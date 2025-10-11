// components/Alert/Alert.jsx
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Alert.css';

const Alert = () => {
  const { alert, showAlert } = useContext(AppContext);

  if (!alert.isVisible || !alert.message) return null;

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const handleClose = () => {
    showAlert('', ''); // Clear alert
  };

  return (
    <div className={`alert alert-${alert.type}`}>
      <div className="alert-content">
        <div className="alert-icon">
          {getAlertIcon()}
        </div>
        <div className="alert-message">
          {alert.message}
        </div>
        <button 
          className="alert-close" 
          onClick={handleClose}
          aria-label="Close alert"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Alert;