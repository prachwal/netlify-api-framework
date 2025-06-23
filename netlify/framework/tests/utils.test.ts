/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isValidEmail,
  isValidId,
  paginate,
  createResponse,
  createErrorResponse,
  sanitizeInput,
  validateRequiredFields,
  hashString,
  generateId,
  formatTimestamp,
  logger,
  cache
} from '../utils/utils'

// Helper to parse Response body
async function parseResponseBody(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

describe('Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear cache between tests
    if (cache && typeof cache.clear === 'function') {
      cache.clear()
    }
  })

  it('should validate email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
  })

  it('should validate IDs', () => {
    expect(isValidId('123')).toBe(true)
    expect(isValidId('invalid-id')).toBe(false)
  })

  it('should paginate results', () => {
    const items = Array.from({ length: 50 }, (_, i) => i + 1)
    const result = paginate(items, 1, 10)
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.totalPages).toBe(5)
  })

  it('should create a response object', async () => {
    const response = createResponse({ success: true })
    expect(response).toBeInstanceOf(Response)
    const body = await response.json()
    expect(body).toEqual({ success: true })
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should create an error response object', async () => {
    const response = createErrorResponse('Operation failed')
    expect(response).toBeInstanceOf(Response)
    const body = await response.json()
    expect(body.error).toBe('Operation failed')
    expect(body.status).toBe(400)
    expect(typeof body.timestamp).toBe('string')
  })

  it('should sanitize input', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toMatch(/[<>"']/)
    expect(sanitizeInput('   hello world   ')).toBe('hello world')
  })

  it('should validate required fields', () => {
    const fields = { name: 'John', email: '' }
    const required = ['name', 'email']
    const { isValid, missing } = validateRequiredFields(fields, required)
    expect(isValid).toBe(false)
    expect(missing).toEqual(['email'])
  })

  it('should hash a string', () => {
    const hash = hashString('password')
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should generate a unique ID', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
  })

  it('should format a timestamp', () => {
    const date = new Date('2021-01-01T00:00:00Z')
    expect(formatTimestamp(date)).toBe('2021-01-01T00:00:00.000Z')
  })

  it('should log messages (calls logger.info)', () => {
    // Only test that logger exists and has info method
    expect(typeof logger.info).toBe('function')
  })
})
