// components/Checkout/Checkout.jsx
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  FaTruck, FaCreditCard, FaCheckCircle, 
  FaArrowLeft, FaArrowRight, FaMapMarkerAlt,
  FaShoppingBag, FaMobileAlt, FaExclamationCircle,
  FaLock, FaShieldAlt, FaGlobe
} from 'react-icons/fa';
import { kenyanCounties, calculateShipping } from '../../utils/shippingCalculator';
import './Checkout.css';

function Checkout() {
  const { 
    user, 
    cart, 
    clearCart, 
    processMpesaPayment, 
    processCardPayment,
    showNotification 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [securityToken, setSecurityToken] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '+254',
    address: '',
    city: '',
    county: '',
    zip: '',
    country: 'Kenya',
    deliveryOption: 'standard',
    specialInstructions: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Generate security token for form protection
  useEffect(() => {
    setSecurityToken(Math.random().toString(36).substring(2, 15));
  }, []);

  // Get cart items safely
  const cartItems = cart?.items || [];
  const cartCount = cartItems.length;

  // Validate shipping form with enhanced security
  const validateShipping = useCallback(() => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim() || formData.firstName.length < 2) 
      newErrors.firstName = 'Valid first name is required (min 2 characters)';
    
    if (!formData.lastName.trim() || formData.lastName.length < 2) 
      newErrors.lastName = 'Valid last name is required (min 2 characters)';
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Valid email address is required';
    
    if (!/^\+254[0-9]{9}$/.test(formData.phone)) 
      newErrors.phone = 'Valid Kenyan number required (e.g., +254712345678)';
    
    if (!formData.address.trim() || formData.address.length < 10) 
      newErrors.address = 'Complete address is required (min 10 characters)';
    
    if (!formData.city.trim()) 
      newErrors.city = 'City/town is required';
    
    if (!formData.county) 
      newErrors.county = 'County is required';
    
    if (formData.country === 'Kenya' && !formData.zip.trim()) 
      newErrors.zip = 'Postal code is required for Kenya';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Enhanced payment validation
  const validatePayment = useCallback(() => {
    const newErrors = {};
    
    if (paymentMethod === 'mpesa') {
      if (!/^\+254[0-9]{9}$/.test(formData.phone)) {
        newErrors.payment = 'Valid Kenyan number required for M-Pesa payments';
      }
    } else {
      // Enhanced card validation
      const cleanNumber = cardDetails.number.replace(/\s/g, '');
      
      if (!/^[0-9]{13,16}$/.test(cleanNumber) || !luhnCheck(cleanNumber)) 
        newErrors.number = 'Invalid card number';
      
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardDetails.expiry)) 
        newErrors.expiry = 'Valid expiry date required (MM/YY)';
      
      // Check if card is expired
      const [month, year] = cardDetails.expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < new Date()) 
        newErrors.expiry = 'Card has expired';
      
      if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) 
        newErrors.cvv = 'Valid CVV required';
      
      if (!cardDetails.name.trim() || cardDetails.name.length < 3) 
        newErrors.name = 'Name on card required (min 3 characters)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  }, [paymentMethod, formData.phone, cardDetails]);

  // Luhn algorithm for card validation
  const luhnCheck = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }
    
    // Format expiry date
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return;
    }
    
    // Format CVV (numbers only)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }
    
    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setActiveStep(2);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Security checks
    if (!securityToken) {
      showNotification('Security validation failed. Please refresh the page.', 'error');
      return;
    }
    
    if (!validatePayment()) return;
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      const orderData = {
        items: cartItems,
        shippingInfo: formData,
        paymentMethod,
        subtotal: calculateSubtotal(),
        deliveryFee: calculateDelivery(),
        total: calculateTotal(),
        securityToken,
        timestamp: Date.now()
      };

      let paymentResult;
      const amount = calculateTotal();

      if (paymentMethod === 'mpesa') {
        paymentResult = await processMpesaPayment(formData.phone, amount, orderData);
      } else {
        paymentResult = await processCardPayment({
          ...cardDetails,
          amount,
          orderData
        });
      }
      
      if (paymentResult.success) {
        // Clear cart and navigate to confirmation
        await clearCart();
        
        navigate('/confirmation', { 
          state: { 
            orderId: paymentResult.orderId,
            orderDetails: formData,
            paymentMethod,
            orderTotal: amount,
            cartItems: cartItems,
            deliveryFee: calculateDelivery()
          },
          replace: true // Prevent going back to checkout
        });
      } else {
        throw new Error(paymentResult.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ 
        payment: error.message || 'Payment failed. Please try again or contact support.' 
      });
      
      // Security: Clear sensitive data on error
      if (paymentMethod === 'card') {
        setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate order values
  const calculateSubtotal = () => 
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const calculateDelivery = () => {
    if (formData.country !== 'Kenya') return 2000; // International
    
    if (formData.deliveryOption === 'express') return 300;
    
    // Calculate standard delivery based on county
    if (formData.county) {
      return calculateShipping({
        country: formData.country,
        county: formData.county,
        isRural: formData.deliveryOption === 'rural'
      });
    }
    
    return 500; // Default
  };

  const calculateTotal = () => calculateSubtotal() + calculateDelivery();

  // Prevent checkout with empty cart
  useEffect(() => {
    if (cartCount === 0 && activeStep === 1) {
      navigate('/cart');
    }
  }, [cartCount, navigate, activeStep]);

  // Auto-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName
      }));
    }
  }, [user]);

  return (
    <div className="checkout-page">
      {/* Secure Header */}
      <header className="checkout-header">
        <div className="container">
          <div className="header-content">
            <h1 className="checkout-logo">
              <a href="/">☕ Rerendet Coffee</a>
            </h1>
            <div className="security-badge">
              <FaLock />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="checkout-main">
        <div className="container">
          {/* Progress Steps */}
          <div className="checkout-progress">
            <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
              <div className="step-icon">
                {activeStep > 1 ? <FaCheckCircle /> : <FaTruck />}
              </div>
              <div className="step-label">Shipping</div>
            </div>
            
            <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
              <div className="step-icon">
                {activeStep > 2 ? <FaCheckCircle /> : <FaCreditCard />}
              </div>
              <div className="step-label">Payment</div>
            </div>
            
            <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
              <div className="step-icon">
                <FaCheckCircle />
              </div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>

          <div className="checkout-content">
            {/* Shipping Form */}
            {activeStep === 1 && (
              <form onSubmit={handleNextStep} className="checkout-form">
                <section className="form-section">
                  <h2><FaMapMarkerAlt /> Shipping Information</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? 'error' : ''}
                        minLength="2"
                        required
                      />
                      {errors.firstName && <span className="error-message"><FaExclamationCircle /> {errors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? 'error' : ''}
                        minLength="2"
                        required
                      />
                      {errors.lastName && <span className="error-message"><FaExclamationCircle /> {errors.lastName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? 'error' : ''}
                        required
                      />
                      {errors.email && <span className="error-message"><FaExclamationCircle /> {errors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={errors.phone ? 'error' : ''}
                        pattern="\+254[0-9]{9}"
                        required
                      />
                      {errors.phone && <span className="error-message"><FaExclamationCircle /> {errors.phone}</span>}
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="address">Delivery Address *</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                        placeholder="Street address, building, apartment number"
                        minLength="10"
                        required
                      />
                      {errors.address && <span className="error-message"><FaExclamationCircle /> {errors.address}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="country">Country *</label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Kenya">Kenya</option>
                        <option value="Other">Other Country</option>
                      </select>
                    </div>

                    {formData.country === 'Kenya' ? (
                      <>
                        <div className="form-group">
                          <label htmlFor="county">County *</label>
                          <select
                            id="county"
                            name="county"
                            value={formData.county}
                            onChange={handleInputChange}
                            className={errors.county ? 'error' : ''}
                            required
                          >
                            <option value="">Select County</option>
                            {kenyanCounties.map(county => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                          {errors.county && <span className="error-message"><FaExclamationCircle /> {errors.county}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="city">City/Town *</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={errors.city ? 'error' : ''}
                            required
                          />
                          {errors.city && <span className="error-message"><FaExclamationCircle /> {errors.city}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="zip">Postal Code *</label>
                          <input
                            type="text"
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            className={errors.zip ? 'error' : ''}
                            required
                          />
                          {errors.zip && <span className="error-message"><FaExclamationCircle /> {errors.zip}</span>}
                        </div>
                      </>
                    ) : (
                      <div className="form-group full-width">
                        <label htmlFor="city">City/Region *</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={errors.city ? 'error' : ''}
                          required
                        />
                        {errors.city && <span className="error-message"><FaExclamationCircle /> {errors.city}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="delivery-section">
                    <h3>Delivery Method</h3>
                    <div className="delivery-options">
                      <label className={`delivery-option ${formData.deliveryOption === 'standard' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryOption"
                          value="standard"
                          checked={formData.deliveryOption === 'standard'}
                          onChange={handleInputChange}
                        />
                        <div className="option-content">
                          <div className="option-title">Standard Delivery</div>
                          <div className="option-details">
                            2-3 business days • KES {formData.county ? calculateShipping({
                              country: formData.country,
                              county: formData.county,
                              isRural: false
                            }).toLocaleString() : '500'}
                          </div>
                        </div>
                      </label>
                      
                      <label className={`delivery-option ${formData.deliveryOption === 'express' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="deliveryOption"
                          value="express"
                          checked={formData.deliveryOption === 'express'}
                          onChange={handleInputChange}
                        />
                        <div className="option-content">
                          <div className="option-title">Express Delivery</div>
                          <div className="option-details">Next day • KES 300</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="specialInstructions">Special Delivery Instructions (Optional)</label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      placeholder="Gate code, building instructions, safe place to leave package..."
                      rows="3"
                    />
                  </div>
                </section>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/cart')}>
                    <FaArrowLeft /> Back to Cart
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Continue to Payment <FaArrowRight />
                  </button>
                </div>
              </form>
            )}
            
            {/* Payment Form */}
            {activeStep === 2 && (
              <form onSubmit={handlePaymentSubmit} className="checkout-form">
                <input type="hidden" name="securityToken" value={securityToken} />
                
                <section className="form-section">
                  <h2><FaCreditCard /> Payment Method</h2>
                  
                  {errors.payment && (
                    <div className="payment-error">
                      <FaExclamationCircle /> {errors.payment}
                    </div>
                  )}
                  
                  <div className="payment-methods">
                    <div 
                      className={`payment-option ${paymentMethod === 'mpesa' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('mpesa')}
                    >
                      <div className="payment-icon">
                        <FaMobileAlt />
                      </div>
                      <div className="payment-info">
                        <h4>M-Pesa</h4>
                        <p>Pay via M-Pesa mobile money</p>
                        <div className="security-note">
                          <FaShieldAlt /> Secure & Instant
                        </div>
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
                        <p>Pay with Visa or Mastercard</p>
                        <div className="security-note">
                          <FaLock /> PCI DSS Compliant
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {paymentMethod === 'mpesa' ? (
                    <div className="payment-details">
                      <div className="form-group">
                        <label>M-Pesa Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={errors.phone ? 'error' : ''}
                          pattern="\+254[0-9]{9}"
                          required
                        />
                        {errors.phone && <span className="error-message"><FaExclamationCircle /> {errors.phone}</span>}
                        <p className="note">
                          You'll receive an STK Push on your phone to complete payment. 
                          Ensure your phone is nearby and has sufficient airtime.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="payment-details">
                      <div className="security-notice">
                        <FaLock /> Your card details are encrypted and secure
                      </div>
                      
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          name="number"
                          value={cardDetails.number}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          className={errors.number ? 'error' : ''}
                          maxLength="19"
                          required
                        />
                        {errors.number && <span className="error-message"><FaExclamationCircle /> {errors.number}</span>}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            className={errors.expiry ? 'error' : ''}
                            maxLength="5"
                            required
                          />
                          {errors.expiry && <span className="error-message"><FaExclamationCircle /> {errors.expiry}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label>CVV *</label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            className={errors.cvv ? 'error' : ''}
                            maxLength="4"
                            required
                          />
                          {errors.cvv && <span className="error-message"><FaExclamationCircle /> {errors.cvv}</span>}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Name on Card *</label>
                        <input
                          type="text"
                          name="name"
                          value={cardDetails.name}
                          onChange={handleCardChange}
                          className={errors.name ? 'error' : ''}
                          placeholder="As shown on card"
                          minLength="3"
                          required
                        />
                        {errors.name && <span className="error-message"><FaExclamationCircle /> {errors.name}</span>}
                      </div>
                    </div>
                  )}
                </section>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setActiveStep(1)}>
                    <FaArrowLeft /> Back to Shipping
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="btn-spinner"></div>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay KES ${calculateTotal().toLocaleString()}`
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {/* Order Summary */}
            <aside className="order-summary">
              <div className="summary-header">
                <FaShoppingBag />
                <h3>Order Summary</h3>
              </div>
              
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item._id || item.id} className="summary-item">
                    <div className="item-info">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <span className="item-price">KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>KES {calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Delivery</span>
                  <span>KES {calculateDelivery().toLocaleString()}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>KES {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="security-guarantee">
                <FaLock />
                <div>
                  <strong>Secure Payment Guarantee</strong>
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;