"use client";

import { useState, useEffect } from "react";
import Map from "../components/map";

export default function Home() {
  const [key, setKey] = useState(0);
  const [showMap, setShowMap] = useState(true);

  // Function to force a complete remount
  const forceRefresh = () => {
    setShowMap(false);
    setTimeout(() => {
      setKey((prev) => prev + 1);
      setShowMap(true);
    }, 100);
  };

  return (
    <div style={{ width: "100%", height: "100vh", padding: "0", margin: "0" }}>
      {showMap && <Map key={key} />}
      <button
        onClick={forceRefresh}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Refresh Map
      </button>
    </div>
  );
}
