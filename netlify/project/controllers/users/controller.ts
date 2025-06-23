/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  RouteHandler, 
  RequestWithParsedBody, 
  isValidEmail, 
  isValidId, 
  sanitizeString, 
  generateId, 
  log, 
  validateRequiredFields,
  createResponse
} from '../../../framework'
import { 
  CreateUserRequest, 
  UpdateUserRequest
} from './types'
import { 
  ApiResponse,
  APIError
} from '../../types/common'

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
  // Zwróć przykładową odpowiedź bez bazy
  const response = {
    users: [
      { id: '1', name: 'Test User', email: 'test@example.com', createdAt: new Date().toISOString() }
    ]
  }
  return createResponse(createSuccessResponse(response, { totalCount: 1, page: 1, limit: 10, hasNext: false, hasPrevious: false }))
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

  // Przykładowa odpowiedź
  const user = {
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString()
  }

  return createResponse(createSuccessResponse({ user }))
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
    
    // Przykładowa odpowiedź po "utworzeniu" użytkownika
    const newUser = {
      id: '2',
      name: sanitizedName,
      email: sanitizedEmail,
      createdAt: new Date().toISOString()
    }
    
    log('info', `Created new user: ${newUser.name}`)
    
    return createResponse(createSuccessResponse({
      user: newUser,
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

  // Przykładowa odpowiedź po "aktualizacji" użytkownika
  const updatedUser = {
    id: userId,
    name: body.name ? sanitizeString(body.name, 100) : 'Test User',
    email: body.email ? sanitizeString(body.email, 255) : 'test@example.com',
    createdAt: new Date().toISOString()
  }

  return createResponse(createSuccessResponse({
    user: updatedUser,
    message: 'User updated successfully'
  }))
}

export const deleteUser: RouteHandler = async (_req, _context, params) => {
  const userId = params?.id
  
  if (!userId) {
    return createResponse(createErrorResponse({
      error: 'User ID is required',
      code: 'MISSING_USER_ID'
    }), 400)
  }

  // Przykładowa odpowiedź po "usunięciu" użytkownika
  return createResponse(createSuccessResponse({ 
    success: true,
    message: 'User deleted successfully' 
  }))
}
