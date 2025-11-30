// components/Common/Notification.jsx
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import './Notification.css';

const Notification = () => {
  const { alert, hideAlert } = useContext(AppContext);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (alert?.isVisible) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert, hideAlert]);

  // Don't render if no alert or alert is not visible
  if (!alert || !alert.isVisible || !alert.message) {
    return null;
  }

  const getAlertClass = () => {
    switch (alert.type) {
      case 'success':
        return 'notification success';
      case 'error':
        return 'notification error';
      case 'warning':
        return 'notification warning';
      case 'info':
      default:
        return 'notification info';
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getAlertClass()}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <span className="notification-message">{alert.message}</span>
        <button 
          className="notification-close" 
          onClick={hideAlert}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;