# Users Controller

## Overview
Complete CRUD operations for user management with pagination, search, and validation.

## API Endpoints

### `GET /api/users`
List users with optional pagination and search.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for name/email
- `sortBy` - Sort field (name, email, createdAt)
- `sortOrder` - Sort direction (asc, desc)

### `GET /api/users/:id`
Get specific user by ID.

### `POST /api/users`
Create new user.

**Request Body:**
```typescript
{
  name: string,
  email: string
}
```

### `PUT /api/users/:id`
Update existing user.

**Request Body:**
```typescript
{
  name?: string,
  email?: string
}
```

### `DELETE /api/users/:id`
Delete user by ID.

## Functions

### `getUsers(): RouteHandler`
- Pagination support
- Search functionality (name, email)
- Sorting options
- Input validation

### `getUserById(): RouteHandler`
- ID validation
- 404 handling for non-existent users

### `createUser(): RouteHandler`
- Email format validation
- Duplicate email prevention
- Required field validation

### `updateUser(): RouteHandler`
- Partial update support
- Email uniqueness validation
- 404 handling

### `deleteUser(): RouteHandler`
- ID validation
- Soft delete simulation
- 404 handling

## Frontend Integration

### Component
- **File:** `src/components/api/UsersComponent.tsx`
- **Features:**
  - User list with pagination
  - Search functionality
  - Create/Edit forms
  - Delete confirmation
  - Real-time updates

### Page Integration
- **File:** `src/pages/lab/Lab.tsx`
- **Tab:** "👥 Users"
- **Route:** `/lab` (users tab)

### Tests
- **File:** `src/components/__tests__/UsersComponent.test.tsx`
- **Coverage:** All CRUD operations, pagination, search

## Types

### `User`
Main user entity:
```typescript
{
  id: string,
  name: string,
  email: string,
  age?: number,
  createdAt?: string,
  updatedAt?: string
}
```

### `CreateUserRequest`
User creation payload:
```typescript
{
  name: string,
  email: string
}
```

### `UpdateUserRequest`
User update payload:
```typescript
{
  name?: string,
  email?: string
}
```

## Implementation Details

### Validation
- Email format validation using regex
- Name length validation (1-100 characters)
- Required field checking

### Pagination
- Default page size: 10
- Maximum page size: 100
- Total count calculation
- Has next/previous indicators

### Search
- Case-insensitive search
- Searches both name and email fields
- Partial matching support

### Error Handling
- 400 for validation errors
- 404 for not found
- 409 for duplicate email
- Detailed error messages

## Mock Data
Uses in-memory array for demonstration:
- Pre-populated with sample users
- Simulates database operations
- Includes realistic user data
