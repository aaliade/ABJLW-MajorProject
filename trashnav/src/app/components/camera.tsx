"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";
import { getUserById, getUserId, createUser, createReport } from "@/utils/db/actions";
import { json } from "stream/consumers";

const Camera: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    email: string;
    name: string;
  } | null>(null);

  // Video constraints to force back camera
  const videoConstraints = {
    facingMode: "environment",
  };

  // Capture function to take a screenshot
  const capture = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy, // Meters
          });
        },
        (error) => {
          setError(error.message);
        },
        {
          enableHighAccuracy: true, // Ensures precise location
          timeout: 10000, // Max wait time (10 seconds)
          maximumAge: 0, // Prevent cached values
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      localStorage.setItem("capturedImage", imageSrc);
      alert("Image saved!");
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUserData(data.user);
    };
    fetchUserData();
  }, []);

  const identifyImage = async () => {
    setLoading(true);
    const genAI = new GoogleGenerativeAI(
      "AIzaSyBszO5o1feXKzREDORVafBpfbBG-i2Jqiw"
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const imageSrc = localStorage.getItem("capturedImage");
      if (!imageSrc) {
        alert("No image found in local storage!");
        return;
      }

      // Convert the Base64 string into an Image object (strip the prefix if necessary)
      const base64Data = imageSrc.replace(/^data:image\/\w+;base64,/, ""); // Remove "data:image/jpeg;base64,"
      const image = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", // Change this to match the actual image type
        },
      };

      // Send request with both text and image
      const result = await model.generateContent([
        {
          text: `
          Return a JSON object with wasteType, and Amount ELSE If no waste is visible, return a single word: 'Invalid'.
          
          For Amount, determine the current fill level by examining visible contents and container capacity.
          
          Classify the fill level into one of three categories:
          - Minimum: Container is 0-30% full (mostly empty, minimal waste visible)
          - Medium: Container is 31-70% full (partially filled, contents visible but not overflowing)
          - Maximum: Container is 71-100% full (nearly full or overflowing, urgent collection needed).
          
          If no waste is visible, Just return a single word: 'Invalid'.
          
          Amount should be a single word: 'Minimum', 'Medium', 'Maximum', or 'Invalid'.
          Do not include any other text or explanation.
          
          For wasteType, classify the waste into one of the following categories:
          - Plastic
          - Paper
          - Metal
          - Glass
          - Organic
          - Other
          
          wasteType should be a single word: 'Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'Other', or 'Invalid'.
          Do not include any other text or explanation.

          Please adhere to the following guidelines:
          Return just the JSON object with ONLY wasteType and Amount.
          Remove the \`\`\`json \`\`\` form the JSON object. 
          `,

        },
        image, // Correctly formatted image input
      ]);

      const response = await result.response;
      var result_json = response.candidates && response.candidates[0]?.content.parts[0]?.text?.replace("```json", "").replace("```", "").replace("\n", "");

      var json_data = JSON.parse(result_json ?? "{}");

      // if (json_data["wasteType"] == "Invalid" && json_data["Amount"] == "Invalid") {
      //   console.log("Invalid image. Please try again.");
      //   return;
      // } else {
      if (location) {
        var userEmail = await getUserById(userData?.email!);

        if (userEmail!.length < 1) {
          await createUser(userData?.name!, userData?.email!);
        }

        const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );

          const data = await response.json();

          console.log("Response:", data);

          if (data.status === "OK" && data.results.length > 0) {
            return data.results[0].formatted_address;
          } else {
            console.log("Unable to fetch address");
          }
        };


        const address = await getAddressFromCoordinates(location.latitude, location.longitude);
        console.log("Address:", address);

        var userID = await getUserId(userData?.email!);

        await createReport(
          userID!,
          address,
          location.longitude,
          location.latitude,
          json_data["wasteType"],
          json_data["Amount"],
        );
      }
      // }
    } catch (error) {
      console.error("Error identifying image:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <button
        onClick={identifyImage}
        style={{ marginTop: "10px", padding: "10px" }}
        disabled={loading}
      >
        {loading ? "Processing..." : "Send To AI"}
      </button>
    </div>
  );
};

export default Camera;
