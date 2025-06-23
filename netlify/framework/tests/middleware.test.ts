import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { RequestWithParsedBody } from '../router/router'

describe('Middleware', () => {
  let request: RequestWithParsedBody
  let response: any
  let next: () => void

  beforeEach(() => {
    request = {} as RequestWithParsedBody
    response = {}
    next = vi.fn()
  })

  it('placeholder test', () => {
    expect(true).toBe(true)
  })
})
