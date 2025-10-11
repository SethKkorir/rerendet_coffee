import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { 
  FaTruck, FaCreditCard, FaCheckCircle, 
  FaArrowLeft, FaArrowRight, FaMapMarkerAlt,
  FaShoppingBag, FaMobileAlt, FaExclamationCircle
} from 'react-icons/fa';
import './Checkout.css';

function Checkout() {
  const { cart, clearCart, processMpesaPayment, processCardPayment } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+254',
    address: '',
    city: 'Nairobi',
    zip: '',
    country: 'Kenya',
    deliveryOption: 'standard'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Get cart items safely - handle both object and array structures
  const cartItems = cart?.items || [];
  const cartCount = cartItems.length;

  // Validate shipping form
  const validateShipping = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!/^\+254[0-9]{9}$/.test(formData.phone)) newErrors.phone = 'Valid Kenyan number required (+254...)';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment form
  const validatePayment = () => {
    if (paymentMethod === 'mpesa') {
      if (!/^\+254[0-9]{9}$/.test(formData.phone)) {
        setErrors({...errors, payment: 'Valid Kenyan number required for M-Pesa'});
        return false;
      }
    } else {
      const newErrors = {};
      if (!/^[0-9]{13,16}$/.test(cardDetails.number.replace(/\s/g, ''))) newErrors.number = 'Invalid card number';
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardDetails.expiry)) newErrors.expiry = 'MM/YY required';
      if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) newErrors.cvv = 'Invalid CVV';
      if (!cardDetails.name.trim()) newErrors.name = 'Name on card required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors({...errors, ...newErrors});
        return false;
      }
    }
    return true;
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
    setCardDetails(prev => ({ ...prev, [name]: value }));
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
    if (!validatePayment()) return;
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      let paymentSuccess = false;
      const amount = calculateTotal();
      
      if (paymentMethod === 'mpesa') {
        paymentSuccess = await processMpesaPayment(formData.phone, amount);
      } else {
        paymentSuccess = await processCardPayment({
          ...cardDetails,
          amount
        });
      }
      
      if (paymentSuccess) {
        clearCart();
        navigate('/confirmation', { 
          state: { 
            orderDetails: formData,
            paymentMethod,
            orderTotal: amount,
            cartItems: cartItems
          }
        });
      }
    } catch (error) {
      setErrors({ payment: error.message || 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate order values safely
  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const calculateDelivery = () => formData.deliveryOption === 'express' ? 300 : 0;
  const calculateTotal = () => calculateSubtotal() + calculateDelivery();

  // Prevent checkout with empty cart
  useEffect(() => {
    if (cartCount === 0) {
      navigate('/cart');
    }
  }, [cartCount, navigate]);

  // Add form-row CSS class for card details layout
  const formRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  };

  return (
    <div className="checkout-page">
      {/* Minimal Header - Only Logo */}
      <header className="checkout-header">
        <div className="container">
          <h1 className="checkout-logo">
            <a href="/">☕ Rerendet Coffee</a>
          </h1>
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
                      />
                      {errors.phone && <span className="error-message"><FaExclamationCircle /> {errors.phone}</span>}
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="address">Address *</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={errors.address ? 'error' : ''}
                      />
                      {errors.address && <span className="error-message"><FaExclamationCircle /> {errors.address}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      >
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="zip">Postal Code</label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                      />
                    </div>
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
                          <div className="option-details">2-3 business days • FREE</div>
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
                        />
                        {errors.phone && <span className="error-message"><FaExclamationCircle /> {errors.phone}</span>}
                        <p className="note">You'll receive an STK Push to complete payment</p>
                      </div>
                    </div>
                  ) : (
                    <div className="payment-details">
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          name="number"
                          value={cardDetails.number}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          className={errors.number ? 'error' : ''}
                        />
                        {errors.number && <span className="error-message"><FaExclamationCircle /> {errors.number}</span>}
                      </div>
                      
                      <div style={formRowStyle}>
                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input
                            type="text"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            className={errors.expiry ? 'error' : ''}
                          />
                          {errors.expiry && <span className="error-message"><FaExclamationCircle /> {errors.expiry}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label>CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            className={errors.cvv ? 'error' : ''}
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
                        />
                        {errors.name && <span className="error-message"><FaExclamationCircle /> {errors.name}</span>}
                      </div>
                    </div>
                  )}
                </section>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setActiveStep(1)}>
                    <FaArrowLeft /> Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Payment...' : 'Complete Order'}
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
                  <div key={item._id} className="summary-item">
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
                  <span>{calculateDelivery() === 0 ? 'FREE' : `KES ${calculateDelivery().toLocaleString()}`}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>KES {calculateTotal().toLocaleString()}</span>
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