"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = [
    { src: '/banner1.png', title: 'Keep it clean', description: 'Keep your environment clean, safe and healthy' },
    { src: '/banner2.png', title: 'Route Planning', description: 'Optmizing waste collection routes with efficiency' },
    { src: '/banner3.png', title: 'Effective route planning', description: 'Route planning with effective Wastemangement' },
    { src: '/banner4.png', title: 'Clean and d', description: 'Adventure Tours' },
    { src: '/banner5.png', title: 'Wildlife Reserve', description: 'Nature Experience' },
  ];

  // Move to next image every 3 seconds
  useEffect(() => {
    console.log("Current slide:", currentIndex, "Image:", images[currentIndex].src);
    
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        console.log("Auto advancing to slide:", newIndex);
        return newIndex;
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [currentIndex, images.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Display only the current image
  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-24 mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Nagano Prefecture</h2>
        <p className="text-xl">Discover the beauty of nature</p>
      </div>
      
      <div className="w-full h-[350px] relative rounded-lg overflow-hidden">
        {/* Only render the current image */}
        <Image
          key={currentIndex} // Force re-render when index changes
          src={currentImage.src}
          alt={currentImage.title}
          fill
          priority={true}
          style={{ objectFit: 'cover' }}
        />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
          <h3 className="font-semibold text-lg">{currentImage.title}</h3>
          <p className="text-sm">{currentImage.description}</p>
        </div>
        
        {/* Navigation buttons */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-20 hover:bg-white"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-20 hover:bg-white"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
