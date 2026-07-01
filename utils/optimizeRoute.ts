import type { RouteStop } from "../data/mockData";
import { haversine } from "./calculateRoute";

const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Reorders route stops via nearest-neighbor TSP, keeping stop 0 fixed as the
 * departure point. Labels are re-sequenced A, B, C… to match the new order;
 * colors and coordinates are preserved.
 */
export function optimizeRoute(route: RouteStop[]): RouteStop[] {
  if (route.length < 3) return route;

  const remaining = route.slice(1);
  const ordered: RouteStop[] = [route[0]];

  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((stop, i) => {
      const d = haversine(last.lat, last.lng, stop.lat, stop.lng);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }

  return ordered.map((stop, i) => ({ ...stop, label: LABELS[i] ?? stop.label }));
}
