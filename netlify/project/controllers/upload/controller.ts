import { 
  RouteHandler, 
  RequestWithParsedBody, 
  json, 
  sanitizeString, 
  log, 
  validateRequiredFields,
  generateId
} from '../../../framework'
import { UploadFileResponse } from './types'
import { ApiResponse, APIError } from '../../types/common'

// Helper functions for consistent API responses
const createSuccessResponse = <T>(
  payload: T,
  additionalMetadata?: Record<string, unknown>
): ApiResponse<T> => {
  return {
    status: 'ok',
    payload,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
      ...additionalMetadata
    }
  }
}

const createErrorResponse = (
  error: APIError,
  additionalMetadata?: Record<string, unknown>
): ApiResponse => {
  return {
    status: 'error',
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
      ...additionalMetadata
    }
  }
}

export const uploadFile: RouteHandler = async (req) => {
  try {
    const contentType = req.headers.get('content-type')
    
    // Handle JSON requests (as expected by tests)
    if (contentType && contentType.includes('application/json')) {
      const body = (req as RequestWithParsedBody).parsedBody as {
        filename?: string
        content?: string
        mimetype?: string
        size?: number
      }
      
      // Validate required fields
      const validation = validateRequiredFields(body, ['filename', 'content'])
      if (!validation.isValid) {
        return json(createErrorResponse({
          error: 'Missing required fields',
          code: 'VALIDATION_ERROR',
          details: { missing: validation.missing }
        }), 400)
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      const contentSize = body.size || (body.content ? body.content.length : 0)
      if (contentSize > maxSize) {
        return json(createErrorResponse({
          error: 'File too large. Maximum size is 5MB',
          code: 'FILE_TOO_LARGE'
        }), 400)
      }
      
      // Validate file type
      const allowedTypes = ['text/plain', 'image/jpeg', 'image/png', 'application/pdf']
      if (body.mimetype && !allowedTypes.includes(body.mimetype)) {
        return json(createErrorResponse({
          error: 'File type not allowed',
          code: 'INVALID_FILE_TYPE'
        }), 400)
      }
      
      const uploadResponse = {
        message: 'File uploaded successfully',
        file: {
          filename: sanitizeString(body.filename!, 255),
          size: contentSize,
          type: body.mimetype || 'unknown',
          uploadedAt: new Date().toISOString()
        }
      }
      
      log('info', `File uploaded: ${body.filename}`, { size: body.size, type: body.mimetype })
      
      return json(createSuccessResponse(uploadResponse))
    }
    
    // Handle multipart/form-data requests (fallback)
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return json(createErrorResponse({
        error: 'Multipart form data required',
        code: 'INVALID_CONTENT_TYPE'
      }), 400)
    }
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return json(createErrorResponse({
        error: 'No file uploaded',
        code: 'NO_FILE_PROVIDED'
      }), 400)
    }
    
    // W prawdziwej aplikacji tutaj byłby upload do storage
    const uploadResponse: UploadFileResponse = {
      message: 'File uploaded successfully',
      fileName: sanitizeString(file.name, 255),
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    }
    
    log('info', `File uploaded: ${file.name}`, { size: file.size, type: file.type })
    
    return json(createSuccessResponse(uploadResponse))
  } catch (error: unknown) {
    log('error', 'Upload error', error)
    return json(createErrorResponse({
      error: 'Upload failed',
      code: 'UPLOAD_ERROR'
    }), 500)
  }
}
