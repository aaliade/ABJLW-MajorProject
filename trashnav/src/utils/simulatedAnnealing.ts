type LatLngLiteral = google.maps.LatLngLiteral;

// Calculate the distance between two LatLng points using the Haversine formula
function calculateDistance(point1: LatLngLiteral, point2: LatLngLiteral): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate the total distance of a route
export function calculateTotalDistance(route: LatLngLiteral[]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
}

// Simulated Annealing algorithm for TSP with animation support
export function simulatedAnnealingTSP(
  points: LatLngLiteral[], 
  landfill: LatLngLiteral, 
  iterations: number = 5000,
  initialTemp: number = 1000,
  coolingRate: number = 0.999,
  onProgress?: (progress: number, currentBest: number, currentRoute: LatLngLiteral[]) => void
): LatLngLiteral[] {
  // Ensure the route starts and ends at the landfill
  const route = [landfill, ...points, landfill];
  let currentRoute = [...route];
  let bestRoute = [...route];
  let currentDistance = calculateTotalDistance(currentRoute);
  let bestDistance = currentDistance;
  let temperature = initialTemp;

  // Function to perform one iteration of the algorithm
  const performIteration = (i: number) => {
    // Generate a new route by swapping two random points (excluding landfill)
    const newRoute = [...currentRoute];
    const idx1 = Math.floor(Math.random() * (points.length)) + 1; // +1 to skip landfill
    const idx2 = Math.floor(Math.random() * (points.length)) + 1;
    [newRoute[idx1], newRoute[idx2]] = [newRoute[idx2], newRoute[idx1]];

    const newDistance = calculateTotalDistance(newRoute);
    const deltaDistance = newDistance - currentDistance;

    // Accept the new route if it's better or based on probability
    if (deltaDistance < 0 || Math.random() < Math.exp(-deltaDistance / temperature)) {
      currentRoute = newRoute;
      currentDistance = newDistance;
      if (currentDistance < bestDistance) {
        bestRoute = [...currentRoute];
        bestDistance = currentDistance;
      }
    }

    temperature *= coolingRate;

    // Report progress every 10 iterations for smoother animation
    if (onProgress && i % 10 === 0) {
      onProgress(i / iterations, bestDistance, currentRoute);
    }

    return i < iterations;
  };

  // Start the animation loop
  let iteration = 0;
  const animate = () => {
    if (performIteration(iteration)) {
      iteration++;
      requestAnimationFrame(animate);
    }
  };

  // Start the animation
  animate();

  return bestRoute;
} 