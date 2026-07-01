import type { Trip } from "../data/mockData";
import { haversine } from "./calculateRoute";

/**
 * Computes total statistics from an array of trips.
 */
export function calculateUserStats(trips: Trip[]) {
  let totalSpent = 0;
  let totalKm = 0;
  const countries = new Set<string>();
  let currentMonthSpent = 0;
  const now = new Date();

  trips.forEach(trip => {
    // Collect countries from destinations (e.g. "Bali, Indonesia")
    const destinationParts = trip.destination.split(",");
    if (destinationParts.length > 1) {
      countries.add(destinationParts[destinationParts.length - 1].trim());
    } else {
      countries.add(trip.destination.trim());
    }

    // Sum total spending and current month spending
    trip.expenses.forEach(exp => {
      totalSpent += exp.amount;
      
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        currentMonthSpent += exp.amount;
      }
    });

    // Calculate km from route
    for (let i = 0; i < trip.route.length - 1; i++) {
        totalKm += haversine(
            trip.route[i].lat, trip.route[i].lng,
            trip.route[i+1].lat, trip.route[i+1].lng
        );
    }
  });

  return {
    totalTrips: trips.length,
    countriesVisited: countries.size,
    totalSpent,
    currentMonthSpent,
    totalKm: Math.round(totalKm),
    countryList: Array.from(countries)
  };
}
