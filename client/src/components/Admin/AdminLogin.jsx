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

  const [step, setStep] = useState('login'); // 'login' or '2fa'
  const [code, setCode] = useState('');

  const { loginAdmin, verifyAdmin2FA, showNotification } = useContext(AppContext);
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
      if (step === 'login') {
        const response = await loginAdmin(formData);
        if (response.requires2FA) {
          setStep('2fa');
          showNotification('Verification code sent to your email', 'info');
        } else {
          navigate('/admin');
        }
      } else {
        // Verify 2FA
        await verifyAdmin2FA(formData.email, code);
        navigate('/admin');
      }

    } catch (error) {
      console.error('❌ Admin login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
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
            <div className="logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <img src="/rerendet-logo.png" alt="Rerendet Admin" style={{ height: '80px' }} />
            </div>
            {step === '2fa' && <h3>Two-Factor Authentication</h3>}
          </div>

          {error && (
            <div className="error-message">
              <strong>{step === 'login' ? 'Access Denied:' : 'Verification Failed:'}</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {step === 'login' ? (
              <>
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
              </>
            ) : (
              <div className="form-group">
                <label>Verification Code</label>
                <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                  Enter the 6-digit code sent to <strong>{formData.email}</strong>
                </div>
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  disabled={loading}
                  className="form-input"
                  style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '24px' }}
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  {step === 'login' ? 'Authenticating...' : 'Verifying...'}
                </>
              ) : (
                step === 'login' ? 'Access Admin Dashboard' : 'Verify & Login'
              )}
            </button>

            {step === '2fa' && (
              <button
                type="button"
                className="back-btn"
                onClick={() => setStep('login')}
                style={{ marginTop: '16px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', width: '100%' }}
              >
                Back to Login
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;