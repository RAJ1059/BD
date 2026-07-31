/**
 * End-to-end smoke test. Boots an in-memory MongoDB + the real Express app,
 * then walks through the primary flows for every phase-1 module. Exits 1 on
 * any failure so it can double as a lightweight regression check.
 *
 * Run with: npm run smoke
 */
import { MongoMemoryServer } from 'mongodb-memory-server'

process.env.NODE_ENV = 'test'
process.env.PORT = process.env.PORT || '5099'

const mongod = await MongoMemoryServer.create()
process.env.MONGO_URI = mongod.getUri('bd_admin_smoke')
process.env.SEED_SUPER_ADMIN_EMAIL = 'superadmin@businessdirection.com'
process.env.SEED_SUPER_ADMIN_PASSWORD = 'ChangeMe@12345'

const { seed } = await import('../src/seed/seed.js')
const { createApp } = await import('../src/app.js')

await seed()
const app = createApp()
const port = Number(process.env.PORT)
const server = app.listen(port)
const BASE = `http://localhost:${port}/api`

let passed = 0
let failed = 0

async function step(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failed += 1
    console.error(`  ✗ ${name}`)
    console.error(`    ${err.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed')
}

async function api(method, url, { token, body } = {}) {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}

let accessToken
let roleId
let userToken
let leadId
let clientId
let categoryId
let tagId
let blogId

console.log('\nRunning smoke test against', BASE, '\n')

await step('health check responds', async () => {
  const res = await fetch(`http://localhost:${port}/health`)
  assert(res.status === 200, `expected 200, got ${res.status}`)
})

await step('login as seeded Super Admin', async () => {
  const { status, json } = await api('POST', '/auth/login', {
    body: { email: process.env.SEED_SUPER_ADMIN_EMAIL, password: process.env.SEED_SUPER_ADMIN_PASSWORD },
  })
  assert(status === 200, `expected 200, got ${status}: ${JSON.stringify(json)}`)
  assert(json.data?.accessToken, 'expected an access token')
  accessToken = json.data.accessToken
})

await step('GET /auth/me returns the current user', async () => {
  const { status, json } = await api('GET', '/auth/me', { token: accessToken })
  assert(status === 200, `expected 200, got ${status}`)
  assert(json.data?.email === process.env.SEED_SUPER_ADMIN_EMAIL, 'unexpected user in /auth/me')
})

await step('permission catalog is reachable', async () => {
  const { status, json } = await api('GET', '/roles/permissions/catalog', { token: accessToken })
  assert(status === 200)
  assert(Array.isArray(json.data?.modules) && json.data.modules.length > 0)
})

await step('create a custom role', async () => {
  const { status, json } = await api('POST', '/roles', {
    token: accessToken,
    body: { name: 'Smoke Test Role', permissions: [{ module: 'leads', actions: ['view', 'create'] }] },
  })
  assert(status === 201, `expected 201, got ${status}: ${JSON.stringify(json)}`)
  roleId = json.data._id
})

await step('create a user with the custom role and log in as them', async () => {
  const { status, json } = await api('POST', '/users', {
    token: accessToken,
    body: { name: 'Smoke Tester', email: 'smoke.tester@businessdirection.com', password: 'SmokeTest@123', role: roleId },
  })
  assert(status === 201, `expected 201, got ${status}: ${JSON.stringify(json)}`)

  const login = await api('POST', '/auth/login', { body: { email: 'smoke.tester@businessdirection.com', password: 'SmokeTest@123' } })
  assert(login.status === 200, 'new user should be able to log in')
  userToken = login.json.data.accessToken
})

await step('scoped role can view leads but cannot view clients (RBAC enforced)', async () => {
  const canViewLeads = await api('GET', '/leads', { token: userToken })
  assert(canViewLeads.status === 200, `expected 200, got ${canViewLeads.status}`)

  const cannotViewClients = await api('GET', '/clients', { token: userToken })
  assert(cannotViewClients.status === 403, `expected 403, got ${cannotViewClients.status}`)
})

await step('create a lead (CRM)', async () => {
  const { status, json } = await api('POST', '/leads', {
    token: accessToken,
    body: { companyName: 'Acme Corp', contactPerson: 'Jane Doe', email: 'jane@acme.test', source: 'website', estimatedValue: 5000 },
  })
  assert(status === 201, `expected 201, got ${status}: ${JSON.stringify(json)}`)
  leadId = json.data._id
})

