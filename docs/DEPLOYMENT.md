# Deploying MY DAY

Production URL: **https://my-day-rust-five.vercel.app**
Repository: **https://github.com/libra073/my-day**

## Stack

| Piece | Service |
| --- | --- |
| Frontend + API | Vercel (Vite build, `api/` serverless functions) |
| Identity (signup, email confirmation, sign-in, password reset) | Supabase Auth |
| App data (workspaces, bookings, budget…) | JSON store, `/tmp` on Vercel (see caveat) |

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for Production and Preview:

| Name | Scope | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | build + browser | `https://zfdwmlgoixheqjgjyfxv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | build + browser | publishable key (`sb_publishable_…`) |
| `SUPABASE_URL` | server | same project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | secret key (`sb_secret_…`) — never expose to the browser |
| `SUPABASE_REDIRECT_URL` | server | `https://my-day-rust-five.vercel.app/auth/callback` |

Locally the same names live in `.env` (gitignored). `.env.example` documents them.

## Supabase dashboard setup (required for email links)

**Authentication → URL Configuration**

- Site URL: `https://my-day-rust-five.vercel.app`
- Redirect URLs (add both):
  - `https://my-day-rust-five.vercel.app/auth/callback`
  - `http://localhost:5173/auth/callback`

Without this, confirmation and password-reset links fall back to the Site URL and land on a dead page.

**Authentication → Emails → SMTP**

The built-in mailer allows only a couple of messages per hour and returns
`email rate limit exceeded`. Add Resend / SendGrid / SES credentials before real users sign up.

## Demo accounts

Create or repair them in Supabase (password `password123`, email pre-confirmed):

```bash
node scripts/setup-supabase-demo-users.mjs
```

| Email | Role |
| --- | --- |
| john@myday.co.tz | customer (groom) |
| sarah@myday.co.tz | customer (bride) |
| neema@planning.co.tz | customer (planner) |
| info@grandimperial.co.tz | provider |
| admin@myday.co.tz | admin |

## Deploy

```bash
npm test                 # suite must be green
git push origin master   # GitHub
npx vercel --prod --yes  # Vercel production
```

CLI deployments are not linked to GitHub yet — pushing alone does not deploy.
Link the repo in Vercel → Settings → Git (or add a GitHub Action) to make `main`/`master` auto-deploy.

## Known caveat: data persistence

`server/db.js` writes to `/tmp/myday-data` when running on Vercel. Serverless instances are
ephemeral, so **writes (bookings, payments, new workspaces) can disappear between cold starts**.

For real production data, move the store to Supabase Postgres (or another managed database) and
keep Supabase Auth as the identity provider. That is the next planned migration.

## Security notes

- Rotate the `sb_secret_…` key if it has ever been shared in chat/logs.
- `.env` is gitignored; never commit real keys.
- Legacy local-auth endpoints return `410` while Supabase is configured, so the seeded
  password path cannot be used as a bypass.
