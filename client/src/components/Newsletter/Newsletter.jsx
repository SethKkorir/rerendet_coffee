// src/components/Newsletter/Newsletter.jsx
import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content">
          <h2>Join Our Coffee Journey</h2>
          <p>Subscribe to receive updates, special offers, and brewing tips straight to your inbox.</p>
          <form className="newsletter-form">
            <input 
              type="email" 
              placeholder="Your email address" 
              required 
            />
            <button type="submit" className="btn primary">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;