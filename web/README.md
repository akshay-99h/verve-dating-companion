# Verve Web

Next.js App Router web app with WorkOS AuthKit and installable PWA support.

## Project support

This app now supports:

- TypeScript
- Tailwind CSS 4
- shadcn-compatible structure with [`components/ui/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/components/ui)

Why `components/ui` matters:

- It gives reusable interface primitives a stable home.
- It keeps the project compatible with shadcn-style additions and future shared UI work.
- It separates generic building blocks from page-specific components.

## Why the content stays in sync

The web app imports from the repo-level `shared/` export layer:

- `shared/content.ts` re-exports the canonical prompt datasets from the existing root `data/` files.
- `shared/types.ts` re-exports the root domain types.
- `shared/rotator.ts` re-exports shared audience and rotation helpers.

That means adding a prompt remains a single edit in the root content modules.

## Environment

Copy `.env.example` to `.env.local` and set:

- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_COOKIE_PASSWORD`
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI`

In the WorkOS dashboard, configure:

- Redirect URI: `http://localhost:3000/callback`
- Sign-in endpoint: `http://localhost:3000/login`
- Sign-out redirect: `http://localhost:3000/`

Production URLs:

- App URL: `https://verve.akxost.com`
- Redirect URI: `https://verve.akxost.com/callback`
- Sign-in endpoint: `https://verve.akxost.com/login`
- Sign-out redirect: `https://verve.akxost.com/`

## Run

```bash
pnpm install
pnpm run dev
```

## Deploy

This app avoids Vercel-only APIs. It should work on:

- Vercel directly
- Cloudflare via a Next.js adapter/runtime layer

For production, set `NEXT_PUBLIC_WORKOS_REDIRECT_URI` to the exact deployed callback URL.
