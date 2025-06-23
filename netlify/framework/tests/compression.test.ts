import { describe, it, expect, vi } from 'vitest'
import { compressionMiddleware } from '../middleware/advanced/compression.js'

describe('compressionMiddleware', () => {
  it('should set the Content-Encoding header if gzip is accepted and content is large', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'accept-encoding': 'gzip' }
    })
    const largeContent = 'x'.repeat(200)
    const next = vi.fn().mockResolvedValue(new Response(largeContent, { status: 200 }))
    const response = await compressionMiddleware(req as any, {} as any, next)
    expect(response.headers.get('Content-Encoding')).toBe('gzip')
  })

  it('should not set Content-Encoding if content is small', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'accept-encoding': 'gzip' }
    })
    const smallContent = 'short'
    const next = vi.fn().mockResolvedValue(new Response(smallContent, { status: 200 }))
    const response = await compressionMiddleware(req as any, {} as any, next)
    expect(response.headers.get('Content-Encoding')).toBeNull()
  })

  it('should call next()', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'accept-encoding': 'gzip' }
    })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await compressionMiddleware(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
  })
})
