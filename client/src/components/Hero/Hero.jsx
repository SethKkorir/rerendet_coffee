import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaArrowRight, FaStar } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  // Premium Dark Roast / Beans / Steam aesthetic
  const heroImage = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2574&auto=format&fit=crop";

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className="hero-section" id="hero" data-testid="hero-section">
      {/* Animated Background */}
      <div className="hero-background-wrapper">
        <motion.div
          className="hero-background-image"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="hero-overlay" />
      </div>

      {/* Main Content */}
      <div className="hero-container">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          {/* Premium Badge */}
          <motion.div className="hero-badge" variants={itemVariants} data-testid="badge-hero-premium">
            <span className="hero-badge-text">PREMIUM BLEND</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 className="hero-heading" variants={itemVariants} data-testid="text-hero-headline">
            Start Your Day With{" "}
            <span className="hero-heading-accent">Rerendet-Coffee.</span>
          </motion.h1>

          {/* Description */}
          <motion.p className="hero-description" variants={itemVariants}>
            Boost your productivity and mood with our 100% natural Arabica roast
            from the highlands of Kenya. Smooth, bold, and delivered to your door.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="hero-cta" variants={itemVariants}>
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
          </motion.div>


        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="hero-scroll-dot" />
      </motion.div>
    </section>
  );
};

export default Hero;