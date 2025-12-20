// components/AccountDashboard.jsx - MODERN REDESIGN
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  FaUser, FaShoppingBag, FaMapMarkerAlt, FaCreditCard,
  FaHeart, FaCog, FaShieldAlt, FaCoffee,
  FaEdit, FaPlus, FaTrash, FaEye, FaEyeSlash,
  FaBox, FaTruck, FaCheckCircle, FaClock, FaUserCircle,
  FaExclamationTriangle, FaTimes, FaSearch, FaShippingFast,
  FaArrowLeft, FaArrowRight, FaShoppingCart, FaHistory,
  FaGift, FaBell, FaCrown, FaRocket, FaBars, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AccountDashboard.css';

function AccountDashboard() {
  const {
    user,
    showSuccess,
    showError,
    updateUserProfile,
    changeUserPassword,
    deleteAccount,
    fetchUserOrders,
    logout,
    loading: contextLoading,
    orderRefreshTrigger
  } = useContext(AppContext);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Combine loadings for UI
  const isLoading = contextLoading || localLoading;

  // Real data states
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    favoriteRoast: 'medium',
    brewMethod: 'espresso',
    subscription: false,
    notifications: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    // We need to either fetch all orders for stats or rely on the pagination total
    // For now, we'll use the pagination total and filter what we have for transit
    return {
      totalOrders: pagination.total || 0,
      favoritesCount: user?.favorites?.length || 0,
      ordersInTransit: orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length,
      monthlySpending: 0 // Mock for now
    };
  }, [pagination.total, user?.favorites, orders]);

  // Initialize form state when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: (user.dateOfBirth && !isNaN(new Date(user.dateOfBirth).getTime()))
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: user.gender || ''
      });

      // Initialize preferences if they exist
      if (user.preferences) {
        setPreferencesForm(prev => ({ ...prev, ...user.preferences }));
      }
    }
  }, [user]);

  // Fetch orders when tab changes to orders or tracking
  useEffect(() => {
    if (user && (activeTab === 'orders' || activeTab === 'tracking' || activeTab === 'overview')) {
      loadOrders();
    }
  }, [user, activeTab, orderRefreshTrigger]);

  const loadOrders = async (page = 1) => {
    setOrdersLoading(true);
    try {
      const data = await fetchUserOrders(page);
      if (data && data.data) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await updateUserProfile(profileForm);
      setIsEditing(false);
    } catch (error) {
      // Error handled in context
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      await updateUserProfile({ preferences: preferencesForm });
    } catch (error) {
      // Error handled in context
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      await changeUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', showPassword: false });
    } catch (error) {
      // Error handled in context
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLocalLoading(true);
      try {
        const res = await deleteAccount();
        // The context's deleteAccount already handles success message and logout
        // If we reach here, it means the API was successful
        navigate('/shop');
      } catch (error) {
        // Error already shown by context
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/shop');
  };

  // Enhanced tab configuration with modern icons
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <FaRocket />, color: '#d4af37' },
    { id: 'orders', label: 'My Orders', icon: <FaShoppingBag />, color: '#10b981' },
    { id: 'tracking', label: 'Track Order', icon: <FaShippingFast />, color: '#f59e0b' },
    { id: 'profile', label: 'My Profile', icon: <FaUserCircle />, color: '#3b82f6' },
    { id: 'security', label: 'Security', icon: <FaShieldAlt />, color: '#ef4444' }
  ];

  // Modern Order Card Component
  const OrderCard = ({ order, compact = false }) => {
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);

    const getProgress = (status) => {
      const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
      const index = steps.indexOf(status);
      return ((index + 1) / steps.length) * 100;
    };

    return (
      <div className={`modern-order-card ${compact ? 'compact' : ''} ${order.status} ${isTrackingOpen ? 'extended' : ''}`}>
        <div className="order-header" onClick={() => !compact && setIsTrackingOpen(!isTrackingOpen)}>
          <div className="order-meta">
            <h4>Order #{order.orderNumber}</h4>
            <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}</p>
          </div>
          <div className="order-amount">
            <span className="amount">KES {order.totalAmount?.toLocaleString()}</span>
            <span className={`status-badge ${order.status}`}>
              {order.status === 'delivered' && <FaCheckCircle />}
              {order.status === 'processing' && <FaClock />}
              {order.status === 'shipped' && <FaTruck />}
              {order.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {!compact && (
          <div className="order-progress-container">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${getProgress(order.status)}%` }}
              ></div>
            </div>
            <div className="progress-steps-labels">
              <span>Placed</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>
        )}

        {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && compact && (
          <div className="order-tracking">
            <FaTruck className="tracking-icon" />
            <div className="tracking-info">
              <span className="label">Tracking Number:</span>
              <span className="number">{order.trackingNumber}</span>
            </div>
          </div>
        )}

        {isTrackingOpen && !compact && (
          <div className="order-tracking-details">
            <div className="tracking-header">
              <h5><FaShippingFast /> Tracking Journey</h5>
              {order.trackingNumber && (
                <div className="tracking-id-badge">
                  <span>ID:</span> {order.trackingNumber}
                </div>
              )}
            </div>

            <div className="vertical-tracking-timeline">
              {order.trackingHistory && order.trackingHistory.length > 0 ? (
                order.trackingHistory.slice().reverse().map((event, index) => (
                  <div key={index} className="timeline-milestone">
                    <div className="milestone-indicator">
                      <div className="milestone-dot"></div>
                      <div className="milestone-line"></div>
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-meta">
                        <span className="milestone-status">{event.status}</span>
                        <span className="milestone-date">
                          {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="milestone-location">
                          <strong>Location:</strong> {event.location}
                        </div>
                      )}
                      <div className="milestone-message">{event.message}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="timeline-milestone active">
                  <div className="milestone-indicator">
                    <div className="milestone-dot"></div>
                    <div className="milestone-line"></div>
                  </div>
                  <div className="milestone-content">
                    <div className="milestone-meta">
                      <span className="milestone-status">Order Placed</span>
                      <span className="milestone-date">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="milestone-message">We've received your order and are getting it ready.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!compact && (
          <div className="order-items-preview">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="order-item-preview">
                <span className="item-name">{item.quantity}x {item.name}</span>
                <span className="item-price">KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="more-items">+{order.items.length - 2} more items</div>
            )}
          </div>
        )}

        <div className="order-actions">
          <button
            className="btn-outline btn-sm"
            onClick={() => setIsTrackingOpen(!isTrackingOpen)}
          >
            {isTrackingOpen ? 'Close Tracking' : 'Track Order'}
          </button>
          {order.status === 'delivered' && (
            <button className="btn-primary btn-sm">
              <FaShoppingCart /> Reorder
            </button>
          )}
        </div>
      </div>
    );
  };

  // Modern Stat Card Component
  const StatCard = ({ icon, value, label, trend, color }) => (
    <div className="modern-stat-card" style={{ '--card-color': color }}>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
        {trend && <span className="trend">{trend}</span>}
      </div>
    </div>
  );

  // Enhanced Overview Tab
  const OverviewTab = () => (
    <div className="modern-dashboard-tab">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>Welcome back, {user?.firstName}! 👋</h1>
            <p>Your coffee journey continues. Ready for your next brew?</p>
          </div>
          <div className="welcome-actions">
            <button className="btn-primary">
              <FaShoppingCart /> Order Coffee
            </button>
          </div>
        </div>
        <div className="welcome-graphic">
          <div className="coffee-cup"></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <StatCard
          icon={<FaShoppingBag />}
          value={stats.totalOrders}
          label="Total Orders"
          color="#3b82f6"
        />
        <StatCard
          icon={<FaTruck />}
          value={stats.ordersInTransit}
          label="In Transit"
          color="#d4af37"
        />
        <StatCard
          icon={<FaHeart />}
          value={stats.favoritesCount}
          label="Favorites"
          color="#ef4444"
        />
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Orders */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button
              className="btn-text"
              onClick={() => setActiveTab('orders')}
            >
              View All <FaArrowRight />
            </button>
          </div>
          {ordersLoading ? (
            <div className="loading-spinner"></div>
          ) : orders.length > 0 ? (
            <div className="orders-list-compact">
              {orders.slice(0, 3).map(order => (
                <OrderCard key={order._id || order.id} order={order} compact />
              ))}
            </div>
          ) : (
            <p className="no-data">No recent orders found.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="content-card quick-actions-card">
          <h3>Quick Settings</h3>
          <div className="quick-actions-grid">
            <button className="quick-action" onClick={() => setActiveTab('profile')}>
              <div className="action-icon">
                <FaEdit />
              </div>
              <span>Edit Profile</span>
            </button>
            <button className="quick-action" onClick={() => setActiveTab('security')}>
              <div className="action-icon">
                <FaShieldAlt />
              </div>
              <span>Security</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/shop')}>
              <div className="action-icon">
                <FaShoppingCart />
              </div>
              <span>Shop</span>
            </button>
          </div>
        </div>
      </div >
    </div >
  );

  // Enhanced Profile Tab
  const ProfileTab = () => (
    <div className="modern-dashboard-tab">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p>{user?.email}</p>
          </div>
        </div>
        <button
          className={`edit-toggle-btn ${isEditing ? 'editing' : ''}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>Cancel Editing</>
          ) : (
            <><FaEdit /> Edit Profile</>
          )}
        </button>
      </div>

      <div className="profile-content-grid">
        {/* Personal Information */}
        <div className="content-card">
          <h3>Personal Information</h3>
          <form className="modern-form" onSubmit={handleProfileUpdate}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? 'disabled' : ''}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="disabled"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="+254 XXX XXX XXX"
                />
              </div>
            </div>
            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  // Orders Tab
  const OrdersTab = () => (
    <div className="modern-dashboard-tab">
      <div className="tab-header">
        <h2>My Orders</h2>
        <div className="tab-actions">
          <div className="search-bar">
            <FaSearch />
            <input type="text" placeholder="Search orders..." />
          </div>
        </div>
      </div>

      {ordersLoading ? (
        <div className="loading-spinner"></div>
      ) : orders.length > 0 ? (
        <div className="orders-list">
          {orders.map(order => (
            <OrderCard key={order._id || order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaBox />
          <h3>No orders yet</h3>
          <p>Time to discover your favorite coffee!</p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );

  // Security Tab
  const SecurityTab = () => (
    <div className="modern-dashboard-tab">
      <div className="tab-header">
        <h2>Security Settings</h2>
      </div>

      <div className="security-grid">
        <div className="content-card">
          <h3>Change Password</h3>
          <form className="modern-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input">
                <input
                  type={passwordForm.showPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={passwordForm.showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input">
                <input
                  type={passwordForm.showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="showPassword"
                checked={passwordForm.showPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, showPassword: e.target.checked }))}
              />
              <label htmlFor="showPassword">Show Passwords</label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="content-card">
          <h3>Account Management</h3>
          <div className="danger-zone">
            <div className="danger-item">
              <div className="danger-info">
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
              <button
                className="btn-danger btn-sm"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Tracking Tab
  const TrackingTab = () => {
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));

    return (
      <div className="modern-dashboard-tab">
        <div className="tab-header">
          <h2>Order Tracking</h2>
          <p>Real-time updates on your coffee shipments</p>
        </div>

        <div className="tracking-overview-grid">
          <div className="content-card in-transit-card">
            <div className="card-header">
              <h3>Active Deliveries ({activeOrders.length})</h3>
              <div className="live-indicator">
                <span className="dot"></span>
                Live Updates
              </div>
            </div>
            {activeOrders.length > 0 ? (
              <div className="orders-list">
                {activeOrders.map(order => (
                  <OrderCard key={order._id || order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="empty-tracking">
                <FaBox className="empty-icon" />
                <p>No active deliveries at the moment.</p>
                <button className="btn-outline" onClick={() => navigate('/shop')}>Shop Now</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render function for tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      case 'orders': return <OrdersTab />;
      case 'tracking': return <TrackingTab />;
      case 'security': return <SecurityTab />;
      default: return <OverviewTab />;
    }
  };

  if (!user) {
    return (
      <div className="modern-account-dashboard">
        <div className="login-prompt-modern">
          <div className="prompt-content">
            <FaUserCircle className="prompt-icon" />
            <h2>Welcome to Your Coffee Journey</h2>
            <p>Sign in to access your personalized dashboard, track orders, and manage your coffee preferences.</p>
            <button className="btn-primary">Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-account-dashboard">
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className="modern-dashboard-container">
        {/* Modern Sidebar */}
        <div className={`modern-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="user-card-modern">
              <div className="avatar-modern">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              <div className="user-info-modern">
                <h3>{user?.firstName} {user?.lastName}</h3>
                <p>{user?.email}</p>
                <div className="user-stats">
                  {/* Stats removed */}
                </div>
              </div>
            </div>
          </div>

          <nav className="modern-sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`modern-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                style={{ '--active-color': tab.color }}
              >
                <span className="nav-icon-modern">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
                <div className="active-indicator"></div>
              </button>
            ))}
            <button
              className="modern-nav-item logout-btn"
              onClick={handleLogout}
              style={{ '--active-color': 'var(--accent-red)', marginTop: 'auto' }}
            >
              <span className="nav-icon-modern"><FaSignOutAlt /></span>
              <span className="nav-label">Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="modern-main-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default AccountDashboard;