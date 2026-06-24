# Romancelovesophy — Personal Brand Website (v1)

A premium black‑and‑white editorial site for a creator whose work blends classical wisdom with modern digital influence. Built with Next.js 15, Supabase, and deployed on Vercel.

- Premium dark/light editorial design, serif + sans typography, smooth motion
- Homepage: hero, admin‑uploadable portrait above an auto‑pulled featured quote, Latest Videos (YouTube), Spotify podcast player (latest episode), latest writing, newsletter
- Quote gallery: Pinterest‑style masonry, search + category filters, download + share (WhatsApp/Facebook/X/LinkedIn/copy)
- Articles: rich‑text editor with image upload, SEO + Open Graph per post, Blogger importer
- Connect, Contact (general + business enquiries), Downloads
- Secure admin dashboard (single admin, email + password) — no coding needed
- Data‑driven social links (add any future platform from the dashboard)

---

## 1. Prerequisites

- Node.js 18.18+ (or 20+)
- A free Supabase account
- A Google Cloud account (for the YouTube API key)
- A Vercel account (for deployment)

---

## 2. Install

```bash
npm install
cp .env.example .env.local   # then fill in the values (see step 4)
```

---

## 3. Set up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run the entire contents of `supabase/schema.sql`.
   This creates all tables, row‑level security policies, the 4 storage buckets
   (`quote-images`, `article-images`, `portraits`, `downloads`), and seeds your
   social links.
3. Create the admin user: Authentication → Users → Add user → enter your
   brother's email + a password (tick “auto‑confirm”).
4. Link that user to the admin allow‑list — run this in the SQL editor,
   replacing the email:
   ```sql
   insert into profiles (id, email)
   select id, email from auth.users where email = 'your-brother@email.com';
   ```
   Only emails present in `profiles` can access `/admin`.

---

## 4. Environment variables

Fill `.env.local` (and later, the same values in Vercel):

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page (anon public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | same page (service_role — **server only**) |
| `YOUTUBE_API_KEY` | Google Cloud → enable “YouTube Data API v3” → create API key |
| `YOUTUBE_CHANNEL_ID` | optional; leave blank to auto‑resolve from the handle |
| `NEXT_PUBLIC_YOUTUBE_HANDLE` | `@Romancelovesophy` |
| `SPOTIFY_SHOW_ID` | `49dcwx5qz045JY5jRrxxcF` (from the show URL) |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | optional — enables auto‑showing the *latest* episode. Create at developer.spotify.com. Without them the player embeds the show (still plays newest first). |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; your domain in production |

---

## 5. Run locally

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (redirects to /login)

First steps in the admin: open **Settings** to upload the portrait and confirm
the YouTube/Spotify IDs, then **Quotes** to upload the first quote (it becomes
the featured quote on the homepage automatically), then **Categories** and
**Articles**.

---

## 6. Import existing Blogger articles (optional, one‑time)

1. In Blogger: Settings → Manage blog → Back up content → download the XML.
2. Place it in the project root (e.g. `blog-export.xml`).
3. Run:
   ```bash
   npx tsx scripts/import-blogger.ts ./blog-export.xml
   ```
   Posts import as **drafts** — review and publish them from `/admin/articles`.

---

## 7. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel: New Project → import the repo.
3. Add all the environment variables from step 4 (set `NEXT_PUBLIC_SITE_URL`
   to your production URL).
4. Deploy. Image optimization and ISR caching work out of the box.
5. Add your custom domain in Vercel → Settings → Domains (HTTPS is automatic).
6. After go‑live: submit `https://yourdomain.com/sitemap.xml` to Google Search
   Console, and test a shared link in WhatsApp/X to confirm the preview image.

---

## 8. How the key features work

- **Featured quote** = the quote pinned in Settings, or the most recently
  uploaded quote if none is pinned. The portrait above it is the image uploaded
  in Settings.
- **Latest Videos** are fetched server‑side from the YouTube Data API, cached in
  the `videos_cache` table, and revalidated every ~30 min — new uploads appear
  automatically. If the API is ever unavailable, the last cached videos still show.
- **Spotify** shows the latest episode (with API credentials) or the show player
  (without), both playable in‑page.
- **Sharing**: every article and quote has its own URL with Open Graph tags, so
  shared links show a rich preview.
- **Adding a new social platform**: Admin → Social links → Add. It instantly
  appears in the header, footer, and Connect page — no code change.

---

## 9. Project structure

```
app/(site)        public pages (home, quotes, videos, articles, connect, contact, downloads)
app/admin         protected dashboard
app/api           youtube, spotify, newsletter, contact, quote download, admin upload/export
components/site    public UI (hero, galleries, share, spotify, header/footer…)
components/admin   dashboard UI (nav, forms, editor)
lib                supabase clients, youtube, spotify, queries, share, utils, auth
supabase/schema.sql   database + RLS + storage + seed
scripts/import-blogger.ts  one-time migration
middleware.ts     guards /admin
```

---

## 10. Tech

Next.js 15 (App Router, TypeScript) · Supabase (Postgres + Storage + Auth) ·
Tailwind CSS · Framer Motion · Tiptap editor · lucide‑react · Vercel.
