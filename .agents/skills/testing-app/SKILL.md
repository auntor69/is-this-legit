# Testing "Is This Legit?" Application

## Dev Server
```bash
npm run dev
```
Runs on `http://localhost:3000` by default.

## Stack
- Next.js (App Router) + Prisma + SQLite (LibSQL adapter) + Tailwind CSS
- Prisma 7 requires the `PrismaLibSql` adapter from `@prisma/adapter-libsql`
- Generated Prisma client lives at `src/generated/prisma/client` (import as `@/generated/prisma/client`)

## Database Setup
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```
SQLite DB is created at `./dev.db` in the project root.

## Key Pages
- `/` — Home page with URL submission form and Recent Checks list
- `/check/[id]` — Result page with status badge, voting, report form, reports list
- `/admin` — Hidden admin panel (password-protected)

## Admin Panel
- Navigate to `/admin`
- Default password: value of `ADMIN_PASSWORD` env var (defaults to `admin123` in dev)
- Admin can change entry status (trusted/suspicious/scam/pending), delete entries, delete reports

## Testing Checklist
1. Submit a new URL with a category → verify redirect to `/check/[id]` with Pending status
2. Submit the same URL again → verify it redirects to the existing entry (duplicate detection via URL normalization)
3. Vote "Looks Scam" → verify score becomes -1, button turns red
4. Submit a report → verify success message appears and textarea clears
5. Reload the page → verify score, votes, reports persist from DB
6. Admin login → change status → verify it reflects on result page and home page Recent Checks
7. Empty form submission → verify "Please enter a URL" error

## Lint & Build
```bash
npm run lint
npm run build
```
