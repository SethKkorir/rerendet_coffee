import React from 'react';
import { FaLeaf, FaArrowRight, FaStar } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  const heroImage = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80";

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="hero" data-testid="hero-section">
      {/* Background Image */}
      <div
        className="hero-background"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Dark Overlay */}
      <div className="hero-overlay" />

      {/* Main Content */}
      <div className="hero-container">
        <div className="hero-content">

          {/* Premium Badge */}
          <div className="hero-badge" data-testid="badge-hero-premium">
            <span className="hero-badge-text">PREMIUM BLEND</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-heading" data-testid="text-hero-headline">
            Start Your Day With{" "}
            <span className="hero-heading-accent">Rerendet-Coffee.</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Boost your productivity and mood with our 100% natural Arabica roast
            from the highlands of Kenya. Smooth, bold, and delivered to your door.
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta">
            <button
              className="hero-cta-btn hero-cta-btn-primary"
              onClick={() => scrollToSection('coffee-shop')}
              data-testid="button-order-now"
            >
              Order Now
              <FaArrowRight className="hero-cta-icon" />
            </button>
            <button
              className="hero-cta-btn hero-cta-btn-secondary"
              onClick={() => scrollToSection('about')}
            >
              <FaLeaf className="hero-cta-icon" />
              Our Story
            </button>
          </div>

          {/* Stats / Social Proof */}
          <div className="hero-stats" data-testid="hero-social-proof">
            <div className="hero-stat" data-testid="stat-reviews">
              <div className="hero-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="hero-star" />
                ))}
              </div>
              <span className="hero-stat-text">
                <span className="hero-stat-value">1K+</span> Reviews
              </span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat" data-testid="stat-sold">
              <span className="hero-stat-text">
                <span className="hero-stat-value">3K+</span> Sold
              </span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat" data-testid="stat-rating">
              <span className="hero-stat-text">
                <span className="hero-stat-value">4.9</span> Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator">
        <div className="hero-scroll-dot" />
      </div>
    </section>
  );
};

export default Hero;