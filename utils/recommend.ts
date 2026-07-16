import type { Trip } from "../data/mockData";

// Scoring happens server-side (GET /recommendations) — see
// my-trips-backend/app/Http/Controllers/Api/RecommendationController.php.
// This type just describes what that endpoint returns.
export interface Recommendation {
  trip: Trip;
  score: number;
  reason: string;
}
