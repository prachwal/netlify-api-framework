import { describe, it, expect, vi } from 'vitest'
import { requestSizeLimit } from '../middleware/advanced/request-size-limit'

describe('requestSizeLimit', () => {
  it('should set the Content-Length header (allow request)', async () => {
    const middleware = requestSizeLimit(1000)
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-length': '500' },
      body: 'x'.repeat(500)
    })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await middleware(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
    expect(response.status).toBe(200)
  })

  it('should reject if content-length exceeds limit', async () => {
    const middleware = requestSizeLimit(1000)
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-length': '1500' },
      body: 'x'.repeat(1500)
    })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await middleware(req as any, {} as any, next)
    expect(response.status).toBe(413)
    const body = await response.json()
    expect(body.error).toBe('Request too large')
  })
})
