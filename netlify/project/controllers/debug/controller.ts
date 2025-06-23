import { 
  RouteHandler, 
  json
} from '../../../framework'
import { 
  ApiResponse
} from '../../types/common'

// Debug endpoint to check environment variables
export const debugEnvironment: RouteHandler = async (_req, _context) => {
  const debugInfo = {
    nodeEnv: process.env.NODE_ENV,
    auth0Domain: process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN,
    auth0ClientId: process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID,
    mongoUri: process.env.MONGODB_URI ? '***configured***' : 'not configured',
    timestamp: new Date().toISOString(),
    platform: process.platform,
    processEnv: {
      isDev: process.env.NODE_ENV !== 'production',
      isProd: process.env.NODE_ENV === 'production'
    }
  }

  const response: ApiResponse<typeof debugInfo> = {
    status: 'ok',
    payload: debugInfo,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  return json(response)
}
