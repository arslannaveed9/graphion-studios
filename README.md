# Graphion Studios

Production CMS + marketing platform for an IT services and SaaS company.

## Stack

- Next.js App Router (TypeScript)
- MongoDB + Mongoose
- Tailwind CSS + shadcn/ui
- Auth via encrypted httpOnly sessions, bcrypt passwords, role-based permissions
- Local media uploads in `public/uploads`
- Resend or SMTP for notifications

## Local setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Set `AUTH_SECRET` to at least 32 characters (`openssl rand -base64 48`).

3. Start MongoDB:

```bash
docker compose up -d
```

Or point `MONGODB_URI` at Atlas.

4. Seed the CMS (services, products, work, journal, admin user):

```bash
npm run seed
```

Default admin (change after first login):

- Email: `admin@graphion.studio`
- Password: `ChangeMeNow!2026`

5. Run the app:

```bash
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Admin CMS: [http://localhost:3000/admin](http://localhost:3000/admin)

## What the admin can change

Almost all public content is database-driven: services and pricing, SaaS products, portfolio, journal, homepage sections, navigation, footer, about, FAQs, team, technologies, legal pages, SEO, leads, and media.

## Email and uploads

Without `RESEND_API_KEY` or SMTP settings, enquiry emails are logged in development and skipped rather than crashing. Media is stored on disk under `uploads/` (and `public/uploads`). The app user must be able to write those folders. If uploads return HTTP 413, raise the reverse-proxy limit (Nginx: `client_max_body_size 12m;` inside the `server` block, then `nginx -t && systemctl reload nginx`).
