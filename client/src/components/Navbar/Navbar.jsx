import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaShoppingBag, 
  FaBars, 
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaBoxOpen,
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
  FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { register, verifyEmail } from '../../api/api'; // <-- Add this import
import './Navbar.css';

function Navbar() {
  const {
    cartCount,
    setIsCartOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    user,
    logout,
    loginWithGoogle,
    showNotification
  } = useContext(AppContext);

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [isValid, setIsValid] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('254');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Theme initialization
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode !== null ? savedMode : systemPrefersDark;
    
    setDarkMode(initialMode);
    document.documentElement.setAttribute('data-theme', initialMode ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.classList.toggle('menu-open', !mobileMenuOpen);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleSignInClick = () => {
    setShowSignInForm(true);
    setSignupStep(1);
    setIsAccountDropdownOpen(false);
    document.body.classList.add('form-open');
  };

  const closeSignInForm = () => {
    setShowSignInForm(false);
    setSignupStep(1);
    document.body.classList.remove('form-open');
  };

  const validateInput = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmailOrPhone(value);
    setIsValid(validateInput(value) || value === '');
  };

  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword;

  const handleContinueFromEmail = () => {
    if (validateInput(emailOrPhone)) {
      setSignupStep(2);
    } else {
      setIsValid(false);
    }
  };

  const handleContinueFromPassword = () => {
    if (isPasswordValid && passwordsMatch) {
      setSignupStep(3);
    }
  };

  const handleContinueFromPersonalInfo = () => {
    if (firstName && lastName && (emailOrPhone.includes('@') || phoneNumber)) {
      setSignupStep(4);
    }
  };

  const handleContinueFromAdditionalInfo = async () => {
    if (gender && dob && agreeTerms) {
      // Call backend register API
      try {
        const payload = {
          firstName,
          lastName,
          email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
          phone: !emailOrPhone.includes('@') ? `${phonePrefix}${phoneNumber}` : undefined,
          password,
          gender,
          dateOfBirth: dob,
        };
        const res = await register(payload);
        // Optionally show a success message
        setSignupStep(5); // Move to verification step
      } catch (err) {
        alert(err.response?.data?.message || 'Registration failed');
      }
    }
  };
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    console.log('🔐 Google login response received');
    
    const decoded = jwtDecode(credentialResponse.credential);
    
    console.log('📧 Google user email:', decoded.email);
    
    const googleUser = {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      googleId: decoded.sub,
      firstName: decoded.given_name,
      lastName: decoded.family_name
    };

    // Call your backend to login/register with Google
    await loginWithGoogle(googleUser);
    
    // Close the form immediately - no verification needed
    closeSignInForm();
    
    console.log('✅ Google login successful - user automatically logged in');
    
  } catch (error) {
    console.error('❌ Google login error:', error);
    showNotification('Google login failed. Please try again.', 'error');
  }
};
  const handleGoogleError = () => {
    console.log('Google login failed');
  };

  const handleCompleteSignup = () => {
    console.log('Signup complete with:', {
      emailOrPhone,
      firstName,
      lastName,
      phoneNumber: emailOrPhone.includes('@') ? null : `${phonePrefix}${phoneNumber}`,
      gender,
      dob
    });
    closeSignInForm();
  };

  const goBackStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  // Render different form steps
  const renderSignupForm = () => {
    switch(signupStep) {
      case 1:
        return (
          <motion.div 
            key="step1"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="signin-header">
              <div className="signin-logo">Rerendet Coffee</div>
              <p>Enter your email or phone number to create account</p>
            </div>
            <form className="signin-form" onSubmit={(e) => { e.preventDefault(); handleContinueFromEmail(); }}>
              <div className={`form-group ${!isValid ? 'error' : ''}`}>
                <input
                  type="text"
                  id="emailOrPhone"
                  value={emailOrPhone}
                  onChange={handleInputChange}
                  placeholder="Email or phone number"
                  className={!isValid ? 'invalid' : ''}
                />
                {!isValid && <span className="error-message">Please enter a valid email or phone number</span>}
              </div>
              <button type="submit" className="signin-btn">
                Continue
              </button>
              <div className="divider">
                <span>or</span>
              </div>
              <div className="social-login">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme={darkMode ? 'filled_blue' : 'outline'}
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
                <button type="button" className="social-btn facebook">
                  <FaFacebook /> Continue with Facebook
                </button>
              </div>
              <div className="terms">
                By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
              </div>
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step2"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="signin-header">
              <button className="back-btn" onClick={goBackStep}>
                <FaArrowLeft />
              </button>
              <h2>Create your account</h2>
              <p>To keep your account safe, we need a strong password</p>
              <div className="email-display">
                {emailOrPhone} <button className="edit-btn" onClick={() => setSignupStep(1)}>Edit</button>
              </div>
            </div>
            <form className="signin-form" onSubmit={(e) => { e.preventDefault(); handleContinueFromPassword(); }}>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {!isPasswordValid && password && (
                  <span className="error-message">
                    Password must be at least 8 characters with 1 uppercase letter and 1 number
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
                {!passwordsMatch && confirmPassword && (
                  <span className="error-message">Both passwords must match</span>
                )}
              </div>
              <button 
                type="submit" 
                className="signin-btn"
                disabled={!isPasswordValid || !passwordsMatch}
              >
                Continue
              </button>
            </form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="step3"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="signin-header">
              <button className="back-btn" onClick={goBackStep}>
                <FaArrowLeft />
              </button>
              <h2>Personal Information</h2>
              <p>Tell us a little more about yourself</p>
            </div>
            <form className="signin-form" onSubmit={(e) => { e.preventDefault(); handleContinueFromPersonalInfo(); }}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
              {!emailOrPhone.includes('@') && (
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="phone-input">
                    <select 
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                    >
                      <option value="254">+254 (KE)</option>
                      <option value="255">+255 (TZ)</option>
                      <option value="256">+256 (UG)</option>
                      <option value="257">+257 (BI)</option>
                      <option value="250">+250 (RW)</option>
                    </select>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              )}
              <button 
                type="submit" 
                className="signin-btn"
                disabled={!firstName || !lastName}
              >
                Continue
              </button>
            </form>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            key="step4"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="signin-header">
              <button className="back-btn" onClick={goBackStep}>
                <FaArrowLeft />
              </button>
              <h2>Additional Information</h2>
            </div>
            <form className="signin-form" onSubmit={(e) => { e.preventDefault(); handleContinueFromAdditionalInfo(); }}>
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agreeTerms">
                  I agree to the Terms and Conditions and Privacy Policy
                </label>
              </div>
              <button 
                type="submit" 
                className="signin-btn"
                disabled={!gender || !dob || !agreeTerms}
              >
                Continue
              </button>
            </form>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            key="step5"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="signin-header">
              <button className="back-btn" onClick={goBackStep}>
                <FaArrowLeft />
              </button>
              <h2>Verify Your Account</h2>
              <p>We've sent a verification code to {emailOrPhone.includes('@') ? emailOrPhone : `+${phonePrefix}${phoneNumber}`}</p>
            </div>
            <form className="signin-form" onSubmit={(e) => { e.preventDefault(); handleCompleteSignup(); }}>
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>
              <button 
                type="submit" 
                className="signin-btn"
                disabled={verificationCode.length !== 6}
              >
                Complete Signup
              </button>
              <div className="resend-code">
                Didn't receive a code? <button type="button">Resend Code</button>
              </div>
            </form>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <>
        <nav className={`navbar ${showSignInForm ? 'hidden' : ''}`}>
          <div className="container">
            <Link to="/" className="logo-container" onClick={() => setMobileMenuOpen(false)}>
              <div className="logo">Rerendet Coffee</div>
            </Link>

            <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
              <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Our Coffee
              </a>
              <a href="#coffee-shop" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </a>
              <Link to="/blog" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Blog
              </Link>
              <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                About
              </a>
              <a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </a>
            </div>

            <div className="nav-actions">
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              <div className="account-section">
                <button 
                  className="account-trigger"
                  onClick={toggleAccountDropdown}
                  aria-expanded={isAccountDropdownOpen}
                >
                  <span className="account-icon">
                    {user ? <FaUserCircle /> : <FaUser />}
                  </span>
                  <span className="account-text">Account</span>
                </button>
                
                {isAccountDropdownOpen && (
                  <div className="account-dropdown">
                    {user ? (
                      <>
                        <div className="account-header">
                          <div className="account-avatar">
                            {user.picture ? (
                              <img src={user.picture} alt={user.name} />
                            ) : (
                              <FaUserCircle />
                            )}
                          </div>
                          <div className="account-info">
                            <h4>Welcome To Rerendet Coffee!</h4>
                            <p>{user.name || user.email}</p>
                            {user.googleId && (
                              <span className="google-badge">
                                <FaGoogle /> Google Account
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="account-links">
                          <Link to="/account" className="account-link">
                            <FaUserCircle className="link-icon" />
                            <span>My Account</span>
                          </Link>
                          <Link to="/orders" className="account-link">
                            <FaBoxOpen className="link-icon" />
                            <span>My Orders</span>
                          </Link>
                          <button className="account-link logout-btn" onClick={logout}>
                            <FaSignOutAlt className="link-icon" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="account-auth">
                        <button 
                          className="auth-btn primary"
                          onClick={handleSignInClick}
                        >
                          Sign In
                        </button>
                        <Link to="/orders" className="auth-btn secondary">
                          Track Orders
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="cart-action" onClick={() => setIsCartOpen(true)}>
                <div className="cart-count">{cartCount}</div>
                <FaShoppingBag />
              </div>
            </div>

            <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {showSignInForm && (
            <motion.div 
              className="signin-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="signin-form-container"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <button className="close-signin" onClick={closeSignInForm}>
                  <FaTimes />
                </button>
                <AnimatePresence mode="wait">
                  {renderSignupForm()}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </GoogleOAuthProvider>
  );
}

export default Navbar;