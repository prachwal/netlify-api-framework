import { describe, it, expect, vi } from 'vitest'
import { jsonBodyParser } from '../middleware/json-body-parser.js'

const mockContext = {
  account: {}, cookies: {}, deploy: {}, flags: {}, geo: {}, ip: '',
  log: {}, next: vi.fn(), params: {}, requestId: '', site: {},
  user: {}, waitUntil: vi.fn(), env: {}, health: {}, request: {},
  event: {}, locals: {}, url: '',
} as any

describe('jsonBodyParser - extra coverage', () => {
  it('should return 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalidJson}'
    })
    const res = await jsonBodyParser(req as any, mockContext, vi.fn())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid JSON')
  })
  it('should not set parsedBody if no body', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' }
    })
    const reqWithParsed: any = req
    await jsonBodyParser(reqWithParsed, mockContext, vi.fn())
    expect(reqWithParsed.parsedBody).toBeUndefined()
  })
})
