import type { RouteStop } from "../data/mockData";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateTotalDistance(route: RouteStop[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversine(route[i - 1].lat, route[i - 1].lng, route[i].lat, route[i].lng);
  }
  return total;
}

export function calculateRouteTime(route: RouteStop[], transport: string): string {
  const dist = calculateTotalDistance(route);
  const speeds: Record<string, number> = { flight: 800, car: 80, train: 120, bus: 60, ferry: 30 };
  const speed = speeds[transport] || 80;
  const hours = dist / speed;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
}
