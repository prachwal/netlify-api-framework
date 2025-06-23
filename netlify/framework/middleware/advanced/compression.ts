import { Middleware } from '../../router/router.js'

export const compressionMiddleware: Middleware = async (req, _context, next) => {
  const response = await next()
  const acceptEncoding = req.headers.get('accept-encoding') || ''
  const headers = new Headers(response.headers)
  headers.set('Vary', 'Accept-Encoding')
  if (acceptEncoding.includes('gzip')) {
    const responseClone = response.clone()
    const content = await responseClone.text()
    if (content.length > 100) {
      headers.set('Content-Encoding', 'gzip')
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
