"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
  useLoadScript,
  Polyline
} from "@react-google-maps/api";

import Places from "./places";
import Distance from "./distance";

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

export default function Map() {
  const [office, setOffice] = useState<LatLngLiteral>();
  const [routeResponse, setRouteResponse] = useState<RoutesResponse>();
  const [directions, setDirections] = useState<DirectionsResult>();
  const [error, setError] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [routeKey, setRouteKey] = useState<number>(0);
  const [lastClickedHouse, setLastClickedHouse] = useState<LatLngLiteral | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ["places", "geometry"],
  });
 
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 18.5194, lng: -77.000}),
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

  const houses = useMemo(() => generateHouses(center), [center]);

  // Helper function to compare two locations with a small epsilon for floating point comparison
  const isSameLocation = (loc1: LatLngLiteral | null, loc2: LatLngLiteral): boolean => {
    if (!loc1) return false;
    
    // Use a small epsilon for floating point comparison
    const epsilon = 0.0000001;
    return Math.abs(loc1.lat - loc2.lat) < epsilon && 
           Math.abs(loc1.lng - loc2.lng) < epsilon;
  };

  const fetchRoute = async (house: LatLngLiteral) => {
    if (!office) return;
    
    console.log("Clicked house:", house);
    console.log("Last clicked house:", lastClickedHouse);
    
    // Check if clicking the same house twice to toggle/reset
    if (isSameLocation(lastClickedHouse, house)) {
      console.log("Same house clicked twice, clearing route");
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
      setRoutePath([]);
      setRouteKey(prevKey => prevKey + 1); // Increment the key to force re-render
      setLastClickedHouse(house); // Set the last clicked house
      
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: house.lat,
                longitude: house.lng
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: office.lat,
                longitude: office.lng
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
        bounds.extend(new google.maps.LatLng(house.lat, house.lng));
        bounds.extend(new google.maps.LatLng(office.lat, office.lng));
        
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
              start_location: new google.maps.LatLng(house.lat, house.lng),
              end_location: new google.maps.LatLng(office.lat, office.lng),
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
            origin: house,
            destination: office,
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
    window.location.reload();
  };

  const clearRoute = () => {
    setDirections(undefined);
    setRoutePath([]);
    setRouteResponse(undefined);
    setLastClickedHouse(null);
    setShowRoute(false); // Hide the route
    console.log("Route cleared");
  };

  useEffect(() => {
    // This effect will run when showRoute changes
    if (!showRoute) {
      // If showRoute is false, make sure to remove any polylines from the DOM
      console.log("Effect: Removing polylines from DOM");
      
      // Force a re-render with a new key
      setRouteKey(prevKey => prevKey + 1);
      
      // Clear the route path
      setRoutePath([]);
    }
  }, [showRoute]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="controls">
        <br /><br />
        <h2>TrashNav Map Controls</h2>
        <Places
          setOffice={(position) => {
            setOffice(position);
            mapRef.current?.panTo(position);
          }}
        />
        {!office && <p>Enter the address of your office.</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
        {showRoute && (
          <button 
            className="clear-route-button" 
            onClick={hardReset}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Route
          </button>
        )}
        {/* Debug button */}
        <button 
          onClick={() => {
            console.log("Current state:");
            console.log("- routePath length:", routePath.length);
            console.log("- showRoute:", showRoute);
            console.log("- lastClickedHouse:", lastClickedHouse);
          }}
          style={{
            marginTop: '10px',
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Debug Route
        </button>
        <button 
          onClick={hardReset}
          style={{
            marginTop: '10px',
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Hard Reset
        </button>
      </div>
      <div className="map">
        <GoogleMap
          zoom={9}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {office && (
            <>
              <Marker
                position={office}
                icon="https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              />
              
              <MarkerClusterer>
                {(clusterer) => (
                  <>
                    {houses.map((house) => (
                      <Marker
                        key={house.lat}
                        position={house}
                        clusterer={clusterer}
                        onClick={() => {
                          fetchRoute(house);
                        }}
                      />
                    ))}
                  </>
                )}
              </MarkerClusterer>
              
              <Circle center={office} radius={15000} options={closeOptions} />
              <Circle center={office} radius={25000} options={middleOptions} />
              <Circle center={office} radius={30000} options={farOptions} />
              
              {/* Only render polyline if showRoute is true and routePath has elements */}
              {showRoute && routePath.length > 0 ? (
                <Polyline
                  key={`polyline-${routeKey}`}
                  path={routePath}
                  options={{
                    strokeColor: "#4CAF50", // Nice green color
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                  }}
                />
              ) : null}
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

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

const generateHouses = (position: LatLngLiteral) => {
  const _houses: Array<LatLngLiteral> = [];
  for (let i = 0; i <90; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
  }
  return _houses;
};