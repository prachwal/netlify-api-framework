# Netlify API Framework

Modern, type-safe API framework dedicated to Netlify Functions with TypeScript support and comprehensive middleware system.

## 🚀 Features

- **TypeScript-first** - Full TypeScript support with comprehensive type definitions
- **Modern Fetch API** - Built on web standards, no legacy dependencies
- **Middleware System** - Comprehensive middleware for authentication, CORS, rate limiting, and more
- **Route Parameters** - Dynamic route parameters with automatic parsing
- **Error Handling** - Built-in error handling and validation
- **Performance Monitoring** - Built-in performance metrics and logging
- **Security** - Security headers, rate limiting, and authentication middleware
- **Testing** - Comprehensive test suite with Vitest
- **Zero Dependencies** - Lightweight with minimal external dependencies

## 📦 Installation

```bash
npm install netlify-api-framework
```

## 🚀 Quick Start

### Basic Setup

Create your API function in `netlify/functions/api.mts`:

```typescript
import { NetlifyRouter, cors, jsonBodyParser, errorHandler } from 'netlify-api-framework'

const router = new NetlifyRouter()

// Add global middleware
router.use(cors({ origin: '*' }))
router.use(jsonBodyParser())
router.use(errorHandler())

// Define routes
router.get('/hello', async (req, context) => {
  return new Response(JSON.stringify({ 
    message: 'Hello World!',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

router.get('/hello/:name', async (req, context, params) => {
  return new Response(JSON.stringify({ 
    message: `Hello, ${params?.name}!`,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Export handler for Netlify
export const handler = router.handler()
```

### Advanced Example with Middleware

```typescript
import { 
  NetlifyRouter, 
  cors, 
  jsonBodyParser, 
  errorHandler,
  jwtAuth,
  rateLimit,
  requestId,
  securityHeaders,
  performanceMonitor,
  json,
  parseQueryParams
} from 'netlify-api-framework'

const router = new NetlifyRouter()

// Global middleware stack
router.use(requestId())
router.use(securityHeaders())
router.use(cors({ 
  origin: ['https://your-domain.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
router.use(rateLimit({ requests: 100, window: 60000 }))
router.use(jsonBodyParser())
router.use(performanceMonitor())
router.use(errorHandler())

// Public routes
router.get('/api/health', async (req, context) => {
  return json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Protected routes
const protectedRouter = new NetlifyRouter()
protectedRouter.use(jwtAuth({ secret: process.env.JWT_SECRET! }))

protectedRouter.get('/profile', async (req, context) => {
  const user = (req as any).user // Added by JWT middleware
  return json({ 
    user: {
      id: user.id,
      email: user.email
    }
  })
})

protectedRouter.post('/posts', async (req, context) => {
  const body = (req as any).parsedBody
  const user = (req as any).user
  
  // Create post logic here
  const post = {
    id: Date.now(),
    title: body.title,
    content: body.content,
    authorId: user.id,
    createdAt: new Date().toISOString()
  }
  
  return json({ post }, { status: 201 })
})

// Mount protected routes
router.use('/api/protected', protectedRouter)

export const handler = router.handler()
```

## 🛠 API Reference

### Router

#### `NetlifyRouter`

Main router class for handling HTTP requests.

```typescript
const router = new NetlifyRouter()

// HTTP methods
router.get(path, handler)
router.post(path, handler)
router.put(path, handler)
router.delete(path, handler)
router.patch(path, handler)
router.options(path, handler)

// Middleware
router.use(middleware)
router.use(path, subRouter)

// Get handler for Netlify
const handler = router.handler()
```

#### Route Parameters

```typescript
// Dynamic route with parameter
router.get('/users/:id', async (req, context, params) => {
  const userId = params?.id
  return json({ userId })
})

// Multiple parameters
router.get('/users/:userId/posts/:postId', async (req, context, params) => {
  const { userId, postId } = params || {}
  return json({ userId, postId })
})

// Query parameters
router.get('/search', async (req, context) => {
  const queryParams = parseQueryParams(req)
  const { q, limit, offset } = queryParams
  return json({ query: q, limit, offset })
})
```

### Middleware

#### Built-in Middleware

```typescript
import { 
  cors,
  jsonBodyParser,
  errorHandler,
  jwtAuth,
  rateLimit,
  requestId,
  securityHeaders,
  performanceMonitor,
  cache,
  compression,
  requestSizeLimit,
  logging
} from 'netlify-api-framework'

// CORS
router.use(cors({
  origin: '*', // or ['https://domain.com']
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

// JSON Body Parser
router.use(jsonBodyParser())

// JWT Authentication
router.use(jwtAuth({ 
  secret: 'your-secret',
  algorithms: ['HS256']
}))

// Rate Limiting
router.use(rateLimit({ 
  requests: 100, 
  window: 60000 // 1 minute
}))

// Security Headers
router.use(securityHeaders())

// Performance Monitoring
router.use(performanceMonitor())

// Request Size Limit
router.use(requestSizeLimit({ limit: 1024 * 1024 })) // 1MB

// Caching
router.use(cache({ 
  ttl: 300, // 5 minutes
  key: (req) => req.url 
}))

// Compression
router.use(compression())

// Logging
router.use(logging())
```

