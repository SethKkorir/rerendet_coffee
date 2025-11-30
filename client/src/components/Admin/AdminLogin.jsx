// src/components/Admin/AdminLogin.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: 'admin@rerendetcoffee.com',
    password: 'Admin123!'
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
      console.log('🔄 Attempting admin login...', { email: formData.email, password: '***' });
      
      // Use the admin-specific login function
      const response = await loginAdmin(formData);
      
      console.log('✅ Admin login successful, redirecting to admin dashboard...');
      
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
                placeholder="admin@rerendetcoffee.com"
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

          {/* Development helper */}
          <div className="dev-helper">
            <div className="credentials-card">
              <h4>🔧 Development Access</h4>
              <div className="credentials">
                <div className="credential-item">
                  <strong>Email:</strong> admin@rerendetcoffee.com
                </div>
                <div className="credential-item">
                  <strong>Password:</strong> Admin123!
                </div>
              </div>
              <p className="security-note">
                ⚠️ Ensure admin user exists in database with userType: 'admin'
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;