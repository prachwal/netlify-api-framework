import { RequestWithParsedBody } from '../router/router'
// Import the new Winston-based logger
export { logger, log, logRequest, logPerformance, logError, LogLevel } from './logger'

// Define QueryParams locally for framework
export interface QueryParams {
  [key: string]: string | undefined
}

// Parsowanie query parameters
export function parseQueryParams(request: RequestWithParsedBody): QueryParams {
  const url = new URL(request.url)
  const params: QueryParams = {}
  
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  
  return params
}

// Walidacja email
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  // Basic format check
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Check for invalid IP format in domain
  const emailParts = email.split('@')
  if (emailParts.length !== 2) {
    return false
  }
  
  const domain = emailParts[1] || ''
  const ipRegex = /^\d+\.\d+\.\d+\.\d+$/
  if (ipRegex.test(domain)) {
    // Validate IP ranges (simplified check)
    const parts = domain.split('.').map(Number)
    if (parts.some(part => part > 255)) {
      return false
    }
  }
  
  return true
}

// Walidacja ID (musi być liczbą dodatnią lub UUID)
export function isValidId(id: string | undefined | null): boolean {
  if (!id || typeof id !== 'string') {
    return false
  }
  
  // Check for whitespace or invalid characters
  if (id.trim() !== id) {
    return false
  }
  
  // Check if it's a positive integer
  const numId = parseInt(id, 10)
  if (!isNaN(numId) && numId > 0 && id === numId.toString()) {
    return true
  }
  
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Sanityzacja string input
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().substring(0, maxLength)
}

// Generowanie losowego ID (string)
export function generateId(): string {
  return generateStringId()
}

// Generate UUID-like string ID
export function generateStringId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Parsowanie pagination parameters
export function parsePaginationParams(queryParams: QueryParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(queryParams.page || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit || '10', 10)))
  
  return { page, limit }
}

// Delay utility dla rate limiting
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Formatowanie response z dodatkowymi headers
export function createResponse(
  data: unknown, 
  status: number = 200, 
  additionalHeaders: Record<string, string> = {}
): Response {
  const headers = {
    'Content-Type': 'application/json',
    'X-Response-Time': Date.now().toString(),
    ...additionalHeaders
  }
  
  return new Response(JSON.stringify(data), {
    status,
    headers
  })
}

// Logowanie z timestampem - now handled by Winston logger
// See logger.ts for the new Winston-based implementation

// Walidacja JSON body  
export function validateRequiredFields(body: unknown, requiredFields: string[]): { isValid: boolean; missing: string[] } {
  return validateFields(body, requiredFields)
}

// Enhanced validation that returns object structure expected by tests
export function validateFields(body: unknown, requiredFields: string[]): { isValid: boolean; missing: string[] } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, missing: requiredFields }
  }
  
  const bodyObj = body as Record<string, unknown>
  const missing: string[] = []
  
  for (const field of requiredFields) {
    if (!(field in bodyObj) || bodyObj[field] === undefined || bodyObj[field] === null) {
      missing.push(field)
    } else if (typeof bodyObj[field] === 'string' && (bodyObj[field] as string).trim() === '') {
      missing.push(field)
    }
  }
  
  return { isValid: missing.length === 0, missing }
}

// Cache simulation (w prawdziwej aplikacji użyj Redis/Memcached)
const cacheMap = new Map<string, { data: unknown; expiry: number }>()

export const cache = {
  set: (key: string, data: unknown, ttlMs: number = 300000) => {
    cacheMap.set(key, {
      data,
      expiry: Date.now() + ttlMs
    })
  },
  get: (key: string): unknown | undefined => {
    const item = cacheMap.get(key)
    
    if (!item) {
      return undefined
    }
    
    if (Date.now() > item.expiry) {
      cacheMap.delete(key)
      return undefined
    }
    
    return item.data
  },
  delete: (key: string) => {
    cacheMap.delete(key)
  },
  clear: (pattern?: string) => {
    if (pattern) {
      for (const key of cacheMap.keys()) {
        if (key.includes(pattern)) {
          cacheMap.delete(key)
        }
      }
    } else {
      cacheMap.clear()
    }
  }
}

// Cleanup cache periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, item] of cacheMap.entries()) {
    if (now > item.expiry) {
      cacheMap.delete(key)
    }
  }
}, 60000) // Clean up every minute

// Pagination utility
export function paginate<T>(
  items: T[], 
  page: number, 
  limit: number
): { 
  items: T[]; 
  total: number; 
  totalItems: number; 
  totalPages: number; 
  currentPage: number; 
  page: number; 
  limit: number; 
  hasNext: boolean; 
  hasPrev: boolean; 
} {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = items.slice(startIndex, endIndex)
  const totalPages = Math.ceil(items.length / limit)
  
  return {
    items: paginatedItems,
    total: items.length,
    totalItems: items.length,
    totalPages,
    currentPage: page,
    page,
    limit,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

// Create error response
export function createErrorResponse(
  message: string, 
  status: number = 400, 
  details?: unknown
): Response {
  const errorData: Record<string, unknown> = {
    error: message,
    status,
    timestamp: new Date().toISOString()
  }
  
  if (details) {
    errorData.details = details
  }
  
  return new Response(JSON.stringify(errorData), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onload=, onerror=
    .substring(0, 1000) // Limit length
}

// Hash string (simple implementation)
export function hashString(input: string): string {
  let hash = 0
  if (input.length === 0) return hash.toString()
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16)
}

// Format timestamp
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString()
}

// Logger is now handled by Winston logger (see logger.ts)
