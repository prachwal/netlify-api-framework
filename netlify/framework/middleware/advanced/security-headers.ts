import { Middleware } from '../../router/router.js'

export const securityHeadersMiddleware: Middleware = async (_req, _context, next) => {
  const response = await next()
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Content-Security-Policy', "default-src 'self'")
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
