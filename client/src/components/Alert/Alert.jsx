// components/Alert/Alert.jsx
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './Alert.css';

const Alert = () => {
  const ctx = useContext(AppContext) || {};
  const alert = ctx.alert || { isVisible: false, message: '' };
  const hideAlert = ctx.hideAlert || (() => {});

  if (!alert || !alert.isVisible) return null;

  return (
    <div className="app-alert">
      <div className="app-alert__message">{alert.message || 'Notice'}</div>
      <button className="app-alert__close" onClick={hideAlert} aria-label="Close alert">
        ×
      </button>
    </div>
  );
};

export default Alert;