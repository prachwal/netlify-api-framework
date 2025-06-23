import { Middleware } from '../../router/router.js'
import { logError } from '../../utils/logger.js'

export const errorHandlingMiddleware: Middleware = async (req, context, next) => {
  try {
    return await next()
  } catch (error) {
    const requestId = (context as any).requestId || `req_${Date.now()}`
    logError(
      error instanceof Error ? error : new Error(String(error)),
      'Unhandled middleware error',
      {
        url: req.url,
        method: req.method,
        requestId
      }
    )
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      requestId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
      }
    })
  }
}
