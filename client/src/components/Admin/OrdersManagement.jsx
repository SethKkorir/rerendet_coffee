// src/components/Admin/OrdersManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaFilter, FaEye, FaEdit, FaShippingFast } from 'react-icons/fa';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const { showNotification } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();

      const response = await fetch(`/api/admin/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingNumber = '') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber,
          notifyCustomer: true
        })
      });

      if (!response.ok) throw new Error('Failed to update order status');

      const data = await response.json();
      
      if (data.success) {
        showNotification('Order status updated successfully', 'success');
        setShowStatusModal(false);
        setSelectedOrder(null);
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Update order status error:', error);
      showNotification('Failed to update order status', 'error');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
      refunded: 'gray'
    };

    return (
      <span className={`status-badge ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const OrderRow = ({ order }) => (
    <tr className="order-row">
      <td>#{order.orderNumber}</td>
      <td>
        {order.user?.firstName} {order.user?.lastName}
        <br />
        <small>{order.user?.email}</small>
      </td>
      <td>KES {order.totalAmount?.toLocaleString()}</td>
      <td>
        <StatusBadge status={order.status} />
      </td>
      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
      <td>
        <div className="order-actions">
          <button 
            className="btn-icon"
            onClick={() => setSelectedOrder(order)}
            title="View Details"
          >
            <FaEye />
          </button>
          <button 
            className="btn-icon"
            onClick={() => {
              setSelectedOrder(order);
              setShowStatusModal(true);
            }}
            title="Update Status"
          >
            <FaEdit />
          </button>
          {order.status === 'confirmed' && (
            <button 
              className="btn-icon primary"
              onClick={() => updateOrderStatus(order._id, 'shipped', `TRK${Date.now()}`)}
              title="Mark as Shipped"
            >
              <FaShippingFast />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="orders-management">
      <div className="page-header">
        <h1>Orders Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchOrders}>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <OrderRow key={order._id} order={order} />
              ))}
            </tbody>
          </table>
        )}

        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            className="btn-outline"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {filters.page} of {pagination.pages}
          </span>
          
          <button
            disabled={filters.page === pagination.pages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            className="btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onUpdate={updateOrderStatus}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

// Status Update Modal Component
const StatusUpdateModal = ({ order, onUpdate, onClose }) => {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    await onUpdate(order._id, status, trackingNumber);
    setUpdating(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Order Status</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="status-form">
          <div className="form-group">
            <label>Order #</label>
            <input type="text" value={order.orderNumber} disabled />
          </div>
          
          <div className="form-group">
            <label>Customer</label>
            <input 
              type="text" 
              value={`${order.user?.firstName} ${order.user?.lastName}`} 
              disabled 
            />
          </div>
          
          <div className="form-group">
            <label>New Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {status === 'shipped' && (
            <div className="form-group">
              <label>Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={updating}>
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdersManagement;