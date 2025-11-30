// components/Checkout/Checkout.jsx - COMPLETELY REWRITTEN WITH FIXES
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaLock, FaCreditCard, FaMoneyBillWave, FaPhone, FaTruck, FaUser } from 'react-icons/fa';
import './Checkout.css';

// Kenyan counties for shipping
const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
  'Garissa', 'Kakamega', 'Nyeri', 'Machakos', 'Meru', 'Lamu', 'Nanyuki', 'Naivasha',
  'Narok', 'Bungoma', 'Busia', 'Embu', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Muranga',
  'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
  'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

function Checkout() {
  const { 
    user, 
    cart = [], 
    showNotification, 
    clearCart,
    token,
    isAuthenticated
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '+254 ',
    address: '',
    county: '',
    city: '',
    country: 'Kenya',
    postalCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const [shippingCost, setShippingCost] = useState(0);
  const tax = subtotal * 0.16;
  const total = subtotal + shippingCost + tax;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Checkout Debug:', {
      isAuthenticated,
      token: token ? 'Present' : 'Missing',
      cartItems: cart.length,
      shippingInfo,
      paymentMethod
    });
  }, [isAuthenticated, token, cart, shippingInfo, paymentMethod]);

  // Calculate shipping when county changes
  useEffect(() => {
    if (shippingInfo.county) {
      calculateShipping();
    }
  }, [shippingInfo.county]);

  const calculateShipping = async () => {
    if (!shippingInfo.county) {
      setShippingCost(0);
      return;
    }
    
    setCalculatingShipping(true);
    try {
      // ✅ FIXED: Correct endpoint
      const response = await fetch('/api/orders/shipping-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          country: shippingInfo.country,
          county: shippingInfo.county
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setShippingCost(result.data.shippingCost);
        }
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      // Default shipping cost based on county
      const defaultCost = shippingInfo.county === 'Nairobi' ? 200 : 350;
      setShippingCost(defaultCost);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingInfo.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email?.trim()) newErrors.email = 'Email is required';
    if (!shippingInfo.phone?.trim() || shippingInfo.phone === '+254') newErrors.phone = 'Valid phone number is required';
    if (!shippingInfo.address?.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.county?.trim()) newErrors.county = 'County is required';
    if (!shippingInfo.city?.trim()) newErrors.city = 'City/Town is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingInfo.email && !emailRegex.test(shippingInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCartItems = () => {
    if (cart.length === 0) {
      throw new Error('Your cart is empty');
    }

    for (const item of cart) {
      const productId = item.productId || item._id;
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      
      if (!productId || !objectIdRegex.test(productId)) {
        throw new Error(`Invalid product: ${item.name}`);
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`Invalid quantity for: ${item.name}`);
      }
      if (!item.price || item.price < 0) {
        throw new Error(`Invalid price for: ${item.name}`);
      }
      if (!item.size) {
        throw new Error(`Size selection required for: ${item.name}`);
      }
    }
  };

  const prepareCartItems = () => {
    return cart.map(item => {
      const productId = item.productId || item._id;
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      
      if (!objectIdRegex.test(productId)) {
        throw new Error(`Invalid product ID for "${item.name}"`);
      }

      return {
        product: productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.images?.[0]?.url || '/default-product.jpg'
      };
    });
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showNotification('Please log in to place an order', 'error');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      validateCartItems();
    } catch (error) {
      showNotification(error.message, 'error');
      return;
    }

    setLoading(true);
    
    try {
      const preparedCartItems = prepareCartItems();
      
      const orderData = {
        shippingAddress: shippingInfo,
        paymentMethod: paymentMethod,
        items: preparedCartItems,
        subtotal: subtotal,
        shippingCost: shippingCost,
        totalAmount: total, // ✅ FIXED: Changed to totalAmount
        notes: '' // ✅ FIXED: Added notes field
      };

      console.log('📦 Sending order data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Order response:', result);

      if (result.success) {
        clearCart();
        showNotification('Order placed successfully!', 'success');
        
        // ✅ FIXED: Use result.data instead of result.order
        navigate(`/orders/${result.data._id}`, { 
          state: { order: result.data }
        });
        
      } else {
        throw new Error(result.message || 'Order failed');
      }
      
    } catch (error) {
      console.error('❌ Order error:', error);
      showNotification(error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showNotification('Please log in to checkout', 'info');
      navigate('/login');
    }
  }, [isAuthenticated, navigate, showNotification]);

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="empty-container">
          <h2>Your cart is empty</h2>
          <p>Add some delicious coffee to get started!</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/')}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-forms">
          <div className="form-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <h2>Shipping Information</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={shippingInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={shippingInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+254 712 345 678"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              
              <div className="form-group full-width">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={errors.address ? 'error' : ''}
                  placeholder="Street address, apartment, suite, etc."
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>County *</label>
                <select
                  value={shippingInfo.county}
                  onChange={(e) => handleInputChange('county', e.target.value)}
                  className={errors.county ? 'error' : ''}
                >
                  <option value="">Select County</option>
                  {KENYAN_COUNTIES.map((county, index) => (
                    // ✅ FIXED: Unique keys
                    <option key={`${county}-${index}`} value={county}>{county}</option>
                  ))}
                </select>
                {errors.county && <span className="error-message">{errors.county}</span>}
              </div>
              
              <div className="form-group">
                <label>City/Town *</label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'error' : ''}
                  placeholder="Nairobi"
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <select
                  value={shippingInfo.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <option value="Kenya">Kenya</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <FaLock className="section-icon" />
              <h2>Payment Method</h2>
            </div>
            
            <div className="payment-options">
              <div 
                className={`payment-option ${paymentMethod === 'mpesa' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <div className="payment-icon">
                  <FaPhone />
                </div>
                <div className="payment-info">
                  <h4>M-Pesa</h4>
                  <p>Pay securely with M-Pesa</p>
                </div>
                <div className="payment-radio">
                  <div className={`radio-dot ${paymentMethod === 'mpesa' ? 'active' : ''}`}></div>
                </div>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-icon">
                  <FaCreditCard />
                </div>
                <div className="payment-info">
                  <h4>Credit/Debit Card</h4>
                  <p>Pay with Visa, Mastercard</p>
                </div>
                <div className="payment-radio">
                  <div className={`radio-dot ${paymentMethod === 'card' ? 'active' : ''}`}></div>
                </div>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="payment-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="payment-info">
                  <h4>Cash on Delivery</h4>
                  <p>Pay when you receive your order</p>
                </div>
                <div className="payment-radio">
                  <div className={`radio-dot ${paymentMethod === 'cod' ? 'active' : ''}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-header">
            <h3>Order Summary</h3>
            <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
          </div>
          
          <div className="summary-items">
            {cart.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-image">
                  <img 
                    src={item.images?.[0]?.url || '/default-product.jpg'} 
                    alt={item.name}
                  />
                </div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-meta">
                    <span className="item-size">Size: {item.size}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <div className="item-price">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>
                Shipping
                {calculatingShipping && <span className="calculating">Calculating...</span>}
              </span>
              <span>KSh {shippingCost.toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>Tax (16% VAT)</span>
              <span>KSh {tax.toLocaleString()}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total Amount</span>
              <span>KSh {total.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            className="btn-primary place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading || calculatingShipping}
          >
            {loading ? 'Processing Your Order...' : `Place Order - KSh ${total.toLocaleString()}`}
          </button>
          
          <div className="security-notice">
            <FaLock />
            <span>Your payment information is secure and encrypted.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;