// context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  verifyEmail, 
  register as apiRegister,
  googleAuth as apiGoogleAuth 
} from '../api/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return savedUser && token ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ 
    message: '', 
    type: '', 
    isVisible: false 
  });

  // Cart states
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Cart helpers
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Auth functions
  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await apiRegister(formData);
      showNotification('Registration successful! Please check your email for verification code.', 'success');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      showNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

 // In AppContext.js - Update verifyUserEmail function
const verifyUserEmail = async (email, code) => {
  setLoading(true);
  try {
    console.log('🔄 Verifying email in context:', email);
    
    const res = await verifyEmail({ email, code });
    const { token, user: userData } = res.data.data;
    
    console.log('✅ Verification response:', userData);
    
    // Force update both localStorage and state
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Use functional update to ensure state is set
    setUser(prevUser => {
      console.log('🔄 Previous user:', prevUser);
      console.log('🔄 New user data:', userData);
      return userData;
    });
    
    // Double check the state was updated
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      console.log('✅ Final user state check:', currentUser);
    }, 100);
    
    showNotification('Email verified successfully! Welcome to Rerendet Coffee!', 'success');
    return userData;
    
  } catch (err) {
    console.error('❌ Verification failed in context:', err);
    const errorMessage = err.response?.data?.message || 'Verification failed';
    showNotification(errorMessage, 'error');
    throw err;
  } finally {
    setLoading(false);
  }
};
  const login = async (formData) => {
    setLoading(true);
    try {
      const res = await apiLogin(formData);
      const { token, user: userData } = res.data.data;
      
      console.log('🔑 Login successful, updating user state:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      showNotification(`Welcome back, ${userData.firstName}!`, 'success');
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      showNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser) => {
    setLoading(true);
    try {
      console.log('🔐 Attempting Google login for:', googleUser.email);
      
      const res = await apiGoogleAuth(googleUser);
      const { token, user: userData } = res.data.data;
      
      console.log('✅ Google login API response:', userData);
      
      // CRITICAL: Update both localStorage and state
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Force state update
      setUser(userData);
      
      console.log('✅ User state updated after Google login:', userData);
      console.log('✅ User first name:', userData.firstName);
      
      showNotification(`Welcome ${userData.firstName}! Google login successful!`, 'success');
      return userData;
      
    } catch (err) {
      console.error('❌ Google login failed:', err);
      const errorMessage = err.response?.data?.message || 'Google login failed';
      showNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      showNotification('Logged out successfully', 'info');
    }
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🔍 App started with user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Debug: Log when user state changes
  useEffect(() => {
    console.log('🎯 AppContext: User state changed!', user);
    console.log('🎯 User first name:', user?.firstName);
    console.log('🎯 User is logged in:', !!user);
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', isVisible: false });
    }, 5000);
  };

  return (
    <AppContext.Provider value={{
      // Auth
      user,
      loading,
      signup,
      login,
      logout,
      verifyUserEmail,
      loginWithGoogle,
      
      // Notification
      notification,
      showNotification,
      
      // Cart
      cart,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      isCartOpen,
      setIsCartOpen,
      mobileMenuOpen,
      setMobileMenuOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};