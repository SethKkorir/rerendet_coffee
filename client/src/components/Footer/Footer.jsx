// src/components/Footer/Footer.jsx
import React from 'react';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcPaypal,
  FaMobileAlt
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo">Rerendet Coffee</div>
            </div>
            <p>Bringing the finest coffee from our farm to your cup since 1998.</p>
            <div className="footer-social">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaYoutube /></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#features">Our Coffee</a></li>
              <li><a href="#coffee-shop">Shop</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Help & Info</h3>
            <ul className="footer-links">
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Refunds</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Shop Hours</h3>
            <ul className="hours-list">
              <li><span>Monday - Friday:</span> 8am - 5pm</li>
              <li><span>Saturday:</span> 9am - 4pm</li>
              <li><span>Sunday:</span> 10am - 2pm</li>
            </ul>
            <div className="payment-icons">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcPaypal />
              <FaMobileAlt />
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Rerendet Coffee Farm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;