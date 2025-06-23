import { describe, it, expect } from 'vitest'
import { corsMiddleware } from '../middleware/cors'

describe('corsMiddleware - extra coverage', () => {
  it('should handle OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/test', { method: 'OPTIONS' })
    const next = () => Promise.resolve(new Response('OK', { status: 200 }))
    const res = await corsMiddleware(req as any, {} as any, next)
    expect(res.status).toBe(200)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, PATCH, OPTIONS')
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization, X-Requested-With')
  })
})
