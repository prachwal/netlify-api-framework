// test-api.mjs
import fetch from 'node-fetch'

const BASE = 'http://localhost:9999/.netlify/functions/api'

const tests = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/hello' },
  { method: 'GET', path: '/hello/test' },
  { method: 'POST', path: '/upload', body: JSON.stringify({ foo: 'bar' }), headers: { 'Content-Type': 'application/json' } },
  { method: 'GET', path: '/profile' },
  { method: 'PUT', path: '/profile', body: JSON.stringify({ name: 'New Name' }), headers: { 'Content-Type': 'application/json' } },
  { method: 'GET', path: '/token-info' },
  { method: 'GET', path: '/debug-env' },
  { method: 'GET', path: '/debug' },
  // Users resource CRUD (przykładowe)
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/users/1' },
  { method: 'POST', path: '/users', body: JSON.stringify({ name: 'Test', email: 'test@example.com' }), headers: { 'Content-Type': 'application/json' } },
  { method: 'PUT', path: '/users/1', body: JSON.stringify({ name: 'Updated' }), headers: { 'Content-Type': 'application/json' } },
  { method: 'DELETE', path: '/users/1' },
]

async function testApi() {
  for (const t of tests) {
    const url = BASE + t.path
    const opts = { method: t.method, headers: t.headers || {}, body: t.body }
    // GET/HEAD must not have body
    if ((t.method === 'GET' || t.method === 'HEAD') && opts.body) delete opts.body
    console.log(`\n${t.method} ${url}`)
    try {
      const res = await fetch(url, opts)
      console.log('Status:', res.status)
      console.log('Headers:', Object.fromEntries(res.headers.entries()))
      const contentType = res.headers.get('content-type') || ''
      const body = contentType.includes('json') ? await res.json() : await res.text()
      console.log('Body:', body)
    } catch (e) {
      console.error('Request failed:', e)
    }
  }
}

testApi().catch(console.error)
