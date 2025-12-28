# Pisure - Royalty-Free Stock Photos & Videos for Africa

Pisure is a platform for discovering and sharing royalty-free visuals focused on African themes, created by and for Africans.

## Features

- **Homepage**: Browse trending African visuals
- **Search**: Find assets by keywords, tags, or categories
- **Upload**: Contribute your own photos and videos (requires approval)
- **Download**: Free downloads with attribution encouragement
- **Profiles**: Showcase creator portfolios
- **Admin Dashboard**: Moderate uploads

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Deployment**: Vercel

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd pisure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
   - Enable Google OAuth if desired
   - Create an admin user with email `admin@pisure.com`

4. **Configure environment variables**
   - Copy `.env.local` and fill in your Supabase URLs and keys

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Database Schema

- `profiles`: User profiles with bio, avatar, etc.
- `assets`: Uploaded photos/videos with metadata

## Deployment

Deploy to Vercel by connecting your GitHub repo. Ensure environment variables are set in Vercel dashboard.

## Seed Data

To add initial assets:
1. Sign up as admin@pisure.com
2. Upload some African-themed images/videos
3. Approve them via /admin

## Contributing

Contributions welcome! Focus on African representation and user experience.

## License

All user-uploaded content is royalty-free. Platform code is MIT licensed.
