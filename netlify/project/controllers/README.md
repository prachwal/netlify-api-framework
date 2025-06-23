# Controllers Documentation

## Overview
This document provides a comprehensive overview of all backend controllers, their responsibilities, API endpoints, and frontend integration points.

## Controller Structure
Each controller follows a standardized folder structure:
```
controller-name/
├── controller.ts    # Main controller logic with route handlers
├── index.ts        # Re-exports for clean imports
├── types.ts        # TypeScript types and interfaces
└── README.md       # Controller-specific documentation
```

---

## 🏥 Health Controller
**Path:** `netlify/project/controllers/health/`
**Documentation:** `health/README.md`

### Purpose
Monitors system health including database connectivity, Auth0 service status, and system metrics.

### API Endpoints
- `GET /api/health` - Complete health check with database and Auth0 status

### Frontend Integration
- **Component:** `src/components/api/HealthCheckComponent.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Health Check tab)
- **State Machine:** `src/machines/api/healthMachine.ts`
- **Tests:** `src/services/__tests__/apiServices.test.ts`

---

## 👋 Hello Controller
**Path:** `netlify/project/controllers/hello/`
**Documentation:** `hello/README.md`

### Purpose
Simple greeting endpoint for testing and demonstration purposes.

### API Endpoints
- `GET /api/hello` - Default greeting
- `GET /api/hello/:name` - Personalized greeting with name parameter

### Frontend Integration
- **Component:** `src/components/api/HelloComponent.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Hello API tab)
- **State Machine:** `src/machines/api/helloMachine.ts`

---

## 👥 Users Controller
**Path:** `netlify/project/controllers/users/`
**Documentation:** `users/README.md`

### Purpose
Complete CRUD operations for user management with pagination and search.

### API Endpoints
- `GET /api/users` - List users with pagination and search
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update existing user
- `DELETE /api/users/:id` - Delete user

### Frontend Integration
- **Component:** `src/components/api/UsersComponent.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Users tab)
- **Tests:** `src/components/__tests__/UsersComponent.test.tsx`

---

## 📝 Posts Controller
**Path:** `netlify/project/controllers/posts/`
**Documentation:** `posts/README.md`

### Purpose
Blog post management with basic CRUD operations (partial implementation).

### API Endpoints
- `GET /api/posts` - List posts with pagination
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post

### Functions
- `getPosts()` - List posts
- `getPostById()` - Get single post
- `createPost()` - Create new post

### Frontend Integration
- **Component:** `src/components/api/PostsComponent.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Posts tab)
- **Detail View:** `src/pages/main/PostDetail.tsx`

### Types
- `Post` - Main post entity
- `CreatePostRequest` - Post creation payload
### Purpose
Complete CRUD operations for post management with pagination and search functionality.

### API Endpoints
- `GET /api/posts` - List posts with pagination and search
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update existing post
- `DELETE /api/posts/:id` - Delete post

### Frontend Integration
- **Component:** `src/components/api/PostsComponent.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Posts tab)
- **Tests:** `src/services/__tests__/apiServices.test.ts`

---

## 📁 Upload Controller
**Path:** `netlify/project/controllers/upload/`
**Documentation:** `upload/README.md`

### Purpose
File upload handling with validation, security checks, and storage management.

### API Endpoints
- `POST /api/upload` - Upload single file with validation

### Frontend Integration
- **Component:** `src/components/api/UploadComponent.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Upload tab)
- **Tests:** `src/services/__tests__/apiServices.test.ts`

---

## 🔐 Profile Controller
**Path:** `netlify/project/controllers/profile/`
**Documentation:** `profile/README.md`

### Purpose
Secured user profile management requiring Auth0 ID token authentication.

### API Endpoints
- `GET /api/profile` - Get current user profile (secured)
- `PUT /api/profile` - Update user profile (secured)

### Frontend Integration
- **Component:** `src/components/api/SecuredApiTester.tsx`
- **Page Integration:** `src/pages/lab/Lab.tsx` (Secured API tab)
- **Auth Integration:** `src/contexts/Auth0Context.tsx`

---

## 💾 Database Controller
**Path:** `netlify/project/controllers/database/`
**Documentation:** `database/README.md`

