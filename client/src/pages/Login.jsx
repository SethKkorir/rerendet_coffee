import React from 'react';
import '../App.css'; // Make sure to import your existing CSS

const Login = () => {
  return (
    <section className="login-section" style={{
      background: 'linear-gradient(135deg, #f9f5f0, var(--secondary-color))',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '100px 0'
    }}>
      <div className="container">
        <div className="login-card" style={{
          maxWidth: '450px',
          margin: '0 auto',
          background: 'var(--white)',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--box-shadow)',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 className="section-title" style={{
            textAlign: 'center',
            paddingBottom: 0,
            marginBottom: '30px'
          }}>
            Welcome Back
            <div style={{
              height: '3px',
              width: '80px',
              background: 'var(--accent-color)',
              margin: '15px auto 0'
            }}></div>
          </h2>
          
          <form className="login-form">
            <div className="form-group" style={{ position: 'relative', marginBottom: '25px' }}>
              <i className="login-icon fas fa-user" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}></i>
              <input 
                type="text" 
                className="login-input" 
                placeholder="Email Address"
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 40px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1rem',
                  transition: 'var(--transition)'
                }}
              />
            </div>
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '30px' }}>
              <i className="login-icon fas fa-lock" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}></i>
              <input 
                type="password" 
                className="login-input" 
                placeholder="Password"
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 40px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1rem',
                  transition: 'var(--transition)'
                }}
              />
            </div>
            
            <button 
              className="btn primary" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '14px 20px',
                fontSize: '1rem'
              }}
            >
              <span>Sign In</span>
              <i className="fas fa-chevron-right"></i>
            </button>
            
            <div className="login-options" style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '20px',
              fontSize: '0.9rem'
            }}>
              <label style={{ cursor: 'pointer' }}>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" style={{ color: 'var(--primary-color)' }}>Forgot Password?</a>
            </div>
          </form>
          
          <div className="social-login" style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ 
              color: 'var(--text-light)', 
              marginBottom: '15px',
              position: 'relative'
            }}>
              <span style={{ 
                background: 'var(--white)', 
                padding: '0 10px',
                position: 'relative',
                zIndex: '1'
              }}>
                Or continue with
              </span>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                right: '0',
                height: '1px',
                background: 'var(--gray-300)',
                zIndex: '0'
              }}></div>
            </p>
            
            <div className="social-icons" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px'
            }}>
              {['facebook', 'google', 'twitter'].map((platform) => (
                <a 
                  key={platform}
                  href="#" 
                  className={`social-login-icon fab fa-${platform}`}
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--gray-100)',
                    color: 'var(--text-color)',
                    fontSize: '1.2rem',
                    transition: 'var(--transition)',
                    textDecoration: 'none'
                  }}
                ></a>
              ))}
            </div>
          </div>
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '30px',
            color: 'var(--text-light)'
          }}>
            Don't have an account? <a href="#" style={{ color: 'var(--primary-color)' }}>Sign Up</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;