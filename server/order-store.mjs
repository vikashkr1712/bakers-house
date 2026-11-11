import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createPostgresOrderStore } from './order-store-postgres.mjs'

const queues = new Map()
const sha256 = value => createHash('sha256').update(value).digest('hex')

// A single Node process owns checkout. Gateway work is serialized per database;
// the order and deduplication reservations themselves use atomic SQLite writes.
export function createOrderStore({ path = resolve('.payment-data/orders.sqlite'), legacyPath = resolve(dirname(path), 'orders.json') } = {}) {
  const absolute = resolve(path)
  let database
  function open() {
    if (database) return database
    mkdirSync(dirname(absolute), { recursive: true })
    database = new DatabaseSync(absolute, { timeout: 5000 })
    database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
        idempotency_hash TEXT NOT NULL UNIQUE, access_token_hash TEXT NOT NULL,
        status TEXT NOT NULL, provider_link_id TEXT UNIQUE,
        checked_at INTEGER NOT NULL DEFAULT 0, snapshot TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS orders_pending ON orders(status, checked_at);
      CREATE TABLE IF NOT EXISTS payment_events (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;
    `)
    if (!database.prepare('SELECT value FROM metadata WHERE key = ?').get('legacy_json_import')) {
      database.exec('BEGIN IMMEDIATE')
      try {
        if (database.prepare('SELECT count(*) AS count FROM orders').get().count === 0 && existsSync(legacyPath)) {
          const legacy = JSON.parse(readFileSync(legacyPath, 'utf8'))
          if (legacy.version !== 1 || !Array.isArray(legacy.orders)) throw new Error('Legacy order data requires review before migration.')
          for (const previous of legacy.orders) {
            if (!previous?.id || !previous.reference || !previous.idempotencyHash || !previous.accessToken || !previous.request) continue
            const { accessToken, ...order } = previous
            order.accessTokenHash = sha256(accessToken)
            order.paymentMethod = order.request.paymentMethod || 'payment-link'
            if (order.status === 'confirmed' && order.paymentStatus === 'paid') {
              order.status = 'awaiting_bakery_confirmation'
              order.paidAt = order.confirmedAt || order.createdAt
            }
            delete order.confirmedAt
            delete order.whatsappConversation
            delete order.messageDelivery
            delete order.confirmationDelivery
            write(order, database)
          }
          for (const id of Array.isArray(legacy.webhookEvents) ? legacy.webhookEvents : []) database.prepare('INSERT OR IGNORE INTO payment_events(id, created_at) VALUES (?, ?)').run(String(id), Date.now())
        }
        database.prepare('INSERT INTO metadata(key, value) VALUES (?, ?)').run('legacy_json_import', new Date().toISOString())
        database.exec('COMMIT')
      } catch (error) {
        database.exec('ROLLBACK')
        database.close(); database = undefined
        throw error
      }
    }
    return database
  }
  function write(order, db = open()) {
    db.prepare(`INSERT INTO orders(id, reference, idempotency_hash, access_token_hash, status, provider_link_id, checked_at, snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status, provider_link_id=excluded.provider_link_id, checked_at=excluded.checked_at, snapshot=excluded.snapshot`)
      .run(order.id, order.reference, order.idempotencyHash, order.accessTokenHash, order.status, order.providerLinkId || null, order.lastCheckedAt || 0, JSON.stringify(order))
  }
  const unpack = row => row ? JSON.parse(row.snapshot) : null
  return {
    provider: 'sqlite',
    configured: true,
    path: absolute,
    serialized(action) {
      const previous = queues.get(absolute) || Promise.resolve()
      const work = previous.then(() => { open(); return action() })
      const settled = work.catch(() => {})
      queues.set(absolute, settled)
      settled.finally(() => { if (queues.get(absolute) === settled) queues.delete(absolute) })
      return work
    },
    get: id => unpack(open().prepare('SELECT snapshot FROM orders WHERE id = ?').get(id)),
    byKey: key => unpack(open().prepare('SELECT snapshot FROM orders WHERE idempotency_hash = ?').get(key)),
    byReference: reference => unpack(open().prepare('SELECT snapshot FROM orders WHERE reference = ?').get(reference)),
    byLink: id => unpack(open().prepare('SELECT snapshot FROM orders WHERE provider_link_id = ?').get(id)),
    pending: limit => open().prepare("SELECT snapshot FROM orders WHERE status = 'awaiting_payment' AND provider_link_id IS NOT NULL ORDER BY checked_at ASC LIMIT ?").all(limit).map(unpack),
    count: () => open().prepare('SELECT count(*) AS count FROM orders').get().count,
    save: order => write(order),
    hasEvent: id => Boolean(open().prepare('SELECT id FROM payment_events WHERE id = ?').get(id)),
    recordEvent: (id, timestamp) => open().prepare('INSERT OR IGNORE INTO payment_events(id, created_at) VALUES (?, ?)').run(id, timestamp),
    close() { database?.close(); database = undefined },
  }
}

export function createRuntimeOrderStore({ env = process.env, ...options } = {}) {
  if (env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL || env.POSTGRES_URL) return createPostgresOrderStore({ env })
  if (env.VERCEL) return {
    provider: 'unconfigured', configured: false,
    async serialized() { const error = new Error('Persistent order storage is not configured.'); error.code = 'ORDER_STORAGE_UNAVAILABLE'; throw error },
    close() {},
  }
  return createOrderStore(options)
}
