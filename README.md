# Star Level

Level up by starring public GitHub repositories. Built with Next.js and Supabase.

## Features

- Email signup (Supabase Auth) + required GitHub link
- Sync GitHub Stars via Edge Function
- XP: 10 per newly recognized repo
- Daily recognition cap: `10 * ceil(level / 10)`
- Business day resets at **01:00 Beijing time**
- Levels 1–100; no XP after max level

## Internationalization (i18n)

- **Locales**: `zh` (default), `en`
- **URLs**: `/zh/dashboard`, `/en/login`, etc.
- **Switcher**: top-right on every page
- **Messages**: `messages/zh.json`, `messages/en.json`

Add a locale in `src/i18n/routing.ts` and create `messages/<locale>.json`.

## Local setup

### 1. Supabase Dashboard

1. **Authentication → Providers → Email**: enable email signup.
2. **Authentication → Providers → GitHub**: enable, set Client ID/Secret from [GitHub OAuth Apps](https://github.com/settings/developers).
3. **Authentication → URL configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/zh/auth/callback`
     - `http://localhost:3000/en/auth/callback`
4. **Authentication → Providers → GitHub**: ensure scopes include `read:user` (default is fine for public starred repos).

### 2. Environment

```bash
cp .env.local.example .env.local
# Edit with your project URL and anon/publishable key
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Import [github.com/quick123-666/star-level](https://github.com/quick123-666/star-level) on [vercel.com](https://vercel.com).
2. **Settings → Environment Variables** (required for Production and Preview):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon / publishable key from Supabase → Settings → API |

3. Redeploy after saving env vars.
4. In **Supabase → Authentication → URL Configuration**, add your Vercel URLs, e.g.:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/zh/auth/callback`, `https://your-app.vercel.app/en/auth/callback`

### 4. Deploy Edge Function

From project root (requires [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase link --project-ref fkkeylzfdfpsudocydwz
supabase functions deploy sync-github-stars
```

Or deploy via Supabase Dashboard → Edge Functions.

The function `sync-github-stars` requires JWT (`verify_jwt: true`) and body `{ "provider_token": "..." }` from the user session after GitHub OAuth.

## Project structure

```
src/app/           # Next.js pages (login, signup, bind-github, dashboard)
src/components/    # UI components
src/lib/supabase/  # Supabase clients + middleware
supabase/functions/sync-github-stars/  # Star sync + XP grants
```

## Database

Schema and RLS live in Supabase migrations (`star_level_*`). Key RPC:

- `my_progress()` — current level, XP, daily stats
- `recognize_github_star()` — service role only (called from Edge Function)

## Social features (reserved)

Tables `posts`, `post_likes`, `conversations`, `messages` exist with RLS deny-all for v1; enable when building feed/DM features.
