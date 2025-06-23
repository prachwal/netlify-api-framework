// Database controller - database operations and health checks
import { checkDatabaseHealth, initializeDatabase, connectToDatabase } from '../../../utils/database'

// Utility function to create standardized JSON responses with proper UTF-8 encoding
function createJsonResponseLocal(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    }
  )
}

/**
 * Database health check endpoint
 */
export async function databaseHealth() {
  try {
    const healthCheck = await checkDatabaseHealth()
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503
    
    return createJsonResponseLocal({
      success: healthCheck.status === 'healthy',
      data: healthCheck,
      message: healthCheck.message
    }, statusCode)
    
  } catch (error) {
    console.error('Database health check error:', error)
    
    return createJsonResponseLocal({
      success: false,
      error: 'Database Health Check Failed',
      message: (error as Error).message
    }, 503)
  }
}

/**
 * Initialize database endpoint (development only)
 */
export async function initDatabase() {
  try {
    // Only allow in development/staging
    if (process.env.NODE_ENV === 'production') {
      return createJsonResponseLocal({
        success: false,
        error: 'Forbidden',
        message: 'Database initialization is not allowed in production'
      }, 403)
    }

    await initializeDatabase()
    
    return createJsonResponseLocal({
      success: true,
      message: 'Database initialized successfully',
      data: {
        collections: ['users', 'profiles', 'sessions', 'logs'],
        indexes: 'Created successfully'
      }
    })
    
  } catch (error) {
    console.error('Database initialization error:', error)
    
    return createJsonResponseLocal({
      success: false,
      error: 'Database Initialization Failed',
      message: (error as Error).message
    }, 500)
  }
}

/**
 * Database info endpoint
 */
export async function databaseInfo() {
  try {
    const { db } = await connectToDatabase()
    
    // Get database stats
    const stats = await db.stats()
    const collections = await db.listCollections().toArray()
    
    return createJsonResponseLocal({
      success: true,
      data: {
        database: db.databaseName,
        collections: collections.map(col => ({
          name: col.name,
          type: col.type
        })),
        stats: {
          collections: stats.collections,
          views: stats.views,
          objects: stats.objects,
          avgObjSize: stats.avgObjSize,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          indexSize: stats.indexSize
        }
      },
      message: 'Database information retrieved successfully'
    })
    
  } catch (error) {
    console.error('Database info error:', error)
    
    return createJsonResponseLocal({
      success: false,
      error: 'Database Info Failed',
      message: (error as Error).message
    }, 500)
  }
}
