import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NetlifyRouter, json, text, html } from '../router/router.js'
import type { RequestWithParsedBody, RouteHandler, Middleware } from '../router/router.js'

describe('NetlifyRouter', () => {
  let router: NetlifyRouter

  beforeEach(() => {
    router = new NetlifyRouter()
  })

  it('should handle GET requests', async () => {
    router.get('/test', () => {
      return json({ message: 'Hello, world!' })
    })

    const response = await router.handle({
      httpMethod: 'GET',
      path: '/test',
      headers: {},
      body: '',
      url: 'http://localhost/api/test',
      method: 'GET',
    } as any, {} as any)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Hello, world!' })
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should handle POST requests', async () => {
    router.post('/test', async (req) => {
      // Simulate JSON parsing
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { name } = body
      return json({ message: `Hello, ${name}!` })
    })

    const response = await router.handle({
      httpMethod: 'POST',
      path: '/test',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John' }),
      url: 'http://localhost/api/test',
      method: 'POST',
    } as any, {} as any)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Hello, John!' })
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should handle text response', async () => {
    router.get('/text', () => {
      return text('Hello, world!', 200)
    })

    const response = await router.handle({
      httpMethod: 'GET',
      path: '/text',
      headers: {},
      body: '',
      url: 'http://localhost/api/text',
      method: 'GET',
    } as any, {} as any)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('Hello, world!')
    expect(response.headers.get('Content-Type')).toBe('text/plain')
  })

  it('should handle HTML response', async () => {
    router.get('/html', () => {
      return html('<h1>Hello, world!</h1>', 200)
    })

    const response = await router.handle({
      httpMethod: 'GET',
      path: '/html',
      headers: {},
      body: '',
      url: 'http://localhost/api/html',
      method: 'GET',
    } as any, {} as any)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('<h1>Hello, world!</h1>')
    expect(response.headers.get('Content-Type')).toBe('text/html')
  })

  it('should handle 404 Not Found', async () => {
    const response = await router.handle({
      httpMethod: 'GET',
      path: '/not-found',
      headers: {},
      body: '',
      url: 'http://localhost/api/not-found',
      method: 'GET',
    } as any, {} as any)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe('Route not found')
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('should handle errors', async () => {
    router.get('/error', () => {
      throw new Error('Something went wrong')
    })

    const response = await router.handle({
      httpMethod: 'GET',
      path: '/error',
      headers: {},
      body: '',
      url: 'http://localhost/api/error',
      method: 'GET',
    } as any, {} as any)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Internal server error')
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })
})
