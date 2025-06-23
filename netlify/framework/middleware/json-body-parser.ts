import { Middleware, RequestWithParsedBody } from '../router/router.js'
import { logError } from '../utils/logger.js'

export const jsonBodyParser: Middleware = async (req, _context, next) => {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    try {
      const contentType = req.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const requestClone = req.clone()
        const text = await requestClone.text()
        if (text.trim()) {
          const body = JSON.parse(text)
          ;(req as RequestWithParsedBody).parsedBody = body
        }
      }
    } catch (error: unknown) {
      logError(error instanceof Error ? error : new Error(String(error)), 'JSON parsing')
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  return await next()
}
