// Profile controller - secured with ID token authentication
import 'dotenv/config';
import { requireIDToken } from '../../../../src/utils/jwtUtils'

// Utility function to create standardized JSON responses with proper UTF-8 encoding
function createJsonResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    }
  )
}

/**
 * Get user profile - secured endpoint that requires ID token
 */
export async function getProfile(request: Request) {
  // Configure ID token validation
  const auth = requireIDToken({
    issuer: `https://${process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID || '',
    maxAge: 24 * 60 * 60 // 24 hours max age
  })

  // Add debug logging
  console.log('Auth0 Domain:', process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN)
  console.log('Auth0 Client ID:', process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID)

  // Validate the ID token
  const authResult = auth(request)
  
  if (!authResult.isValid) {
    return createJsonResponse({ 
        error: 'Unauthorized', 
        message: authResult.error 
      }, 401)
  }

  // Token is valid, extract user info
  const user = authResult.user!

  try {
    // Here you could fetch additional user data from database
    // For now, we'll return the decoded token info
    const profile = {
      id: user.sub,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      picture: user.picture,
      email_verified: user.email_verified,
      
      // Token metadata
      token_info: {
        issued_at: new Date(user.iat * 1000).toISOString(),
        expires_at: new Date(user.exp * 1000).toISOString(),
        issuer: user.iss,
        audience: user.aud
      },
      
      // Additional claims (if any)
      custom_claims: Object.fromEntries(
        Object.entries(user).filter(([key]) => 
          !['sub', 'email', 'name', 'nickname', 'picture', 'email_verified', 
            'iss', 'aud', 'exp', 'iat', 'nonce'].includes(key)
        )
      )
    }

    return createJsonResponse({
        success: true,
        data: profile,
        message: 'Profile retrieved successfully'
      })

  } catch (error) {
    console.error('Profile endpoint error:', error)
    
    return createJsonResponse({
        error: 'Internal Server Error',
        message: 'Failed to retrieve profile'
      }, 500)
  }
}

/**
 * Update user profile - secured endpoint
 */
export async function updateProfile(request: Request) {
  // Configure ID token validation
  const auth = requireIDToken({
    issuer: `https://${process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID || '',
    maxAge: 24 * 60 * 60 // 24 hours max age
  })

  // Validate the ID token
  const authResult = auth(request)
  
  if (!authResult.isValid) {
    return createJsonResponse({ 
        error: 'Unauthorized', 
        message: authResult.error 
      }, 401)
  }

  const user = authResult.user!

  try {
    // Parse request body
    const body = await request.json()
    
    // Validate and sanitize update data
    const allowedFields = ['name', 'nickname', 'preferences']
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    )

    // Simulate profile update (in real app, this would update database)
    const updatedProfile = {
      id: user.sub,
      email: user.email,
      ...updateData,
      updated_at: new Date().toISOString()
    }

    return createJsonResponse({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      })

  } catch (error) {
    console.error('Profile update error:', error)
    
    return createJsonResponse({
        error: 'Bad Request',
        message: 'Invalid request body'
      }, 400)
  }
}

/**
 * Get token info - debug endpoint to inspect ID token
 */
export async function getTokenInfo(request: Request) {
  // This is a debug endpoint - be careful in production
  const auth = requireIDToken({
    issuer: `https://${process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID || '',
    maxAge: 24 * 60 * 60
  })

  const authResult = auth(request)
  
  if (!authResult.isValid) {
    return createJsonResponse({ 
        error: 'Unauthorized', 
        message: authResult.error 
      }, 401)
  }

  const user = authResult.user!

  // Return detailed token information
  const tokenInfo = {
    header_info: 'ID Token successfully decoded and validated',
    user_id: user.sub,
    email: user.email,
    email_verified: user.email_verified,
    issued_at: new Date(user.iat * 1000).toISOString(),
    expires_at: new Date(user.exp * 1000).toISOString(),
    issuer: user.iss,
    audience: user.aud,
    time_to_expiry: Math.max(0, user.exp - Math.floor(Date.now() / 1000)),
    all_claims: user
  }

  return createJsonResponse({
      success: true,
      data: tokenInfo,
      message: 'Token information retrieved successfully'
    })
}

/**
 * Debug endpoint to check environment variables - REMOVE IN PRODUCTION
 */
export async function debugEnv() {
  // This is for debugging only - remove in production
  const envInfo = {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    VITE_AUTH0_DOMAIN: process.env.VITE_AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    VITE_AUTH0_CLIENT_ID: process.env.VITE_AUTH0_CLIENT_ID,
    NODE_ENV: process.env.NODE_ENV,
    available_env_keys: Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('auth') || key.toLowerCase().includes('vite')
    )
  }

  return createJsonResponse({
      success: true,
      data: envInfo,
      message: 'Environment variables debug info'
    })
}
