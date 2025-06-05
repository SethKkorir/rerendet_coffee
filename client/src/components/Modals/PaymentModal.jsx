// src/components/Modals/PaymentModal.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaTimes, FaMobileAlt, FaCreditCard } from 'react-icons/fa';
import './PaymentModal.css';

export const MpesaModal = () => {
  const { isMpesaModalOpen, setIsMpesaModalOpen, cartTotal, showNotification } = useContext(AppContext);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsMpesaModalOpen(false);
      showNotification('Payment successful! Check your phone for M-Pesa confirmation');
    }, 2000);
  };

  if (!isMpesaModalOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2><FaMobileAlt /> M-Pesa Payment</h2>
          <button className="close-modal" onClick={() => setIsMpesaModalOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone-number">Phone Number</label>
              <input 
                type="tel" 
                id="phone-number" 
                placeholder="e.g., 07XXXXXXXX" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className="modal-info">
              You will receive an M-Pesa prompt on your phone to complete the payment.
            </p>
            <div className="total-amount">
              <span>Total Amount:</span>
              <span>KSh {cartTotal.toLocaleString()}</span>
            </div>
            <button 
              type="submit" 
              className="btn primary btn-block"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const CardModal = () => {
  const { isCardModalOpen, setIsCardModalOpen, cartTotal, showNotification } = useContext(AppContext);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsCardModalOpen(false);
      showNotification('Payment successful! Your order is confirmed.');
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  if (!isCardModalOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2><FaCreditCard /> Card Payment</h2>
          <button className="close-modal" onClick={() => setIsCardModalOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="card-name">Name on Card</label>
              <input 
                type="text" 
                id="card-name" 
                name="name"
                required
                value={cardDetails.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="card-number">Card Number</label>
              <input 
                type="text" 
                id="card-number" 
                name="number"
                placeholder="1234 5678 9012 3456" 
                required
                value={cardDetails.number}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiry-date">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiry-date" 
                  name="expiry"
                  placeholder="MM/YY" 
                  required
                  value={cardDetails.expiry}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input 
                  type="text" 
                  id="cvv" 
                  name="cvv"
                  placeholder="123" 
                  required
                  value={cardDetails.cvv}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="total-amount">
              <span>Total Amount:</span>
              <span>KSh {cartTotal.toLocaleString()}</span>
            </div>
            <button 
              type="submit" 
              className="btn primary btn-block"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};