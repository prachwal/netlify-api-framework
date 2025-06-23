import { Middleware } from '../router/router'
import { logRequest } from '../utils/logger'

export const loggingMiddleware: Middleware = async (req, _context, next) => {
  const start = Date.now()
  const url = new URL(req.url)
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID()
  logRequest(req.method, url.pathname, undefined, undefined, requestId)
  const response = await next()
  const duration = Date.now() - start
  logRequest(req.method, url.pathname, response.status, duration, requestId)
  return response
}
