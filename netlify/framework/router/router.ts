import { Context } from '@netlify/functions'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'

export interface RequestWithParsedBody extends Request {
  parsedBody?: unknown
}

export interface RouteHandler {
  (req: RequestWithParsedBody, context: Context, params?: Record<string, string>): Promise<Response> | Response
}

export interface Middleware {
  (req: RequestWithParsedBody, context: Context, next: () => Promise<Response>): Promise<Response> | Response
}

interface Route {
  method: HttpMethod
  path: string        // Oryginalna ścieżka
  pattern: RegExp
  handler: RouteHandler
  paramNames: string[]
}

export class NetlifyRouter {
  private routes: Route[] = []
  private middlewares: Middleware[] = []

  // Dodaj middleware
  use(middleware: Middleware): void
  // Dodaj sub-router z prefiksem ścieżki
  use(path: string, router: NetlifyRouter): void
  use(pathOrMiddleware: string | Middleware, router?: NetlifyRouter): void {
    if (typeof pathOrMiddleware === 'string' && router) {
      // Montowanie sub-routera
      this.mountRouter(pathOrMiddleware, router)
    } else if (typeof pathOrMiddleware === 'function') {
      // Dodawanie middleware
      this.middlewares.push(pathOrMiddleware)
    }
  }

  // Montuj sub-router pod określoną ścieżką
  private mountRouter(basePath: string, router: NetlifyRouter): void {
    // Usuń trailing slash z basePath
    const normalizedBasePath = basePath.replace(/\/$/, '')
    
    // Dodaj wszystkie routes z sub-routera do głównego routera
    router.routes.forEach(route => {
      let fullPath = normalizedBasePath + route.path
      
      // Jeśli route.path to '/', zastąp go pustym stringiem aby uniknąć //
      if (route.path === '/') {
        fullPath = normalizedBasePath
      }
      
      const { pattern, paramNames } = this.pathToRegExp(fullPath)
      
      this.routes.push({
        method: route.method,
        path: fullPath,
        pattern,
        handler: route.handler,
        paramNames
      })
    })

    // Dodaj middleware z sub-routera
    this.middlewares.push(...router.middlewares)
  }

  // Dodaj route dla konkretnej metody HTTP
  private addRoute(method: HttpMethod, path: string, handler: RouteHandler): void {
    const { pattern, paramNames } = this.pathToRegExp(path)
    this.routes.push({ method, path, pattern, handler, paramNames })
  }

  // Metody HTTP
  get(path: string, handler: RouteHandler): void {
    this.addRoute('GET', path, handler)
  }

  post(path: string, handler: RouteHandler): void {
    this.addRoute('POST', path, handler)
  }

  put(path: string, handler: RouteHandler): void {
    this.addRoute('PUT', path, handler)
  }

  delete(path: string, handler: RouteHandler): void {
    this.addRoute('DELETE', path, handler)
  }

  patch(path: string, handler: RouteHandler): void {
    this.addRoute('PATCH', path, handler)
  }

  options(path: string, handler: RouteHandler): void {
    this.addRoute('OPTIONS', path, handler)
  }

