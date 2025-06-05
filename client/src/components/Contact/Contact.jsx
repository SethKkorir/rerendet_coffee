// src/components/Contact/Contact.jsx
import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-wrapper">
          <div className="contact-info" data-aos="fade-right">
            <h2 className="section-title">Get In Touch</h2>
            <p>
              We'd love to hear from you! Whether you have questions about our coffee, 
              want to place a bulk order, or are interested in visiting our farm, 
              our team is here to help.
            </p>
            
            <div className="contact-details">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <p>Rerendet Farm, Bomet County<br />Southern Rift, Kenya</p>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <p>+254 712 345 678</p>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <p>info@rerendetcoffee.com</p>
              </div>
            </div>
            
            <div className="social-links">
              <a href="#" className="social-link">
                <FaFacebookF />
              </a>
              <a href="#" className="social-link">
                <FaInstagram />
              </a>
              <a href="#" className="social-link">
                <FaTwitter />
              </a>
              <a href="#" className="social-link">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          
          <div className="contact-form-container" data-aos="fade-left">
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="4" required></textarea>
              </div>
              <button type="submit" className="btn primary btn-block">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;