### Purpose
Database health monitoring and management operations.

### API Endpoints
- `GET /api/database/health` - Database health check
- `POST /api/database/init` - Initialize database (development only)

### Frontend Integration
- **No direct frontend usage** - Used internally by system monitoring
- **Potential use:** Admin dashboards, health monitoring UIs

---

## 🐛 Debug Controller
**Path:** `netlify/project/controllers/debug/`
**Documentation:** `debug/README.md`

### Purpose
Development and debugging utilities for environment inspection.

### API Endpoints
- `GET /api/debug-env` - Environment variables and system info

### Frontend Integration
- **Component:** `src/components/api/SecuredApiTester.tsx` (debug functionality)
- **Use case:** Development troubleshooting and environment verification

---

## 🎥 YouTube Controller
**Path:** `netlify/project/controllers/youtube/`
**Documentation:** `youtube/README.md`

### Purpose
Comprehensive YouTube API v3 integration with search, video details, captions, transcripts, and MongoDB caching.

### API Endpoints
- `GET /api/youtube/search` - Search YouTube videos with caching
- `GET /api/youtube/recent` - Get cached videos with pagination
- `GET /api/youtube/video` - Get video details (cached or fresh)
- `POST /api/youtube/transcript-save` - Save browser-extracted transcripts
- `GET /api/youtube/captions` - Get available captions for video

### Frontend Integration
- **Components:** 
  - `src/components/features/YouTubeDemoNew.tsx` (main)
  - `src/components/features/YouTubeDemo.tsx` (legacy)
  - `src/components/video/VideoCard.tsx`
- **Hooks:** 
  - `src/hooks/useYouTubeNew.ts` (server-side API)
  - `src/hooks/useYouTube.ts` (client-side API)
- **Services:** 
  - `src/services/youtubeApiClient.ts`
  - `src/services/youtubeService.ts`
- **Utilities:**
  - `src/utils/youtubeTranscriptExtractor.ts`
  - `src/utils/youtubeBookmarkletImproved.ts`
- **Page Integration:** `src/pages/lab/Lab.tsx` (YouTube demo)

### Special Features
- **MongoDB Caching**: All searches and video details cached for performance
- **Transcript Processing**: Browser-extracted transcripts saved to database
- **CORS Support**: Full CORS for browser extensions and bookmarklets
- **Quota Optimization**: Smart caching reduces YouTube API quota usage
---

## 📋 Main Controller Aggregator
**Path:** `netlify/project/controllers/controllers.ts`

### Purpose
Central export point for all controller functions, used by the main API router.

### Exports
All controller functions are re-exported for clean imports in the routing layer.

---

## 🔗 API Routing
**Main API Entry:** `netlify/functions/api.mts`

### Route Structure
```
/api/
├── health                 # Health Controller
├── hello[/:name]         # Hello Controller
├── users/*               # Users Controller (nested router)
├── posts/*               # Posts Controller (nested router)
├── upload                # Upload Controller
├── profile               # Profile Controller (secured)
├── token-info            # Profile Controller (secured)
├── debug-env             # Profile Controller
├── debug                 # Debug Controller
├── db/*                  # Database Controller
├── blobs/*               # Netlify Blobs (separate router)
└── youtube/*             # YouTube Controller (nested router)
```

### Middleware Stack
1. CORS middleware
2. Logging middleware
3. JSON body parser
4. Rate limiting (50 requests/minute)

---

## 🧪 Testing
Each controller has corresponding tests in:
- `src/services/__tests__/apiServices.test.ts` - API integration tests
- `src/components/__tests__/` - Component tests
- `netlify/tests/` - Backend controller tests

---

## 🔧 Development Notes

### Adding New Controllers
1. Create folder with `controller.ts`, `index.ts`, `types.ts`
2. Add to `controllers.ts` aggregator
3. Update `netlify/project/types/types.ts`
4. Add routing in `api.mts`
5. Create frontend component if needed
6. Add to Lab.tsx if UI component exists

### Type System
- Backend types in controller `types.ts` files
- Frontend types in `src/types/` with re-exports
- Shared types through `netlify/project/types/types.ts`

### Security
- Profile endpoints require Auth0 ID token
- Rate limiting applied globally
- CORS enabled for development
