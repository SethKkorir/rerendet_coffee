// context/AppContext.js - COMPLETE REWRITTEN VERSION
import React, { createContext, useCallback, useEffect, useState, useMemo } from 'react';
import API, { 
  login as apiLogin, 
  loginAdmin as apiLoginAdmin, 
  getCurrentUser,
  getDashboardStats,
  getSalesAnalytics,
  getAdminUsers,
  getAdminOrders,
  getAdminProducts
} from '../api/api';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Notification system
  const [notifications, setNotifications] = useState([]);
  
  // Alert system (for backward compatibility)
  const [alert, setAlert] = useState({ 
    isVisible: false, 
    message: '', 
    type: 'info' 
  });
  
  const [cart, setCartState] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==================== NOTIFICATION SYSTEM ====================

  // Add a new notification
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Success notification
  const showSuccess = useCallback((message, duration = 5000) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  // Error notification
  const showError = useCallback((message, duration = 5000) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  // Warning notification
  const showWarning = useCallback((message, duration = 5000) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  // Info notification
  const showInfo = useCallback((message, duration = 5000) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  // ==================== ALERT SYSTEM (Backward Compatibility) ====================

  const showAlert = useCallback((message, type = 'info') => {
    // Also add as notification for the new system
    addNotification(message, type);
    
    // Keep old alert system for components that still use it
    setAlert({ isVisible: true, message, type });
  }, [addNotification]);

  const hideAlert = useCallback(() => {
    setAlert({ isVisible: false, message: '', type: 'info' });
  }, []);

  // Alias for backward compatibility
  const showNotification = showAlert;

  // ==================== AUTHENTICATION METHODS ====================

  // Clear authentication function
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem('auth');
    console.log('🔓 Auth cleared completely');
  }, []);

  // Set authentication
  const setAuth = useCallback((userData, authToken, type) => {
    if (!authToken || !userData) {
      console.error('❌ Invalid auth data provided');
      return;
    }

    setUser(userData);
    setToken(authToken);
    setUserType(type);
    
    // Store in localStorage
    localStorage.setItem('auth', JSON.stringify({
      user: userData,
      token: authToken,
      userType: type
    }));

    console.log('🔐 Auth set for:', userData.email, 'Type:', type);
  }, []);

  // Validate JWT token
  const validateToken = useCallback((token) => {
    if (!token) {
      console.error('❌ No token provided for validation');
      return false;
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Invalid token structure');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.error('❌ Token expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error.message);
      return false;
    }
  }, []);

  // ==================== CART METHODS ====================

  const addToCart = useCallback((product, quantity = 1, selectedSize = null) => {
    setCartState(prevCart => {
      const productId = product._id;
      
      if (!productId) {
        console.error('❌ Cannot add product to cart: Missing _id');
        return prevCart;
      }

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(productId.toString())) {
        console.error('❌ Invalid product ID format:', productId);
        return prevCart;
      }

      let itemPrice = product.price;
      let finalSize = selectedSize || product.size || product.selectedSize || '250g';
      
      if (product.sizes && product.sizes.length > 0) {
        const selectedSizeData = product.sizes.find(size => size.size === finalSize);
        if (selectedSizeData) {
          itemPrice = selectedSizeData.price;
        } else {
          itemPrice = product.sizes[0].price;
          finalSize = product.sizes[0].size;
        }
      }
      
      if (!itemPrice || itemPrice <= 0) {
        console.warn('⚠️ No valid price found for product, using default');
        itemPrice = 1000;
      }

      const existingItemIndex = prevCart.findIndex(item => 
        item._id === productId.toString() && item.size === finalSize
      );
      
      if (existingItemIndex > -1) {
        return prevCart.map((item, index) =>
          index === existingItemIndex
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                itemTotal: (item.quantity + quantity) * item.price
              }
            : item
        );
      } else {
        const cartItem = {
          _id: productId.toString(),
          productId: productId.toString(),
          name: product.name,
          price: itemPrice,
          quantity: quantity,
          size: finalSize,
          itemTotal: itemPrice * quantity,
          images: product.images || [],
          category: product.category,
          roastLevel: product.roastLevel,
          origin: product.origin,
          flavorNotes: product.flavorNotes,
          badge: product.badge
        };
        
        console.log('🛒 Adding to cart:', cartItem);
        return [...prevCart, cartItem];
      }
    });
    
    const sizeText = selectedSize ? ` (${selectedSize})` : '';
    showSuccess(`Added ${quantity} ${product.name}${sizeText} to cart`);
  }, [showSuccess]);

  const removeFromCart = useCallback((productId, size = null) => {
    setCartState(prevCart => {
      const updatedCart = prevCart.filter(item => {
        if (size) {
          return !(item._id === productId && item.size === size);
        } else {
          return item._id !== productId;
        }
      });
      
      console.log('🗑️ Removed from cart:', productId, size);
      return updatedCart;
    });
    showInfo('Product removed from cart');
  }, [showInfo]);

  const updateCartQuantity = useCallback((productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    
    setCartState(prevCart =>
      prevCart.map(item => {
        if (size) {
          return (item._id === productId && item.size === size) 
            ? { ...item, quantity } 
            : item;
        } else {
          return (item._id === productId) 
            ? { ...item, quantity } 
            : item;
        }
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartState([]);
    console.log('🛒 Cart cleared');
    showInfo('Cart cleared');
  }, [showInfo]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const cartCount = getCartItemCount();

  // ==================== UI METHODS ====================

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  const setMobileMenuOpenState = useCallback((isOpen) => {
    setMobileMenuOpen(isOpen);
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, []);

  // ==================== AUTH API METHODS ====================

  // Customer login
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await apiLogin(credentials);
      const { user: userData, token: authToken } = response.data.data;
      
      if (!validateToken(authToken)) {
        throw new Error('Invalid token received from server');
      }
      
      setAuth(userData, authToken, 'customer');
      showSuccess('Login successful! Welcome back!');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      showError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, validateToken, showSuccess, showError]);

  // Admin login
  const loginAdmin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await apiLoginAdmin(credentials);
      const { user: userData, token: authToken } = response.data.data;
      
      if (!validateToken(authToken)) {
        throw new Error('Invalid token received from server');
      }
      
      setAuth(userData, authToken, 'admin');
      showSuccess(`Admin login successful! Welcome ${userData.role === 'super-admin' ? 'Super Admin' : 'Admin'}!`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Admin login failed';
      showError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, validateToken, showSuccess, showError]);

  // Customer registration
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const customerData = { ...userData, userType: 'customer' };
      const response = await API.post('/auth/customer/register', customerData);
      showSuccess('Registration successful! Please check your email for verification.');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      showError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
      setCartState([]);
      showInfo('Logged out successfully');
    }
  }, [clearAuth, showInfo]);

  // ==================== ADMIN DATA FETCHING METHODS ====================

  const fetchDashboardStats = useCallback(async (timeframe = '30d') => {
    try {
      const response = await getDashboardStats({ timeframe });
      return response.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      showError('Failed to fetch dashboard statistics');
      throw error;
    }
  }, [showError]);

  const fetchSalesAnalytics = useCallback(async (period = '30d') => {
    try {
      const response = await getSalesAnalytics({ period });
      return response.data;
    } catch (error) {
      console.error('Sales analytics error:', error);
      showError('Failed to fetch sales analytics');
      throw error;
    }
  }, [showError]);

  const fetchAdminUsers = useCallback(async (params = {}) => {
    try {
      const response = await getAdminUsers(params);
      return response.data;
    } catch (error) {
      console.error('Admin users fetch error:', error);
      showError('Failed to fetch users');
      throw error;
    }
  }, [showError]);

  const fetchAdminOrders = useCallback(async (params = {}) => {
    try {
      const response = await getAdminOrders(params);
      return response.data;
    } catch (error) {
      console.error('Admin orders fetch error:', error);
      showError('Failed to fetch orders');
      throw error;
    }
  }, [showError]);

  const fetchAdminProducts = useCallback(async (params = {}) => {
    try {
      const response = await getAdminProducts(params);
      return response.data;
    } catch (error) {
      console.error('Admin products fetch error:', error);
      showError('Failed to fetch products');
      throw error;
    }
  }, [showError]);

  // ==================== AUTH INITIALIZATION ====================

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
          const { user: storedUser, token: storedToken, userType: storedUserType } = JSON.parse(storedAuth);
          
          if (storedToken && validateToken(storedToken)) {
            console.log('🔄 Found valid token in storage, verifying with server...');
            
            setToken(storedToken);
            
            try {
              const response = await getCurrentUser();
              if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                const actualUserType = userData.userType || storedUserType;
                setUserType(actualUserType);
                console.log('✅ Auth restored from API:', userData.email, 'Type:', actualUserType);
                
                localStorage.setItem('auth', JSON.stringify({
                  user: userData,
                  token: storedToken,
                  userType: actualUserType
                }));
              }
            } catch (error) {
              console.error('❌ Token validation failed - clearing:', error.message);
              clearAuth();
              if (error.response?.status === 401) {
                showInfo('Your session has expired. Please log in again.');
              }
            }
          } else {
            console.log('❌ Invalid token found - clearing');
            clearAuth();
          }
        }

        // Initialize cart
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
              setCartState(parsedCart);
              console.log('🛒 Cart restored:', parsedCart.length, 'items');
            }
          } catch (error) {
            console.error('Failed to parse cart:', error);
            setCartState([]);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      }
    };

    initializeAuth();
  }, [clearAuth, validateToken]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ==================== ROLE CHECKS ====================

  const isAdmin = userType === 'admin';
  const isSuperAdmin = user?.role === 'super-admin';
  const isCustomer = userType === 'customer';
  const isAuthenticated = !!user && !!token;

  // ==================== CONTEXT VALUE ====================

  const contextValue = useMemo(() => ({
    // Auth state
    user,
    token,
    userType,
    loading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isCustomer,
    
    // Notification system
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Alert system (backward compatibility)
    alert,
    showAlert,
    hideAlert,
    showNotification, // Alias for backward compatibility
    
    // Auth methods
    login,
    loginAdmin,
    register,
    logout,
    clearAuth,
    
    // Admin data methods
    fetchDashboardStats,
    fetchSalesAnalytics,
    fetchAdminUsers,
    fetchAdminOrders,
    fetchAdminProducts,
    
    // Cart state
    cart,
    isCartOpen,
    cartCount,
    mobileMenuOpen,
    
    // Cart methods
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    
    // UI methods
    openCart,
    closeCart,
    toggleCart,
    setIsCartOpen,
    setMobileMenuOpen: setMobileMenuOpenState,
  }), [
    user, token, userType, loading, isAuthenticated, isAdmin, isSuperAdmin, isCustomer,
    notifications, alert,
    cart, isCartOpen, cartCount, mobileMenuOpen,
    addNotification, removeNotification, clearNotifications, showSuccess, showError, showWarning, showInfo,
    showAlert, hideAlert,
    login, loginAdmin, register, logout, clearAuth,
    fetchDashboardStats, fetchSalesAnalytics, fetchAdminUsers, fetchAdminOrders, fetchAdminProducts,
    addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartItemCount,
    openCart, closeCart, toggleCart, setMobileMenuOpenState
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}