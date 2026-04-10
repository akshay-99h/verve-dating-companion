# Prompt Rotator

Minimal Expo app for browsing and copying conversational prompts with foreground-only auto rotation.

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

## Notes

- Clipboard is only written when the user taps `Copy`.
- Rotation pauses when the app is backgrounded.
- Prompt content lives in `data/prompts.ts`.