  // Konwertuj ścieżkę na RegExp z parametrami
  private pathToRegExp(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = []
    
    // Zamień parametry (:param) na grupy przechwytujące BEFORE escaping slashes
    const regexPattern = path
      .replace(/:([^/]+)/g, (_match, paramName) => {
        paramNames.push(paramName)
        return '([^/]+)'
      })
      .replace(/\//g, '\\/')
      .replace(/\*/g, '.*')

    // Dodaj opcjonalny trailing slash - pozwala na dopasowanie z lub bez /
    const patternWithOptionalSlash = `^${regexPattern}\\/?$`

    return {
      pattern: new RegExp(patternWithOptionalSlash),
      paramNames
    }
  }  // Wyodrębnij parametry z URL
  private extractParams(pattern: RegExp, paramNames: string[], pathname: string): Record<string, string> {
    const matches = pathname.match(pattern)
    const params: Record<string, string> = {}
    
    if (matches && paramNames.length > 0) {
      paramNames.forEach((name, index) => {
        const paramValue = matches[index + 1]
        if (paramValue !== undefined) {
          params[name] = paramValue
        }
      })
    }

    return params
  }

  // Główna metoda obsługująca requesty
  async handle(request: RequestWithParsedBody, context: Context): Promise<Response> {
    const url = new URL(request.url)
    const originalPathname = url.pathname
    const method = request.method as HttpMethod

    // Handle both local development (/api) and Netlify Functions (/.netlify/functions/api) paths
    let pathname = originalPathname
    
    if (originalPathname.startsWith('/.netlify/functions/api')) {
      pathname = originalPathname.replace(/^\/\.netlify\/functions\/api/, '') || '/'
    } else if (originalPathname.startsWith('/api')) {
      pathname = originalPathname.replace(/^\/api/, '') || '/'
    } else {
      return new Response(JSON.stringify({ 
        error: 'Route not found',
        path: originalPathname,
        method 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      // Handle OPTIONS requests for CORS preflight
      if (method === 'OPTIONS') {
        const optionsHandler = async (): Promise<Response> => {
          return new Response(null, {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
              'Access-Control-Max-Age': '86400'
            }
          })
        }

        // Apply middleware to OPTIONS response
        let finalHandler = optionsHandler
        for (let i = this.middlewares.length - 1; i >= 0; i--) {
          const middleware = this.middlewares[i]
          if (middleware) {
            const currentHandler = finalHandler
            finalHandler = async () => {
              return await middleware(request, context, currentHandler)
            }
          }
        }

        return await finalHandler()
      }

      // Znajdź pasującą route
      const matchedRoute = this.routes.find(route => 
        route.method === method && route.pattern.test(pathname)
      )

      if (!matchedRoute) {
        // Create a 404 handler that will go through middleware
        const notFoundHandler = async (): Promise<Response> => {
          return new Response(JSON.stringify({ 
            error: 'Route not found',
            path: pathname,
            method 
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        // Apply middleware to 404 response
        let finalHandler = notFoundHandler
        for (let i = this.middlewares.length - 1; i >= 0; i--) {
          const middleware = this.middlewares[i]
          if (middleware) {
            const currentHandler = finalHandler
            finalHandler = async () => {
              return await middleware(request, context, currentHandler)
            }
          }
        }

        return await finalHandler()
      }

      // Wyodrębnij parametry
      const params = this.extractParams(
        matchedRoute.pattern, 
        matchedRoute.paramNames, 
        pathname
      )

      // NAPRAW: Ustaw params w context
      context.params = params

      // Wykonaj middleware chain
      const executeHandler = async (): Promise<Response> => {
        return await matchedRoute.handler(request, context, params)
      }

      let finalHandler = executeHandler

      // Zastosuj middleware w odwrotnej kolejności
      for (let i = this.middlewares.length - 1; i >= 0; i--) {
        const middleware = this.middlewares[i]
        if (middleware) {
          const currentHandler = finalHandler
          finalHandler = async () => {
            return await middleware(request, context, currentHandler)
          }
        }
      }

      return await finalHandler()

    } catch (error) {
      console.error('Router error:', error)
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  /**
   * Create a Netlify Functions handler that automatically converts
   * Netlify event format to Web API Request/Response
   */
  handler() {
    return async (event: any, context: Context) => {
      try {
        // Create proper Request object from Netlify event
        const url = `https://example.com${event.path || '/'}${event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''}`
        const request = new Request(url, {
          method: event.httpMethod || 'GET',
          headers: event.headers || {},
          body: event.body || undefined
        })
        
        const response = await this.handle(request, context)
        
        // Convert Response to Netlify format
        const responseText = await response.text()
        return {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText
        }
        
      } catch (error) {
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: String(error) })
        }
      }
    }
  }
}

// Helper functions dla response
export const json = (data: unknown, status: number = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const text = (text: string, status: number = 200): Response => {
  return new Response(text, {
    status,
    headers: { 'Content-Type': 'text/plain' }
  })
}

export const html = (html: string, status: number = 200): Response => {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html' }
  })
}

// Helper function do tworzenia resource routera (jak w Express.js)
export interface ResourceHandlers {
  index?: RouteHandler    // GET /
  show?: RouteHandler     // GET /:id
  create?: RouteHandler   // POST /
  update?: RouteHandler   // PUT /:id
  destroy?: RouteHandler  // DELETE /:id
}

export const createResourceRouter = (handlers: ResourceHandlers): NetlifyRouter => {
  const router = new NetlifyRouter()

  if (handlers.index) {
    router.get('/', handlers.index)
  }
  
  if (handlers.show) {
    router.get('/:id', handlers.show)
  }
  
  if (handlers.create) {
    router.post('/', handlers.create)
  }
  
  if (handlers.update) {
    router.put('/:id', handlers.update)
  }
  
  if (handlers.destroy) {
    router.delete('/:id', handlers.destroy)
  }

  return router
}
