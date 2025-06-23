import { describe, it, expect, vi } from 'vitest'
import { corsMiddleware } from '../middleware/cors.js'

describe('corsMiddleware', () => {
  it('should set the correct headers', async () => {
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await corsMiddleware(req as any, {} as any, next)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, PATCH, OPTIONS')
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization, X-Requested-With')
  })

  it('should call next()', async () => {
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await corsMiddleware(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
  })
})
