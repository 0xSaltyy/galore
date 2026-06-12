# \# galore

Moody late-night Discord site for `# galore`. Built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, Discord OAuth, Discord webhooks, and a separate long-running Discord Gateway bot.

## Features

- Dark editorial homepage using `public/images/galore-profile.jpeg`
- Live VC page powered only by real Supabase voice data
- Discord Gateway bot that syncs real voice channels and current VC members
- Discord OAuth protected admin dashboard
- Staff applications and reports stored in Supabase
- Discord webhook notifications for staff submissions
- Supabase-managed staff profiles and events

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill it in.

3. Run the Supabase schema:

```text
supabase/schema.sql
```

Paste it into the Supabase SQL editor for your project and run it.

4. Check local environment variables:

```bash
npm run check:env
```

This prints only whether values are present or invalid. It never prints secret values. This is a full local stack check, so it includes the bot token needed by `npm run bot:dev`.

5. Start the website and bot together:

```bash
npm run dev:all
```

The website runs through `npm run dev`. The bot runs through `npm run bot:dev`.

## Scripts

```bash
npm run dev
npm run bot:dev
npm run dev:all
npm run bot:start
npm run check:env
npm run build
npm run lint
npm run typecheck
```

- `npm run dev`: start only the Next.js website
- `npm run bot:dev`: start only the Discord bot locally
- `npm run dev:all`: start website and bot together locally
- `npm run bot:start`: start the Discord bot for production workers
- `npm run check:env`: validate required local env vars without printing secrets
- `npm run build`: production-build the Next.js site
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks

## Required Local Environment Variables

```env
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
DISCORD_STAFF_WEBHOOK_URL=
NEXT_PUBLIC_DISCORD_INVITE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
DISCORD_ALLOWED_USER_IDS=
DISCORD_STAFF_ROLE_IDS=
DISCORD_ENABLE_PRESENCE_INTENT=false
```

Notes:

- `NEXT_PUBLIC_DISCORD_INVITE_URL` must be a complete invite, such as `https://discord.gg/code` or `https://discord.com/invite/code`.
- If the invite URL is missing or incomplete, the site shows an invite configuration error instead of a broken Discord link.
- `DISCORD_ALLOWED_USER_IDS` and `DISCORD_STAFF_ROLE_IDS` are comma-separated Discord snowflake IDs.
- `SESSION_SECRET` should be a random string at least 32 characters long.
- Variables prefixed with `NEXT_PUBLIC_` are visible to the browser. Never put secrets in them.

## GitHub + Vercel Deployment

Vercel hosts the website. The Discord Gateway bot must run separately because Vercel serverless functions cannot keep a Discord Gateway WebSocket alive 24/7.

### Before Pushing

The repo is configured so local secrets and build output are ignored:

```text
.env
.env.local
.env*.local
.vercel
node_modules
.next
```

Before committing, run:

```bash
npm run check:env
npm run lint
npm run typecheck
npm run build
```

### GitHub Commands

Create the GitHub repo in GitHub first, then run:

```bash
git status
git add .
git commit -m "Prepare # galore website"
git branch -M main
git remote add origin <github-repo-url>
git push -u origin main
```

### Vercel Website Deployment

1. Push the project to GitHub.

2. In Vercel, choose **Add New Project** and import the GitHub repo.

3. Use the Next.js framework preset.

4. If Vercel asks for a root directory, select the folder that contains `package.json`.

5. Set the build command to:

```bash
npm run build
```

6. Add the Vercel environment variables listed below.

7. Deploy.

### Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

```env
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/discord/callback
DISCORD_GUILD_ID=
DISCORD_ALLOWED_USER_IDS=
DISCORD_STAFF_ROLE_IDS=
DISCORD_STAFF_WEBHOOK_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
NEXT_PUBLIC_DISCORD_INVITE_URL=https://discord.gg/YOUR-INVITE-CODE
```

Do not put `DISCORD_BOT_TOKEN` in Vercel for the normal deployment. The website uses Discord OAuth for dashboard login, Supabase for live data, and webhooks for submissions. The long-running bot token belongs on Railway, Render Background Worker, Fly.io, or a VPS.

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DISCORD_INVITE_URL`, and `DISCORD_REDIRECT_URI` must be production values on Vercel. Do not leave them as `localhost`.

## Discord OAuth Production Setup

The app uses this OAuth callback route:

```text
/api/auth/discord/callback
```

Local redirect:

```text
http://localhost:3000/api/auth/discord/callback
```

Production redirect:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/discord/callback
```

Add the production redirect in Discord Developer Portal -> OAuth2 -> Redirects.

`DISCORD_REDIRECT_URI` in Vercel must exactly match that production redirect, including protocol, domain, path, and trailing slash behavior.

The login flow requests `identify guilds.members.read` so the dashboard can check the signed-in user's Discord ID and staff roles without requiring `DISCORD_BOT_TOKEN` on Vercel.

## Bot Hosting

Vercel hosts the website only. The Discord bot worker must be hosted separately on a long-running host:

- Railway
- Render Background Worker
- Fly.io
- VPS

Railway is the easiest option.

### Railway Bot Setup

1. Push this project to GitHub.

2. In Railway, create a new project from the GitHub repo.

3. If Railway asks for a root directory, choose the folder that contains `package.json`.

4. Set the Railway start command:

```bash
npm run bot:start
```

5. Add these Railway environment variables:

```env
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DISCORD_ENABLE_PRESENCE_INTENT=false
```

Set `DISCORD_ENABLE_PRESENCE_INTENT=true` only if the Presence Intent is enabled for the bot in the Discord Developer Portal.

6. Deploy the Railway service.

7. Check Railway logs for:

```text
Logged in as <bot tag>
Fetched guild <guild name>
Found X voice channels
Synced X active voice members
Initial VC sync complete
Listening for voiceStateUpdate
```

## Discord Bot Behavior

When started, the bot:

- loads `.env.local` in local development
- logs into Discord automatically
- fetches the real guild from `DISCORD_GUILD_ID`
- fetches real voice channels
- writes voice channels to Supabase
- syncs members already inside VCs
- writes active voice members to Supabase
- listens for `voiceStateUpdate`
- re-syncs when users join, leave, move, mute, or deafen

Bot logs are intentionally non-secret.

## Branding Checklist

- Server name: `# galore`
- Main image path: `public/images/galore-profile.jpeg`
- Invite URL comes from `NEXT_PUBLIC_DISCORD_INVITE_URL`
- Production site URL comes from `NEXT_PUBLIC_SITE_URL`
- OAuth redirect comes from `DISCORD_REDIRECT_URI`
