import { describe, it, expect } from 'vitest'
import '../index'
import '../middleware/index'
import '../types/index'

describe('index exports', () => {
  it('should import without error', () => {
    expect(true).toBe(true)
  })
})
