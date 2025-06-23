import { describe, it, expect, vi } from 'vitest'
import { rateLimitMiddleware } from '../middleware/rate-limit'

describe('rateLimitMiddleware', () => {
  it('should limit requests', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '127.0.0.1' }
    })
    const context = { ip: '127.0.0.1' } as any
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    for (let i = 0; i < 100; i++) {
      await rateLimitMiddleware(req, context, next)
    }
    const response = await rateLimitMiddleware(req, context, next)
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeDefined()
    const body = await response.json()
    expect(body.error).toBe('Too many requests')
  })

  it('should call next()', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'x-forwarded-for': '127.0.0.2' }
    })
    const context = { ip: '127.0.0.2' } as any
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await rateLimitMiddleware(req, context, next)
    expect(next).toHaveBeenCalled()
    expect(response.status).toBe(200)
  })
})
