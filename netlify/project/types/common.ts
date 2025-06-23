// Generic API types that are shared across all controllers

// Error types
export interface APIError {
  error: string
  message?: string
  code?: string
  details?: unknown
}

// Metadata for API responses
export interface ApiMetadata {
  timestamp: string
  requestId?: string
  version?: string
  totalCount?: number
  page?: number
  limit?: number
  hasNext?: boolean
  hasPrevious?: boolean
  [key: string]: unknown
}

// Standard API Response
export interface ApiResponse<T = unknown> {
  status: 'ok' | 'degraded' | 'error'
  payload?: T
  error?: APIError
  metadata: ApiMetadata
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  hasMore: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationParams
}

// Utility types
export interface QueryParams {
  [key: string]: string | undefined
}

export interface RouteParams {
  [key: string]: string
}

// Extended Context type for Netlify
export interface ExtendedContext {
  requestId?: string
  startTime?: number
  health?: {
    uptime: number
    memory: NodeJS.MemoryUsage
    timestamp: string
  }
}
