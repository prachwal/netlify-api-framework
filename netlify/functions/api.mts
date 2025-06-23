// Main API Entry Point - Modern Implementation
// This file demonstrates the new nested router functionality

import 'dotenv/config';
import { Context } from '@netlify/functions'
import { 
  NetlifyRouter,
  corsMiddleware, 
  loggingMiddleware, 
  jsonBodyParser, 
  rateLimitMiddleware 
} from '../framework'
import { 
  hello,
  uploadFile,
  getProfile,
  updateProfile,
  getTokenInfo,
  debugEnv,
  debugEnvironment
} from '../project/controllers/controllers'
import { 
  createUsersRouterResource
} from '../project/routes'

// Create main router instance
const router = new NetlifyRouter()

// Add framework middleware
router.use(corsMiddleware)
router.use(loggingMiddleware)
router.use(jsonBodyParser)
router.use(rateLimitMiddleware) // 50 requests per minute

// Direct routes (not nested)
router.get('/', hello)
router.get('/hello', hello)
router.get('/hello/:name', hello)
router.post('/upload', uploadFile)

// Secured profile endpoints - require ID token
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/token-info', getTokenInfo)
router.get('/debug-env', debugEnv)
router.get('/debug', debugEnvironment)


// NOWY SPOSÓB: Zagnieżdżone routery
// Zamiast 10 linii dla każdego zasobu, teraz tylko 2 linie:

// Users resource - kompletny CRUD w jednej linii
router.use('/users', createUsersRouterResource())

// Dodatkowe przykłady zastosowania:

// Wersjonowanie API
// router.use('/v1/users', createUsersRouterV1())
// router.use('/v2/users', createUsersRouterV2())

// Zagnieżdżone zasoby
// const commentsRouter = createCommentsRouter()
// router.use('/posts/:postId/comments', commentsRouter)

// Admin routes z middleware
// const adminRouter = new NetlifyRouter()
// adminRouter.use(adminAuthMiddleware)
// adminRouter.use('/users', createAdminUsersRouter())
// router.use('/admin', adminRouter)

// Export the handler
export default async (request: Request, context: Context): Promise<Response> => {
  try {
    return await router.handle(request, context)
  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
