// src/components/Hero/Hero.jsx
import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        
        {/* Left Side: Content */}
        <div className="hero-text">
          <span className="subtitle">PREMIUM BLEND</span>
          <h1>Start Your Day With <br/> <span className="highlight">Real Coffee.</span></h1>
          <p>
            Boost your productivity and mood with our 100% natural Arabica roast. 
            Smooth, bold, and delivered to your door.
          </p>
          
          <div className="cta-group">
            <button className="btn-primary">Order Now</button>
            <span className="price">$7.99</span>
          </div>

          <div className="stats-row">
            <div className="stat">
              <strong>1K+</strong> <span>Reviews</span>
            </div>
            <div className="stat">
              <strong>3K+</strong> <span>Sold</span>
            </div>
            <div className="stat">
              <strong>4.9</strong> <span>Rating</span>
            </div>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="hero-image">
          {/* Simple Circle Background */}
          <div className="blob"></div>
          <img 
            src="https://png.pngtree.com/png-vector/20230415/ourmid/pngtree-coffee-cup-vector-png-image_6707669.png" 
            alt="Coffee Cup" 
          />
        </div>

      </div>
    </section>
  );
};

export default Hero;