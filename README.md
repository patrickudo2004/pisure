# Pisure — Royalty-Free African Stock Photos

**Visuals for Africa, by Africa.** A platform for discovering and sharing
royalty-free photography focused on African themes, created by and for
Africans. All photos are free under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Stack

| Layer | Choice | Cost |
|---|---|---|
| App | Next.js (App Router) on Vercel | free |
| Database | Neon serverless Postgres + Drizzle ORM | free |
| Auth | Better Auth (self-hosted, email/password + Google) | free |
| Images | Cloudflare R2 + CDN on a custom domain | free tier (10 GB, zero egress) |

Total running cost: the domain.

## Architecture highlights

- **Direct-to-R2 uploads** — the browser uploads three derivatives (original /
  1280px web / 400px thumb) via presigned URLs; the server never proxies image bytes.
- **EXIF stripped client-side** at upload (including GPS metadata).
- **Server-rendered pages** with per-asset OpenGraph metadata, sitemap, and
  category landing pages — built to rank on Google Images.
- **Server-side security** — session + admin checks live in server components
  and API routes, never in the client; all queries are parameterized (Drizzle).
- **Moderation workflow** — uploads start `pending`; an admin approves or
  rejects (rejection deletes both the DB row and the R2 objects).

## Development

```bash
cp .env.example .env.local   # fill from SETUP.md
npm install
npx drizzle-kit push         # create tables
npm run dev
```

Full infrastructure walkthrough: **[SETUP.md](./SETUP.md)**.

## License

Platform code: MIT (see `LICENSE`). User-uploaded photos: CC BY 4.0 —
attribution required, commercial use allowed.
