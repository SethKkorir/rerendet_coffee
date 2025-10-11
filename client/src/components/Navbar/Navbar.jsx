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
  FaArrowLeft,
  FaCoffee,
  FaStar,
  FaHeart,
  FaMapMarkerAlt,
  FaCreditCard,
  FaShield
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { register, verifyEmail, login } from '../../api/api';
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
    showNotification,
    setUser
  } = useContext(AppContext);

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    phone: '+254',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phonePrefix: '254',
    phoneNumber: '',
    gender: '',
    dob: '',
    agreeTerms: false
  });

  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleAuthClick = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuthForm(true);
    setIsAccountDropdownOpen(false);
    document.body.classList.add('form-open');
    resetForm();
  };

  const closeAuthForm = () => {
    setShowAuthForm(false);
    setSignupStep(1);
    setAuthMode('signin');
    document.body.classList.remove('form-open');
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      phone: '+254',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phonePrefix: '254',
      phoneNumber: '',
      gender: '',
      dob: '',
      agreeTerms: false
    });
    setVerificationCode(['', '', '', '', '', '']);
    setErrors({});
  };

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+254[0-9]{9}$/.test(phone);
  const validatePassword = (password) => password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Sign In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const { email, password } = formData;
      
      if (!validateEmail(email)) {
        setErrors({ email: 'Please enter a valid email address' });
        return;
      }

      if (!password) {
        setErrors({ password: 'Password is required' });
        return;
      }

      const loginData = { email, password };
      const userData = await login(loginData);
      
      showNotification(`Welcome back, ${userData.firstName}!`, 'success');
      closeAuthForm();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handlers
  const handleSignUpStep1 = (e) => {
    e.preventDefault();
    const { email, phone } = formData;
    
    if (!validateEmail(email) && !validatePhone(phone)) {
      setErrors({ email: 'Please enter a valid email or phone number' });
      return;
    }

    setSignupStep(2);
  };

  const handleSignUpStep2 = (e) => {
    e.preventDefault();
    const { password, confirmPassword } = formData;
    
    if (!validatePassword(password)) {
      setErrors({ password: 'Password must be 8+ characters with 1 uppercase and 1 number' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setSignupStep(3);
  };

  const handleSignUpStep3 = (e) => {
    e.preventDefault();
    const { firstName, lastName } = formData;
    
    if (!firstName || !lastName) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    setSignupStep(4);
  };

  const handleSignUpStep4 = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, password, gender, dob, agreeTerms } = formData;
    
    if (!gender || !dob || !agreeTerms) {
      setErrors({ general: 'Please fill in all required fields and agree to terms' });
      return;
    }

    setIsSendingCode(true);
    try {
      const payload = {
        firstName,
        lastName,
        email: validateEmail(email) ? email : undefined,
        phone: validatePhone(phone) ? phone : `${formData.phonePrefix}${formData.phoneNumber}`,
        password,
        gender,
        dateOfBirth: dob,
      };
      
      await register(payload);
      showNotification('Verification code sent to your email!', 'success');
      setSignupStep(5);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsSendingCode(false);
    }
  };

  // M-Pesa style PIN input for verification
  const handleVerificationInput = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`verification-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleCompleteSignup = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setErrors({ verification: 'Please enter the 6-digit code' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyEmail({ email: formData.email, code });
      const verifiedUser = res.data.data.user;
      setUser(verifiedUser);
      showNotification(`Welcome, ${verifiedUser.firstName}! Your account is verified.`, 'success');
      closeAuthForm();
      setIsAccountDropdownOpen(true);
    } catch (error) {
      setErrors({ verification: error.response?.data?.message || 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Auth
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleUser = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        googleId: decoded.sub,
        firstName: decoded.given_name,
        lastName: decoded.family_name
      };

      await loginWithGoogle(googleUser);
      closeAuthForm();
      showNotification(`Welcome ${googleUser.firstName}!`, 'success');
      
    } catch (error) {
      showNotification('Google login failed. Please try again.', 'error');
    }
  };

  const handleGoogleError = () => {
    showNotification('Google login failed. Please try again.', 'error');
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  // Render Auth Forms
  const renderAuthForm = () => {
    if (authMode === 'signin') {
      return (
        <motion.div key="signin" variants={formVariants} initial="hidden" animate="visible" exit="exit">
          <div className="auth-header">
            <div className="auth-logo">
              <FaCoffee className="logo-icon" />
              Rerendet Coffee
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue your coffee journey</p>
          </div>

          <form className="auth-form" onSubmit={handleSignIn}>
            {errors.general && <div className="error-message general">{errors.general}</div>}
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="your@email.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-btn primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-auth">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme={darkMode ? 'filled_blue' : 'outline'}
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            <div className="auth-switch">
              Don't have an account? 
              <button type="button" onClick={() => setAuthMode('signup')}>
                Sign up now
              </button>
            </div>
          </form>
        </motion.div>
      );
    }

    // Sign Up Steps
    switch(signupStep) {
      case 1:
        return (
          <motion.div key="signup-1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <div className="auth-header">
              <button className="back-btn" onClick={() => handleAuthClick('signin')}>
                <FaArrowLeft />
              </button>
              <h2>Join Rerendet Coffee</h2>
              <p>Create your account to start your coffee adventure</p>
            </div>

            <form className="auth-form" onSubmit={handleSignUpStep1}>
              {errors.general && <div className="error-message general">{errors.general}</div>}
              
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="phone-option">
                <div className="divider">or use phone</div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="phone-input">
                    <select 
                      value={formData.phonePrefix}
                      onChange={(e) => handleInputChange('phonePrefix', e.target.value)}
                    >
                      <option value="254">+254 (KE)</option>
                      <option value="255">+255 (TZ)</option>
                      <option value="256">+256 (UG)</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="712 345 678"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-btn primary">
                Continue
              </button>

              <div className="auth-divider">
                <span>or sign up with</span>
              </div>

              <div className="social-auth">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme={darkMode ? 'filled_blue' : 'outline'}
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                />
              </div>

              <div className="auth-switch">
                Already have an account? 
                <button type="button" onClick={() => setAuthMode('signin')}>
                  Sign in
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="signup-2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <div className="auth-header">
              <button className="back-btn" onClick={() => setSignupStep(1)}>
                <FaArrowLeft />
              </button>
              <h2>Create Password</h2>
              <p>Choose a strong password to secure your account</p>
            </div>

            <form className="auth-form" onSubmit={handleSignUpStep2}>
              <div className="form-group">
                <label>Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create your password"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
                <div className="password-requirements">
                  <span className={formData.password.length >= 8 ? 'met' : ''}>• 8+ characters</span>
                  <span className={/[A-Z]/.test(formData.password) ? 'met' : ''}>• 1 uppercase letter</span>
                  <span className={/[0-9]/.test(formData.password) ? 'met' : ''}>• 1 number</span>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="auth-btn primary">
                Continue
              </button>
            </form>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="signup-3" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <div className="auth-header">
              <button className="back-btn" onClick={() => setSignupStep(2)}>
                <FaArrowLeft />
              </button>
              <h2>Personal Information</h2>
              <p>Tell us a bit about yourself</p>
            </div>

            <form className="auth-form" onSubmit={handleSignUpStep3}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn primary">
                Continue
              </button>
            </form>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="signup-4" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <div className="auth-header">
              <button className="back-btn" onClick={() => setSignupStep(3)}>
                <FaArrowLeft />
              </button>
              <h2>Additional Information</h2>
            </div>

            <form className="auth-form" onSubmit={handleSignUpStep4}>
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                />
                <label htmlFor="agreeTerms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                </label>
              </div>

              <button 
                type="submit" 
                className="auth-btn primary"
                disabled={!formData.gender || !formData.dob || !formData.agreeTerms || isSendingCode}
              >
                {isSendingCode ? 'Sending Code...' : 'Continue'}
              </button>
            </form>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="signup-5" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <div className="auth-header">
              <button className="back-btn" onClick={() => setSignupStep(4)}>
                <FaArrowLeft />
              </button>
              <h2>Verify Your Account</h2>
              <p>We've sent a 6-digit code to:</p>
              <div className="verification-email">
                {formData.email}
              </div>
            </div>

            <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleCompleteSignup(); }}>
              <div className="form-group">
                <label>Verification Code</label>
                <div className="verification-grid">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`verification-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleVerificationInput(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      className="verification-input"
                    />
                  ))}
                </div>
                {errors.verification && <span className="error-text">{errors.verification}</span>}
              </div>

              <button 
                type="submit" 
                className="auth-btn primary"
                disabled={verificationCode.join('').length !== 6 || isLoading}
              >
                {isLoading ? 'Verifying...' : 'Complete Sign Up'}
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
        <nav className={`navbar ${showAuthForm ? 'hidden' : ''}`}>
          <div className="nav-container">
            <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
              <FaCoffee className="logo-icon" />
              <span>Rerendet Coffee</span>
            </Link>

            <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
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

              {/* Quick Account Access for logged-in users */}
              {user && (
                <Link 
                  to="/account" 
                  className="account-quick-access"
                  title="My Account"
                >
                  <FaUserCircle />
                </Link>
              )}

              <div className="account-section">
                <button 
                  className="account-trigger"
                  onClick={toggleAccountDropdown}
                  aria-expanded={isAccountDropdownOpen}
                >
                  <span className="account-icon">
                    {user ? <FaUserCircle /> : <FaUser />}
                  </span>
                  <span className="account-text">
                    {user ? `Hi, ${user.firstName}` : 'Account'}
                  </span>
                </button>
                
                <AnimatePresence>
                  {isAccountDropdownOpen && (
                    <motion.div 
                      className="account-dropdown"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
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
                              <h4>Welcome back!</h4>
                              <p>{user.firstName} {user.lastName}</p>
                              <span className="user-email">{user.email}</span>
                            </div>
                          </div>
                          
                          <div className="account-links">
                            <Link 
                              to="/account" 
                              className="account-link"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <FaUserCircle className="link-icon" />
                              <span>My Account</span>
                            </Link>
                            <Link 
                              to="/orders" 
                              className="account-link"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <FaBoxOpen className="link-icon" />
                              <span>My Orders</span>
                            </Link>
                            <Link 
                              to="/favorites" 
                              className="account-link"
                              onClick={() => setIsAccountDropdownOpen(false)}
                            >
                              <FaHeart className="link-icon" />
                              <span>Favorites</span>
                            </Link>
                            <button className="account-link logout-btn" onClick={logout}>
                              <FaSignOutAlt className="link-icon" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="account-auth">
                          <div className="auth-options">
                            <button 
                              className="auth-btn primary"
                              onClick={() => handleAuthClick('signin')}
                            >
                              Sign In
                            </button>
                            <button 
                              className="auth-btn outline"
                              onClick={() => handleAuthClick('signup')}
                            >
                              Create Account
                            </button>
                          </div>
                          <div className="auth-features">
                            <div className="feature">
                              <FaStar className="feature-icon" />
                              <span>Earn loyalty points</span>
                            </div>
                            <div className="feature">
                              <FaBoxOpen className="feature-icon" />
                              <span>Track orders</span>
                            </div>
                            <div className="feature">
                              <FaHeart className="feature-icon" />
                              <span>Save favorites</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="cart-action" onClick={() => setIsCartOpen(true)}>
                <div className="cart-count">{cartCount}</div>
                <FaShoppingBag />
              </div>
            </div>

            <div className="mobile-toggle" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </nav>

        {/* Auth Form Overlay */}
        <AnimatePresence>
          {showAuthForm && (
            <motion.div 
              className="auth-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="auth-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button className="close-auth" onClick={closeAuthForm}>
                  <FaTimes />
                </button>
                
                <AnimatePresence mode="wait">
                  {renderAuthForm()}
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