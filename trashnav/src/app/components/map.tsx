"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
    
    // Liguanea area
    { id: 11, name: "Liguanea Plaza", area: "Liguanea", lat: 18.0055, lng: -76.7756, garbageLevel: 65 },
    { id: 12, name: "Sovereign Centre", area: "Liguanea", lat: 18.0042, lng: -76.7789, garbageLevel: 40 },
    { id: 13, name: "Hope Road", area: "Liguanea", lat: 18.0075, lng: -76.7742, garbageLevel: 85 },
    { id: 14, name: "Old Hope Road", area: "Liguanea", lat: 18.0101, lng: -76.7726, garbageLevel: 55 },
    { id: 15, name: "Lady Musgrave Road", area: "Liguanea", lat: 18.0028, lng: -76.7801, garbageLevel: 70 },
    
    // Kintyre area
    { id: 21, name: "Kintyre Main Road", area: "Kintyre", lat: 18.0344, lng: -76.7255, garbageLevel: 95 },
    { id: 22, name: "Kintyre Community Centre", area: "Kintyre", lat: 18.0329, lng: -76.7274, garbageLevel: 60 },
    { id: 23, name: "Kintyre Primary School", area: "Kintyre", lat: 18.0351, lng: -76.7246, garbageLevel: 40 },
    { id: 24, name: "Dublin Drive", area: "Kintyre", lat: 18.0365, lng: -76.7233, garbageLevel: 85 },
    { id: 25, name: "Tredegar Park", area: "Kintyre", lat: 18.0311, lng: -76.7292, garbageLevel: 70 },
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
      setRoutePath([]);
      setRouteKey(prevKey => prevKey + 1); // Increment the key to force re-render
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
            setLandfill(position);
            mapRef.current?.panTo(position);
          }}
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
        
        {/* Buttons */}
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
          zoom={9} // Lower zoom level to see more of Jamaica
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
                          // Clear any existing timeout
                          if (hoverTimeoutRef.current) {
                            window.clearTimeout(hoverTimeoutRef.current);
                            hoverTimeoutRef.current = null;
                          }
                          // Set the hovered location
                          setHoveredLocation(location);
                        }}
                        onMouseOut={() => {
                          // Add delay before hiding to prevent flickering
                          hoverTimeoutRef.current = window.setTimeout(() => {
                            setHoveredLocation(null);
                          }, 500); // Increased delay to 500ms
                        }}
                      />
                    ))}
                    
                    {/* Info window with offset position */}
                    {hoveredLocation && (
                      <InfoWindow
                        position={{ 
                          lat: hoveredLocation.lat + 0.005, // Increased offset above marker
                          lng: hoveredLocation.lng 
                        }}
                        options={{ 
                          disableAutoPan: true, // Prevent map panning when info window opens
                          pixelOffset: new google.maps.Size(0, -10) // Add additional pixel offset
                        }}
                        onCloseClick={() => setHoveredLocation(null)}
                      >
                        <div style={{ padding: '5px', color: '#000', minWidth: '150px' }}>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#000' }}>{hoveredLocation.name}</h3>
                          <p style={{ margin: '0 0 3px 0', fontSize: '14px', color: '#000' }}>Area: {hoveredLocation.area}</p>
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
                        </div>
                      </InfoWindow>
                    )}
                  </>
                )}
              </MarkerClusterer>
              
              <Circle center={landfill} radius={15000} options={closeOptions} />
              <Circle center={landfill} radius={25000} options={middleOptions} />
              <Circle center={landfill} radius={30000} options={farOptions} />
              
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