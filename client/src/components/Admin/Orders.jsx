import React, { useEffect, useState } from 'react';
import API from '../../api/api';
import './Admin.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/admin/orders'); // backend: GET /api/admin/orders
        setOrders(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load admin orders', err);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  return (
    <div className="admin-page">
      <h2>Orders</h2>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id || o.id}>
              <td>{o._id}</td>
              <td>{o.user?.email || o.userEmail}</td>
              <td>KES {o.total || (o.subtotal + o.shippingCost)}</td>
              <td>{o.status || 'pending'}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}