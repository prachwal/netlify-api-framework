import { describe, it, expect, vi } from 'vitest'
import { securityHeadersMiddleware } from '../middleware/advanced/security-headers'

describe('securityHeadersMiddleware', () => {
  it('should set security-related headers', async () => {
    const middleware = securityHeadersMiddleware
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const context = {} as any
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await middleware(req as any, context, next)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains')
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'")
  })

  it('should call next()', async () => {
    const middleware = securityHeadersMiddleware
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const context = {} as any
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await middleware(req as any, context, next)
    expect(next).toHaveBeenCalled()
  })
})
