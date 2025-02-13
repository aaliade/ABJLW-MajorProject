"use client"; // Ensures it's a client component

import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";

import Camera from "@/components/camera";

export default function Home() {
  return (
    <div style={{ textAlign: "center" }}>
      <div>Hello</div>
      <Camera />
    </div>
  );
}
