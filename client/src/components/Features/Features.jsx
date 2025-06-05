// src/components/Features/Features.jsx
import React from 'react';
import { FaMugHot, FaLeaf, FaMountain, FaStar } from 'react-icons/fa';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: <FaMugHot />,
      title: "Year-Round Excellence",
      description: "Like the evergreen Rerendet tree, our coffee is consistently fresh and flavorful throughout the seasons."
    },
    {
      icon: <FaLeaf />,
      title: "Rich Volcanic Soils",
      description: "Grown in nutrient-rich volcanic soil, our coffee boasts a deep, complex taste profile unlike any other."
    },
    {
      icon: <FaMountain />,
      title: "Ethically Sourced",
      description: "We partner with local farmers to support sustainable farming practices and ensure fair compensation."
    },
    {
      icon: <FaStar />,
      title: "Unique Flavor Profile",
      description: "A zesty, rich brew with chocolate undertones and a bold, unforgettable finish that keeps you coming back."
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">Why Choose Our Coffee</h2>
        <p className="section-subtitle">Exceptional quality from seed to cup</p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;