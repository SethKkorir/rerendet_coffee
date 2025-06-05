// src/components/Admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Temporary password for development
    if (password === 'admin123') {
      navigate('/admin');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h2>Rerendet Admin Portal</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
        <p className="login-note">
          <strong>Development Access:</strong> Use password "admin123"
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;