// src/components/Hero/Hero.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  
  const slides = [
    {
      image: "https://via.placeholder.com/500x400?text=Premium+Coffee",
      alt: "Premium Coffee"
    },
    {
      image: "https://via.placeholder.com/500x400?text=Signature+Blend",
      alt: "Signature Blend"
    },
    {
      image: "https://via.placeholder.com/500x400?text=Organic+Beans",
      alt: "Organic Beans"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="container">
        <div className="hero-content">
          <h1 className="fade-in">Craft Coffee, Farm to Cup</h1>
          <p className="fade-in">Experience the finest specialty coffee, sustainably grown at high altitude in the Southern Rift of Bomet, Kenya.</p>
          <div className="cta-buttons fade-in">
            <a href="#coffee-shop" className="btn primary">Shop Now</a>
            <a href="#features" className="btn secondary">Learn More</a>
          </div>
        </div>
        
        <div className="hero-carousel fade-in">
          <div className="carousel-inner" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div 
                key={index} 
                className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
              >
                <img src={slide.image} alt={slide.alt} />
              </div>
            ))}
          </div>
          
          <div className="carousel-controls">
            <button className="carousel-prev" onClick={prevSlide}>
              <FaChevronLeft />
            </button>
            <button className="carousel-next" onClick={nextSlide}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;