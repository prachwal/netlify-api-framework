import { describe, it, expect, vi } from 'vitest'
import { requestIdMiddleware } from '../middleware/advanced/request-id'

describe('requestIdMiddleware', () => {
  it('should generate a unique request ID', async () => {
    const context = {} as any
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await requestIdMiddleware(req as any, context, next)
    expect(response.headers.get('X-Request-ID')).toBeTruthy()
    expect(next).toHaveBeenCalled()
  })

  it('should call next()', async () => {
    const context = {} as any
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await requestIdMiddleware(req as any, context, next)
    expect(next).toHaveBeenCalled()
  })
})
