# 🛡️ Is This Legit? — Bangladesh Scam Check Platform

A community-driven web platform where users can check if a website, shop, or page is legitimate or a scam. Built for people in Bangladesh to protect themselves from online fraud.

## Features

- **URL Submission** — Submit any URL with a category (Online Shop, Job/Hiring, Facebook Page, etc.)
- **Duplicate Detection** — If a URL already exists, shows the existing result
- **Community Voting** — Vote "Looks Legit" or "Looks Scam" to build a trust score
- **Report System** — Submit text reports explaining why something is unsafe
- **Status Badges** — Color-coded: Trusted (green), Suspicious (yellow), Scam (red), Pending (gray)
- **Admin Panel** — Hidden admin route (`/admin`) to manage entries, change statuses, delete reports
- **Spam Prevention** — IP-based vote deduplication and rate-limited report submissions
- **Mobile-First** — Clean, fast UI designed for low to medium digital literacy users

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database**: SQLite via [Prisma](https://prisma.io) + [LibSQL](https://turso.tech/libsql)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd is-this-legit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite database URL | `file:./dev.db` |
| `ADMIN_PASSWORD` | Password for the admin panel | `admin123` |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checks/route.ts    # URL submission & search
│   │   ├── votes/route.ts     # Voting system
│   │   ├── reports/route.ts   # Report submission
│   │   └── admin/route.ts     # Admin CRUD operations
│   ├── check/[id]/
│   │   ├── page.tsx           # Result page (server component)
│   │   ├── vote-buttons.tsx   # Voting UI (client component)
│   │   └── report-form.tsx    # Report form (client component)
│   ├── admin/page.tsx         # Admin panel
│   ├── page.tsx               # Home page (search + submit)
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   └── utils.ts               # URL normalization, constants
└── generated/prisma/          # Auto-generated Prisma client
prisma/
├── schema.prisma              # Database schema
└── migrations/                # Migration files
```

## Database Schema

- **Check** — `id`, `url` (unique), `category`, `status`, `score`, timestamps
- **Report** — `id`, `reason`, `ip`, `checkId` (FK), timestamp
- **Vote** — `id`, `value` (+1/-1), `ip`, `checkId` (FK), timestamp; unique on `(checkId, ip)`

## Admin Panel

Navigate to `/admin` and enter the admin password. From there you can:

- Change the status of any entry (Trusted / Suspicious / Scam / Pending)
- Delete individual reports
- Delete entire entries

## Deployment

### Vercel (Recommended)

For Vercel deployment, you'll need an external database (e.g., [Turso](https://turso.tech) for SQLite-compatible hosting):

1. Create a Turso database
2. Set `DATABASE_URL` to your Turso URL in Vercel environment variables
3. Set `ADMIN_PASSWORD` to a strong password
4. Deploy via `vercel` CLI or GitHub integration

### Docker / Self-hosted

```bash
npm run build
npm start
```

## Disclaimer

> This platform is community-reported and for awareness only. We do not guarantee accuracy.

## License

MIT
