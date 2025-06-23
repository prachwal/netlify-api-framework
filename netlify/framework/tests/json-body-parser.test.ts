import { describe, it, expect, vi } from 'vitest'
import { jsonBodyParser } from '../middleware/json-body-parser.js'

const mockContext = {
  account: {}, cookies: {}, deploy: {}, flags: {}, geo: {}, ip: '',
  log: {}, next: vi.fn(), params: {}, requestId: '', site: {},
  user: {}, waitUntil: vi.fn(), env: {}, health: {}, request: {},
  event: {}, locals: {}, url: '',
} as any

describe('jsonBodyParser', () => {
  it('should parse JSON body', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ test: 'test' })
    })
    const requestWithParsed: any = req
    await jsonBodyParser(requestWithParsed, mockContext, vi.fn())
    expect(requestWithParsed.parsedBody).toEqual({ test: 'test' })
  })

  it('should call next()', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ test: 'test' })
    })
    await jsonBodyParser(req as any, mockContext, vi.fn())
    expect(vi.fn).toBeCalled
  })
})
