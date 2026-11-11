import { createOrderMiddleware } from '../server/test-payment-api.mjs'

// Preserve original request bytes for Razorpay's signature verification.
export const config = { api: { bodyParser: false } }
export const maxDuration = 60
let middleware

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
  try {
    // Plain Vercel functions do not infer a catch-all filesystem route. The
    // explicit rewrite supplies the path while preserving staff query fields.
    const url = new URL(req.url, 'https://api.invalid')
    if (url.pathname === '/api/index') {
      const route = url.searchParams.get('route') || ''
      url.searchParams.delete('route')
      if (!/^[A-Za-z0-9/_-]*$/.test(route)) {
        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Order API route not found.' }))
        return
      }
      req.url = `/api/${route}${url.search ? url.search : ''}`
    }
    if (!middleware) {
      const hosts = new Set(['localhost', '127.0.0.1', '[::1]'])
      for (const value of [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL, process.env.ORDER_PUBLIC_BASE_URL, ...String(process.env.ORDER_ALLOWED_HOSTS || '').split(',')]) {
        if (!value) continue
        try { hosts.add(new URL(value.includes('://') ? value : `https://${value}`).hostname) } catch { /* Invalid hosts are not trusted. */ }
      }
      middleware = createOrderMiddleware({ env: process.env, allowedHosts: [...hosts] })
    }
    await middleware(req, res, () => {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'Order API route not found.' }))
    })
  } catch {
    if (!res.writableEnded) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'The order service is temporarily unavailable. Please try again.' }))
    }
  }
}
