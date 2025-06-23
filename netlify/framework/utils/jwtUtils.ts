// JWT Utilities for ID Token verification
// Handles Auth0 ID token decoding and verification

interface JWTHeader {
  alg: string
  typ: string
  kid: string
}

interface JWTPayload {
  iss: string // Issuer
  sub: string // Subject (user ID)
  aud: string // Audience
  exp: number // Expiration time
  iat: number // Issued at time
  nonce?: string
  email?: string
  email_verified?: boolean
  name?: string
  nickname?: string
  picture?: string
  [key: string]: any
}

interface DecodedJWT {
  header: JWTHeader
  payload: JWTPayload
  signature: string
}

/**
 * Decode JWT token without verification (for debugging/inspection)
 */
export function decodeJWT(token: string): DecodedJWT {
  const parts = token.split('.')
  
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  try {
    // Helper function to decode base64url with proper UTF-8 handling
    const decodeBase64Url = (str: string): string => {
      // Convert base64url to base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '='
      }
      
      // Decode base64 to binary string
      const binaryString = atob(base64)
      
      // Convert binary string to UTF-8
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // Decode as UTF-8
      return new TextDecoder('utf-8').decode(bytes)
    }

    const header = JSON.parse(decodeBase64Url(parts[0])) as JWTHeader
    const payload = JSON.parse(decodeBase64Url(parts[1])) as JWTPayload
    const signature = parts[2]

    return { header, payload, signature }
  } catch (error) {
    throw new Error('Failed to decode JWT: ' + (error as Error).message)
  }
}

/**
 * Verify JWT token expiration
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Verify JWT token issuer
 */
export function verifyIssuer(payload: JWTPayload, expectedIssuer: string): boolean {
  return payload.iss === expectedIssuer
}

/**
 * Verify JWT token audience
 */
export function verifyAudience(payload: JWTPayload, expectedAudience: string): boolean {
  if (Array.isArray(payload.aud)) {
    return payload.aud.includes(expectedAudience)
  }
  return payload.aud === expectedAudience
}

/**
 * Basic JWT validation (without signature verification)
 * For full security, you should verify the signature using Auth0's public key
 */
export function validateIDToken(
  token: string,
  options: {
    issuer: string
    audience: string
    maxAge?: number // Maximum age in seconds
  }
): { isValid: boolean; payload: JWTPayload | null; error?: string } {
  try {
    const decoded = decodeJWT(token)
    const { payload } = decoded

    // Check expiration
    if (isTokenExpired(payload)) {
      return { isValid: false, payload: null, error: 'Token has expired' }
    }

    // Check issuer
    if (!verifyIssuer(payload, options.issuer)) {
      return { isValid: false, payload: null, error: 'Invalid issuer' }
    }

    // Check audience
    if (!verifyAudience(payload, options.audience)) {
      return { isValid: false, payload: null, error: 'Invalid audience' }
    }

    // Check max age if provided
    if (options.maxAge) {
      const now = Math.floor(Date.now() / 1000)
      const tokenAge = now - payload.iat
      if (tokenAge > options.maxAge) {
        return { isValid: false, payload: null, error: 'Token is too old' }
      }
    }

    return { isValid: true, payload }
  } catch (error) {
    return { isValid: false, payload: null, error: (error as Error).message }
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

/**
 * Middleware function for ID token authentication
 */
export function requireIDToken(options: {
  issuer: string
  audience: string
  maxAge?: number
}) {
  return (request: Request): { isValid: boolean; user?: JWTPayload; error?: string } => {
    console.log('=== JWT Validation Debug ===')
    console.log('Expected issuer:', options.issuer)
    console.log('Expected audience:', options.audience)
    
    const authHeader = request.headers.get('Authorization')
    console.log('Authorization header present:', !!authHeader)
    
    const token = extractBearerToken(authHeader)
    console.log('Token extracted:', !!token)

    if (!token) {
      console.log('❌ No authorization token provided')
      return { isValid: false, error: 'No authorization token provided' }
    }

    try {
      // First decode the token to see what's in it
      const decoded = decodeJWT(token)
      console.log('Token decoded successfully')
      console.log('Token issuer:', decoded.payload.iss)
      console.log('Token audience:', decoded.payload.aud)
      console.log('Token expiry:', new Date(decoded.payload.exp * 1000).toISOString())
      
      const validation = validateIDToken(token, options)
      
      if (!validation.isValid) {
        console.log('❌ Token validation failed:', validation.error)
        return { isValid: false, error: validation.error }
      }

      console.log('✅ Token validation successful')
      return { isValid: true, user: validation.payload! }
    } catch (error) {
      console.log('❌ Token decoding failed:', (error as Error).message)
      return { isValid: false, error: 'Invalid token format' }
    }
  }
}

/**
 * Get user info from ID token
 */
export function getUserFromIDToken(token: string): JWTPayload | null {
  try {
    const decoded = decodeJWT(token)
    return decoded.payload
  } catch {
    return null
  }
}

/**
 * Format token info for debugging
 */
export function getTokenInfo(token: string): {
  header: JWTHeader
  payload: JWTPayload
  isExpired: boolean
  expiresAt: string
  issuedAt: string
} {
  const decoded = decodeJWT(token)
  
  return {
    header: decoded.header,
    payload: decoded.payload,
    isExpired: isTokenExpired(decoded.payload),
    expiresAt: new Date(decoded.payload.exp * 1000).toISOString(),
    issuedAt: new Date(decoded.payload.iat * 1000).toISOString()
  }
}

/**
 * Create standardized JSON response with proper UTF-8 encoding
 */
export function createJsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  })
}
