import { describe, it, expect, beforeEach } from 'vitest'
import { NetlifyRouter, createResourceRouter } from '../router/router.js'

// Mock handlers for testing
const mockContext = {} as any

const mockHandlers = {
  index: async () => new Response('index'),
  show: async () => new Response('show'),
  create: async () => new Response('create'),
  update: async () => new Response('update'),
  destroy: async () => new Response('destroy')
}

describe('Nested Routers', () => {
  let mainRouter: NetlifyRouter
  let subRouter: NetlifyRouter

  beforeEach(() => {
    mainRouter = new NetlifyRouter()
    subRouter = new NetlifyRouter()
  })

  it('should mount sub-router under prefix', async () => {
    // Setup sub-router
    subRouter.get('/', mockHandlers.index)
    subRouter.get('/:id', mockHandlers.show)
    
    // Mount sub-router
    mainRouter.use('/users', subRouter)
    
    // Test mounted routes - router requires /api prefix
    const indexRequest = new Request('http://localhost/api/users/')
    const showRequest = new Request('http://localhost/api/users/123')
    
    const indexResponse = await mainRouter.handle(indexRequest, mockContext)
    const showResponse = await mainRouter.handle(showRequest, mockContext)
    
    expect(await indexResponse.text()).toBe('index')
    expect(await showResponse.text()).toBe('show')
  })

  it('should handle nested routes with parameters', async () => {
    subRouter.get('/:id/profile', async (req, ctx, params) => {
      return new Response(`profile-${params?.id}`)
    })
    
    mainRouter.use('/users', subRouter)
    
    const request = new Request('http://localhost/api/users/123/profile')
    const response = await mainRouter.handle(request, mockContext)
    
    expect(await response.text()).toBe('profile-123')
  })
})

describe('Resource Router', () => {
  it('should create standard CRUD routes', async () => {
    const resourceRouter = createResourceRouter({
      index: mockHandlers.index,
      show: mockHandlers.show,
      create: mockHandlers.create,
      update: mockHandlers.update,
      destroy: mockHandlers.destroy
    })
    
    const mainRouter = new NetlifyRouter()
    mainRouter.use('/users', resourceRouter)  // Montuj bez prefiksu /api
    
    // Test all CRUD operations
    const tests = [
      { method: 'GET', path: '/api/users/', expected: 'index' },
      { method: 'GET', path: '/api/users/123', expected: 'show' },
      { method: 'POST', path: '/api/users/', expected: 'create' },
      { method: 'PUT', path: '/api/users/123', expected: 'update' },
      { method: 'DELETE', path: '/api/users/123', expected: 'destroy' }
    ]
    
    for (const test of tests) {
      const request = new Request(`http://localhost${test.path}`, {
        method: test.method
      })
      const response = await mainRouter.handle(request, mockContext)
      expect(await response.text()).toBe(test.expected)
    }
  })

  it('should handle partial resource handlers', async () => {
    const partialRouter = createResourceRouter({
      index: mockHandlers.index,
      show: mockHandlers.show
      // Brak create, update, destroy
    })
    
    const mainRouter = new NetlifyRouter()
    mainRouter.use('/posts', partialRouter)  // Montuj bez prefiksu /api
    
    // Test existing routes
    const indexRequest = new Request('http://localhost/api/posts/')
    const showRequest = new Request('http://localhost/api/posts/123')
    
    const indexResponse = await mainRouter.handle(indexRequest, mockContext)
    const showResponse = await mainRouter.handle(showRequest, mockContext)
    
    expect(await indexResponse.text()).toBe('index')
    expect(await showResponse.text()).toBe('show')
    
    // Test non-existing route
    const createRequest = new Request('http://localhost/api/posts/', {
      method: 'POST'
    })
    const createResponse = await mainRouter.handle(createRequest, mockContext)
    expect(createResponse.status).toBe(404)
  })
})
