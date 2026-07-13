# You-and-Me-Store

It's gonna help buyers and sellers to connect

## Stack

Next.js (App Router) + TypeScript + Tailwind + Prisma (PostgreSQL/Supabase) + NextAuth.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values (see comments in that file for where each one comes from):

   ```
   cp .env.example .env
   ```

   - `DATABASE_URL` / `DIRECT_URL` — from your Supabase project's Database settings (pooled and direct connection strings).
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional; leave blank to disable "Continue with Google".
   - `RESEND_API_KEY` / `EMAIL_FROM` — optional in development; without a key, verification and password-reset links are logged to the console instead of emailed.
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings, needed for listing photo uploads.

3. In your Supabase project, create a **public** Storage bucket named `listing-photos` (Storage → New bucket → Public bucket).

4. Apply the database schema:

   ```
   npx prisma migrate deploy
   ```

   (Use `npm run db:migrate` instead during local development if you're evolving the schema.)

5. (Optional) Seed sample data:

   ```
   npm run db:seed
   ```

6. Run the dev server:

   ```
   npm run dev
   ```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — generate the Prisma client and build for production
- `npm run start` — run the production build
- `npm run db:migrate` — create/apply a migration in development
- `npm run db:deploy` — apply pending migrations (production)
- `npm run db:seed` — seed sample users, listings, and reviews
