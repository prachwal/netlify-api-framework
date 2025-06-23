import { Middleware } from '../../router/router.js'

export const cacheMiddleware: Middleware = async (req, _context, next) => {
  const response = await next()
  const headers = new Headers(response.headers)
  if (req.method === 'GET') {
    headers.set('Cache-Control', 'public, max-age=300')
    const responseClone = response.clone()
    const content = await responseClone.text()
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
    const etag = `"${hash.toString(16)}"`
    headers.set('ETag', etag)
    const ifNoneMatchHeader = req.headers.get('If-None-Match')
    if (ifNoneMatchHeader) {
      const clientEtags = ifNoneMatchHeader.split(',').map(t => t.trim())
      if (clientEtags.includes(etag) || clientEtags.includes('*')) {
        return new Response(null, {
          status: 304,
          headers
        })
      }
    }
  } else {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
