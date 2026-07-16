# CLAUDE.md

## Stack
- React Native 0.81 (bare RN CLI, not Expo), React 19, TypeScript 5.9
- Navigation: React Navigation (native-stack + bottom-tabs), file-grouped routes under `app/` (`(auth)`, `(tabs)`) but wired manually in `src/navigation/` — not Expo Router
- Styling: NativeWind (Tailwind v3 for RN)
- Reanimated 4 + gesture-handler for animation/gestures
- Talks to `my-trips-backend` (Laravel API) via `services/api.ts`

## Commands
| Task | Command |
|---|---|
| Install | `npm install` |
| Run iOS | `npm run ios` |
| Run Android | `npm run android` |
| Start Metro | `npm run start` |
| Lint | `npm run lint` |

## Project Layout
```
app/(auth)/        login, register screens
app/(tabs)/         dashboard, explore, profile, trips
app/public-feed.tsx, public-trip.tsx, landing.tsx, onboarding.tsx
context/            AuthContext, ThemeContext, TripContext
services/api.ts     backend API client
src/navigation/      AppNavigator, AuthStack, MainTabs, TripStack (actual RN Navigation wiring)
```

## Judgment Boundaries
- NEVER commit `.env` (holds `DEV_LAN_IP` for local backend access).
- ASK FIRST before adding new native dependencies (requires pod install / native rebuild, not just JS).
- ALWAYS check both `app/` screen file and its `src/navigation/*Stack.tsx` registration when adding a screen — they're wired separately.

## Conventions
- `app/(auth)` and `app/(tabs)` directory names use route-group parens by convention but this is NOT Expo Router — actual navigation tree lives in `src/navigation/`.
- API base URL comes from `@env` (`DEV_LAN_IP`, via react-native-dotenv) — update `.env` when backend's LAN IP changes, not hardcoded.

## Agentic Config
See `.agents/` and `.claude/` for subagents, skills, and wiki notes.

@AGENTS.md
