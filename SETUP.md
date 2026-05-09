# Verve Setup

This repo contains two apps:

- An Expo native app at the repo root
- A Next.js web app in [`web/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web)

Both apps share the same prompt content. You only add or edit prompts once in the root data files.

## Project layout

- [`data/prompts.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/data/prompts.ts): reply prompts
- [`data/openers.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/data/openers.ts): opener prompts
- [`data/smallTalkTopics.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/data/smallTalkTopics.ts): small-talk prompts
- [`types.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/types.ts): shared domain types
- [`shared/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/shared): shared export layer used by the web app
- [`web/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web): Next.js + WorkOS AuthKit + PWA app

## Prerequisites

Install these first:

- Node.js 20+ recommended
- npm 10+ recommended
- pnpm 10+ recommended for the web app
- Xcode and CocoaPods if you want to run iOS locally
- A WorkOS account if you want to run the authenticated web app

Check versions:

```bash
node -v
npm -v
```

## 1. Install dependencies

Root app dependencies:

```bash
npm install
```

Web app dependencies:

```bash
cd web
pnpm install
cd ..
```

## 1.1 Web structure notes

The `web/` app now supports:

- TypeScript
- Tailwind CSS 4
- shadcn-compatible component organization

The default reusable UI path is [`web/components/ui/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/components/ui).

Why this folder matters:

- It gives shared UI primitives a predictable location.
- It keeps the app compatible with shadcn-style component additions.
- It avoids mixing low-level reusable pieces with route-specific view code.

## 2. Shared content workflow

Do not duplicate prompt content in native and web.

When you want to add or update prompt copy, edit only the root content files:

- [`data/prompts.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/data/prompts.ts)
- [`data/openers.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/data/openers.ts)
- [`data/smallTalkTopics.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/data/smallTalkTopics.ts)

The web app imports those through [`shared/index.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/shared/index.ts), so one change updates both apps.

## 3. Run the Expo native app

Start the Expo dev server:

```bash
npm start
```

Useful scripts:

```bash
npm run start:tunnel
npm run ios
npm run android
```

Notes:

- The root app uses Expo SDK 54.
- The app persists local settings and saved state on-device.
- iOS native files already exist in [`ios/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/ios).

## 4. Set up the web app

The web app uses WorkOS AuthKit on Next.js App Router.

### 4.1 Create local env file

Copy the example env file:

```bash
cp web/.env.example web/.env.local
```

Set these values in `web/.env.local`:

```bash
WORKOS_API_KEY=sk_test_your_api_key
WORKOS_CLIENT_ID=client_your_client_id
WORKOS_COOKIE_PASSWORD=replace_with_a_minimum_32_character_secret
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

Requirements:

- `WORKOS_COOKIE_PASSWORD` must be at least 32 characters
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` must exactly match the callback URL you configure in WorkOS

Generate a cookie secret:

```bash
openssl rand -base64 32
```

### 4.2 Configure WorkOS

In the WorkOS dashboard, configure these URLs for local development:

- Redirect URI: `http://localhost:3000/callback`
- Sign-in endpoint: `http://localhost:3000/login`
- Sign-out redirect: `http://localhost:3000/`

If you deploy the site, update the same values to the production domain too.

Production target:

- App domain: `https://verve.akxost.com`
- Redirect URI: `https://verve.akxost.com/callback`
- Sign-in endpoint: `https://verve.akxost.com/login`
- Sign-out redirect: `https://verve.akxost.com/`

## 5. Run the web app

From the repo root:

```bash
pnpm run web:dev
```

Or directly:

```bash
cd web
pnpm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000)

Available scripts:

```bash
pnpm run web:typecheck
pnpm run web:build
```

Or inside `web/`:

```bash
npm run typecheck
npm run build
```

## 6. PWA behavior

The web app includes:

- A manifest route in [`web/app/manifest.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/app/manifest.ts)
- Service worker registration in [`web/components/pwa-registration.tsx`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/components/pwa-registration.tsx)
- Static service worker in [`web/public/sw.js`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/public/sw.js)

Notes:

- The app is installable as a PWA
- Basic shell assets are cached
- Authentication still requires network access

## 7. Build verification

Native:

```bash
npm start
```

Web typecheck:

```bash
pnpm run web:typecheck
```

Web production build:

```bash
pnpm run web:build
```

Important:

- The web production build requires the WorkOS environment variables to be present
- If `WORKOS_API_KEY` or related env vars are missing, the Next build can fail while evaluating AuthKit routes

## 8. Deploy the web app

### Vercel

Recommended if you want the easiest Next.js deployment.

Set these environment variables in Vercel:

- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_COOKIE_PASSWORD`
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI`

Example production callback:

- `NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://verve.akxost.com/callback`

Then update WorkOS dashboard URLs to match:

- Redirect URI: `https://verve.akxost.com/callback`
- Sign-in endpoint: `https://verve.akxost.com/login`
- Sign-out redirect: `https://verve.akxost.com/`

### Cloudflare

This app was kept framework-standard so it can be adapted for Cloudflare deployment, but Cloudflare is not as direct as Vercel for a standard Next.js auth setup.

If you deploy to Cloudflare:

- Use a Next-compatible Cloudflare adapter/runtime path
- Set the same WorkOS environment variables
- Make sure the callback URL and login URL exactly match your deployed domain

If you want the least friction, deploy the web app to Vercel first.

## 9. Common issues

### Missing WorkOS env vars

Symptom:

- `NoApiKeyProvidedException`

Fix:

- Set `WORKOS_API_KEY`
- Set `WORKOS_CLIENT_ID`
- Set `WORKOS_COOKIE_PASSWORD`
- Set `NEXT_PUBLIC_WORKOS_REDIRECT_URI`

### Sign-out fails

Symptom:

- Sign-out redirects to an error page

Fix:

- Add the sign-out redirect URL in WorkOS dashboard

### Prompts updated in one app but not the other

Fix:

- Make sure you edited the root `data/` files, not a generated or local-only file

### Web build fails after auth changes

Fix:

- Run `pnpm run web:typecheck`
- Recheck WorkOS env vars
- Recheck [`web/middleware.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/middleware.ts), [`web/app/login/route.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/app/login/route.ts), and [`web/app/callback/route.ts`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web/app/callback/route.ts)

## 10. Recommended day-to-day workflow

1. Edit shared prompt content in the root `data/` files.
2. Run the Expo app if you want to check native behavior.
3. Run `pnpm run web:dev` if you want to check the authenticated web app.
4. Before shipping web changes, run:

```bash
pnpm run web:typecheck
pnpm run web:build
```

## 11. Useful commands

Root app:

```bash
npm start
npm run start:tunnel
npm run ios
npm run android
```

Web app:

```bash
pnpm run web:dev
pnpm run web:typecheck
pnpm run web:build
```
