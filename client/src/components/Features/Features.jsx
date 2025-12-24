import React from 'react';
import { motion } from 'framer-motion';
import { FaMugHot, FaLeaf, FaMountain, FaStar } from 'react-icons/fa';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: <FaMugHot />,
      title: "Year-Round Excellence",
      description: "Our coffee is consistently fresh and flavorful throughout the seasons."
    },
    {
      icon: <FaLeaf />,
      title: "Rich Volcanic Soils",
      description: "Grown in nutrient-rich volcanic soil, boasting a deep, complex taste profile."
    },
    {
      icon: <FaMountain />,
      title: "Ethically Sourced",
      description: "We partner with local farmers to ensure sustainable practices and fair compensation."
    },
    {
      icon: <FaStar />,
      title: "Unique Flavor Profile",
      description: "A zesty, rich brew with chocolate undertones and a bold, unforgettable finish."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="features" className="features">
      <div className="container">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Why Choose Our Coffee</h2>
          <p className="section-subtitle">Exceptional quality from seed to cup</p>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="icon-wrapper">
                <div className="icon">{feature.icon}</div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;