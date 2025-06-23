import { Middleware } from '../../router/router'
import { logPerformance } from '../../utils/logger'

export const performanceMiddleware: Middleware = async (_req, _context, next) => {
  const startTime = performance.now()
  const response = await next()
  const duration = Math.ceil(performance.now() - startTime)
  const headers = new Headers(response.headers)
  headers.set('X-Response-Time', `${duration}ms`)
  if (duration > 100) {
    logPerformance('Request processing', duration, { slow: true })
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
