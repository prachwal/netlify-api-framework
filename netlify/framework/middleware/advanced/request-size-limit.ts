import { Middleware } from '../../router/router.js'
import { logger } from '../../utils/logger.js'

export const requestSizeLimitMiddleware = (maxSizeBytes: number = 1024 * 1024): Middleware => {
  return async (req, _context, next) => {
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      return new Response(JSON.stringify({
        error: 'Request too large',
        maxSize: `${maxSizeBytes} bytes`
      }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'HEAD') {
      try {
        const requestClone = req.clone()
        const body = await requestClone.text()
        if (body.length > maxSizeBytes) {
          return new Response(JSON.stringify({
            error: 'Request too large',
            maxSize: `${maxSizeBytes} bytes`
          }), {
            status: 413,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      } catch (error) {
        logger.warn('Could not read request body for size check', { error: error instanceof Error ? error.message : String(error) })
      }
    }
    return await next()
  }
}
export const requestSizeLimit = requestSizeLimitMiddleware
