import { Middleware } from '../../router/router.js'

export const requestIdMiddleware: Middleware = async (req, context, next) => {
  let requestId = req.headers.get('X-Request-ID')
  if (!requestId) {
    requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  ;(context as any).requestId = requestId
  const response = await next()
  const headers = new Headers(response.headers)
  headers.set('X-Request-ID', requestId)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
