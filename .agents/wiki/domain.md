# Domain

## Screens
- `app/(auth)/login.tsx`, `register.tsx` — auth entry
- `app/(tabs)/dashboard.tsx`, `explore.tsx`, `profile.tsx`, `trips/` — signed-in tab flow
- `app/public-feed.tsx`, `public-trip.tsx` — browsing public trips (mirrors backend's public Trip visibility)
- `app/landing.tsx`, `onboarding.tsx` — pre-auth flow

## State
- `AuthContext` — session/token, matches backend's Sanctum/Socialite/OTP auth
- `TripContext` — active trip data, matches backend `Trip` model (route stops, expenses, photos, notes)
- `ThemeContext` — light/dark mode

## API surface
- `services/api.ts` calls `my-trips-backend` routes (`routes/api.php`) — check that file for the current endpoint contract, docs are auto-generated there via Scramble.
