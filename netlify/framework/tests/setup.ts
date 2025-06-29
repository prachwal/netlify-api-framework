import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Global test setup
beforeAll(() => {
  // Setup before all tests
  console.log('🧪 Starting test suite...')
})

afterAll(() => {
  // Cleanup after all tests
  console.log('✅ Test suite completed')
})

beforeEach(() => {
  // Setup before each test
})

afterEach(() => {
  // Cleanup after each test
})

// Mock fetch globally if needed
if (!global.fetch) {
  global.fetch = async () => {
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Export test utilities
export const createMockRequest = (
  url: string = 'https://example.com/api/test',
  options: RequestInit = {}
): Request => {
  return new Request(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  })
}

export const createMockContext = () => {
  return {
    log: console.log,
    error: console.error,
    request: createMockRequest(),
    // Add other context properties as needed
  }
}
