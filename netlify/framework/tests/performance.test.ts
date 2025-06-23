import { describe, it, expect, vi } from 'vitest'
import { performanceMiddleware } from '../middleware/advanced/performance.js'

describe('performanceMiddleware', () => {
  it('should attach a start time to the request', async () => {
    const context = {} as any
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await performanceMiddleware(req as any, context, next)
    expect(response.headers.get('X-Response-Time')).toMatch(/\d+ms/)
    expect(next).toHaveBeenCalled()
  })

  it('should call next()', async () => {
    const context = {} as any
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await performanceMiddleware(req as any, context, next)
    expect(next).toHaveBeenCalled()
  })
})
