"use client";

import React, { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";

const Camera: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Video constraints to force back camera
  const videoConstraints = {
    facingMode: "environment",
  };

  // Capture function to take a screenshot
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      localStorage.setItem("capturedImage", imageSrc);
      alert("Image saved!");
    }
  }, []);



const identifyImage = async () => {
  setLoading(true);
  const genAI = new GoogleGenerativeAI("AIzaSyBszO5o1feXKzREDORVafBpfbBG-i2Jqiw");
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
      { text: "Identify this image and provide its name and important information including a brief explanation." },
      image, // Correctly formatted image input
    ]);

    const response = await result.response;
    console.log("Gemini AI Response:", response.candidates[0].content.parts[0].text);

  } catch (error) {
    console.error("Error identifying image:", error);
  } finally {
    setLoading(false);
  }
};



/**
  // Send the captured image to AI for processing
  const identifyImage = async () => {
    setLoading(true);
    const genAI = new GoogleGenerativeAI("AIzaSyBszO5o1feXKzREDORVafBpfbBG-i2Jqiw");
    //const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
      const imageSrc = localStorage.getItem("capturedImage");
      if (!imageSrc) {
        alert("No image found in local storage!");
        return;
      } else {
        const result = await model.generateContent([
          "Identify this image and provide its name and important information including a brief explanation about that image.",
          imageSrc,
        ]);
        const response = await result.response;
        console.log(response); // Log the response to see what you get
      }
    } catch (error) {
      console.error("Error identifying image:", error);
    } finally {
      setLoading(false);
    }
  };
*/
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

