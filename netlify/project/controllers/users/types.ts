// User-related types

export interface User {
  id: string
  name: string
  email: string
  age?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserRequest {
  name: string
  email: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}
