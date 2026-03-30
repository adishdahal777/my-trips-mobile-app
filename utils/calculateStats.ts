import type { Trip } from "../data/mockData";

/**
 * Calculates the Haversine distance between two points on Earth.
 */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
