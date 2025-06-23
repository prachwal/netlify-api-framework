/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  RouteHandler, 
  RequestWithParsedBody, 
  parseQueryParams, 
  isValidEmail, 
  isValidId, 
  sanitizeString, 
  generateId, 
  parsePaginationParams, 
  log, 
  validateRequiredFields,
  cache,
  paginate,
  createResponse
} from '../../../framework'
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest
} from './types'
import { 
  ApiResponse,
  APIError
} from '../../types/common'
import { db, users } from '../../lib/db'
import { eq, ilike, or, desc, count } from 'drizzle-orm'

// Helper function to create standard API responses
const createSuccessResponse = <T>(
  payload: T,
  additionalMetadata?: Record<string, unknown>
): ApiResponse<T> => {
  return {
    status: 'ok',
    payload,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
      ...additionalMetadata
    }
  }
}

const createErrorResponse = (
  error: APIError,
  additionalMetadata?: Record<string, unknown>
): ApiResponse => {
  return {
    status: 'error',
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
      ...additionalMetadata
    }
  }
}

// Users controller
export const getUsers: RouteHandler = async (req, _context) => {
  try {
    console.log('[DEBUG] getUsers: Starting')
    
    // Parse pagination parameters first
    const queryParams = parseQueryParams(req)
    console.log('[DEBUG] getUsers: Parsed query params', queryParams)
    
    const { page, limit } = parsePaginationParams(queryParams)
    console.log('[DEBUG] getUsers: Pagination params', { page, limit })
    
    const search = queryParams.search
    console.log('[DEBUG] getUsers: Search param', search)
    
    // Create cache key based on query parameters
    const cacheKey = `users:page-${page}:limit-${limit}:search-${encodeURIComponent(search || 'none')}`
    console.log('[DEBUG] getUsers: Cache key', cacheKey)
    
    const cached = cache.get(cacheKey)
    console.log('[DEBUG] getUsers: Cached result', cached)
    
    if (cached) {
      log('info', 'Returning cached users')
      return createResponse(cached)
    }

    console.log('[DEBUG] getUsers: Querying database')
    
    // Build database query
    let query = db.select().from(users)
    let countQuery = db.select({ count: count() }).from(users)
    
    // Apply search filter if provided
    if (search) {
      const searchCondition = or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
      query = query.where(searchCondition)
      countQuery = countQuery.where(searchCondition)
    }
    
    // Get total count
    const [{ count: totalCount }] = await countQuery
    console.log('[DEBUG] getUsers: Total count', totalCount)
    
    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)
    
    // Execute query
    const dbUsers = await query
    console.log('[DEBUG] getUsers: Database users', dbUsers.length)
      // Transform database results to API format
    const apiUsers: User[] = dbUsers.map(user => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString()
    }))
    
    const response = createSuccessResponse(
      {
        users: apiUsers
      },
      {
        totalCount: totalCount,
        page: page,
        limit: limit,
        hasNext: page * limit < totalCount,
        hasPrevious: page > 1
      }
    )
    
    console.log('[DEBUG] getUsers: Setting cache')
    cache.set(cacheKey, response, 60000) // Cache for 1 minute
    
    log('info', `Retrieved ${apiUsers.length} users`)
    
    console.log('[DEBUG] getUsers: Returning response')
    return createResponse(response)
  } catch (error) {
    console.error('[DEBUG] getUsers: Error caught', error)
    log('error', 'Error fetching users from database', error)
    return createResponse(createErrorResponse({
      error: 'Failed to fetch users',
      code: 'DATABASE_ERROR'
    }), 500)
  }
}

export const getUserById: RouteHandler = async (_req, _context, params) => {
  const userId = params?.id
  
  if (!userId) {
    return createResponse(createErrorResponse({
      error: 'User ID is required',
      code: 'MISSING_USER_ID'
    }), 400)
  }
  
  if (!isValidId(userId)) {
    return createResponse(createErrorResponse({
      error: 'Invalid user ID format',
      code: 'INVALID_USER_ID'
    }), 400)
  }

  try {
    log('info', `Fetching user with ID: ${userId}`)
    
    // Query database for user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1)
    
    if (!user) {
      return createResponse(createErrorResponse({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }), 404)
    }

    // Transform to API format
    const apiUser: User = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString()
    }

    return createResponse(createSuccessResponse({      user: apiUser
    }))
  } catch (error) {
    log('error', 'Error fetching user by ID', error)
    return createResponse(createErrorResponse({
      error: 'Failed to fetch user',
      code: 'DATABASE_ERROR'
    }), 500)
  }
}

