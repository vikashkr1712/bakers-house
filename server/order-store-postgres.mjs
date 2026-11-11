import { AsyncLocalStorage } from 'node:async_hooks'

const LOCK = [1375349814, 184734511]
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS bakery_orders (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    idempotency_hash TEXT NOT NULL UNIQUE,
    access_token_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    provider_link_id TEXT UNIQUE,
    checked_at BIGINT NOT NULL DEFAULT 0,
    snapshot JSONB NOT NULL
  );
  CREATE INDEX IF NOT EXISTS bakery_orders_pending ON bakery_orders(status, checked_at);
  CREATE TABLE IF NOT EXISTS bakery_payment_events (
    id TEXT PRIMARY KEY, created_at BIGINT NOT NULL
  );
`

// Session advisory locks require a direct connection, not transaction pooling.
export function postgresConnectionString(env = process.env) {
  const explicit = env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING
  const value = String(explicit || env.DATABASE_URL || env.POSTGRES_URL || '').trim()
  if (!value) return ''
  let url
  try { url = new URL(value) } catch { throw new Error('The order database connection is invalid.') }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.pathname.slice(1)) throw new Error('The order database connection is invalid.')
  if (!explicit && /\.neon\.tech$/i.test(url.hostname)) url.hostname = url.hostname.replace(/-pooler(?=\.)/i, '')
  return url.href
}

const defaultClient = async config => {
  const { Client } = await import('pg')
  return new Client(config)
}

export function createPostgresOrderStore({ env = process.env, connectionString, createClient = defaultClient } = {}) {
  const contexts = new AsyncLocalStorage()
  // Resolve lazily: a config request must not expose a connection string or
  // crash the function simply because a deployment has no database yet.
  const connection = () => connectionString || postgresConnectionString(env)
  const client = () => {
    const current = contexts.getStore()
    if (!current) throw new Error('Database operations require a serialized order action.')
    return current
  }
  const one = async (sql, values) => {
    const result = await client().query(sql, values)
    const snapshot = result.rows[0]?.snapshot
    return snapshot ? typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot : null
  }

  return {
    provider: 'postgres',
    configured: Boolean(connectionString || env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL || env.POSTGRES_URL),
    async serialized(action) {
      const current = contexts.getStore()
      if (current) return action()
      let db
      let locked = false
      try {
        const url = connection()
        if (!url) throw new Error('The order database is not configured.')
        db = await createClient({ connectionString: url, connectionTimeoutMillis: 10000, statement_timeout: 12000, query_timeout: 15000, lock_timeout: 8000, application_name: 'bakers-house-checkout' })
        // A connection failure must not become an unhandled pg error event.
        db.on?.('error', () => {})
        await db.connect()
        await db.query('SELECT pg_advisory_lock($1, $2)', LOCK)
        locked = true
        await db.query(SCHEMA)
        // Intentionally no BEGIN around action(): each save commits before a
        // gateway request. Retrying an uncertain gateway response then keeps
        // the original reference instead of allocating a second payment link.
        return await contexts.run(db, action)
      } catch (error) {
        // Gateway and validation errors already have their intended HTTP code.
        if (Number.isInteger(error?.status)) throw error
        const unavailable = new Error('Persistent order storage is temporarily unavailable.')
        unavailable.code = 'ORDER_STORAGE_UNAVAILABLE'
        throw unavailable
      } finally {
        if (db) {
          if (locked) { try { await db.query('SELECT pg_advisory_unlock($1, $2)', LOCK) } catch { /* Closing also releases session locks. */ } }
          try { await db.end() } catch { /* Do not turn a saved order into an apparent failed checkout. */ }
        }
      }
    },
    get: id => one('SELECT snapshot FROM bakery_orders WHERE id = $1', [id]),
    byKey: key => one('SELECT snapshot FROM bakery_orders WHERE idempotency_hash = $1', [key]),
    byReference: reference => one('SELECT snapshot FROM bakery_orders WHERE reference = $1', [reference]),
    byLink: id => one('SELECT snapshot FROM bakery_orders WHERE provider_link_id = $1', [id]),
    async pending(limit) {
      const result = await client().query("SELECT snapshot FROM bakery_orders WHERE status = 'awaiting_payment' AND provider_link_id IS NOT NULL ORDER BY checked_at ASC LIMIT $1", [limit])
      return result.rows.map(row => typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : row.snapshot)
    },
    async count() { return Number((await client().query('SELECT count(*) AS count FROM bakery_orders')).rows[0].count) },
    async save(order) {
      await client().query(`INSERT INTO bakery_orders(id, reference, idempotency_hash, access_token_hash, status, provider_link_id, checked_at, snapshot)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        ON CONFLICT(id) DO UPDATE SET status=EXCLUDED.status, provider_link_id=EXCLUDED.provider_link_id, checked_at=EXCLUDED.checked_at, snapshot=EXCLUDED.snapshot`,
      [order.id, order.reference, order.idempotencyHash, order.accessTokenHash, order.status, order.providerLinkId || null, order.lastCheckedAt || 0, JSON.stringify(order)])
    },
    async hasEvent(id) { return Boolean((await client().query('SELECT id FROM bakery_payment_events WHERE id = $1', [id])).rows.length) },
    async recordEvent(id, timestamp) { await client().query('INSERT INTO bakery_payment_events(id, created_at) VALUES ($1, $2) ON CONFLICT(id) DO NOTHING', [id, timestamp]) },
    close() { /* Every action closes its own direct connection. */ },
  }
}
