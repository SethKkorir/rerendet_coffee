// src/components/Checkout/PaymentMethods.jsx
import React from 'react';
import { FaMobileAlt, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

const PaymentMethods = ({ paymentMethod, setPaymentMethod, formData, handleInputChange }) => {
  return (
    <div className="form-section">
      <h2><FaCreditCard /> Payment Method</h2>
      
      <div className="payment-methods">
        <div 
          className={`payment-method ${paymentMethod === 'mpesa' ? 'selected' : ''}`}
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
          className={`payment-method ${paymentMethod === 'airtel' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('airtel')}
        >
          <div className="payment-icon">
            <FaMoneyBillWave />
          </div>
          <div className="payment-info">
            <h4>Airtel Money</h4>
            <p>Pay via Airtel Money</p>
          </div>
        </div>
        
        <div 
          className={`payment-method ${paymentMethod === 'card' ? 'selected' : ''}`}
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
      
      {paymentMethod === 'mpesa' && (
        <div className="payment-form">
          <div className="form-group">
            <label htmlFor="mpesaPhone">M-Pesa Phone Number *</label>
            <input 
              type="tel" 
              id="mpesaPhone" 
              name="phone"
              className="input" 
              placeholder="+254 700 123 456" 
              value={formData.phone}
              onChange={handleInputChange}
              required 
            />
            <p className="input-note">
              You'll receive an STK Push on your phone to complete payment
            </p>
          </div>
        </div>
      )}
      
      {paymentMethod === 'airtel' && (
        <div className="payment-form">
          <div className="form-group">
            <label htmlFor="airtelPhone">Airtel Money Phone Number *</label>
            <input 
              type="tel" 
              id="airtelPhone" 
              name="phone"
              className="input" 
              placeholder="+254 700 123 456" 
              value={formData.phone}
              onChange={handleInputChange}
              required 
            />
            <p className="input-note">
              You'll receive a payment request on your phone
            </p>
          </div>
        </div>
      )}
      
      {paymentMethod === 'card' && (
        <div className="payment-form">
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number *</label>
            <input 
              type="text" 
              id="cardNumber" 
              name="cardNumber"
              className="input" 
              placeholder="1234 5678 9012 3456" 
              pattern="[0-9]{13,16}"
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiry">Expiry Date *</label>
              <input 
                type="text" 
                id="expiry" 
                name="expiry"
                className="input" 
                placeholder="MM/YY" 
                pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cvv">CVV *</label>
              <input 
                type="text" 
                id="cvv" 
                name="cvv"
                className="input" 
                placeholder="123" 
                pattern="[0-9]{3,4}"
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="cardName">Name on Card *</label>
            <input 
              type="text" 
              id="cardName" 
              name="cardName"
              className="input" 
              placeholder="John Doe" 
              required 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;