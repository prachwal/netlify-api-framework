import { RouteHandler, json, parseQueryParams } from '../../../framework'
import { ApiResponse } from '../../types/common'

// Hello World (z parametrem)
export const hello: RouteHandler = async (req, _context, params) => {
  const queryParams = parseQueryParams(req)
  const name = params?.name || queryParams.name || 'World'
  const cleanName = name.trim() || 'World'
  
  const helloData = {
    message: `Hello, ${cleanName}!`,
    timestamp: new Date().toISOString()
  }
  
  const response: ApiResponse<typeof helloData> = {
    status: 'ok',
    payload: helloData,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  }
  
  return json(response)
}