#### Custom Middleware

```typescript
import { Middleware } from 'netlify-api-framework'

const customAuth: Middleware = async (req, context, next) => {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Add user to request
  (req as any).user = { id: 1, email: 'user@example.com' }
  
  return next()
}

router.use(customAuth)
```

### Utilities

```typescript
import { 
  json,
  parseQueryParams,
  validateRequest,
  createError,
  consoleFormat
} from 'netlify-api-framework'

// JSON Response
return json({ data: 'value' }, { status: 200 })

// Parse Query Parameters
const params = parseQueryParams(req)

// Error Handling
throw createError(400, 'Bad Request', { field: 'email' })

// Logging
console.log(consoleFormat('info', 'Request processed', { requestId: '123' }))
```

## 🧪 Testing

The framework includes comprehensive tests. Run them with:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run framework tests only
npm run test:framework

# Run tests in watch mode
npm run test:framework:watch

# Run tests with UI
npm run test:ui
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { NetlifyRouter, json } from 'netlify-api-framework'

describe('API Routes', () => {
  it('should handle GET request', async () => {
    const router = new NetlifyRouter()
    
    router.get('/test', async (req, context) => {
      return json({ message: 'test' })
    })
    
    const handler = router.handler()
    const request = new Request('http://localhost/.netlify/functions/api/test')
    const context = {} as any
    
    const response = await handler(request, context)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.message).toBe('test')
  })
})
```

## 🏗 Project Structure

```
netlify/
├── functions/
│   └── api.mts              # Main API function
├── framework/              # Framework source code
│   ├── index.ts            # Main exports
│   ├── middleware/         # Middleware modules
│   ├── router/            # Router implementation
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── tests/             # Test files
└── project/               # Your application code
    ├── controllers/       # Route controllers
    ├── routes/           # Route definitions
    └── types/            # Application types
```

## 🔧 Configuration

### TypeScript Configuration

The framework uses TypeScript with ES modules. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Netlify Configuration

In your `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

## 🚀 Deployment

### Publishing to NPM

The framework includes automated publishing scripts:

#### Using the automated script:
```bash
# Interactive publish with version selection
./publish.sh

# Quick patch version publish
./quick-publish.sh
```

#### Manual publish process:
```bash
# Clean and test
npm run clean
npm run test:run

# Build the package
npm run build

# Test the build
npm run publish:dry

# Version bump (optional)
npm run version:patch  # or version:minor, version:major

# Publish
npm publish
```

### Deploying to Netlify

1. Build your project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

## 📝 Examples

### REST API with CRUD Operations

```typescript
import { NetlifyRouter, json, jsonBodyParser, errorHandler } from 'netlify-api-framework'

const router = new NetlifyRouter()
router.use(jsonBodyParser())
router.use(errorHandler())

// In-memory store (use database in production)
const posts = new Map()

// GET /api/posts - List all posts
router.get('/api/posts', async (req, context) => {
  const queryParams = parseQueryParams(req)
  const limit = parseInt(queryParams.limit || '10')
  const offset = parseInt(queryParams.offset || '0')
  
  const allPosts = Array.from(posts.values())
  const paginatedPosts = allPosts.slice(offset, offset + limit)
  
  return json({
    posts: paginatedPosts,
    total: allPosts.length,
    limit,
    offset
  })
})

// GET /api/posts/:id - Get single post
router.get('/api/posts/:id', async (req, context, params) => {
  const post = posts.get(params?.id)
  
  if (!post) {
    return json({ error: 'Post not found' }, { status: 404 })
  }
  
  return json({ post })
})

// POST /api/posts - Create new post
router.post('/api/posts', async (req, context) => {
  const body = (req as any).parsedBody
  
  if (!body.title || !body.content) {
    return json({ error: 'Title and content are required' }, { status: 400 })
  }
  
  const post = {
    id: Date.now().toString(),
    title: body.title,
    content: body.content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  posts.set(post.id, post)
  
  return json({ post }, { status: 201 })
})

// PUT /api/posts/:id - Update post
router.put('/api/posts/:id', async (req, context, params) => {
  const post = posts.get(params?.id)
  
  if (!post) {
    return json({ error: 'Post not found' }, { status: 404 })
  }
  
  const body = (req as any).parsedBody
  const updatedPost = {
    ...post,
    ...body,
    updatedAt: new Date().toISOString()
  }
  
  posts.set(post.id, updatedPost)
  
  return json({ post: updatedPost })
})

// DELETE /api/posts/:id - Delete post
router.delete('/api/posts/:id', async (req, context, params) => {
  const exists = posts.has(params?.id)
  
  if (!exists) {
    return json({ error: 'Post not found' }, { status: 404 })
  }
  
  posts.delete(params?.id)
  
  return json({ message: 'Post deleted successfully' })
})

export const handler = router.handler()
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Netlify Functions
- Inspired by modern web standards
- TypeScript-first approach
- Comprehensive testing with Vitest
