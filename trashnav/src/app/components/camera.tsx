"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";
import {
  getUserById,
  getUserId,
  createUser,
  createReport,
} from "@/utils/db/actions";

import { Session } from "next-auth";

const Camera: React.FC<{ session: Session }> = ({ session }) => {
  const [userData, setUserData] = useState(session.user);

  const [loading, setLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      console.log(data.user);
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
          
          Amount should be a an integer between 0 and 100: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, or 'Invalid'.
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
      var result_json =
        response.candidates &&
        response.candidates[0]?.content.parts[0]?.text
          ?.replace("```json", "")
          .replace("```", "")
          .replace("\n", "");

      var json_data = JSON.parse(result_json ?? "{}");

      if (
        json_data["wasteType"] == "Invalid" &&
        json_data["Amount"] == "Invalid"
      ) {
        alert("Invalid image. Please try again.");
      } else {
        if (location) {
          var userEmail = await getUserById(userData?.email!);

          if (userEmail!.length < 1) {
            await createUser(userData?.name!, userData?.email!);
          }

          const getAddressFromCoordinates = async (
            latitude: number,
            longitude: number
          ) => {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );

            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
              return data.results[0].formatted_address;
            } else {
              console.log("Unable to fetch address");
            }
          };

          const address =
            (await getAddressFromCoordinates(
              location.latitude,
              location.longitude
            )) ?? "";
          // console.log("Address:", address);

          var userID = await getUserId(userData?.email!);

          await createReport(
            address,
            userID!,
            address,
            location.longitude,
            location.latitude,
            json_data["Amount"]
          );

          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: userData?.email,
              subject: "Waste Report Submitted",
              text: `Hey ${userData?.name},
        We have received your waste report. You will receive a notification when it is picked up.

        Thank you for your contribution to the environment!

        Sincerely,
        The TrashNav Team`,
            }),
          });

          alert(
            `Your waste report has been submitted.

Waste Type: ${json_data["wasteType"]}
Waste Level: ${json_data["Amount"]}%

You will receive a notification when it is picked up.

Thank you for your contribution to the environment!`
          );
        }
      }
    } catch (error) {
      console.error("Error identifying image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="text-2xl font-bold mb-4">Webcam Feed</h1>
      <Webcam
        ref={webcamRef}
        videoConstraints={videoConstraints}
        mirrored={false}
        screenshotFormat="image/jpeg"
        style={{
          marginTop: "10px",
          width: "100%",
          height: "auto",
          border: "5px solid #ccc",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      />
      <div className="mt-4 flex justify-center gap-8">
        <button
          onClick={capture}
          className="px-4 py-2 bg-gray-800 text-white font-medium rounded-md hover:bg-green-600 transition"
        >
          Capture Photo
        </button>

        <button
          onClick={identifyImage}
          disabled={loading} // Disable the button when loading
          className={`px-4 py-2 font-medium rounded-md transition ${
            loading
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-green-600"
          }`}
        >
          {loading ? "Processing..." : "Send to AI"}
        </button>
      </div>
    </div>
  );
};

export default Camera;
