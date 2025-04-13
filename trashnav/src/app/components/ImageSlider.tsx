"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const images = [
    { src: '/banner3.png', title: 'Helicopter Rescue', description: 'Emergency Services' },
    { src: '/banner2.png', title: 'Mountain Park', description: 'Outdoor Activities' },
    { src: '/banner3.png', title: 'Ski Resort', description: 'Winter Sports' },
    { src: '/banner4.png', title: 'Hiking Trails', description: 'Adventure Tours' },
    { src: '/banner5.png', title: 'Wildlife Reserve', description: 'Nature Experience' },
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Navigation functions
  const nextSlide = () => {
    if (sliderRef.current) {
      const newIndex = currentSlide === images.length - 1 ? 0 : currentSlide + 1;
      setCurrentSlide(newIndex);
      
      // Calculate scroll position
      const cardWidth = sliderRef.current.querySelector('div')?.offsetWidth || 250;
      const scrollPosition = newIndex * (cardWidth + 16); // 16px is the gap
      sliderRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      const newIndex = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
      setCurrentSlide(newIndex);
      
      // Calculate scroll position
      const cardWidth = sliderRef.current.querySelector('div')?.offsetWidth || 250;
      const scrollPosition = newIndex * (cardWidth + 16); // 16px is the gap
      sliderRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (sliderRef.current) {
      // Calculate scroll position
      const cardWidth = sliderRef.current.querySelector('div')?.offsetWidth || 250;
      const scrollPosition = index * (cardWidth + 16); // 16px is the gap
      sliderRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-24 mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Nagano Prefecture</h2>
        <p className="text-xl">Discover the beauty of nature</p>
      </div>
      
      {/* Main slider container */}
      <div className="relative">
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <div 
              key={index}
              className="min-w-[250px] h-[350px] rounded-lg overflow-hidden snap-start flex-shrink-0 relative shadow-lg"
            >
              <Image
                src={image.src}
                alt={`Slide ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                <h3 className="font-semibold text-lg">{image.title}</h3>
                <p className="text-sm">{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100"
          onClick={nextSlide}
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
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Add custom CSS to hide scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;
