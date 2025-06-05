// src/components/Checkout/OrderSummary.jsx
import React from 'react';
import { FaShoppingBag, FaGift } from 'react-icons/fa';

const OrderSummary = ({ cart, deliveryOption }) => {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 300 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="order-summary">
      <h3><FaShoppingBag /> Order Summary</h3>
      
      <div className="summary-items">
        {cart.map(item => (
          <div key={item.id} className="summary-item">
            <div className="item-info">
              <span className="item-quantity">{item.quantity}x</span>
              <span className="item-name">{item.name}</span>
            </div>
            <div className="item-price">KES {item.price * item.quantity}</div>
          </div>
        ))}
      </div>
      
      <div className="summary-totals">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>KES {subtotal}</span>
        </div>
        <div className="summary-row">
          <span>Delivery</span>
          <span>{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee}`}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>KES {total}</span>
        </div>
      </div>
      
      <div className="promo-code">
        <FaGift />
        <input type="text" placeholder="Enter promo code" />
        <button>Apply</button>
      </div>
    </div>
  );
};

export default OrderSummary;