import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../../context/AppContext';
import { playNotificationSound } from '../../utils/sound';
import './Notification.css';

const Notification = () => {
  const { notifications, removeNotification } = useContext(AppContext);
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Only play sound if number of notifications INCREASED
    if (notifications.length > prevCountRef.current) {
      // Get the latest notification type
      const latest = notifications[notifications.length - 1];
      playNotificationSound(latest?.type);
    }
    prevCountRef.current = notifications.length;
  }, [notifications]);

  if (!notifications.length) {
    return null;
  }

  const getNotificationClass = (type) => {
    switch (type) {
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

  const getIcon = (type) => {
    switch (type) {
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
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClass(notification.type)}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {getIcon(notification.type)}
            </span>
            <span className="notification-message">
              {notification.message}
            </span>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;