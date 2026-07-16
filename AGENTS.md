# AGENTS.md

## Mission
React Native mobile client for a trip-sharing app: auth, trip creation/browsing, public trip feed, backed by `my-trips-backend` (Laravel API).

## Toolchain
| Task | Command |
|---|---|
| Install | `npm install` |
| iOS | `npm run ios` |
| Android | `npm run android` |
| Lint | `npm run lint` |

## Judgment Boundaries
- NEVER commit `.env`.
- ASK FIRST before adding native deps (needs native rebuild) or upgrading React Native/React versions.
- ALWAYS update both the screen (`app/`) and its navigator registration (`src/navigation/`) together.

## Non-Standard Tooling
- `app/` uses Expo-Router-style route-group folder names (`(auth)`, `(tabs)`) but this project is bare RN CLI — actual navigation is manually wired in `src/navigation/`. Don't assume file-based routing works.
- Env vars typed via `env.d.ts` + `react-native-dotenv`, imported from `@env`.

## Agentic Resources
See `.agents/agents/`, `.agents/skills/`, `.agents/wiki/`.
