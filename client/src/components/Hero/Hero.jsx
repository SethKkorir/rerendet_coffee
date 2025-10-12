// src/components/Hero/Hero.jsx
import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-container">
        {/* Background Elements */}
        <div className="hero-bg">
          <div className="bg-coffee-bean bean-1"></div>
          <div className="bg-coffee-bean bean-2"></div>
          <div className="bg-coffee-bean bean-3"></div>
          <div className="bg-coffee-bean bean-4"></div>
        </div>

        {/* Left Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            Enjoy Your
            <span className="title-accent">Morning Coffee</span>
          </h1>
          
          <div className="coffee-text">
            <span className="coffee-word">COFFEE</span>
            <span className="coffee-word">COFFEE</span>
          </div>

          <p className="hero-description">
            Boost your productivity and build your mood with a glass of coffee 
            in the morning, 100% natural from garden.
          </p>

          <div className="hero-actions">
            <button className="btn-primary">
              Order Now
            </button>
            
            <div className="price-tag">
              <span className="start-text">Start At</span>
              <span className="price">$7.99</span>
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">1K+</div>
              <div className="stat-label">Reviews</div>
            </div>
            
            <div className="stat">
              <div className="stat-number">3k+</div>
              <div className="stat-label">Best Sell</div>
            </div>
            
            <div className="stat">
              <div className="stat-number">150+</div>
              <div className="stat-label">Menu</div>
            </div>
          </div>
        </div>

        {/* Right Content - Coffee Image */}
        <div className="hero-visual">
          <div className="coffee-cup">
            <img 
              src="/api/placeholder/400/500?text=Coffee+Cup" 
              alt="Morning Coffee"
              className="coffee-image"
            />
            <div className="coffee-steam">
              <div className="steam-1"></div>
              <div className="steam-2"></div>
              <div className="steam-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;