"use client";

import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
  useLoadScript,
  Polyline,
  InfoWindow
} from "@react-google-maps/api";

import Places from "./places";
import Distance from "./distance";
import { simulatedAnnealingTSP, calculateTotalDistance } from '../../utils/simulatedAnnealing';

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

// Define the Routes API response types
interface RoutesResponse {
  routes: Array<{
    distanceMeters: number;
    duration: string;
    polyline: {
      encodedPolyline: string;
    };
  }>
}

// Define location interface with garbage level and area
interface Location {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
  garbageLevel: number;
}

export default function Map() {
  const [landfill, setLandfill] = useState<LatLngLiteral>();
  const [routeResponse, setRouteResponse] = useState<RoutesResponse>();
  const [directions, setDirections] = useState<DirectionsResult>();
  const [error, setError] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [routeKey, setRouteKey] = useState<number>(0);
  const [lastClickedHouse, setLastClickedHouse] = useState<LatLngLiteral | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<LatLngLiteral[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [optimizationMessage, setOptimizationMessage] = useState<string>('');
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [currentBestDistance, setCurrentBestDistance] = useState<number>(0);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  
  // Add new state variables for analysis
  const [analysisData, setAnalysisData] = useState<{
    totalTime: number;
    trucksNeeded: number;
    fuelCostPerTruck: number;
    totalFuelConsumption: number;
    totalFuelCost: number;
    collectionTime: number;
    yearlyFuelCost: number;
    yearlyTravelDays: number;
    totalWasteVolume: number;
  } | null>(null);

  // Constants for calculations
  const AVERAGE_SPEED = 40; // km/h
  const FUEL_EFFICIENCY = 3.5; // km/l
  const FUEL_PRICE = 250; // JMD per liter
  const TRUCK_CAPACITY = 15; // tons
  const COLLECTIONS_PER_MONTH = 2;
  const WORKING_HOURS_PER_DAY = 8;
  const AVERAGE_LOAD_TIME = 15; // minutes per location
  const AVERAGE_WASTE_PER_LOCATION = 2; // tons per location at 100% capacity

  // Add timeout ref to handle hover delay
  const hoverTimeoutRef = useRef<number | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ["places", "geometry"],
  });
 
  // Use predefined locations for Jamaica
  const locations = useMemo<Location[]>(() => [
    // Papine area
    { id: 1, name: "Papine Market", area: "Papine", lat: 18.0164, lng: -76.7442, garbageLevel: 85 },
    { id: 2, name: "UWI Entrance", area: "Papine", lat: 18.0055, lng: -76.7481, garbageLevel: 45 },
    { id: 3, name: "Papine Square", area: "Papine", lat: 18.0173, lng: -76.7438, garbageLevel: 75 },
    { id: 4, name: "Hope Road Junction", area: "Papine", lat: 18.0145, lng: -76.7459, garbageLevel: 90 },
    { id: 5, name: "Gordon Town Road", area: "Papine", lat: 18.0187, lng: -76.7412, garbageLevel: 60 },
    { id: 6, name: "August Town Road", area: "Papine", lat: 18.0197, lng: -76.7432, garbageLevel: 82 },
    { id: 7, name: "University Hospital", area: "Papine", lat: 18.0087, lng: -76.7465, garbageLevel: 25 },
    { id: 8, name: "Mona Heights", area: "Papine", lat: 18.0109, lng: -76.7492, garbageLevel: 38 },
    { id: 9, name: "Tavern Community", area: "Papine", lat: 18.0201, lng: -76.7398, garbageLevel: 95 },
    { id: 10, name: "Mona Road", area: "Papine", lat: 18.0068, lng: -76.7452, garbageLevel: 55 },
    { id: 11, name: "Golding Avenue", area: "Papine", lat: 18.0048, lng: -76.7439, garbageLevel: 43 },
    { id: 12, name: "Mona Common", area: "Papine", lat: 18.0135, lng: -76.7425, garbageLevel: 78 },
    { id: 13, name: "August Town Police Station", area: "Papine", lat: 18.0189, lng: -76.7389, garbageLevel: 32 },
    { id: 14, name: "University Crescent", area: "Papine", lat: 18.0079, lng: -76.7472, garbageLevel: 59 },
    { id: 15, name: "Chancellor Hall", area: "Papine", lat: 18.0052, lng: -76.7459, garbageLevel: 65 },
    
    // Liguanea area
    { id: 16, name: "Liguanea Plaza", area: "Liguanea", lat: 18.0055, lng: -76.7756, garbageLevel: 65 },
    { id: 17, name: "Sovereign Centre", area: "Liguanea", lat: 18.0042, lng: -76.7789, garbageLevel: 40 },
    { id: 18, name: "Hope Road", area: "Liguanea", lat: 18.0075, lng: -76.7742, garbageLevel: 85 },
    { id: 19, name: "Old Hope Road", area: "Liguanea", lat: 18.0101, lng: -76.7726, garbageLevel: 55 },
    { id: 20, name: "Lady Musgrave Road", area: "Liguanea", lat: 18.0028, lng: -76.7801, garbageLevel: 70 },
    { id: 21, name: "Kings House", area: "Liguanea", lat: 18.0095, lng: -76.7773, garbageLevel: 28 },
    { id: 22, name: "Devon House", area: "Liguanea", lat: 18.0119, lng: -76.7799, garbageLevel: 35 },
    { id: 23, name: "Hope Gardens", area: "Liguanea", lat: 18.0145, lng: -76.7783, garbageLevel: 22 },
    { id: 24, name: "Hope Zoo", area: "Liguanea", lat: 18.0152, lng: -76.7768, garbageLevel: 45 },
    { id: 25, name: "UTECH Campus", area: "Liguanea", lat: 18.0181, lng: -76.7732, garbageLevel: 58 },
    { id: 26, name: "Matilda's Corner", area: "Liguanea", lat: 18.0071, lng: -76.7712, garbageLevel: 79 },
    { id: 27, name: "Barbican Road", area: "Liguanea", lat: 18.0132, lng: -76.7693, garbageLevel: 82 },
    { id: 28, name: "Jack's Hill Road", area: "Liguanea", lat: 18.0175, lng: -76.7638, garbageLevel: 38 },
    { id: 29, name: "Grants Pen Road", area: "Liguanea", lat: 18.0201, lng: -76.7719, garbageLevel: 88 },
    { id: 30, name: "Constant Spring Road", area: "Liguanea", lat: 18.0219, lng: -76.7752, garbageLevel: 72 },
    
    // Kintyre area
    { id: 31, name: "Kintyre Main Road", area: "Kintyre", lat: 18.0344, lng: -76.7255, garbageLevel: 95 },
    { id: 32, name: "Kintyre Community Centre", area: "Kintyre", lat: 18.0329, lng: -76.7274, garbageLevel: 60 },
    { id: 33, name: "Kintyre Primary School", area: "Kintyre", lat: 18.0351, lng: -76.7246, garbageLevel: 40 },
    { id: 34, name: "Dublin Drive", area: "Kintyre", lat: 18.0365, lng: -76.7233, garbageLevel: 85 },
    { id: 35, name: "Tredegar Park", area: "Kintyre", lat: 18.0311, lng: -76.7292, garbageLevel: 70 },
    { id: 36, name: "Wedge Close", area: "Kintyre", lat: 18.0338, lng: -76.7219, garbageLevel: 87 },
    { id: 37, name: "Sylvan Avenue", area: "Kintyre", lat: 18.0323, lng: -76.7242, garbageLevel: 49 },
    { id: 38, name: "Leckford Avenue", area: "Kintyre", lat: 18.0313, lng: -76.7231, garbageLevel: 62 },
    { id: 39, name: "Deanery Road", area: "Kintyre", lat: 18.0355, lng: -76.7281, garbageLevel: 78 },
    { id: 40, name: "Hillview Avenue", area: "Kintyre", lat: 18.0305, lng: -76.7263, garbageLevel: 31 },
    { id: 41, name: "Deanery Drive", area: "Kintyre", lat: 18.0372, lng: -76.7269, garbageLevel: 53 },
    { id: 42, name: "Langston Road", area: "Kintyre", lat: 18.0382, lng: -76.7251, garbageLevel: 92 },
    { id: 43, name: "Whitehall Avenue", area: "Kintyre", lat: 18.0299, lng: -76.7239, garbageLevel: 67 },
    { id: 44, name: "Kintyre Heights", area: "Kintyre", lat: 18.0318, lng: -76.7213, garbageLevel: 73 },
    { id: 45, name: "Mountain View Avenue", area: "Kintyre", lat: 18.0292, lng: -76.7276, garbageLevel: 89 },
  ], []);

  // Set Jamaica center - centered on the whole island
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 18.1096, lng: -77.2975 }), // Center on Jamaica as a whole
    []
  );
  
  const options = useMemo<MapOptions>(
    () => ({
      mapId: "ca15b6fb8fe984f7",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map | null) => {
    mapRef.current = map;
  }, []);

  // Helper function to compare two locations with a small epsilon for floating point comparison
  const isSameLocation = (loc1: LatLngLiteral | null, loc2: LatLngLiteral): boolean => {
    if (!loc1) return false;
    
    // Use a small epsilon for floating point comparison
    const epsilon = 0.0000001;
    return Math.abs(loc1.lat - loc2.lat) < epsilon && 
           Math.abs(loc1.lng - loc2.lng) < epsilon;
  };

  // Helper function to get marker icon color based on garbage level
  const getMarkerIcon = (garbageLevel: number) => {
    if (garbageLevel >= 70) {
      return "http://maps.google.com/mapfiles/ms/icons/red-dot.png"; // High level (70-100%)
    } else if (garbageLevel >= 40) {
      return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // Medium level (40-69%)
    } else {
      return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Low level (0-39%)
    }
  };

  const fetchRoute = async (location: Location) => {
    if (!landfill) return;
    
    console.log("Clicked location:", location);
    
    // Convert Location to LatLngLiteral for comparison
    const locationLatLng: LatLngLiteral = { lat: location.lat, lng: location.lng };
    
    // Check if clicking the same location twice to toggle/reset
    if (lastClickedHouse && isSameLocation(lastClickedHouse, locationLatLng)) {
      console.log("Same location clicked twice, clearing route");
      // Clear the route
      setDirections(undefined);
      setRoutePath([]);
      setRouteResponse(undefined);
      setLastClickedHouse(null);
      setShowRoute(false); // Hide the route
      return;
    }

    try {
      // Clear previous route data
      setError(null);
      setDirections(undefined);
      
      // Clear route path and ensure key is updated before setting a new path
      setRoutePath([]);
      setRouteKey(prevKey => prevKey + 1);
      
      setLastClickedHouse(locationLatLng); // Set the last clicked location
      
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: landfill.lat,
                longitude: landfill.lng
              }
            }
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: false,
          routeModifiers: {
            avoidTolls: false,
            avoidHighways: false,
            avoidFerries: false
          },
          languageCode: "en-US",
          units: "IMPERIAL"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Route computation failed');
      }

      const result: RoutesResponse = await response.json();
      setRouteResponse(result);

      // Convert Routes API response to DirectionsResult format for compatibility
      if (result.routes && result.routes[0]) {
        const route = result.routes[0];
        console.log('Route data:', route);
        
        // Create path from encoded polyline
        const decodedPath = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
        console.log('Decoded path length:', decodedPath.length);
        setRoutePath(decodedPath);
        
        // Create a proper bounds object that includes all points
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(location.lat, location.lng));
        bounds.extend(new google.maps.LatLng(landfill.lat, landfill.lng));
        
        // Add some points from the path to ensure the bounds are correct
        if (decodedPath.length > 0) {
          bounds.extend(decodedPath[0]);
          bounds.extend(decodedPath[Math.floor(decodedPath.length / 2)]);
          bounds.extend(decodedPath[decodedPath.length - 1]);
        }
        
        const syntheticDirectionsResult: DirectionsResult = {
          routes: [{
            legs: [{
              distance: { text: `${Math.round(route.distanceMeters / 1609.34)} mi`, value: route.distanceMeters },
              duration: { text: `${Math.round(Number(route.duration.slice(0, -1)) / 60)} mins`, value: Number(route.duration.slice(0, -1)) },
              steps: [],
              start_location: new google.maps.LatLng(location.lat, location.lng),
              end_location: new google.maps.LatLng(landfill.lat, landfill.lng),
              start_address: "",
              end_address: "",
              traffic_speed_entry: [],
              via_waypoints: []
            }],
            overview_path: decodedPath,
            overview_polyline: route.polyline.encodedPolyline,
            bounds: bounds,
            copyrights: "Map data 2025 Google",
            warnings: [],
            waypoint_order: [],
            summary: `${Math.round(route.distanceMeters / 1609.34)} mi route`
          }],
          geocoded_waypoints: [{
            place_id: "",
            types: ["street_address"]
          }],
          request: {
            origin: locationLatLng,
            destination: landfill,
            travelMode: google.maps.TravelMode.DRIVING
          }
        };
        
        console.log('Synthetic directions result:', syntheticDirectionsResult);
        setDirections(syntheticDirectionsResult);
        setShowRoute(true); // Show the route
        
        // Fit the map to the route bounds
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds);
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setError(error instanceof Error ? error.message : 'Failed to compute route');
      setDirections(undefined);
      setRoutePath([]);
    }
  };

  const hardReset = () => {
    // Use the most extreme approach - reload the page
    console.log("Using page reload to clear the route");
    window.location.reload();
  };

  // Inside the Map component, add this effect to restore the landfill location on load
  useEffect(() => {
    // Check if we have a stored landfill location
    const storedLandfill = sessionStorage.getItem('landfillLocation');
    if (storedLandfill) {
      try {
        const parsedLandfill = JSON.parse(storedLandfill);
        setLandfill(parsedLandfill);
        
        // If we have a stored landfill and the routeCleared flag is set, we're coming from a reset
        if (sessionStorage.getItem('routeCleared')) {
          sessionStorage.removeItem('routeCleared'); // Clear the flag
          console.log("Route was cleared but landfill location restored");
        }
      } catch (e) {
        console.error("Error parsing stored landfill location", e);
      }
    }
  }, []);

  // Update the Places component handler to store the landfill location when it changes
  const handleLandfillSet = (position: LatLngLiteral) => {
    setLandfill(position);
    
    // Store the landfill location in session storage
    sessionStorage.setItem('landfillLocation', JSON.stringify(position));
    
    // Pan to the new location
    mapRef.current?.panTo(position);
  };

  const calculateAnalysis = (distance: number, clusterType: 'Minimum' | 'Medium' | 'Maximum') => {
    // Calculate number of locations in the cluster
    const locationsInCluster = locations.filter(loc => {
      switch (clusterType) {
        case 'Minimum': return loc.garbageLevel < 40;
        case 'Medium': return loc.garbageLevel >= 40 && loc.garbageLevel < 70;
        case 'Maximum': return loc.garbageLevel >= 70;
        default: return false;
      }
    });

    // Calculate total waste volume based on garbage levels
    const totalWasteVolume = locationsInCluster.reduce((total, loc) => {
      // Convert garbage level percentage to actual waste volume
      const wasteVolume = (loc.garbageLevel / 100) * AVERAGE_WASTE_PER_LOCATION;
      return total + wasteVolume;
    }, 0);

    // Calculate number of trucks needed based on waste volume and truck capacity
    const trucksNeeded = Math.ceil(totalWasteVolume / TRUCK_CAPACITY);

    // Calculate total time (including loading time)
    const travelTime = distance / AVERAGE_SPEED; // hours
    const loadingTime = (locationsInCluster.length * AVERAGE_LOAD_TIME) / 60; // hours
    const totalTime = travelTime + loadingTime;

    // Calculate yearly travel time (twice per month)
    const yearlyTravelTime = totalTime * COLLECTIONS_PER_MONTH * 12; // hours
    const yearlyTravelDays = yearlyTravelTime / WORKING_HOURS_PER_DAY; // days

    // Calculate fuel consumption and costs
    const fuelConsumption = distance / FUEL_EFFICIENCY; // liters
    const fuelCostPerTruck = fuelConsumption * FUEL_PRICE;
    const totalFuelCost = fuelCostPerTruck * trucksNeeded;
    const yearlyFuelCost = totalFuelCost * COLLECTIONS_PER_MONTH * 12;

    setAnalysisData({
      totalTime,
      trucksNeeded,
      fuelCostPerTruck,
      totalFuelConsumption: fuelConsumption,
      totalFuelCost,
      collectionTime: totalTime,
      yearlyFuelCost,
      yearlyTravelDays,
      totalWasteVolume
    });
  };

  const optimizeRoute = (clusterType: 'Minimum' | 'Medium' | 'Maximum') => {
    if (!landfill) {
      alert('Please set the landfill location first.');
      return;
    }

    console.log('Starting optimization for:', clusterType);
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setCurrentBestDistance(0);
    setOptimizedRoute([]);
    setOptimizationMessage('');
    setAnalysisData(null);
    setShowAnalysis(false);

    let clusterPoints: LatLngLiteral[] = [];
    switch (clusterType) {
      case 'Minimum':
        clusterPoints = locations.filter(loc => loc.garbageLevel < 40).map(loc => ({ lat: loc.lat, lng: loc.lng }));
        break;
      case 'Medium':
        clusterPoints = locations.filter(loc => loc.garbageLevel >= 40 && loc.garbageLevel < 70).map(loc => ({ lat: loc.lat, lng: loc.lng }));
        break;
      case 'Maximum':
        clusterPoints = locations.filter(loc => loc.garbageLevel >= 70).map(loc => ({ lat: loc.lat, lng: loc.lng }));
        break;
    }

    console.log('Number of points in cluster:', clusterPoints.length);

    if (clusterPoints.length === 0) {
      alert(`No locations found for the ${clusterType} cluster.`);
      setIsOptimizing(false);
      return;
    }

    // Run optimization with real-time visualization
    const optimizedPath = simulatedAnnealingTSP(
      clusterPoints, 
      landfill,
      5000,
      1000,
      0.999,
      (progress, bestDistance, currentRoute) => {
        console.log('Progress update:', progress, 'Best distance:', bestDistance);
        setOptimizationProgress(progress);
        setCurrentBestDistance(bestDistance);
        setOptimizedRoute(currentRoute);
      }
    );
    
    setOptimizedRoute(optimizedPath);
    const distance = calculateTotalDistance(optimizedPath);
    setTotalDistance(distance);
    
    // Calculate and set analysis data
    calculateAnalysis(distance, clusterType);
    
    setIsOptimizing(false);
    
    // Add a delay before showing the optimization message
    setTimeout(() => {
      setOptimizationMessage(`The most efficient route for the ${clusterType} cluster has been successfully optimized. Total distance: ${distance.toFixed(2)} km`);
    }, 86000); // 86 seconds delay
    
    // Add a delay before showing the analysis to ensure the route animation is complete
    setTimeout(() => {
      setShowAnalysis(true);
    }, 96000); // 96 seconds (1 minute and 36 seconds) delay
    
    console.log('Optimization complete');
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="controls" style={{ 
        width: '400px',
        padding: '20px',
        borderRadius: '8px',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        <br /><br />
        <h2>TrashNav Map Controls</h2>
        <Places
          setOffice={handleLandfillSet}
        />
        {!landfill && <p>Enter the address of the landfill or waste disposal site.</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
        
        {/* Legend for garbage levels - only show when landfill is set */}
        {landfill && (
          <div className="legend" style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #eaeaea',
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#333', 
              fontSize: '16px', 
              fontWeight: '600' 
            }}>Garbage Levels</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: 'red', 
                  borderRadius: '50%', 
                  marginRight: '10px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }}></div>
                <span style={{ color: '#333', fontSize: '14px' }}>High (70-100%)</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: 'yellow', 
                  borderRadius: '50%', 
                  marginRight: '10px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }}></div>
                <span style={{ color: '#333', fontSize: '14px' }}>Medium (40-69%)</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: 'blue', 
                  borderRadius: '50%', 
                  marginRight: '10px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                }}></div>
                <span style={{ color: '#333', fontSize: '14px' }}>Low (0-39%)</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Only show Clear Route button when a route is displayed */}
        {showRoute && (
          <button 
            className="clear-route-button" 
            onClick={() => {
              console.log("Reloading page to clear route");
              window.location.reload();
            }}
            style={{
              marginTop: '20px',
              padding: '10px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            Clear Route
          </button>
        )}

        {/* Optimization Controls */}
        {landfill && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => optimizeRoute('Minimum')} 
                disabled={isOptimizing}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: isOptimizing ? 'not-allowed' : 'pointer',
                  opacity: isOptimizing ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)',
                  width: '100%'
                }}
              >
                Optimize Minimum Route
              </button>
              <button 
                onClick={() => optimizeRoute('Medium')} 
                disabled={isOptimizing}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: isOptimizing ? 'not-allowed' : 'pointer',
                  opacity: isOptimizing ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 4px rgba(255, 152, 0, 0.2)',
                  width: '100%'
                }}
              >
                Optimize Medium Route
              </button>
              <button 
                onClick={() => optimizeRoute('Maximum')} 
                disabled={isOptimizing}
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: '#F44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: isOptimizing ? 'not-allowed' : 'pointer',
                  opacity: isOptimizing ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 4px rgba(244, 67, 54, 0.2)',
                  width: '100%'
                }}
              >
                Optimize Maximum Route
              </button>
            </div>
            
            {/* Progress indicator */}
            {isOptimizing && (
              <div style={{ 
                marginTop: '10px',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <p style={{ 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    color: '#333',
                    fontWeight: '500'
                  }}>
                    Optimization Progress: {Math.round(optimizationProgress * 100)}%
                  </p>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e0e0e0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${optimizationProgress * 100}%`, 
                      height: '100%', 
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <p style={{ 
                  marginTop: '10px', 
                  fontSize: '14px', 
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Current Best Distance: {currentBestDistance.toFixed(2)} km
                </p>
              </div>
            )}
            
            {/* Optimization message */}
            {optimizationMessage && (
              <div style={{ 
                marginTop: '10px', 
                padding: '12px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p style={{ 
                  margin: 0,
                  color: '#2c3e50',
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '1.5'
                }}>
                  {optimizationMessage}
                </p>
              </div>
            )}

            {/* Analysis Results - only show when optimization is complete and not optimizing */}
            {analysisData && !isOptimizing && showAnalysis && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: '#2c3e50',
                  fontWeight: '600'
                }}>
                  Collection Analysis
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>🗑️</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Total Waste Volume: {analysisData?.totalWasteVolume?.toFixed(1) || '0.0'} tons
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>⏱️</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Single Route Time: {analysisData?.totalTime?.toFixed(1) || '0.0'} hours
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>🚛</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Trucks Required: {analysisData?.trucksNeeded || 0} (15 tons capacity each)
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>⛽</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Fuel Consumption: {analysisData?.totalFuelConsumption?.toFixed(1) || '0.0'} liters
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Cost per Truck: JMD {analysisData?.fuelCostPerTruck?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>💰</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Total Fuel Cost: JMD {analysisData?.totalFuelCost?.toFixed(2) || '0.00'}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Yearly Cost: JMD {analysisData?.yearlyFuelCost?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>📅</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Collections per Month: {COLLECTIONS_PER_MONTH}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#2c3e50', wordBreak: 'break-word' }}>
                        Yearly Travel Time: {analysisData?.yearlyTravelDays?.toFixed(1) || '0.0'} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="map">
        <GoogleMap
          zoom={9}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {landfill && (
            <>
              <Marker
                position={landfill}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
                onMouseOver={() => setHoveredLocation({ id: 0, name: "Riverton City Dump", area: "Kingston", lat: landfill.lat, lng: landfill.lng, garbageLevel: 0 })}
                onMouseOut={() => {
                  if (hoverTimeoutRef.current) {
                    window.clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  hoverTimeoutRef.current = window.setTimeout(() => {
                    setHoveredLocation(null);
                  }, 500);
                }}
              />
              
              <MarkerClusterer>
                {(clusterer) => (
                  <>
                    {locations.map((location) => (
                      <Marker
                        key={location.id}
                        position={{ lat: location.lat, lng: location.lng }}
                        clusterer={clusterer}
                        icon={getMarkerIcon(location.garbageLevel)}
                        onClick={() => {
                          fetchRoute(location);
                        }}
                        onMouseOver={() => {
                          if (hoverTimeoutRef.current) {
                            window.clearTimeout(hoverTimeoutRef.current);
                            hoverTimeoutRef.current = null;
                          }
                          setHoveredLocation(location);
                        }}
                        onMouseOut={() => {
                          hoverTimeoutRef.current = window.setTimeout(() => {
                            setHoveredLocation(null);
                          }, 500);
                        }}
                      />
                    ))}
                    
                    {/* Info window with offset position */}
                    {hoveredLocation && (
                      <InfoWindow
                        position={{ 
                          lat: hoveredLocation.lat,
                          lng: hoveredLocation.lng 
                        }}
                        options={{ 
                          disableAutoPan: true,
                          pixelOffset: new google.maps.Size(0, -35)
                        }}
                        onCloseClick={() => setHoveredLocation(null)}
                      >
                        <div style={{ padding: '5px', color: '#000', minWidth: '150px' }}>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#000' }}>{hoveredLocation.name}</h3>
                          <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#000' }}>Area: {hoveredLocation.area}</p>
                          {hoveredLocation.id !== 0 && (
                            <p style={{ margin: '0', fontSize: '14px', color: '#000' }}>
                              Garbage Level: 
                              <span style={{ 
                                fontWeight: 'bold', 
                                color: hoveredLocation.garbageLevel >= 70 ? '#FF0000' : 
                                      hoveredLocation.garbageLevel >= 40 ? '#FF8C00' : '#0000FF' 
                              }}>
                                {' '}{hoveredLocation.garbageLevel}%
                              </span>
                            </p>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </>
                )}
              </MarkerClusterer>
              
              <Circle center={landfill} radius={15000} options={closeOptions} />
              <Circle center={landfill} radius={25000} options={middleOptions} />
              <Circle center={landfill} radius={30000} options={farOptions} />
              
              {/* Route polyline */}
              {showRoute && routePath && routePath.length > 0 && (
                <Polyline
                  key={`polyline-${routeKey}`}
                  path={routePath}
                  options={{
                    strokeColor: "#4CAF50",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                  }}
                />
              )}

              {/* Optimized route polyline */}
              {optimizedRoute.length > 0 && (
                <Polyline
                  path={optimizedRoute}
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                    geodesic: true,
                    icons: [{
                      icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 3,
                        strokeColor: '#FF0000',
                      },
                      offset: '50%',
                      repeat: '100px'
                    }]
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

// These option definitions should only appear ONCE in the file
const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};

const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#2196F3", // Blue
  fillColor: "#2196F3",
};

const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FF9800", // Orange
  fillColor: "#FF9800",
};

const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#F44336", // Red
  fillColor: "#F44336",
};