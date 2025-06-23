import { describe, it, expect } from 'vitest'
import { cache, hashString, sanitizeInput, createErrorResponse, validateFields, paginate } from '../utils/utils.js'

describe('utils.ts - extra coverage', () => {
  describe('cache', () => {
    it('should set and get value', () => {
      cache.set('key', 123, 1000)
      expect(cache.get('key')).toBe(123)
    })
    it('should delete value', () => {
      cache.set('key2', 456, 1000)
      cache.delete('key2')
      expect(cache.get('key2')).toBeUndefined()
    })
    it('should clear values by pattern', () => {
      cache.set('abc', 1, 1000)
      cache.set('abcd', 2, 1000)
      cache.clear('abc')
      expect(cache.get('abc')).toBeUndefined()
      expect(cache.get('abcd')).toBeUndefined()
    })
  })

  describe('hashString', () => {
    it('should return a hash for a string', () => {
      expect(typeof hashString('test')).toBe('string')
      expect(hashString('test')).not.toBe(hashString('test2'))
    })
    it('should return 0 for empty string', () => {
      expect(hashString('')).toBe('0')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags and quotes', () => {
      expect(sanitizeInput('<b>test</b>\'\"')).toBe('btest/b')
    })
    it('should remove javascript: and event handlers', () => {
      expect(sanitizeInput('javascript:alert(1) onload=')).toBe('alert(1) ')
    })
    it('should trim and limit length', () => {
      expect(sanitizeInput('   test   ')).toBe('test')
      expect(sanitizeInput('a'.repeat(2000)).length).toBeLessThanOrEqual(1000)
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response with status and message', async () => {
      const res = createErrorResponse('err', 403)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toBe('err')
      expect(body.status).toBe(403)
    })
    it('should include details if provided', async () => {
      const res = createErrorResponse('err', 400, { foo: 1 })
      const body = await res.json()
      expect(body.details).toEqual({ foo: 1 })
    })
  })

  describe('validateFields', () => {
    it('should detect missing fields', () => {
      const result = validateFields({}, ['a', 'b'])
      expect(result.isValid).toBe(false)
      expect(result.missing).toEqual(['a', 'b'])
    })
    it('should detect empty string fields', () => {
      const result = validateFields({ a: '', b: 'ok' }, ['a', 'b'])
      expect(result.isValid).toBe(false)
      expect(result.missing).toContain('a')
    })
    it('should pass when all fields present', () => {
      const result = validateFields({ a: 'x', b: 'y' }, ['a', 'b'])
      expect(result.isValid).toBe(true)
      expect(result.missing).toEqual([])
    })
  })

  describe('paginate', () => {
    it('should paginate items correctly', () => {
      const arr = Array.from({ length: 25 }, (_, i) => i + 1)
      const page1 = paginate(arr, 1, 10)
      expect(page1.items).toEqual([1,2,3,4,5,6,7,8,9,10])
      expect(page1.hasNext).toBe(true)
      expect(page1.hasPrev).toBe(false)
      const page3 = paginate(arr, 3, 10)
      expect(page3.items).toEqual([21,22,23,24,25])
      expect(page3.hasNext).toBe(false)
      expect(page3.hasPrev).toBe(true)
    })
  })
})
