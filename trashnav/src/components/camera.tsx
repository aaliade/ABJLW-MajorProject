"use client";

import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";

const Camera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);

  // Video constraints to force back camera
  const videoConstraints = {
    facingMode: "environment",
  };

  // Capture image function
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    console.log("Captured Image:", imageSrc);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Webcam Feed</h1>
      <Webcam
        ref={webcamRef}
        videoConstraints={videoConstraints}
        mirrored={false}
        screenshotFormat="image/jpeg"
        style={{ width: "100%", height: "auto" }}
      />
      <button onClick={capture} style={{ marginTop: "10px", padding: "10px" }}>
        Capture Photo
      </button>
    </div>
  );
};

export default Camera;

