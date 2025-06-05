// src/components/BackToTop/BackToTop.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { AppContext } from '../../context/AppContext';
import './BackToTop.css';

const BackToTop = () => {
  const { isBackToTopVisible } = useContext(AppContext);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isBackToTopVisible) return null;

  return (
    <button className="back-to-top" onClick={scrollToTop}>
      <FaArrowUp />
    </button>
  );
};

export default BackToTop;