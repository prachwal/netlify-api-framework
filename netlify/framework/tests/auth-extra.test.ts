import { describe, it, expect } from 'vitest'
import { authMiddleware } from '../middleware/auth'

describe('authMiddleware - extra coverage', () => {
  it('should return 401 if no auth provided', async () => {
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = () => Promise.resolve(new Response('OK', { status: 200 }))
    const res = await authMiddleware(req as any, {} as any, next)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })
  it('should return 401 for invalid bearer token', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer wrong-token' }
    })
    const next = () => Promise.resolve(new Response('OK', { status: 200 }))
    const res = await authMiddleware(req as any, {} as any, next)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid token')
  })
  it('should return 401 for invalid API key', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'X-API-Key': 'bad-key' }
    })
    const next = () => Promise.resolve(new Response('OK', { status: 200 }))
    const res = await authMiddleware(req as any, {} as any, next)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid API key')
  })
})
