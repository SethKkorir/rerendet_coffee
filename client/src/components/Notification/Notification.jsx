// src/components/Notification/Notification.jsx
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaCheckCircle } from 'react-icons/fa';
import './Notification.css';

function Notification() {
  const { notification } = useContext(AppContext);
  
  return (
    <div className={`notification ${notification.isVisible ? 'active' : ''} ${notification.type}`}>
      <div className="notification-content">
        <FaCheckCircle />
        <span>{notification.message}</span>
      </div>
    </div>
  );
}

export default Notification;