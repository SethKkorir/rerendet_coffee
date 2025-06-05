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
        {/* Receipt content same as before */}
        {/* ... */}
      </div>
      <button onClick={handlePrint} className="download-btn">
        <FaDownload /> Print/Save Receipt
      </button>
    </div>
  );
};

export default OrderReceipt;