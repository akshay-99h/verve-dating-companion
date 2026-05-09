# Verve

Minimal Expo app for browsing and copying conversational prompts with foreground-only auto rotation.

The repo now also includes a Next.js web app in [`web/`](/Volumes/HP%20P900%201TB%20Media/Personal%20Projects/dating-liker/prompt-generator/web) with WorkOS AuthKit authentication and installable PWA support.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- `expo-clipboard`
- `@react-native-async-storage/async-storage`

## Features

- One prompt on screen at a time
- Next, previous, shuffle, and copy actions
- Foreground-only auto rotation with configurable intervals
- Persisted state for prompt index, auto-rotate, interval, and audience filter
- Audience filters like `Gym`, `Software`, `Creative`, and `Bookish`
- Light and dark themes using a Hinge-inspired color system

## Run

```bash
npm install
npm start -- --clear
```

Web app:

```bash
cd web
pnpm install
pnpm run dev
```

## Notes

- Clipboard is only written when the user taps `Copy`.
- Rotation pauses when the app is backgrounded.
- Prompt content lives in `data/prompts.ts`.
- Web and native share the same prompt datasets through the repo-level `shared/` export layer, so adding a prompt is a single edit.
