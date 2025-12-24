// components/OrderConfirmation/OrderConfirmation.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaCheckCircle, FaBox, FaCalendar, FaCreditCard, FaTruck, FaDownload, FaHome, FaReceipt } from 'react-icons/fa';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification, token, refreshOrders } = useContext(AppContext);

    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // Refresh global order state to ensure dashboard is updated
        refreshOrders();

        if (!order && id) {
            fetchOrder();
        }
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, [id, order, refreshOrders]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch order');

            const result = await response.json();
            if (result.success) {
                setOrder(result.data);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Fetch order error:', error);
            showNotification('Failed to load order details', 'error');
            navigate('/account/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            showNotification('Generating invoice...', 'info');
            const response = await fetch(`/api/orders/${id}/invoice`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to download invoice');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            showNotification('Invoice downloaded successfully', 'success');
        } catch (error) {
            console.error('Invoice download error:', error);
            showNotification('Failed to download invoice', 'error');
        }
    };

    const getEstimatedDelivery = () => {
        const orderDate = new Date(order.createdAt);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(orderDate.getDate() + 5);

        return deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPaymentStatusLabel = (status) => {
        const labels = {
            pending: 'Pending Payment',
            paid: 'Payment Confirmed',
            failed: 'Payment Failed',
            refunded: 'Refunded'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="order-confirmation-loading">
                <div className="loading-spinner"></div>
                <p>Loading your order...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-confirmation-error">
                <h2>Order Not Found</h2>
                <p>We could not find the order you are looking for.</p>
                <button className="btn-primary" onClick={() => navigate('/account/orders')}>
                    View All Orders
                </button>
            </div>
        );
    }

    return (
        <div className="order-confirmation">
            {showConfetti && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="confetti" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            backgroundColor: ['#6F4E37', '#A67C52', '#D4A76A', '#FFD700'][Math.floor(Math.random() * 4)]
                        }}></div>
                    ))}
                </div>
            )}

            <div className="confirmation-header">
                <div className="success-icon">
                    <FaCheckCircle />
                </div>
                <h1>Order Placed Successfully!</h1>
                <p className="confirmation-message">
                    Thank you for your order. We have received your order and will start processing it shortly.
                </p>
            </div>

            <div className="order-number-box">
                <FaReceipt className="receipt-icon" />
                <div className="order-number-content">
                    <span className="order-label">Order Number</span>
                    <span className="order-number">#{order.orderNumber}</span>
                </div>
            </div>

            <div className="order-details-grid">
                <div className="info-card">
                    <div className="card-header">
                        <FaBox />
                        <h3>Order Information</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Order Date:</span>
                            <span className="info-value">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status:</span>
                            <span className={`status-badge ${order.status}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Items:</span>
                            <span className="info-value">{order.items?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="info-card">
                    <div className="card-header">
                        <FaCreditCard />
                        <h3>Payment Details</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Method:</span>
                            <span className="info-value">{order.paymentMethod.toUpperCase()}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Payment Status:</span>
                            <span className={`status-badge ${order.paymentStatus}`}>
                                {getPaymentStatusLabel(order.paymentStatus)}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Total Paid:</span>
                            <span className="info-value amount">KSh {order.total?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="info-card full-width">
                    <div className="card-header">
                        <FaTruck />
                        <h3>Delivery Information</h3>
                    </div>
                    <div className="card-content">
                        <div className="info-row">
                            <span className="info-label">Estimated Delivery:</span>
                            <span className="info-value">
                                <FaCalendar className="inline-icon" /> {getEstimatedDelivery()}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Shipping Address:</span>
                            <div className="address-box">
                                <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.county}</p>
                                <p>{order.shippingAddress?.country}</p>
                                <p>{order.shippingAddress?.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="order-items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                    {order.items?.map((item, index) => (
                        <div key={index} className="order-item">
                            <div className="item-image">
                                <img src={item.image || '/default-product.jpg'} alt={item.name} />
                            </div>
                            <div className="item-details">
                                <h4>{item.name}</h4>
                                <p className="item-size">Size: {item.size}</p>
                                <p className="item-quantity">Quantity: {item.quantity}</p>
                            </div>
                            <div className="item-price">
                                <span>KSh {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="order-summary">
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>KSh {order.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping:</span>
                        <span>KSh {order.shippingCost?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax (16% VAT):</span>
                        <span>KSh {order.tax?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total Amount:</span>
                        <span>KSh {order.total?.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="confirmation-actions">
                <button className="btn-primary" onClick={() => navigate(`/order-tracking/${order._id}`)}>
                    <FaTruck /> Track Order
                </button>
                <button className="btn-outline" onClick={handleDownloadInvoice}>
                    <FaDownload /> Download Invoice
                </button>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                    <FaHome /> Continue Shopping
                </button>
            </div>

            <div className="whats-next">
                <h3>What happens next?</h3>
                <div className="next-steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <p>We'll confirm your order and start preparing it</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <p>You'll receive email updates on your order status</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <p>Your order will be shipped within 1-2 business days</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <p>Enjoy your premium Rerendet Coffee!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
