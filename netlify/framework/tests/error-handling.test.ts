import { describe, it, expect, vi } from 'vitest'
import { errorHandlingMiddleware } from '../middleware/advanced/error-handling'

describe('errorHandlingMiddleware', () => {
  it('should handle errors', async () => {
    const context = {} as any
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const errorNext = vi.fn(async () => { throw new Error('Test error') })
    const response = await errorHandlingMiddleware(req as any, context, errorNext)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Internal Server Error')
    expect(body.message).toBe('Test error')
  })

  it('should call next()', async () => {
    const context = {} as any
    const req = new Request('http://localhost/api/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    const response = await errorHandlingMiddleware(req as any, context, next)
    expect(next).toHaveBeenCalled()
    expect(response.status).toBe(200)
  })
})
