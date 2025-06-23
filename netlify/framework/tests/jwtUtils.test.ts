import { describe, it, expect, vi } from 'vitest'
import {
  decodeJWT,
  isTokenExpired,
  verifyIssuer,
  verifyAudience,
  validateIDToken,
  extractBearerToken,
  requireIDToken,
  getUserFromIDToken,
  getTokenInfo,
  createJsonResponse
} from '../utils/jwtUtils.js'

// Helper to create a valid JWT (header.payload.signature)
function makeJWT(payload: object, header: object = { alg: 'HS256', typ: 'JWT', kid: 'abc' }) {
  const base64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return [base64url(header), base64url(payload), 'sig'].join('.')
}

describe('jwtUtils', () => {
  const now = Math.floor(Date.now() / 1000)
  const validPayload = {
    iss: 'issuer',
    sub: 'user',
    aud: 'aud',
    exp: now + 1000,
    iat: now - 10,
    email: 'a@b.com',
    name: 'Test'
  }
  const expiredPayload = { ...validPayload, exp: now - 100 }
  const wrongIssuer = { ...validPayload, iss: 'bad' }
  const wrongAudience = { ...validPayload, aud: 'other' }

  it('decodes valid JWT', () => {
    const token = makeJWT(validPayload)
    const decoded = decodeJWT(token)
    expect(decoded.payload.iss).toBe('issuer')
    expect(decoded.header.alg).toBe('HS256')
    expect(decoded.signature).toBe('sig')
  })

  it('throws on invalid JWT format', () => {
    expect(() => decodeJWT('bad.token')).toThrow('Invalid JWT format')
  })

  it('throws on invalid base64', () => {
    const token = 'bad.bad.bad'
    expect(() => decodeJWT(token)).toThrow()
  })

  it('isTokenExpired returns true for expired', () => {
    expect(isTokenExpired(expiredPayload)).toBe(true)
    expect(isTokenExpired(validPayload)).toBe(false)
  })

  it('verifyIssuer and verifyAudience', () => {
    expect(verifyIssuer(validPayload, 'issuer')).toBe(true)
    expect(verifyIssuer(validPayload, 'bad')).toBe(false)
    expect(verifyAudience(validPayload, 'aud')).toBe(true)
    expect(verifyAudience(validPayload, 'other')).toBe(false)
    // Test with aud as array
    const arrPayload = { ...validPayload, aud: ['aud', 'x'] as any }
    expect(verifyAudience(arrPayload as any, 'aud')).toBe(true)
  })

  it('validateIDToken: valid, expired, wrong issuer/audience, maxAge', () => {
    const token = makeJWT(validPayload)
    expect(validateIDToken(token, { issuer: 'issuer', audience: 'aud' }).isValid).toBe(true)
    const expired = makeJWT(expiredPayload)
    expect(validateIDToken(expired, { issuer: 'issuer', audience: 'aud' }).isValid).toBe(false)
    const badIssuer = makeJWT(wrongIssuer)
    expect(validateIDToken(badIssuer, { issuer: 'issuer', audience: 'aud' }).isValid).toBe(false)
    const badAud = makeJWT(wrongAudience)
    expect(validateIDToken(badAud, { issuer: 'issuer', audience: 'aud' }).isValid).toBe(false)
    // maxAge
    const old = makeJWT({ ...validPayload, iat: now - 10000 })
    expect(validateIDToken(old, { issuer: 'issuer', audience: 'aud', maxAge: 100 }).isValid).toBe(false)
  })

  it('validateIDToken: catches decode error', () => {
    expect(validateIDToken('bad.token', { issuer: 'issuer', audience: 'aud' }).isValid).toBe(false)
  })

  it('extractBearerToken', () => {
    expect(extractBearerToken('Bearer abc')).toBe('abc')
    expect(extractBearerToken('bearer xyz')).toBe('xyz')
    expect(extractBearerToken('Token abc')).toBeNull()
    expect(extractBearerToken(undefined)).toBeNull()
  })

  it('requireIDToken: valid, no token, invalid token', () => {
    const token = makeJWT(validPayload)
    // Minimal mock Request with headers.get
    const req = { headers: { get: (k: string) => k === 'Authorization' ? 'Bearer ' + token : null } } as any as Request
    expect(requireIDToken({ issuer: 'issuer', audience: 'aud' })(req).isValid).toBe(true)
    // No token
    const req2 = { headers: { get: (_: string) => null } } as any as Request
    expect(requireIDToken({ issuer: 'issuer', audience: 'aud' })(req2).isValid).toBe(false)
    // Invalid token
    const req3 = { headers: { get: (k: string) => k === 'Authorization' ? 'Bearer bad.token' : null } } as any as Request
    expect(requireIDToken({ issuer: 'issuer', audience: 'aud' })(req3).isValid).toBe(false)
  })

  it('getUserFromIDToken returns payload or null', () => {
    const token = makeJWT(validPayload)
    expect(getUserFromIDToken(token)).toMatchObject({ iss: 'issuer' })
    expect(getUserFromIDToken('bad.token')).toBeNull()
  })

  it('getTokenInfo returns info', () => {
    const token = makeJWT(validPayload)
    const info = getTokenInfo(token)
    expect(info.header.alg).toBe('HS256')
    expect(info.payload.iss).toBe('issuer')
    expect(typeof info.isExpired).toBe('boolean')
    expect(typeof info.expiresAt).toBe('string')
    expect(typeof info.issuedAt).toBe('string')
  })

  it('createJsonResponse returns Response with JSON', async () => {
    const res = createJsonResponse({ ok: 1 }, 201)
    expect(res.status).toBe(201)
    expect(res.headers.get('Content-Type')).toMatch(/json/)
    const body = await res.json()
    expect(body.ok).toBe(1)
  })
})
