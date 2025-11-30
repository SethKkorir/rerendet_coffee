import React, { createContext, useCallback, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ 
    isVisible: false, 
    message: '', 
    type: 'info' 
  });
  
  const [cart, setCartState] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==================== AUTHENTICATION METHODS ====================

  // Clear authentication function
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setUserType(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth');
    console.log('🔓 Auth cleared');
  }, []);

  // Set authentication
  const setAuth = useCallback((userData, authToken, type) => {
    setUser(userData);
    setToken(authToken);
    setUserType(type);
    
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
    
    localStorage.setItem('auth', JSON.stringify({
      user: userData,
      token: authToken,
      userType: type
    }));

    console.log('🔐 Auth set:', userData.email, 'Type:', type);
  }, []);

  // Validate JWT token
  const validateToken = useCallback((token) => {
    if (!token) return false;
    
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Invalid token structure');
        return false;
      }
      
      // Check if token is expired
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

  // ==================== ALERT/NOTIFICATION METHODS ====================

  const showAlert = useCallback((message, type = 'info') => {
    setAlert({ isVisible: true, message, type });
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    showAlert(message, type);
  }, [showAlert]);

  const hideAlert = useCallback(() => {
    setAlert({ isVisible: false, message: '', type: 'info' });
  }, []);

  // ==================== CART METHODS ====================

  // Add to cart with size selection
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

    // NEW LOGIC: Handle both product structures
    let itemPrice = product.price; // Use the price that's already set on the product
    let finalSize = selectedSize || product.size || product.selectedSize || '250g';
    
    // If the product has a sizes array, use it to validate the price
    if (product.sizes && product.sizes.length > 0) {
      const selectedSizeData = product.sizes.find(size => size.size === finalSize);
      if (selectedSizeData) {
        itemPrice = selectedSizeData.price;
      } else {
        // Fallback to first size if selected size not found
        itemPrice = product.sizes[0].price;
        finalSize = product.sizes[0].size;
      }
    }
    
    // If no price found, use a default
    if (!itemPrice || itemPrice <= 0) {
      console.warn('⚠️ No valid price found for product, using default');
      itemPrice = 1000; // Default price
    }

    // Check if item with same product ID and size already exists in cart
    const existingItemIndex = prevCart.findIndex(item => 
      item._id === productId.toString() && item.size === finalSize
    );
    
    if (existingItemIndex > -1) {
      // Update existing item with same product ID and size
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
      // Add new item with size information
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
  showAlert(`Added ${quantity} ${product.name}${sizeText} to cart`, 'success');
}, [showAlert]);
  // Remove from cart
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
    showAlert('Product removed from cart', 'info');
  }, [showAlert]);

  // Update cart quantity
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

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartState([]);
    console.log('🛒 Cart cleared');
    showAlert('Cart cleared', 'info');
  }, [showAlert]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Get cart count for Navbar
  const cartCount = getCartItemCount();

  // ==================== UI METHODS ====================

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  // Mobile menu methods
  const setMobileMenuOpenState = useCallback((isOpen) => {
    setMobileMenuOpen(isOpen);
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, []);

  // ==================== AUTH API METHODS ====================

  // Customer login - USED BY NAVBAR
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/customer/login', credentials);
      const { user: userData, token: authToken } = response.data.data;
      
      if (!validateToken(authToken)) {
        throw new Error('Invalid token received from server');
      }
      
      setAuth(userData, authToken, 'customer');
      showAlert('Login successful! Welcome back!', 'success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, showAlert, validateToken]);

  // Admin login - USED BY ADMIN LOGIN PAGE ONLY
  const loginAdmin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/admin/login', credentials);
      const { user: userData, token: authToken } = response.data.data;
      
      if (!validateToken(authToken)) {
        throw new Error('Invalid token received from server');
      }
      
      setAuth(userData, authToken, 'admin');
      showAlert(`Admin login successful! Welcome ${userData.role === 'super-admin' ? 'Super Admin' : 'Admin'}!`, 'success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Admin login failed';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, showAlert, validateToken]);

  // Customer registration - NAVBAR SIGNUP
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      // Force customer type for navbar registration
      const customerData = { ...userData, userType: 'customer' };
      const response = await axios.post('/api/auth/customer/register', customerData);
      showAlert('Registration successful! Please check your email for verification.', 'success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Google login
  const loginWithGoogle = useCallback(async (googleUser) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/google', googleUser);
      const { user: userData, token: authToken } = response.data.data;
      
      if (!validateToken(authToken)) {
        throw new Error('Invalid token received from server');
      }
      
      setAuth(userData, authToken, 'customer');
      showAlert('Google login successful! Welcome!', 'success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Google login failed';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, showAlert, validateToken]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
      setCartState([]);
      showAlert('Logged out successfully', 'info');
    }
  }, [clearAuth, showAlert]);

  // Verify email
  const verifyUserEmail = useCallback(async (email, code) => {
    return verifyEmail({ email, code });
  }, []);

  const verifyEmail = useCallback(async (payload) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-email', payload);
      const { user: userData, token: authToken } = response.data.data;
      
      if (!validateToken(authToken)) {
        throw new Error('Invalid token received from server');
      }
      
      setAuth(userData, authToken, userData.userType);
      showAlert('Email verified successfully!', 'success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuth, showAlert, validateToken]);

  // Resend verification
  const resendVerificationCode = useCallback(async (email) => {
    return resendVerification(email);
  }, []);

  const resendVerification = useCallback(async (email) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      showAlert('Verification code sent to your email', 'info');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification code';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      if (response.data.success) {
        setUser(prevUser => ({ ...prevUser, ...response.data.data }));
        showAlert('Profile updated successfully', 'success');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      showAlert(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // ==================== AUTH INITIALIZATION & INTERCEPTORS ====================

  // Add axios response interceptor for token errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🛡️ Auto-logout due to 401 error - token invalid');
          clearAuth();
          showAlert('Your session has expired. Please log in again.', 'error');
          
          // Redirect to login if on admin page
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [clearAuth, showAlert]);

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
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            
            // Verify token is still valid by fetching user profile
            try {
              const response = await axios.get('/api/auth/me');
              if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                const actualUserType = userData.userType || storedUserType;
                setUserType(actualUserType);
                console.log('✅ Auth restored from API:', userData.email, 'Type:', actualUserType, 'Role:', userData.role);
                
                // Update localStorage with fresh data from API
                localStorage.setItem('auth', JSON.stringify({
                  user: userData,
                  token: storedToken,
                  userType: actualUserType
                }));
              }
            } catch (error) {
              console.error('❌ Token validation failed - clearing corrupted token:', error.message);
              // AUTO-CLEAR corrupted/invalid tokens
              clearAuth();
              if (error.response?.status === 401 || error.message?.includes('token')) {
                showAlert('Your session has expired. Please log in again.', 'info');
              }
            }
          } else {
            console.log('❌ Invalid or expired token found in storage - clearing');
            clearAuth();
          }
        }

        // Initialize cart from localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
              setCartState(parsedCart);
              console.log('🛒 Cart restored from localStorage:', parsedCart.length, 'items');
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
  }, [clearAuth, showAlert, validateToken]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ==================== ROLE & PERMISSION CHECKS ====================

  const isAdmin = userType === 'admin';
  const isSuperAdmin = user?.role === 'super-admin';
  const isCustomer = userType === 'customer';
  const isAuthenticated = !!user && !!token;

  // Admin permission checks
  const canManageUsers = isSuperAdmin || user?.permissions?.canManageUsers;
  const canManageProducts = isAdmin || user?.permissions?.canManageProducts;
  const canManageOrders = isAdmin || user?.permissions?.canManageOrders;
  const canManageContent = isAdmin || user?.permissions?.canManageContent;

  // ==================== CONTEXT VALUE ====================

  const contextValue = useMemo(() => ({
    // Auth state
    user,
    token,
    userType,
    loading,
    isAuthenticated,
    
    // Role checks
    isAdmin,
    isSuperAdmin,
    isCustomer,
    
    // Admin permissions
    canManageUsers,
    canManageProducts,
    canManageOrders,
    canManageContent,
    
    // Auth methods
    login,
    loginAdmin,
    loginWithGoogle,
    register,
    logout,
    verifyEmail,
    verifyUserEmail,
    updateProfile,
    resendVerification,
    resendVerificationCode,
    clearAuth,
    
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
    
    // Alert/Notification methods
    alert,
    showAlert,
    showNotification,
    hideAlert
  }), [
    user, token, userType, loading, isAuthenticated, isAdmin, isSuperAdmin, isCustomer,
    canManageUsers, canManageProducts, canManageOrders, canManageContent,
    cart, isCartOpen, cartCount, mobileMenuOpen, alert,
    login, loginAdmin, loginWithGoogle, register, logout, verifyEmail, 
    verifyUserEmail, updateProfile, resendVerification, resendVerificationCode, clearAuth,
    addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartItemCount,
    openCart, closeCart, toggleCart, setMobileMenuOpenState,
    showAlert, showNotification, hideAlert
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}