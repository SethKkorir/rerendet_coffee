import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaCoffee, FaReceipt, FaCalendarAlt, FaDownload, FaShareAlt } from 'react-icons/fa';
import { FaLocationDot, FaPhone } from 'react-icons/fa6';
import { SiMpesa } from 'react-icons/si';
import './OrderReceipt.css';

const OrderReceipt = () => {
  const { state } = useLocation();
  
  // Default data if accessed directly
  const order = state?.order || {
    id: 'RC-' + Math.floor(Math.random() * 100000),
    date: new Date().toLocaleString(),
    items: [
      { name: 'Ethiopian Yirgacheffe', quantity: 1, price: 12.50 },
      { name: 'Guatemalan Antigua', quantity: 1, price: 12.50 }
    ],
    subtotal: 25.00,
    deliveryFee: 0,
    total: 25.00,
    paymentMethod: 'M-Pesa',
    customer: {
      name: 'Sample Customer',
      phone: '+254700000000',
      address: '123 Sample Street, Nairobi'
    }
  };

  return (
    <div className="receipt-container">
      <div className="modern-receipt">
        <h2>Order Receipt</h2>
        <p>Order ID: {order.id}</p>
        <p>Date: {order.date}</p>
        <h3>Items Ordered:</h3>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.name} - Qty: {item.quantity} - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
        <p>Delivery Fee: ${order.deliveryFee.toFixed(2)}</p>
        <h3>Total: ${order.total.toFixed(2)}</h3>
        <h3>Payment Method:</h3>
        <p>
          <SiMpesa /> {order.paymentMethod}
        </p>
        <h3>Customer Details:</h3>
        <p>Name: {order.customer.name}</p>
        <p>Phone: {order.customer.phone}</p>
        <p>Address: {order.customer.address}</p>
      </div>
      <button onClick={handlePrint} className="download-btn">
        <FaDownload /> Print/Save Receipt
      </button>
    </div>
  );
};

export default OrderReceipt;