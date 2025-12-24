import React from 'react';
import './OrderSummary.css';

export default function OrderSummary({ cart = [], subtotal = 0, shippingCost = 0 }) {
  const total = subtotal + shippingCost;
  return (
    <aside className="order-summary">
      <h3>Order summary</h3>
      {cart.length === 0 ? <p>Your cart is empty</p> : (
        <ul className="os-items">
          {cart.map((it, i) => (
            <li key={it._id || i} className="os-item">
              <div className="os-left">
                <div className="os-name">{it.name || it.title}</div>
                <div className="os-qty">x{it.quantity || 1}</div>
              </div>
              <div className="os-right">KES {(it.price || 0) * (it.quantity || 1)}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="os-row"><span>Subtotal</span><span>KES {subtotal}</span></div>
      <div className="os-row"><span>Shipping</span><span>KES {shippingCost}</span></div>
      <div className="os-row os-total"><span>Total</span><span>KES {total}</span></div>
    </aside>
  );
}