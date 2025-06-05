// src/components/Testimonials/Testimonials.jsx
import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Testimonials.css';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      text: "I've tried coffee from all over the world, but Rerendet's beans are truly exceptional. The flavor profile is complex yet balanced, and I love knowing my purchase supports sustainable farming.",
      author: "Sarah Johnson",
      role: "Coffee Enthusiast"
    },
    {
      text: "As a cafe owner, I'm always looking for quality beans that my customers will love. Rerendet's coffee has become our signature blend, and people keep coming back for more.",
      author: "Michael Chang",
      role: "Owner, Urban Brew Café"
    },
    {
      text: "The commitment to sustainability and ethical farming practices at Rerendet Farm is just as impressive as the quality of their coffee. It's rare to find both in one package.",
      author: "Elena Rodriguez",
      role: "Sustainable Food Advocate"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonial-slider">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`testimonial-slide ${index === currentTestimonial ? 'active' : ''}`}
            >
              <div className="quote-icon"><FaQuoteLeft /></div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="testimonial-controls">
          <button className="testimonial-prev" onClick={prevTestimonial}>
            <FaChevronLeft />
          </button>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => goToTestimonial(index)}
              />
            ))}
          </div>
          <button className="testimonial-next" onClick={nextTestimonial}>
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;