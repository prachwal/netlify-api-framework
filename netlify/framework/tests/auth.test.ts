import { describe, it, expect, vi } from 'vitest'
import { authMiddleware } from '../middleware/auth.js'

describe('authMiddleware', () => {
  it('should set user on request', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer valid-token-123' }
    })
    const reqWithUser: any = req
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await authMiddleware(reqWithUser, {} as any, next)
    expect(reqWithUser.user).toEqual({ id: 1, name: 'Test User' })
  })

  it('should call next()', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer valid-token-123' }
    })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await authMiddleware(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
  })
})
