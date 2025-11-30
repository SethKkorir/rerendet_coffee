// components/AccountDashboard.jsx - MODERN REDESIGN
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FaUser, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, 
  FaHeart, FaCog, FaShieldAlt, FaCoffee, FaStar,
  FaEdit, FaPlus, FaTrash, FaEye, FaEyeSlash,
  FaBox, FaTruck, FaCheckCircle, FaClock, FaUserCircle,
  FaExclamationTriangle, FaTimes, FaSearch,
  FaArrowLeft, FaArrowRight, FaShoppingCart, FaHistory,
  FaGift, FaBell, FaCrown, FaAward, FaRocket
} from 'react-icons/fa';
import './AccountDashboard.css';

function AccountDashboard() {
  const { user, showSuccess, showError, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Enhanced data states with modern structure
  const [dashboardData, setDashboardData] = useState({
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      profilePicture: user?.profilePicture || '',
      preferences: {
        favoriteRoast: '',
        brewMethod: '',
        subscription: false,
        notifications: true
      },
      loyalty: {
        points: 450,
        tier: 'Gold',
        nextTier: 'Platinum',
        progress: 65,
        benefits: ['Free Shipping', 'Early Access', 'Member Discounts']
      }
    },
    addresses: [
      {
        _id: '1',
        type: 'home',
        name: 'Home',
        street: '123 Coffee Street',
        city: 'Nairobi',
        postalCode: '00100',
        country: 'Kenya',
        isDefault: true,
        instructions: 'Ring bell twice'
      }
    ],
    stats: {
      totalOrders: 12,
      loyaltyPoints: 450,
      loyaltyTier: 'Gold',
      loyaltyProgress: 65,
      favoritesCount: 8,
      monthlySpending: 12500
    }
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      _id: '1',
      orderNumber: 'RC-2024-001',
      createdAt: new Date().toISOString(),
      totalAmount: 2850,
      status: 'delivered',
      items: [
        { name: 'Ethiopian Yirgacheffe', quantity: 1, price: 1200 },
        { name: 'Coffee Mug', quantity: 1, price: 650 }
      ]
    },
    {
      _id: '2',
      orderNumber: 'RC-2024-002',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      totalAmount: 1800,
      status: 'processing',
      items: [
        { name: 'Kenya AA', quantity: 1, price: 950 }
      ]
    }
  ]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
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

  // Initialize with user data
  useEffect(() => {
    if (user) {
      setDashboardData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          profilePicture: user.profilePicture || ''
        }
      }));

      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  // Enhanced tab configuration with modern icons
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <FaRocket />, color: 'var(--accent-purple)' },
    { id: 'profile', label: 'My Profile', icon: <FaUserCircle />, color: 'var(--accent-blue)' },
    { id: 'orders', label: 'My Orders', icon: <FaShoppingBag />, color: 'var(--accent-green)' },
    { id: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt />, color: 'var(--accent-orange)' },
    { id: 'security', label: 'Security', icon: <FaShieldAlt />, color: 'var(--accent-red)' }
  ];

  // Modern Order Card Component
  const OrderCard = ({ order, compact = false }) => (
    <div className={`modern-order-card ${compact ? 'compact' : ''} ${order.status}`}>
      <div className="order-header">
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
        <button className="btn-outline btn-sm">View Details</button>
        {order.status === 'delivered' && (
          <button className="btn-primary btn-sm">
            <FaShoppingCart /> Reorder
          </button>
        )}
      </div>
    </div>
  );

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
            <h1>Welcome back, {dashboardData.user.firstName}! 👋</h1>
            <p>Your coffee journey continues. Ready for your next brew?</p>
          </div>
          <div className="welcome-actions">
            <button className="btn-primary">
              <FaShoppingCart /> Order Coffee
            </button>
            <button className="btn-outline">
              <FaGift /> View Rewards
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
          value={dashboardData.stats.totalOrders}
          label="Total Orders"
          trend="+2 this month"
          color="var(--accent-blue)"
        />
        <StatCard 
          icon={<FaStar />}
          value={dashboardData.stats.loyaltyPoints}
          label="Loyalty Points"
          trend="45 to next tier"
          color="var(--accent-gold)"
        />
        <StatCard 
          icon={<FaHeart />}
          value={dashboardData.stats.favoritesCount}
          label="Favorites"
          trend="+1 recently"
          color="var(--accent-pink)"
        />
        <StatCard 
          icon={<FaCoffee />}
          value={`KES ${dashboardData.stats.monthlySpending?.toLocaleString()}`}
          label="Monthly Spend"
          trend="On track"
          color="var(--accent-green)"
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
          <div className="orders-list-compact">
            {recentOrders.map(order => (
              <OrderCard key={order._id} order={order} compact />
            ))}
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="content-card loyalty-card">
          <div className="card-header">
            <h3>Loyalty Status</h3>
            <div className="tier-badge premium">
              <FaCrown /> {dashboardData.user.loyalty.tier}
            </div>
          </div>
          <div className="loyalty-progress">
            <div className="progress-info">
              <span>{dashboardData.user.loyalty.points} points</span>
              <span>Next: {dashboardData.user.loyalty.nextTier}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${dashboardData.user.loyalty.progress}%` }}
              ></div>
            </div>
            <div className="loyalty-benefits">
              {dashboardData.user.loyalty.benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <FaAward />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-card quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="quick-action">
              <div className="action-icon">
                <FaEdit />
              </div>
              <span>Edit Profile</span>
            </button>
            <button className="quick-action">
              <div className="action-icon">
                <FaMapMarkerAlt />
              </div>
              <span>Add Address</span>
            </button>
            <button className="quick-action">
              <div className="action-icon">
                <FaBell />
              </div>
              <span>Notifications</span>
            </button>
            <button className="quick-action">
              <div className="action-icon">
                <FaHeart />
              </div>
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {/* Coffee Recommendations */}
        <div className="content-card recommendations-card">
          <h3>Just For You</h3>
          <div className="recommendations">
            <div className="recommendation-item">
              <div className="rec-image"></div>
              <div className="rec-info">
                <h4>Based on your taste</h4>
                <p>Try our new Ethiopian blend</p>
                <button className="btn-outline btn-sm">Discover</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Profile Tab
  const ProfileTab = () => (
    <div className="modern-dashboard-tab">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            {dashboardData.user.profilePicture ? (
              <img src={dashboardData.user.profilePicture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
            <button className="edit-avatar-btn">
              <FaEdit />
            </button>
          </div>
          <div className="profile-info">
            <h2>{dashboardData.user.firstName} {dashboardData.user.lastName}</h2>
            <p>{dashboardData.user.email}</p>
            <div className="member-since">
              Member since {new Date().getFullYear()}
            </div>
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
          <form className="modern-form">
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
                  value={dashboardData.user.email}
                  disabled
                  className="disabled"
                />
                <small>Contact support to change email</small>
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
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Coffee Preferences */}
        <div className="content-card">
          <h3>Coffee Preferences</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <label>Favorite Roast Level</label>
              <select
                value={preferencesForm.favoriteRoast}
                onChange={(e) => setPreferencesForm(prev => ({ ...prev, favoriteRoast: e.target.value }))}
              >
                <option value="light">Light Roast</option>
                <option value="medium">Medium Roast</option>
                <option value="dark">Dark Roast</option>
              </select>
            </div>
            <div className="preference-item">
              <label>Brew Method</label>
              <select
                value={preferencesForm.brewMethod}
                onChange={(e) => setPreferencesForm(prev => ({ ...prev, brewMethod: e.target.value }))}
              >
                <option value="espresso">Espresso</option>
                <option value="pour-over">Pour Over</option>
                <option value="french-press">French Press</option>
                <option value="aeropress">AeroPress</option>
              </select>
            </div>
          </div>
          <div className="preference-actions">
            <button className="btn-primary" onClick={() => showSuccess('Preferences updated!')}>
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render function for tabs
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      // Add other tabs here...
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
      <div className="modern-dashboard-container">
        {/* Modern Sidebar */}
        <div className="modern-sidebar">
          <div className="sidebar-header">
            <div className="user-card-modern">
              <div className="avatar-modern">
                {dashboardData.user.profilePicture ? (
                  <img src={dashboardData.user.profilePicture} alt="Profile" />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              <div className="user-info-modern">
                <h3>{dashboardData.user.firstName} {dashboardData.user.lastName}</h3>
                <p>{dashboardData.user.email}</p>
                <div className="user-stats">
                  <span className="points-badge">
                    <FaStar /> {dashboardData.user.loyalty.points} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav className="modern-sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`modern-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ '--active-color': tab.color }}
              >
                <span className="nav-icon-modern">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
                <div className="active-indicator"></div>
              </button>
            ))}
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