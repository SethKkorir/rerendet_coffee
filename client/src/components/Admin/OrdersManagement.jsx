// src/components/Admin/OrdersManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaFilter, FaEye, FaEdit, FaShippingFast, FaSync } from 'react-icons/fa';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const { showNotification, token } = useContext(AppContext);
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
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/admin/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders || []);
        setPagination(data.data.pagination || {});
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      showNotification(error.message || 'Failed to load orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingNumber = '') => {
    try {
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
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      showNotification(error.message || 'Failed to update order status', 'error');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'orange',
      confirmed: 'blue',
      processing: 'purple',
      shipped: 'teal',
      delivered: 'green',
      cancelled: 'red'
    };

    const statusLabels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`status-badge ${statusColors[status] || 'gray'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const PaymentStatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'orange',
      paid: 'green',
      failed: 'red',
      refunded: 'gray'
    };

    return (
      <span className={`status-badge ${statusColors[status] || 'gray'}`}>
        {status}
      </span>
    );
  };

  const OrderRow = ({ order }) => (
    <tr className="order-row">
      <td>
        <strong>#{order.orderNumber}</strong>
        <br />
        <small style={{ color: '#666' }}>
          {new Date(order.createdAt).toLocaleDateString()}
        </small>
      </td>
      <td>
        {order.user ? (
          <>
            {order.user.firstName} {order.user.lastName}
            <br />
            <small>{order.user.email}</small>
          </>
        ) : (
          <span style={{ color: '#999' }}>Guest Order</span>
        )}
      </td>
      <td>
        <div>
          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
          <br />
          <small>{order.shippingAddress?.city}, {order.shippingAddress?.country}</small>
        </div>
      </td>
      <td>
        KES {order.total?.toLocaleString()}
        <br />
        <small style={{ fontSize: '0.8em', color: '#666' }}>
          {order.paymentMethod}
        </small>
      </td>
      <td>
        <StatusBadge status={order.status} />
        <br />
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td>
        <div className="order-actions">
          <button 
            className="btn-icon info"
            onClick={() => {
              setSelectedOrder(order);
              setShowOrderModal(true);
            }}
            title="View Details"
          >
            <FaEye />
          </button>
          <button 
            className="btn-icon warning"
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
              onClick={() => updateOrderStatus(order._id, 'processing')}
              title="Start Processing"
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
          <button 
            className="btn-primary" 
            onClick={fetchOrders}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
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
            placeholder="Search by order number, customer name..."
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
          <option value="processing">Processing</option>
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
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Shipping Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order._id} order={order} />
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="empty-state">
                <p>No orders found</p>
                <button 
                  className="btn-outline" 
                  onClick={fetchOrders}
                >
                  Try Again
                </button>
              </div>
            )}
          </>
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
            Page {filters.page} of {pagination.pages} ({pagination.total} total orders)
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

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
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

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Order Details - #{order.orderNumber}</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <div className="order-details">
          {/* Customer Information */}
          <div className="detail-section">
            <h4>Customer Information</h4>
            <div className="detail-grid">
              <div>
                <strong>Name:</strong> {order.user?.firstName} {order.user?.lastName}
              </div>
              <div>
                <strong>Email:</strong> {order.user?.email}
              </div>
              <div>
                <strong>Phone:</strong> {order.shippingAddress?.phone}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="detail-section">
            <h4>Shipping Address</h4>
            <div className="shipping-address">
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.country}<br />
              {order.shippingAddress?.postalCode && `Postal Code: ${order.shippingAddress.postalCode}`}
            </div>
          </div>

          {/* Order Items */}
          <div className="detail-section">
            <h4>Order Items</h4>
            <div className="order-items">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">KES {item.price?.toLocaleString()}</div>
                    <div className="item-quantity">Qty: {item.quantity}</div>
                    <div className="item-total">KES {(item.price * item.quantity)?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="detail-section">
            <h4>Order Summary</h4>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>KES {order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>KES {order.shippingCost?.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>KES {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Meta */}
          <div className="detail-section">
            <h4>Order Information</h4>
            <div className="detail-grid">
              <div>
                <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Status:</strong> <span className={`status-badge ${order.status}`}>{order.status}</span>
              </div>
              <div>
                <strong>Payment Status:</strong> <span className={`status-badge ${order.paymentStatus}`}>{order.paymentStatus}</span>
              </div>
              <div>
                <strong>Payment Method:</strong> {order.paymentMethod}
              </div>
              {order.transactionId && (
                <div>
                  <strong>Transaction ID:</strong> {order.transactionId}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Update Modal Component (keep the existing one)
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
              <option value="processing">Processing</option>
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