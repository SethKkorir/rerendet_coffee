// context/AppContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  verifyEmail, 
  register as apiRegister,
  googleAuth as apiGoogleAuth,
  resendVerificationCode as apiResendVerificationCode,
  checkEmail as apiCheckEmail,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  updateUserProfile as apiUpdateUserProfile,
  getUserProfile as apiGetUserProfile
} from '../api/api';

// Import cart API functions
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveCartItem,
  clearCart as apiClearCart,
  getCartSummary as apiGetCartSummary,
  mergeCarts as apiMergeCarts
} from '../api/cartApi';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return savedUser && token ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing saved user:', error);
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [alert, setAlert] = useState({ 
    message: '', 
    type: '', 
    isVisible: false 
  });

  // Cart states
  const [cart, setCart] = useState({
    items: [],
    itemsCount: 0,
    totalPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    finalPrice: 0,
    currency: 'KES'
  });
  
  const [cartSummary, setCartSummary] = useState({
    itemsCount: 0,
    totalPrice: 0,
    uniqueItemsCount: 0
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // ==================== ALERT SYSTEM ====================
  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ message, type, isVisible: true });
    setTimeout(() => {
      setAlert({ message: '', type: '', isVisible: false });
    }, 5000);
  }, []);

  // Alias for compatibility with components
  const showNotification = useCallback((message, type = 'success') => {
    showAlert(message, type);
  }, [showAlert]);

  // ==================== AUTHENTICATION MANAGEMENT ====================
  
  // Check if email exists
  const checkEmailExists = async (email) => {
    try {
      const response = await apiCheckEmail(email);
      return response.data.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  // Register user
  const register = async (formData) => {
    setAuthLoading(true);
    try {
      const res = await apiRegister(formData);
      showAlert('Registration successful! Please check your email for verification code.', 'success');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async (email) => {
    setAuthLoading(true);
    try {
      const res = await apiResendVerificationCode({ email });
      showAlert('Verification code sent to your email!', 'success');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send verification code';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify email
  const verifyUserEmail = async (email, code) => {
    setAuthLoading(true);
    try {
      const res = await verifyEmail({ email, code });
      const { token, user: userData } = res.data.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Merge guest cart after verification
      setTimeout(() => {
        mergeCarts();
      }, 1000);
      
      showAlert('Email verified successfully! Welcome to Rerendet Coffee!', 'success');
      return userData;
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Login user
  const login = async (formData) => {
    setAuthLoading(true);
    try {
      const res = await apiLogin(formData);
      const { token, user: userData } = res.data.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Merge guest cart after login
      setTimeout(() => {
        mergeCarts();
      }, 1000);
      
      showAlert(`Welcome back, ${userData.firstName}!`, 'success');
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Google OAuth login
  const loginWithGoogle = async (googleUser) => {
    setAuthLoading(true);
    try {
      const res = await apiGoogleAuth(googleUser);
      const { token, user: userData } = res.data.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Merge guest cart after Google login
      setTimeout(() => {
        mergeCarts();
      }, 1000);
      
      showAlert(`Welcome ${userData.firstName}! Google login successful!`, 'success');
      return userData;
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google login failed';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setAuthLoading(true);
    try {
      const res = await apiForgotPassword({ email });
      showAlert('Password reset code sent to your email!', 'success');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset code';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email, code, newPassword) => {
    setAuthLoading(true);
    try {
      const res = await apiResetPassword({ email, code, newPassword });
      showAlert('Password reset successfully! You can now login with your new password.', 'success');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    setLoading(true);
    try {
      const res = await apiGetUserProfile();
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load profile';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await apiUpdateUserProfile(profileData);
      const updatedUser = { ...user, ...res.data.data };
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      showAlert('Profile updated successfully!', 'success');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      showAlert(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('guestCart');
      
      // Reset all states
      setUser(null);
      setCart({
        items: [],
        itemsCount: 0,
        totalPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        finalPrice: 0,
        currency: 'KES'
      });
      setCartSummary({
        itemsCount: 0,
        totalPrice: 0,
        uniqueItemsCount: 0
      });
      
      showAlert('Logged out successfully', 'info');
    }
  };

  // Check authentication status
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
    }
    return false;
  }, []);

  // ==================== CART MANAGEMENT ====================
  
  // Load cart when user changes
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      // Load guest cart from localStorage
      try {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          const parsedCart = JSON.parse(guestCart);
          setCart(parsedCart);
          updateCartSummary(parsedCart);
        }
      } catch (error) {
        console.error('Error loading guest cart:', error);
        // Initialize with empty cart
        setCart({
          items: [],
          itemsCount: 0,
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          finalPrice: 0,
          currency: 'KES'
        });
      }
    }
  }, [user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user && cart) {
      try {
        localStorage.setItem('guestCart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving guest cart:', error);
      }
    }
  }, [cart, user]);

  // Load cart from backend
  const loadCart = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await apiGetCart();
      if (response.data.success) {
        setCart(response.data.data);
        updateCartSummary(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Don't show alert for initial load failures
    }
  }, [user]);

  // Update cart summary
  const updateCartSummary = useCallback((cartData) => {
    if (!cartData) return;
    
    setCartSummary({
      itemsCount: cartData.itemsCount || 0,
      totalPrice: cartData.totalPrice || 0,
      uniqueItemsCount: cartData.items?.length || 0
    });
  }, []);

  // Add to cart - unified function for both guest and logged-in users
  const addToCart = async (product, quantity = 1) => {
    try {
      setCartLoading(true);

      if (user) {
        // Logged-in user: use backend
        try {
          const response = await apiAddToCart({
            productId: product._id,
            quantity: quantity
          });

          if (response.data.success) {
            setCart(response.data.data);
            updateCartSummary(response.data.data);
            showAlert(`${product.name} added to cart!`, 'success');
            return response.data.data;
          }
        } catch (backendError) {
          console.error('Backend cart failed:', backendError);
          // Fall through to frontend cart
        }
      }

      // Guest user or backend failed: use frontend cart
      setCart(prevCart => {
        const existingCart = prevCart || { 
          items: [], 
          itemsCount: 0, 
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          finalPrice: 0,
          currency: 'KES'
        };

        const existingItemIndex = existingCart.items.findIndex(
          item => item._id === product._id
        );

        let newItems;
        if (existingItemIndex > -1) {
          // Update existing item
          newItems = existingCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: (item.quantity || 0) + quantity }
              : item
          );
        } else {
          // Add new item
          newItems = [
            ...existingCart.items,
            {
              _id: product._id,
              name: product.name,
              image: product.images?.[0]?.url || product.image || '',
              price: product.price || 0,
              quantity: quantity,
              addedAt: new Date().toISOString()
            }
          ];
        }

        // Calculate totals
        const subtotal = newItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        const shippingPrice = subtotal >= 5000 ? 0 : 500;
        const taxPrice = Math.round(subtotal * 0.16);
        const finalPrice = subtotal + shippingPrice + taxPrice;

        const newCart = {
          ...existingCart,
          items: newItems,
          itemsCount: newItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
          totalPrice: finalPrice,
          shippingPrice: shippingPrice,
          taxPrice: taxPrice,
          finalPrice: finalPrice
        };

        showAlert(`${product.name} added to cart!`, 'success');
        return newCart;
      });

    } catch (error) {
      console.error('Add to cart error:', error);
      showAlert('Failed to add item to cart', 'error');
      throw error;
    } finally {
      setCartLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, change) => {
    try {
      setCartLoading(true);

      if (user) {
        try {
          const item = cart?.items?.find(item => item._id === itemId);
          if (!item) return;

          const newQuantity = (item.quantity || 0) + change;
          if (newQuantity < 1) {
            await removeFromCart(itemId);
            return;
          }

          const response = await apiUpdateCartItem(itemId, { quantity: newQuantity });
          if (response.data.success) {
            setCart(response.data.data);
            updateCartSummary(response.data.data);
          }
          return;
        } catch (backendError) {
          console.error('Backend update failed:', backendError);
        }
      }

      // Frontend update
      setCart(prevCart => {
        const newItems = prevCart.items.map(item =>
          item._id === itemId 
            ? { ...item, quantity: Math.max(1, (item.quantity || 0) + change) }
            : item
        );

        const subtotal = newItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        const shippingPrice = subtotal >= 5000 ? 0 : 500;
        const taxPrice = Math.round(subtotal * 0.16);
        const finalPrice = subtotal + shippingPrice + taxPrice;

        return {
          ...prevCart,
          items: newItems,
          itemsCount: newItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
          totalPrice: finalPrice,
          shippingPrice: shippingPrice,
          taxPrice: taxPrice,
          finalPrice: finalPrice
        };
      });

    } catch (error) {
      console.error('Update quantity error:', error);
      showAlert('Failed to update quantity', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    try {
      setCartLoading(true);

      if (user) {
        try {
          const response = await apiRemoveCartItem(itemId);
          if (response.data.success) {
            setCart(response.data.data);
            updateCartSummary(response.data.data);
            showAlert('Item removed from cart', 'success');
            return;
          }
        } catch (backendError) {
          console.error('Backend remove failed:', backendError);
        }
      }

      // Frontend remove
      setCart(prevCart => {
        const newItems = prevCart.items.filter(item => item._id !== itemId);
        
        const subtotal = newItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
        const shippingPrice = subtotal >= 5000 ? 0 : 500;
        const taxPrice = Math.round(subtotal * 0.16);
        const finalPrice = subtotal + shippingPrice + taxPrice;

        const newCart = {
          ...prevCart,
          items: newItems,
          itemsCount: newItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
          totalPrice: finalPrice,
          shippingPrice: shippingPrice,
          taxPrice: taxPrice,
          finalPrice: finalPrice
        };

        showAlert('Item removed from cart', 'success');
        return newCart;
      });

    } catch (error) {
      console.error('Remove from cart error:', error);
      showAlert('Failed to remove item', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setCartLoading(true);

      if (user) {
        try {
          const response = await apiClearCart();
          if (response.data.success) {
            setCart(response.data.data);
            updateCartSummary(response.data.data);
            showAlert('Cart cleared', 'success');
            return;
          }
        } catch (backendError) {
          console.error('Backend clear failed:', backendError);
        }
      }

      // Frontend clear
      setCart({
        items: [],
        itemsCount: 0,
        totalPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        finalPrice: 0,
        currency: 'KES'
      });
      showAlert('Cart cleared', 'success');

    } catch (error) {
      console.error('Clear cart error:', error);
      showAlert('Failed to clear cart', 'error');
    } finally {
      setCartLoading(false);
    }
  };

  // Merge guest cart after login
  const mergeCarts = async () => {
    try {
      const guestCart = localStorage.getItem('guestCart');
      if (!guestCart || !user) return;

      const guestCartData = JSON.parse(guestCart);
      if (!guestCartData.items || guestCartData.items.length === 0) return;

      const response = await apiMergeCarts({ guestCart: guestCartData });
      if (response.data.success) {
        setCart(response.data.data);
        updateCartSummary(response.data.data);
        localStorage.removeItem('guestCart');
        showAlert('Your cart items have been saved!', 'success');
      }
    } catch (error) {
      console.error('Merge carts failed:', error);
      // Silent fail - user can still manually add items
    }
  };

  // Get cart summary
  const getCartSummary = useCallback(async () => {
    if (user) {
      try {
        const response = await apiGetCartSummary();
        if (response.data.success) {
          setCartSummary(response.data.data);
        }
      } catch (error) {
        console.error('Failed to get cart summary:', error);
      }
    }
  }, [user]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      getCartSummary();
    }
  }, [user, getCartSummary]);

  // Calculate cart count for Navbar
  const cartCount = cartSummary.itemsCount || cart.itemsCount || 0;

  return (
    <AppContext.Provider value={{
      // Auth State
      user,
      setUser,
      loading: loading || authLoading,
      authLoading,
      
      // Authentication Methods
      register,
      login,
      logout,
      verifyUserEmail,
      loginWithGoogle,
      resendVerificationCode,
      checkEmailExists,
      forgotPassword,
      resetPassword,
      getUserProfile,
      updateUserProfile,
      checkAuth,
      
      // Alert System
      alert,
      showAlert,
      showNotification,
      
      // Cart State
      cart,
      cartSummary,
      cartCount, // For Navbar compatibility
      cartLoading,
      isCartOpen,
      setIsCartOpen,
      mobileMenuOpen,
      setMobileMenuOpen,
      
      // Cart Methods
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      loadCart,
      getCartSummary
    }}>
      {children}
    </AppContext.Provider>
  );
};