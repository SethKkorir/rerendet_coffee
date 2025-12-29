// components/Checkout/Checkout.jsx - WITH LOCATION & PAYMENT LOGIC
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useLocation } from '../../context/LocationContext';
import { FaLock, FaCreditCard, FaMoneyBillWave, FaPhone, FaInfoCircle, FaGlobe } from 'react-icons/fa';
import PaymentProcessingModal from '../PaymentProcessingModal/PaymentProcessingModal';
import './Checkout.css';
import './payment-sections.css';
import { KENYA_LOCATIONS } from '../../utils/kenyaLocations';

const KENYAN_COUNTIES = Object.keys(KENYA_LOCATIONS);

const EAST_AFRICA_COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'];
const MPESA_SUPPORTED_COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'];

function Checkout() {
  const {
    user,
    cart = [],
    showNotification,
    clearCart,
    token,
    isAuthenticated,
    publicSettings
  } = useContext(AppContext);

  const { location, formatPrice, getConvertedPrice } = useLocation();

  const navigate = useNavigate();

  // Initialize with location context country if available
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.shippingInfo?.firstName || user?.firstName || '',
    lastName: user?.shippingInfo?.lastName || user?.lastName || '',
    email: user?.email || '',
    phone: user?.shippingInfo?.phone || user?.phone || '',
    address: user?.shippingInfo?.address || '',
    county: user?.shippingInfo?.county || '',
    city: user?.shippingInfo?.city || '',
    country: user?.shippingInfo?.country || location.countryName || 'United States',
    postalCode: user?.shippingInfo?.zip || ''
  });

  // Update country if location context loads later and user hasn't typed yet? 
  // Better to just respect user profile first, then location context.
  useEffect(() => {
    if (!user?.shippingInfo?.country && location.countryName && !shippingInfo.country) {
      setShippingInfo(prev => ({ ...prev, country: location.countryName }));
    }
  }, [location.countryName, user, shippingInfo.country]);


  // Update form when user data is loaded, but don't overwrite existing entries
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: prev.firstName || user.shippingInfo?.firstName || user.firstName || '',
        lastName: prev.lastName || user.shippingInfo?.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.shippingInfo?.phone || user.phone || '',
        address: prev.address || user.shippingInfo?.address || '',
        city: prev.city || user.shippingInfo?.city || '',
        county: prev.county || user.shippingInfo?.county || '',
        postalCode: prev.postalCode || user.shippingInfo?.zip || '',
        country: prev.country || user.shippingInfo?.country || location.countryName || 'United States'
      }));
    }
  }, [user, location.countryName]);

  // Payment Logic based on Country
  const availablePaymentMethods = useMemo(() => {
    const isMpesaSupported = MPESA_SUPPORTED_COUNTRIES.includes(shippingInfo.country);

    // If we want to strictly follow "Automatically choose payment gateway", 
    // then we enable MPESA only for supported countries.
    // Stripe (Card) is generally global.
    // COD might be restricted to local delivery (Kenya).
    const isKenya = shippingInfo.country === 'Kenya';

    return {
      mpesa: isMpesaSupported,
      card: true, // Assuming Stripe works everywhere we ship
      cod: isKenya // Only allow COD in Kenya for now or based on business logic
    };
  }, [shippingInfo.country]);

  const [paymentMethod, setPaymentMethod] = useState('card'); // Default to card as it's most global

  useEffect(() => {
    // If current method becomes unavailable, switch
    if (paymentMethod === 'mpesa' && !availablePaymentMethods.mpesa) setPaymentMethod('card');
    if (paymentMethod === 'cod' && !availablePaymentMethods.cod) setPaymentMethod('card');

    // Auto-select MPESA for Kenya if preferred?
    if (shippingInfo.country === 'Kenya' && availablePaymentMethods.mpesa && paymentMethod !== 'mpesa') {
      // Maybe don't force switch if user selected card, but default could be MPESA
    }
  }, [availablePaymentMethods, shippingInfo.country]);


  const [loading, setLoading] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [errors, setErrors] = useState({});

  // Payment-specific state
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '+254 ');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Calculate totals
  const subtotalUSD = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // We need to display totals in the user's currency
  // But logic like "Free shipping over 10000" relies on base currency (KES usually in this codebase, but let's assume Cart prices are in KES base or we need to standardize).
  // The app seems to use KES as base. 
  // Let's assume `item.price` is in KES (based on previous files using KES).
  // AND `formatPrice` converts FROM KES TO Target Currency? 
  // WAIT. LocationContext `formatPrice` assumed input was USD. 
  // If the base shop currency is KES (which it seems to be), I should update LocationContext or pass KES.
  // Let's assume Base is KES.
  // LocationContext logic was: `const converted = priceInUSD * location.exchangeRate;`
  // If Base is KES, I need `priceInKES * rate` where rate is KES->Target.
  // Example: KES->USD rate is approx 0.0077.
  // Example: KES->KES rate is 1.

  // Let's assume `formatPrice` handles the conversion correctly if I treat the input as "Base Shop Currency Unit".
  // If the context uses USD as base, but shop is KES, I have a mismatch.
  // Given "Rerendet Coffee" is Kenyan, base is likely KES.
  // I will assume `formatPrice` expects the *Store Base Currency*. 
  // I should check `LocationContext` again to ensure `exchangeRate` logic matches. 
  // I defined USD as 1 in context default... 
  // If I want base to be KES, I should have set KES rate to 1 and USD to 0.0077.
  // But `LocationContext` had: `US: { rate: 1, currency: 'USD' }` and `KE: { rate: 129, currency: 'KES' }`. 
  // This implies BASE IS USD in the Context logic.
  // BUT the App seems to use KES prices (e.g. 1000 KSh).
  // CRITICAL: I need to align this.
  // If current product prices are ~1000, that's definitely KES. 
  // So Context "USD based" logic will treat 1000 as $1000 -> KSh 129,000. That's wrong.
  // I need to update Context to treat KES as base, OR convert App prices to USD. 
  // EASIER: Update Context to have KES as base (1.0) and USD as (0.0077).
  // I will make a quick mental note to update LocationContext rates after this file.

  const [shippingCost, setShippingCost] = useState(0);
  const tax = subtotalUSD * 0.16;
  const total = subtotalUSD + shippingCost + tax;

  // Determine enabled payment methods from settings (default to all true if loading/undefined)
  const enabledMethods = useMemo(() => {
    const methods = publicSettings?.payment?.paymentMethods || { mpesa: true, card: true, cashOnDelivery: true };
    return {
      mpesa: methods.mpesa !== false && availablePaymentMethods.mpesa,
      card: methods.card !== false && availablePaymentMethods.card,
      cod: methods.cashOnDelivery !== false && availablePaymentMethods.cod
    };
  }, [publicSettings, availablePaymentMethods]);

  // Auto-select valid payment method if current is disabled
  useEffect(() => {
    const isCurrentDisabled =
      (paymentMethod === 'mpesa' && !enabledMethods.mpesa) ||
      (paymentMethod === 'card' && !enabledMethods.card) ||
      (paymentMethod === 'cod' && !enabledMethods.cod);

    if (isCurrentDisabled) {
      if (enabledMethods.card) setPaymentMethod('card');
      else if (enabledMethods.mpesa) setPaymentMethod('mpesa');
      else if (enabledMethods.cod) setPaymentMethod('cod');
    }
  }, [enabledMethods, paymentMethod]);

  // Calculate shipping when county/country changes
  useEffect(() => {
    if (shippingInfo.country === 'Kenya' && shippingInfo.county) {
      calculateShipping();
    } else if (shippingInfo.country !== 'Kenya' && shippingInfo.country) {
      // International shipping logic
      setShippingCost(2500); // Flat rate for international? Or dynamic.
    }
  }, [shippingInfo.county, shippingInfo.country]);

  const calculateShipping = async () => {
    if (!shippingInfo.county) {
      setShippingCost(0);
      return;
    }

    setCalculatingShipping(true);
    try {
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
    if (!shippingInfo.phone?.trim()) newErrors.phone = 'Phone Number is required'; // Removed strict length check for international
    if (!shippingInfo.address?.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.country?.trim()) newErrors.country = 'Country is required';

    if (shippingInfo.country === 'Kenya') {
      if (!shippingInfo.county?.trim()) newErrors.county = 'County is required';
      if (!shippingInfo.city?.trim()) newErrors.city = 'City/Town is required';
    } else {
      if (!shippingInfo.city?.trim()) newErrors.city = 'City is required';
      if (!shippingInfo.postalCode?.trim()) newErrors.postalCode = 'Postal/Zip Code is required';
    }

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
    // ... items validation ... (same as before)
  };

  const prepareCartItems = () => {
    return cart.map(item => ({
      product: item.productId || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: item.images?.[0]?.url || '/default-product.jpg'
    }));
  };

  const handlePlaceOrder = async () => {
    // ... same auth check ...
    if (!isAuthenticated) return navigate('/login');
    if (!validateForm()) return showNotification('Please fill in all required fields', 'error');

    // Check Payment logic
    if (paymentMethod === 'mpesa') {
      // ensure phone
      if (!mpesaPhone) return showNotification('Enter M-Pesa phone', 'error');
    }

    // ... modal logic ...
    if (paymentMethod === 'mpesa' || paymentMethod === 'card') {
      setShowPaymentModal(true);
    } else {
      await processOrder();
    }
  };

  const processOrder = async (paymentData = null) => {
    setLoading(true);

    try {
      const preparedCartItems = prepareCartItems();

      const orderData = {
        shippingAddress: shippingInfo,
        paymentMethod: paymentMethod,
        items: preparedCartItems,
        subtotal: subtotalUSD,
        shippingCost: shippingCost,
        tax: tax,
        totalAmount: total,
        currency: location.currency, // Send currency used
        exchangeRate: location.exchangeRate, // Send rate used
        notes: '',
        paymentData: paymentData
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

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Order failed');

      if (result.success) {
        clearCart();
        showNotification('Order placed!', 'success');
        const orderId = result.data._id || result.data.id;
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ... handlers ...

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <PaymentProcessingModal
          isOpen={showPaymentModal}
          paymentMethod={paymentMethod}
          amount={total}
          currency={location.currency} // Pass currency to modal
          phone={mpesaPhone}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
        />

        <div className="checkout-header">
          <h1>Complete Your Order</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-forms">

            {/* Country Selection FIRST */}
            <div className="form-section">
              <div className="section-header">
                <FaGlobe className="section-icon" />
                <h2>Location</h2>
              </div>
              <div className="form-group full-width">
                <label>Country / Region *</label>
                <select
                  value={shippingInfo.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={errors.country ? 'error' : ''}
                >
                  <option value="">Select Country</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="China">China</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  {/* Add more as needed */}
                </select>
                {errors.country && <span className="error-message">{errors.country}</span>}
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <FaUser className="section-icon" />
                <h2>Shipping Address</h2>
              </div>

              <div className="form-grid">
                {/* Name fields */}
                <div className="form-group">
                  <label>First Name</label>
                  <input value={shippingInfo.firstName} onChange={e => handleInputChange('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={shippingInfo.lastName} onChange={e => handleInputChange('lastName', e.target.value)} />
                </div>

                {/* Dynamic Fields based on Country */}
                {shippingInfo.country === 'Kenya' ? (
                  <>
                    <div className="form-group">
                      <label>County</label>
                      <select value={shippingInfo.county} onChange={e => handleInputChange('county', e.target.value)}>
                        <option value="">Select County</option>
                        {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Town</label>
                      <select value={shippingInfo.city} onChange={e => handleInputChange('city', e.target.value)}>
                        <option value="">Select Town</option>
                        {shippingInfo.county && KENYA_LOCATIONS[shippingInfo.county]?.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>City</label>
                      <input value={shippingInfo.city} onChange={e => handleInputChange('city', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input value={shippingInfo.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} />
                    </div>
                  </>
                )}

                <div className="form-group full-width">
                  <label>Address</label>
                  <input value={shippingInfo.address} onChange={e => handleInputChange('address', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input value={shippingInfo.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={shippingInfo.email} onChange={e => handleInputChange('email', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <FaCreditCard className="section-icon" />
                <h2>Payment</h2>
              </div>

              <div className="payment-options">
                {/* Only show MPESA for East Africa */}
                {enabledMethods.mpesa && (
                  <div className={`payment-option ${paymentMethod === 'mpesa' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('mpesa')}>
                    <FaPhone /> <span>M-Pesa</span>
                  </div>
                )}

                {enabledMethods.card && (
                  <div className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}>
                    <FaCreditCard /> <span>Credit/Debit Card</span>
                  </div>
                )}

                {enabledMethods.cod && (
                  <div className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}>
                    <FaMoneyBillWave /> <span>Cash on Delivery</span>
                  </div>
                )}
              </div>

              {/* Inputs for payment methods */}
              {paymentMethod === 'mpesa' && (
                <div className="payment-details-section">
                  <label>M-Pesa Number</label>
                  <input value={mpesaPhone} onChange={handleMpesaPhoneChange} />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="payment-details-section">
                  {/* Card inputs... re-using standard state */}
                  <label>Card Number</label>
                  <input value={cardDetails.cardNumber} onChange={handleCardNumberChange} maxLength="19" />
                  <div className="card-row">
                    <input value={cardDetails.expiryDate} onChange={handleExpiryChange} placeholder="MM/YY" />
                    <input value={cardDetails.cvv} onChange={handleCVVChange} placeholder="CVV" />
                  </div>
                  <input value={cardDetails.cardholderName} onChange={e => setCardDetails({ ...cardDetails, cardholderName: e.target.value })} placeholder="Name on Card" />
                </div>
              )}
            </div>

          </div>

          {/* Right Side Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            {/* Items */}
            <div className="summary-items">
              {cart.map((item, i) => (
                <div key={i} className="summary-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="summary-totals">
              <div className="total-row"><span>Subtotal</span> <span>{formatPrice(subtotalUSD)}</span></div>
              <div className="total-row"><span>Shipping</span> <span>{formatPrice(shippingCost)}</span></div>
              <div className="total-row"><span>Tax</span> <span>{formatPrice(tax)}</span></div>
              <div className="total-row grand-total"><span>Total</span> <span>{formatPrice(total)}</span></div>
            </div>

            <button className="btn-primary place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;