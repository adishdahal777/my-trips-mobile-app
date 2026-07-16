# Architecture

- Navigation: `src/navigation/AppNavigator.tsx` roots the tree, switching between `AuthStack.tsx` (login/register) and `MainTabs.tsx` (bottom tabs: dashboard, explore, profile, trips) based on `AuthContext`. `TripStack.tsx` handles trip detail flow within tabs.
- State: React Context, not Redux — `AuthContext` (session/token), `ThemeContext` (light/dark), `TripContext` (active trip data).
- API: `services/api.ts` is the single client talking to `my-trips-backend`; base URL comes from `DEV_LAN_IP` env var (LAN IP of dev machine running the Laravel backend, since RN can't hit `localhost`).
- Styling: NativeWind (Tailwind classes via `className` prop on RN components), config in `tailwind.config.js`.

## Gotchas
- `app/(auth)` and `app/(tabs)` folder naming *looks* like Expo Router but isn't — screens must be manually registered in `src/navigation/`. Adding a file to `app/` alone does nothing.
- `DEV_LAN_IP` must match whatever machine is running `my-trips-backend` — breaks silently (network error) if stale after switching networks.
