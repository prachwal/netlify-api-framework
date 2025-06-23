import { Middleware } from '../router/router.js'

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export const rateLimitMiddleware: Middleware = async (req, context, next) => {
  const maxRequests = 100
  const windowMs = 60000
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                  req.headers.get('x-real-ip') || 
                  req.headers.get('cf-connecting-ip') || 
                  context.ip || 'unknown'
  const now = Date.now()
  const clientData = requestCounts.get(clientIP)
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs })
    return await next()
  }
  if (clientData.count >= maxRequests) {
    return new Response(JSON.stringify({ 
      error: 'Too many requests',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString()
      }
    })
  }
  clientData.count++
  return await next()
}
