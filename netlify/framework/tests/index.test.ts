import { describe, it, expect } from 'vitest'
import '../index.js'
import '../middleware/index.js'
import '../types/index.js'

describe('index exports', () => {
  it('should import without error', () => {
    expect(true).toBe(true)
  })
})
