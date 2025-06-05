// src/components/About/About.jsx
import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text" data-aos="fade-right">
            <h2 className="section-title">Our Coffee Story</h2>
            <p>
              Founded in the highlands of Kenya, Rerendet Farm has been cultivating exceptional coffee for generations. 
              Our name comes from the local Kalenjin word for the evergreen tree that provides shade for our coffee plants.
            </p>
            <p>
              At elevations of 1,800 meters above sea level, our beans develop slowly, allowing complex flavors to mature 
              fully before harvest. Each batch is hand-picked, carefully processed, and roasted to perfection.
            </p>
            
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">25+</span>
                <span className="stat-label">Years of Experience</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Organic Farming</span>
              </div>
              <div className="stat">
                <span className="stat-number">3</span>
                <span className="stat-label">Award-Winning Blends</span>
              </div>
            </div>
          </div>
          
          <div className="about-image" data-aos="fade-left">
            <img 
              src="https://via.placeholder.com/600x400?text=Coffee+Farm" 
              alt="Rerendet Coffee Farm" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;