import { describe, it, expect, vi } from 'vitest'
import { cacheMiddleware } from '../middleware/advanced/cache.js'

describe('cacheMiddleware', () => {
  it('should set cache-related headers for GET requests', async () => {
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await cacheMiddleware(req as any, {} as any, next)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300')
    expect(response.headers.get('ETag')).toBeTruthy()
    expect(next).toHaveBeenCalled()
  })

  it('should set no-cache headers for non-GET requests', async () => {
    const req = new Request('http://localhost/api/test', { method: 'POST' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await cacheMiddleware(req as any, {} as any, next)
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')
    expect(next).toHaveBeenCalled()
  })
})
