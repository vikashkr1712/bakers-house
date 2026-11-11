import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { readFile, realpath, stat } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'
import { createOrderMiddleware } from './test-payment-api.mjs'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const CONTENT_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }

export async function loadServerEnv(directory = ROOT) {
  const env = {}
  for (const name of ['.env', '.env.local']) {
    try { Object.assign(env, parseEnv(await readFile(resolve(directory, name), 'utf8'))) }
    catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  return { ...env, ...process.env }
}

export function createBakeryServer({ env = process.env, directory = resolve(ROOT, 'dist'), fetchImpl = globalThis.fetch, storePath, legacyPath } = {}) {
  const middleware = createOrderMiddleware({ env, fetchImpl, storePath, legacyPath })
  let timer
  const root = resolve(directory)
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    const serveFile = async () => {
      try {
        if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; res.end('Method not allowed'); return }
        let path
        try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname) } catch { res.statusCode = 400; res.end('Invalid URL'); return }
        const parts = path.replaceAll('\\', '/').split('/')
        if (parts.some(part => part.startsWith('.')) || path.startsWith('/api/') || path.includes('\0') || /\.(?:sqlite3?|db)(?:-(?:wal|shm))?$/i.test(path) || /(?:^|\/)orders\.json$/i.test(path)) { res.statusCode = 403; res.end('Forbidden'); return }
        let target = resolve(root, `.${path}`)
        const local = relative(root, target)
        if (local.startsWith(`..${sep}`) || local === '..' || local.startsWith(sep)) { res.statusCode = 403; res.end('Forbidden'); return }
        let info
        try { info = await stat(target) } catch (error) { if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error }
        if (!info?.isFile()) {
          if (extname(path)) { res.statusCode = 404; res.end('Not found'); return }
          target = resolve(root, 'index.html')
          info = await stat(target)
        }
        const actual = await realpath(target)
        const actualRoot = await realpath(root)
        const actualRelative = relative(actualRoot, actual)
        if (actualRelative.startsWith(`..${sep}`) || actualRelative === '..' || actualRelative.startsWith(sep)) { res.statusCode = 403; res.end('Forbidden'); return }
        res.setHeader('Content-Type', CONTENT_TYPES[extname(target)] || 'application/octet-stream')
        res.setHeader('Cache-Control', path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache')
        res.setHeader('Content-Length', info.size)
        if (req.method === 'HEAD') { res.end(); return }
        const stream = createReadStream(actual)
        stream.on('error', () => { if (!res.headersSent) res.statusCode = 500; res.end() })
        stream.pipe(res)
      } catch (error) {
        res.statusCode = error.code === 'ENOENT' ? 503 : 500
        res.end(error.code === 'ENOENT' ? 'Build the storefront with npm run build before starting the server.' : 'The page could not be served.')
      }
    }
    await middleware(req, res, () => { void serveFile() })
  })
  server.once('listening', () => {
    timer = setInterval(() => middleware.reconcilePending().catch(() => {}), 15000)
    timer.unref?.()
  })
  server.once('close', () => { clearInterval(timer); middleware.close() })
  return server
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const env = await loadServerEnv()
  const port = Number(env.PORT || 5000)
  const host = env.HOST || '127.0.0.1'
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Set PORT to a valid TCP port.')
  const server = createBakeryServer({ env })
  server.on('error', error => { console.error(`The bakery server could not start (${error.code || 'server error'}).`); process.exitCode = 1 })
  server.listen(port, host, () => console.log(`Bakery checkout server: http://${host}:${port} (Razorpay Test Mode)`))
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { server.close(); server.closeAllConnections() })
}
