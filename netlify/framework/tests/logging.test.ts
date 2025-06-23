import { describe, it, expect, vi } from 'vitest'
import { loggingMiddleware } from '../middleware/logging.js'
import * as loggerModule from '../utils/logger.js'

describe('loggingMiddleware', () => {
  it('should log the request', async () => {
    const spy = vi.spyOn(loggerModule, 'logRequest')
    const req = new Request('http://localhost/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await loggingMiddleware(req as any, {} as any, next)
    expect(spy).toHaveBeenCalledWith('GET', '/test', undefined, undefined, expect.any(String))
  })

  it('should call next()', async () => {
    const req = new Request('http://localhost/test', { method: 'GET' })
    const next = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }))
    await loggingMiddleware(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
  })
})
