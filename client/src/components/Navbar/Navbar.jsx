import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaBars, 
  FaTimes,
  FaUser,
  FaCoffee,
  FaSun,
  FaMoon,
  FaArrowLeft,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';

function Navbar() {
  const {
    user,
    cartCount,
    setIsCartOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    logout,
    login,
    register,
    verifyUserEmail,
    loginWithGoogle,
    resendVerificationCode,
    showNotification
  } = useContext(AppContext);

  const navigate = useNavigate();
  
  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme initialization
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode !== null ? savedMode : systemPrefersDark;
    
    setDarkMode(initialMode);
    document.documentElement.setAttribute('data-theme', initialMode ? 'dark' : 'light');
  }, []);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.classList.toggle('menu-open', !mobileMenuOpen);
  };

  // Theme toggle
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  // Auth form handlers
  const handleAuthClick = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuthForm(true);
    setSignupStep(1);
    resetForm();
  };

  const closeAuthForm = () => {
    setShowAuthForm(false);
    setSignupStep(1);
    setAuthMode('signin');
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
    setShowPassword(false);
  };

  // Validation functions (keep your existing logic)
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+254[0-9]{9}$/.test(phone);
  const validatePassword = (password) => password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  
  const validateDateOfBirth = (dob) => {
    if (!dob) return true;
    const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
    return age >= 13;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Sign In Handler - CUSTOMER ONLY
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

      await login({ email, password });
      closeAuthForm();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      
      if (errorMessage.includes('verify your email')) {
        setErrors({ 
          general: errorMessage,
          showResendVerification: true 
        });
      } else if (errorMessage.includes('locked')) {
        setErrors({ general: 'Account temporarily locked. Please try again later.' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await resendVerificationCode(formData.email);
      showNotification('Verification code sent to your email!', 'success');
      setErrors(prev => ({ ...prev, showResendVerification: false }));
    } catch (error) {
      showNotification('Failed to send verification code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handlers - CUSTOMER ONLY (keep all steps)
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
    
    if (dob && !validateDateOfBirth(dob)) {
      setErrors({ dob: 'You must be at least 13 years old to create an account' });
      return;
    }

    if (!gender || !agreeTerms) {
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
        dateOfBirth: dob || null,
        userType: 'customer'
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

  // Verification code handlers
  const handleVerificationInput = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

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
      const response = await verifyUserEmail(formData.email, code);
      const verifiedUser = response?.data?.user || user;
      showNotification(`Welcome, ${verifiedUser?.firstName || formData.firstName}! Your account is verified.`, 'success');
      closeAuthForm();
      
      // Always redirect to customer account
      navigate('/account');
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
      
    } catch (error) {
      showNotification('Google login failed. Please try again.', 'error');
    }
  };

  const handleGoogleError = () => {
    showNotification('Google login failed. Please try again.', 'error');
  };

  // Navigation handlers
  const scrollToSection = (sectionId) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Calculate age for display
  const calculateAge = (dob) => {
    if (!dob) return 0;
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // Navigation links
  const navLinks = [
    { name: 'Shop', href: '#coffee-shop' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

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

  // Render Auth Forms - CUSTOMER ONLY (all your steps with new CSS)
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
            <p>Sign in to your customer account</p>
          </div>

          <form className="auth-form" onSubmit={handleSignIn}>
            {errors.general && (
              <div className="error-message general">
                {errors.general}
                {errors.showResendVerification && (
                  <div className="resend-verification">
                    <button 
                      type="button" 
                      onClick={handleResendVerification}
                      className="resend-btn"
                    >
                      Click here to resend verification code
                    </button>
                  </div>
                )}
              </div>
            )}
            
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

    // Sign Up Steps - CUSTOMER ONLY (all your steps)
    switch(signupStep) {
      case 1:
        return (
          <motion.div key="signup-1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <div className="auth-header">
              <button className="back-btn" onClick={() => handleAuthClick('signin')}>
                <FaArrowLeft />
              </button>
              <h2>Join Rerendet Coffee</h2>
              <p>Create your customer account to start your coffee adventure</p>
            </div>

            <form className="auth-form" onSubmit={handleSignUpStep1}>
              {errors.general && <div className="error-message general">{errors.general}</div>}
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="your@email.com"
                  required
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
                <label>Password *</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create your password"
                    required
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
                <label>Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                  required
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
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    required
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
                <label>Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  required
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
                  max={new Date().toISOString().split('T')[0]}
                />
                {formData.dob && (
                  <div className="age-display">
                    Age: {calculateAge(formData.dob)} years
                  </div>
                )}
                {errors.dob && <span className="error-text">{errors.dob}</span>}
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                  required
                />
                <label htmlFor="agreeTerms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a> *
                </label>
              </div>

              <button 
                type="submit" 
                className="auth-btn primary"
                disabled={!formData.gender || !formData.agreeTerms || isSendingCode}
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
                Didn't receive a code? <button type="button" onClick={handleResendVerification}>Resend Code</button>
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
        {/* Main Header */}
        <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
          <div className="header__container">
            {/* Logo */}
            <div className="header__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <FaCoffee className="header__logo-icon" />
              <span className="header__logo-text">Rerendet</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="header__nav">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="header__nav-link"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="header__actions">
              {/* Theme Toggle */}
              <button className="theme-toggle" onClick={toggleTheme}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* Account */}
              <button 
                className="header__account"
                onClick={() => user ? navigate('/account') : handleAuthClick('signin')}
              >
                <FaUser />
              </button>

              {/* Cart */}
              <div className="header__cart-wrapper">
                <button className="header__cart" onClick={() => setIsCartOpen(true)}>
                  <FaShoppingBag />
                  {cartCount > 0 && (
                    <span className="header__cart-badge">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="header__mobile-trigger" 
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`header__mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <nav className="header__mobile-nav">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="header__mobile-nav-link"
                >
                  {link.name}
                </button>
              ))}
              {user ? (
                <>
                  <button className="header__mobile-nav-link" onClick={() => navigate('/account')}>
                    My Account
                  </button>
                  <button className="header__mobile-nav-link" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  className="header__mobile-nav-link"
                  onClick={() => { handleAuthClick('signin'); setMobileMenuOpen(false); }}
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Auth Modal Overlay */}
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