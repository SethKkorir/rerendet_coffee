// src/components/Admin/AdminLogin.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginAdmin, showNotification } = useContext(AppContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the admin-specific login function
      const response = await loginAdmin(formData);

      // Redirect to admin dashboard
      navigate('/admin');

    } catch (error) {
      console.error('❌ Admin login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <h1>Rerendet Admin</h1>
            </div>
            <p className="login-subtitle">Administrator Access Only</p>
          </div>

          {error && (
            <div className="error-message">
              <strong>Access Denied:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter admin email"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Admin Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter admin password"
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Authenticating...
                </>
              ) : (
                'Access Admin Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;