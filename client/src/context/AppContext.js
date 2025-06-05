// src/context/AppContext.js
import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Cart State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Checkout State
  const [isGuest, setIsGuest] = useState(true);
  
  // Notification State
  const [notification, setNotification] = useState({
    message: '',
    type: '',
    isVisible: false
  });
  
  // User State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Calculate cart totals
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsBackToTopVisible(window.scrollY > 500);
      
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart functions
  const addToCart = (item) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    showNotification(`${item.name} added to cart`);
    setIsCartOpen(true);
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + change) } 
        : item
    ));
  };

  const removeFromCart = (id) => {
    const item = cart.find(item => item.id === id);
    setCart(cart.filter(item => item.id !== id));
    showNotification(`${item.name} removed from cart`);
  };

  const clearCart = () => {
    setCart([]);
  };

  // Notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification({ ...notification, isVisible: false }), 3000);
  };

  // User functions
  const login = (userData) => {
    setUser(userData);
    setIsGuest(false);
    showNotification(`Welcome back, ${userData.name}!`);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(true);
    showNotification('You have been logged out');
  };

  // Payment processing functions
  const processMpesaPayment = async (phoneNumber) => {
    try {
      showNotification('Sending M-Pesa request...', 'info');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate phone number
      if (!phoneNumber.startsWith('+254') || phoneNumber.length < 12) {
        throw new Error('Please enter a valid Kenyan phone number starting with +254');
      }
      
      showNotification('M-Pesa payment request sent! Check your phone', 'success');
      return true;
    } catch (error) {
      showNotification(error.message || 'M-Pesa payment failed', 'error');
      throw error;
    }
  };

  const processCardPayment = async (cardDetails) => {
    try {
      showNotification('Processing card payment...', 'info');
      
      // Validate card details
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        throw new Error('Please fill all card details');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Card payment processed successfully!', 'success');
      return true;
    } catch (error) {
      showNotification(error.message || 'Card payment failed', 'error');
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      // State values
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      isMpesaModalOpen,
      isCardModalOpen,
      isBackToTopVisible,
      mobileMenuOpen,
      notification,
      user,
      isGuest,
      
      // Setter functions
      setIsCartOpen,
      setIsMpesaModalOpen,
      setIsCardModalOpen,
      setMobileMenuOpen,
      setIsGuest,
      
      // Action functions
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      showNotification,
      login,
      logout,
      processMpesaPayment,
      processCardPayment
    }}>
      {children}
    </AppContext.Provider>
  );
};