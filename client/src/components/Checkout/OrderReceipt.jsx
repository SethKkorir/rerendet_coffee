import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../api/api';
import './OrderReceipt.css';

export default function OrderReceipt() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="receipt">Loading receipt...</div>;
  if (!order) return <div className="receipt">Order not found.</div>;

  return (
    <div className="receipt">
      <h2>Order Confirmed</h2>
      <p>Order ID: <strong>{order._id || order.id}</strong></p>
      <p>Subtotal: <strong>KES {(order.subtotal || 0).toLocaleString()}</strong></p>
      <p>Shipping: <strong>KES {(order.shippingCost || 0).toLocaleString()}</strong></p>
      <p>Tax (16% VAT): <strong>KES {(order.tax || 0).toLocaleString()}</strong></p>
      <p>Total: <strong>KES {(order.total || (order.subtotal + order.shippingCost + (order.tax || 0))).toLocaleString()}</strong></p>
      <h4>Shipping</h4>
      <div>{order.shipping?.address || order.shipping?.city}, {order.shipping?.country}</div>
      <h4>Items</h4>
      <ul>
        {(order.items || []).map((it, i) => (
          <li key={it._id || i}>{it.name || it.title} x{it.quantity || 1} — KES {(it.price || 0) * (it.quantity || 1)}</li>
        ))}
      </ul>
      <Link to="/">Back to shop</Link>
    </div>
  );
}