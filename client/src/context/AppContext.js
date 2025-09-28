import { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, verifyEmail, register as apiRegister } from '../api/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Cart state
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
  // User state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isGuest, setIsGuest] = useState(!user);

  // UI states
  const [notification, setNotification] = useState({ message: '', type: '', isVisible: false });

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification({ message: '', type: '', isVisible: false }), 3000);
  };

  // Auth functions
  const registerUser = async (formData) => {
    try {
      const res = await apiRegister(formData);
      showNotification(res.data.message, 'success');
      return res.data.data;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const verifyUserEmail = async (email, code) => {
    try {
      const res = await verifyEmail({ email, code });
      const userData = res.data.data;
      localStorage.setItem('token', userData.token);
      setUser(userData);
      setIsGuest(false);
      showNotification(res.data.message, 'success');
      return userData;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Verification failed', 'error');
      throw err;
    }
  };

  const loginUser = async (formData) => {
    try {
      const res = await apiLogin(formData);
      const userData = res.data.data;
      localStorage.setItem('token', userData.token);
      setUser(userData);
      setIsGuest(false);
      showNotification(res.data.message, 'success');
      return userData;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Login failed', 'error');
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    localStorage.removeItem('token');
    setIsGuest(true);
    showNotification('You have been logged out', 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      isGuest,
      notification,
      registerUser,
      verifyUserEmail,
      loginUser,
      logoutUser,
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