await step('move lead through the pipeline and convert to a client', async () => {
  const won = await api('PATCH', `/leads/${leadId}/status`, { token: accessToken, body: { status: 'won' } })
  assert(won.status === 200, `expected 200, got ${won.status}`)

  const convert = await api('POST', `/leads/${leadId}/convert`, { token: accessToken })
  assert(convert.status === 201, `expected 201, got ${convert.status}: ${JSON.stringify(convert.json)}`)
  clientId = convert.json.data._id
  assert(clientId, 'expected a client id')
})

await step('client is now visible in the CRM', async () => {
  const { status, json } = await api('GET', `/clients/${clientId}`, { token: accessToken })
  assert(status === 200, `expected 200, got ${status}`)
  assert(json.data.companyName === 'Acme Corp')
})

await step('create category and tag for the blog', async () => {
  const category = await api('POST', '/categories', { token: accessToken, body: { name: 'SEO' } })
  assert(category.status === 201, `expected 201, got ${category.status}`)
  categoryId = category.json.data._id

  const tag = await api('POST', '/tags', { token: accessToken, body: { name: 'Rankings' } })
  assert(tag.status === 201, `expected 201, got ${tag.status}`)
  tagId = tag.json.data._id
})

await step('create and publish a blog post', async () => {
  const create = await api('POST', '/blogs', {
    token: accessToken,
    body: {
      title: 'How to Rank #1 on Google in 2026',
      content: '<p>' + 'Great SEO content. '.repeat(50) + '</p>',
      excerpt: 'A practical guide to modern SEO.',
      category: categoryId,
      tags: [tagId],
      status: 'draft',
      seo: { metaTitle: 'How to Rank #1 on Google', metaDescription: 'A practical guide to modern SEO.' },
    },
  })
  assert(create.status === 201, `expected 201, got ${create.status}: ${JSON.stringify(create.json)}`)
  blogId = create.json.data._id
  assert(create.json.data.readingTimeMinutes >= 1, 'expected reading time to be estimated')

  const publish = await api('POST', `/blogs/${blogId}/publish`, { token: accessToken })
  assert(publish.status === 200, `expected 200, got ${publish.status}`)
})

await step('published post is visible on the public blog API', async () => {
  const list = await api('GET', '/public/blogs')
  assert(list.status === 200, `expected 200, got ${list.status}`)
  assert(list.json.data.some((p) => p._id === blogId), 'expected the published post in the public list')

  const detail = await api('GET', '/public/blogs/how-to-rank-1-on-google-in-2026')
  assert(detail.status === 200, `expected 200, got ${detail.status}: ${JSON.stringify(detail.json)}`)
  assert(detail.json.data.viewCount === 1, 'expected view count to increment on read')
})

await step('sitemap.xml and rss.xml are served', async () => {
  const sitemap = await fetch(`http://localhost:${port}/sitemap.xml`)
  assert(sitemap.status === 200)
  const sitemapBody = await sitemap.text()
  assert(sitemapBody.includes('how-to-rank-1-on-google-in-2026'), 'expected the published post in sitemap.xml')

  const rss = await fetch(`http://localhost:${port}/rss.xml`)
  assert(rss.status === 200)
})

await step('public contact form creates a CRM lead', async () => {
  const { status, json } = await api('POST', '/public/contact', {
    body: { name: 'Prospective Client', email: 'prospect@example.com', message: 'Interested in SEO services' },
  })
  assert(status === 201, `expected 201, got ${status}: ${JSON.stringify(json)}`)

  const leads = await api('GET', '/leads?search=Prospective', { token: accessToken })
  assert(leads.json.data.length > 0, 'expected the contact-form lead to appear in the CRM')
})

await step('dashboard summary and charts respond with real + stubbed data', async () => {
  const summary = await api('GET', '/dashboard/summary', { token: accessToken })
  assert(summary.status === 200, `expected 200, got ${summary.status}`)
  assert(typeof summary.json.data.activeClients === 'number')
  assert(summary.json.data.revenue.available === false, 'unconfigured integrations should report available:false')

  const charts = await api('GET', '/dashboard/charts', { token: accessToken })
  assert(charts.status === 200, `expected 200, got ${charts.status}`)
})

await step('activity log captured the actions above', async () => {
  const { status, json } = await api('GET', '/activity-logs?module=blogs', { token: accessToken })
  assert(status === 200, `expected 200, got ${status}`)
  assert(json.data.length > 0, 'expected at least one blog activity log entry')
})

await step('Swagger docs are served', async () => {
  const res = await fetch(`http://localhost:${port}/api/docs.json`)
  assert(res.status === 200)
  const spec = await res.json()
  assert(spec.paths && Object.keys(spec.paths).length > 0, 'expected annotated paths in the OpenAPI spec')
})

console.log(`\n${passed} passed, ${failed} failed\n`)

server.close()
await mongod.stop()
process.exit(failed > 0 ? 1 : 0)
