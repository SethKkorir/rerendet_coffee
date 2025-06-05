import React from 'react';
import '../App.css'; // Import your existing CSS

const SignUp = () => {
  return (
    <section className="signup-section" style={{
      background: 'linear-gradient(135deg, #f9f5f0, var(--secondary-color))',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '100px 0'
    }}>
      <div className="container">
        <div className="signup-card" style={{
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
            Create Account
            <div style={{
              height: '3px',
              width: '80px',
              background: 'var(--accent-color)',
              margin: '15px auto 0'
            }}></div>
          </h2>
          
          <form className="signup-form">
            <div className="form-group" style={{ position: 'relative', marginBottom: '25px' }}>
              <i className="signup-icon fas fa-user" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}></i>
              <input 
                type="text" 
                className="signup-input" 
                placeholder="Full Name"
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
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '25px' }}>
              <i className="signup-icon fas fa-envelope" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}></i>
              <input 
                type="email" 
                className="signup-input" 
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
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '25px' }}>
              <i className="signup-icon fas fa-lock" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}></i>
              <input 
                type="password" 
                className="signup-input" 
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
            
            <div className="form-group" style={{ position: 'relative', marginBottom: '30px' }}>
              <i className="signup-icon fas fa-lock" style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }}></i>
              <input 
                type="password" 
                className="signup-input" 
                placeholder="Confirm Password"
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
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '0.9rem' }}>
                  I agree to the <a href="#" style={{ color: 'var(--primary-color)' }}>Terms & Conditions</a>
                </span>
              </label>
            </div>
            
            <button 
              className="btn primary" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '14px 20px',
                fontSize: '1rem',
                marginBottom: '20px'
              }}
            >
              Create Account
            </button>
          </form>
          
          <div className="divider" style={{
            position: 'relative',
            textAlign: 'center',
            margin: '25px 0',
            color: 'var(--text-light)'
          }}>
            <span style={{ 
              background: 'var(--white)', 
              padding: '0 10px',
              position: 'relative',
              zIndex: '1'
            }}>
              Or sign up with
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
          </div>
          
          <div className="social-signup" style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <button 
              className="social-btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'var(--gray-100)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontWeight: '600'
              }}
            >
              <i className="fab fa-google" style={{ color: '#DB4437' }}></i>
              <span>Google</span>
            </button>
            
            <button 
              className="social-btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'var(--gray-100)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontWeight: '600'
              }}
            >
              <i className="fab fa-apple" style={{ color: '#000' }}></i>
              <span>Apple</span>
            </button>
          </div>
          
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-light)',
            fontSize: '0.95rem'
          }}>
            Already have an account? <a href="#" style={{ color: 'var(--primary-color)' }}>Sign In</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;