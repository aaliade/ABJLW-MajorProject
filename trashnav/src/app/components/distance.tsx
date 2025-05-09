const collectionsPerYear = 24; // Twice per month (2 * 12)
const garbageTruckLitresPerKM = 38 / 100; // Average garbage truck consumes ~38L/100km
const dieselLitreCost = 180; // Diesel cost in JMD per liter (adjust to current price)
const exchangeRate = 155; // JMD to USD exchange rate (adjust as needed)
const litreCostKM = garbageTruckLitresPerKM * dieselLitreCost;
const secondsPerDay = 60 * 60 * 24;

type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {
  if (!leg.distance || !leg.duration) return null;

  // Calculate total time spent in transit per year (in seconds)
  const totalTimeSeconds = collectionsPerYear * leg.duration.value * 2; // Round trip
  
  // Convert to days
  const days = (totalTimeSeconds / secondsPerDay).toFixed(1);
  
  // Calculate fuel cost - distance in km * fuel consumption * collections per year * 2 (round trip)
  const costJMD = Math.floor(
    (leg.distance.value / 1000) * litreCostKM * collectionsPerYear * 2
  );
  
  // Convert to USD for reference
  const costUSD = (costJMD / exchangeRate).toFixed(2);

  return (
    <div>
      <p>
        This home is <span className="highlight">{leg.distance.text}</span> away
        from the Riverton City Landfill. That would take{" "}
        <span className="highlight">{leg.duration.text}</span> each direction.
      </p>

      <p>
        That's <span className="highlight">{days} days</span> of travel time if garbage is collected twice per month
        for the year with a fuel cost of approximately{" "} 
        <span className="highlight">
          J${new Intl.NumberFormat().format(costJMD)} (US${costUSD})
        </span> for this collection route. 
      </p>
    </div>
  );
}