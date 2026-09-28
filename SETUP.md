# Pisure — Setup Guide

One-time infrastructure setup. Everything below is free tier; the only ongoing
cost is the domain (~$10–15/yr) when you buy it.

## 1. Database — Neon

1. Create an account at [neon.tech](https://neon.tech) (or via the Vercel
   marketplace integration, which wires env vars automatically).
2. Create a project named `pisure`.
3. Copy the **pooled** connection string.
4. Set it as `DATABASE_URL` (see `.env.example`).

## 2. Push the schema

```bash
npm install
npx drizzle-kit push
```

## 3. Images — Cloudflare R2

1. Create a free Cloudflare account → **R2** → create bucket `pisure-assets`.
2. **Custom domain:** in the bucket → Settings → *Public access* → connect a
   custom domain (e.g. `images.pisure.com` once you own the domain). For local
   development you can use the `*.r2.dev` public development URL.
3. Set that public base URL as `NEXT_PUBLIC_R2_PUBLIC_URL`.
4. **S3 API token:** R2 → *Manage R2 API tokens* → create token with
   Object Read & Write scoped to the bucket. Note the **Account ID**, **Access
   Key ID**, and **Secret Access Key** → fill `R2_*` env vars.
5. **CORS:** bucket → Settings → CORS policy → allow `PUT` from your app origin:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://www.pisure.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. Auth secrets

- `BETTER_AUTH_SECRET`: `openssl rand -base64 32` (or any 32+ char random string).
- **Google OAuth (optional):** [console.cloud.google.com](https://console.cloud.google.com)
  → create OAuth client (Web) → authorized redirect URI:
  `http://localhost:3000/api/auth/callback/google` (add the production URL too).
  Copy client ID/secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## 5. Create the admin user

```bash
node scripts/seed-admin.mjs you@example.com aStrongPassword
```

Existing account? It just flips the role to admin.

## 6. Run

```bash
npm run dev
```

Smoke test: sign up → upload a photo (check R2 for `thumb/web/original`) →
approve at `/admin` → see it on the homepage → download (counter increments) →
report flow → reject cleans R2.

## 7. Deploy to Vercel

1. Push to GitHub, import the repo in Vercel.
2. **Add all env vars from `.env.example` in Project → Settings → Environment
   Variables** — the build needs them at runtime; every field is listed in
   `.env.local` on your machine, copy the values across (use the *pooled*
   `DATABASE_URL`).
3. When you buy the domain (Cloudflare Registrar or Porkbun recommended):
   - Point `pisure.com` → Vercel (follow their domain wizard), and
   - `images.pisure.com` → the R2 bucket custom domain.
   - Set `NEXT_PUBLIC_SITE_URL=https://www.pisure.com`, and add the production
     URL to the R2 bucket's CORS `AllowedOrigins`.
