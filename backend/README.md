# Business Direction — Admin API (Phase 1)

Node.js + Express + MongoDB backend for the Business Direction admin panel.
This phase ships the platform foundation plus two full business modules:

- **Core platform** — JWT + refresh-token auth, remember me, forgot/reset/change
  password, optional TOTP 2FA, login history, device/session management,
  optional Google login, full RBAC (10 roles, 17 permission modules × 7
  actions), activity/audit logging, media library (local disk or S3), Swagger
  docs, centralized validation & error handling, security hardening.
- **CRM** — Leads (with notes, attachments, conversion to client), Clients,
  and a lightweight Projects record.
- **Blog CMS** — categories, tags, drafts/scheduling/publishing, revisions,
  SEO fields, comments moderation, and public endpoints that power the live
  marketing site (listing, detail, sitemap.xml, rss.xml, contact form → lead).

Later phases (invoicing/quotations, campaigns, social scheduling, SEO
tooling, email marketing, Google/Meta ads dashboards, notifications, the
React admin UI, etc.) build on this same architecture — see "What's not
built yet" below.

## Quick start

```bash
cd server
cp .env.example .env      # already done if you're reading this after setup
npm install
npm run seed               # creates default roles + a Super Admin user
npm run dev                 # http://localhost:5000, docs at /api/docs
```

Requires a MongoDB instance reachable at `MONGO_URI` (defaults to
`mongodb://127.0.0.1:27017/bd_admin`). Install MongoDB Community Server
locally, or point `MONGO_URI` at a MongoDB Atlas cluster — no code changes
needed either way.

The seed script prints/creates a Super Admin using `SEED_SUPER_ADMIN_EMAIL` /
`SEED_SUPER_ADMIN_PASSWORD` from `.env` — **change that password before
deploying anywhere real.**

## Project layout

```
src/
  config/       env, db connection, logger, RBAC constants
  models/       Mongoose schemas
  middlewares/  auth, rbac, validation, rate limiting, upload, error handling
  services/     token, email, storage (local/S3), image optimization, audit log
  controllers/  request handlers, one file per module
  routes/       Express routers + Swagger (@openapi) annotations
  validators/   express-validator rule sets
  docs/         swagger-jsdoc setup
  seed/         seed.js — roles, permissions, Super Admin
uploads/        local file storage (gitignored; unused when STORAGE_DRIVER=s3)
scripts/        smoke-test.js — end-to-end API check used during development
```

## Configuration

Every third-party integration is read from `.env` and fails soft:

- **Storage**: `STORAGE_DRIVER=local` (default) or `s3` — set the `AWS_*`
  vars to switch, no controller code changes.
- **Email**: leave `SMTP_*` blank and the API logs what it would have sent
  instead of failing password-reset / notification flows.
- **Google login**: disabled (`501`) until `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` are set.
- **Google/Meta Ads, WhatsApp, GoHighLevel, Mailchimp, Cloudinary**: env vars
  are reserved (`.env.example`) and the dashboard reports these widgets as
  "not connected" rather than showing fake numbers, so nothing looks real
  until it is.

## RBAC model

`Role` documents hold a list of `{ module, actions[] }` permissions.
`authorize(module, action)` middleware checks the caller's role; **Super
Admin always passes**. Ten roles are seeded with sensible default
permissions (`src/config/constants.js` → `DEFAULT_ROLE_PERMISSIONS`) and are
fully editable afterwards via `PATCH /api/roles/:id` — permissions are data,
not code.

## API documentation

Swagger UI: `GET /api/docs` (raw spec at `/api/docs.json`). Auth, Leads, and
the Public (frontend-facing) routes are fully annotated as the reference
pattern — apply the same `@openapi` JSDoc block style to the remaining route
files as they stabilize.

## Frontend integration points

The existing React site should call:

- `GET /api/public/blogs`, `GET /api/public/blogs/:slug`,
  `GET /api/public/categories`, `GET /api/public/tags` to render blog pages
  from the CMS instead of hardcoded arrays.
- `POST /api/public/contact` from the Contact page — this creates a Lead in
  the CRM automatically, so every website inquiry shows up in the admin
  panel with zero manual entry.
- `POST /api/public/blogs/:slug/comments` for the blog comment form (held
  for moderation until an admin approves it).
- `/sitemap.xml` and `/rss.xml` are served directly by this API and stay in
  sync with published posts automatically.

All of the above are public, unauthenticated, rate-limited endpoints — safe
to call directly from the browser.

## Verifying it works

```bash
npm run smoke
```

`scripts/smoke-test.js` boots an in-memory MongoDB, starts the API, and
walks through: seed → login → create role → create user → create lead →
convert lead to client → create category/tag → create+publish a blog post →
read it back through the public endpoint → fetch dashboard summary. It exits
non-zero on any failure, so it doubles as a regression check while the next
phases are built.

## What's not built yet

Deliberately out of scope for this phase (flagged so nothing is assumed
silently finished):

- Invoicing, Quotations, Payments, Campaigns, Email Marketing, Social Media
  scheduling, SEO audit tooling, Notifications, File Manager beyond the
  media library, and the Reports/export module.
- Real Google Analytics/Search Console/Ads and Meta Ads data — the
  integration points and env vars exist; the dashboard clearly marks them
  "not connected" until credentials are supplied.
- The React admin **frontend** (this repo is the API only). It should be
  built as a separate Vite app matching `../src` branding, consuming this
  API — a natural next phase once you're ready to design it.
