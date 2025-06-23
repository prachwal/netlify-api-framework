// Framework Core Types
// These are reusable types for the router framework

export interface RouteContext {
  health?: {
    uptime: number
  }
  [key: string]: unknown
}

export interface RouteParams {
  [key: string]: string
}

export interface ParsedQueryParams {
  [key: string]: string | undefined
}

// Response helpers
export interface JsonResponse {
  [key: string]: unknown
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  totalItems: number
  totalPages: number
  currentPage: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ValidationResult {
  isValid: boolean
  missing: string[]
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheStore {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T, ttl?: number): void
  delete(key: string): void
  clear(): void
}
