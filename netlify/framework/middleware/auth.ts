import { Middleware } from '../router/router'

export const authMiddleware: Middleware = async (req, _context, next) => {
  const authHeader = req.headers.get('Authorization')
  const apiKey = req.headers.get('X-API-Key')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    if (token === 'valid-token-123') {
      (req as any).user = { id: 1, name: 'Test User' }
      return await next()
    } else {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  if (apiKey) {
    if (apiKey === 'valid-api-key-123') {
      return await next()
    } else {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}
