import type { Trip } from "../data/mockData";

export interface Destination {
  id: string;
  name: string;
  country: string;
  flag?: string;
  coverImage?: string;
  tripCount: number;
  isFeatured: boolean;
  status: string;
}

function countryOf(destination: string): string {
  const parts = destination.split(",");
  return (parts[parts.length - 1] || destination).trim().toLowerCase();
}

// Heuristic: prefer destinations in countries the user hasn't already
// traveled to (per their own trip history), ranked by featured + popularity.
// Falls back to the plain popularity ranking once everything's been "visited".
export function getRecommendedDestinations(destinations: Destination[], ownTrips: Trip[], limit = 6): Destination[] {
  const visited = new Set(ownTrips.map((t) => countryOf(t.destination)));
  const unvisited = destinations.filter((d) => !visited.has(d.country.trim().toLowerCase()));
  const pool = unvisited.length > 0 ? unvisited : destinations;

  return [...pool]
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.tripCount - a.tripCount)
    .slice(0, limit);
}