export const createUser: RouteHandler = async (req, _context) => {
  try {
    const body = (req as RequestWithParsedBody).parsedBody as CreateUserRequest & { age?: number }
    
    // Check if body exists
    if (!body) {
      log('error', 'Create user: Body is missing')
      return createResponse(createErrorResponse({
        error: 'Request body is required',
        code: 'MISSING_BODY'
      }), 400)
    }
      // Walidacja wymaganych pól
    const validation = validateRequiredFields(body, ['name', 'email'])
    if (!validation.isValid) {
      return createResponse(createErrorResponse({
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        details: { missing: validation.missing }
      }), 400)
    }
      // Walidacja email
    if (!isValidEmail(body.email)) {
      return createResponse(createErrorResponse({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      }), 400)
    }
    
    // Walidacja age jeśli jest podane
    if (body.age !== undefined) {      if (typeof body.age !== 'number' || body.age < 0 || body.age > 150) {
        return createResponse(createErrorResponse({
          error: 'Age must be between 0 and 150',
          code: 'INVALID_AGE'
        }), 400)
      }
    }
      // Sanityzacja danych
    const sanitizedName = sanitizeString(body.name, 100)
    const sanitizedEmail = sanitizeString(body.email, 255)
    
    // Create user in database
    const [newUser] = await db
      .insert(users)
      .values({
        name: sanitizedName,
        email: sanitizedEmail
      })
      .returning()
    
    log('info', `Created new user: ${newUser.name}`)
    
    // Transform to API format
    const apiUser: User = {
      id: newUser.id.toString(),
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt.toISOString()
    }
      return createResponse(createSuccessResponse({
      user: apiUser,
      message: 'User created successfully'
    }), 201)  } catch (error: unknown) {
    log('error', 'Create user error', error)
    log('error', 'Create user error stack', error instanceof Error ? error.stack : 'No stack')
    return createResponse(createErrorResponse({
      error: 'Invalid request body',
      code: 'INVALID_BODY'
    }), 400)
  }
}

export const updateUser: RouteHandler = async (req, _context, params) => {
  const userId = params?.id
  const body = (req as RequestWithParsedBody).parsedBody as UpdateUserRequest
  
  if (!userId || !isValidId(userId)) {
    return createResponse(createErrorResponse({
      error: 'Valid User ID is required',
      code: 'INVALID_USER_ID'
    }), 400)
  }
  
  // Walidacja email jeśli jest podany
  if (body?.email && !isValidEmail(body.email)) {
    return createResponse(createErrorResponse({
      error: 'Invalid email format',
      code: 'INVALID_EMAIL'
    }), 400)
  }

  try {
    // Check if user exists first
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1)
    
    if (!existingUser) {
      return createResponse(createErrorResponse({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }), 404)
    }

    // Prepare update data
    const updateData: { name?: string; email?: string; updatedAt: Date } = {
      updatedAt: new Date()
    }
    
    if (body?.name) {
      updateData.name = sanitizeString(body.name, 100)
    }
    
    if (body?.email) {
      updateData.email = sanitizeString(body.email, 255)
    }

    // Update user in database
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(userId)))
      .returning()

    log('info', `Updated user: ${userId}`)

    // Transform to API format
    const apiUser: User = {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt.toISOString()
    }

    return createResponse(createSuccessResponse({
      user: apiUser,
      message: 'User updated successfully'
    }))
  } catch (error) {
    log('error', 'Error updating user', error)
    return createResponse(createErrorResponse({
      error: 'Failed to update user',
      code: 'DATABASE_ERROR'
    }), 500)  }
}

export const deleteUser: RouteHandler = async (_req, _context, params) => {
  const userId = params?.id
  
  if (!userId) {
    return createResponse(createErrorResponse({
      error: 'User ID is required',
      code: 'MISSING_USER_ID'
    }), 400)
  }

  try {
    // Check if user exists first
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1)
    
    if (!existingUser) {
      return createResponse(createErrorResponse({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }), 404)
    }

    // Delete user from database
    await db
      .delete(users)
      .where(eq(users.id, parseInt(userId)))

    log('info', `Deleted user: ${userId}`)

    return createResponse(createSuccessResponse({ 
      success: true,
      message: 'User deleted successfully' 
    }))
  } catch (error) {
    log('error', 'Error deleting user', error)
    return createResponse(createErrorResponse({
      error: 'Failed to delete user',
      code: 'DATABASE_ERROR'
    }), 500)
  }
}
