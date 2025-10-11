// AccountDashboard.jsx - Complete Version
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FaUser, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, 
  FaHeart, FaCog, FaBell, FaShieldAlt, FaCoffee, FaStar,
  FaEdit, FaPlus, FaTrash, FaEye, FaEyeSlash, FaCheck,
  FaBox, FaTruck, FaCheckCircle, FaClock, FaUserCircle,
  FaExclamationTriangle, FaTimes, FaSearch, FaFilter,
  FaArrowLeft, FaArrowRight, FaShoppingCart, FaHistory,
  FaGift
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getDashboardData,
  updateProfile,
  updatePreferences,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updatePassword,
  deleteAccount,
  getDashboardOrders
} from '../../api/api';
import './AccountDashboard.css';

function AccountDashboard() {
  const { user, showNotification, logout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Main data states
  const [dashboardData, setDashboardData] = useState({
    user: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      profilePicture: '',
      preferences: {
        favoriteRoast: '',
        brewMethod: '',
      },
      loyalty: {
        points: 0,
        tier: 'Bronze',
        nextTier: 'Silver',
        progress: 0
      }
    },
    addresses: [],
    paymentMethods: [],
    stats: {
      totalOrders: 0,
      loyaltyPoints: 0,
      loyaltyTier: 'Bronze',
      loyaltyProgress: 0,
      favoritesCount: 0
    }
  });

  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    favoriteRoast: '',
    brewMethod: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });

  const [addressForm, setAddressForm] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Kenya',
    isDefault: false,
    instructions: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'mpesa',
    name: '',
    phone: '',
    isDefault: false
  });

  // UI states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, ordersPage]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardData();
      const data = response.data.data;
      
      setDashboardData(data);
      setRecentOrders(data.recentOrders || []);
      
      // Initialize forms with current data
      setProfileForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phone: data.user.phone || '',
        dateOfBirth: data.user.dateOfBirth || '',
        gender: data.user.gender || ''
      });

      setPreferencesForm(data.user.preferences || {
        favoriteRoast: '',
        brewMethod: ''
      });

    } catch (error) {
      console.error('Dashboard data error:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await getDashboardOrders({ page: ordersPage, limit: 10 });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Orders error:', error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Profile Management
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
      await fetchDashboardData(); // Refresh data
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    try {
      await updatePreferences(preferencesForm);
      await fetchDashboardData(); // Refresh data
      showNotification('Preferences updated successfully!', 'success');
    } catch (error) {
      console.error('Preferences error:', error);
      showNotification(error.response?.data?.message || 'Failed to update preferences', 'error');
    }
    setSaving(false);
  };

  // Password Management
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }

      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      showNotification('Password updated successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showPassword: false
      });
    } catch (error) {
      console.error('Password update error:', error);
      showNotification(error.response?.data?.message || 'Failed to update password', 'error');
    }
    setSaving(false);
  };

  // Address Management
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addAddress(addressForm);
      await fetchDashboardData(); // Refresh data
      setShowAddressModal(false);
      resetAddressForm();
      showNotification('Address added successfully!', 'success');
    } catch (error) {
      console.error('Add address error:', error);
      showNotification(error.response?.data?.message || 'Failed to add address', 'error');
    }
    setSaving(false);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAddress(editingAddress._id, addressForm);
      await fetchDashboardData(); // Refresh data
      setShowAddressModal(false);
      setEditingAddress(null);
      resetAddressForm();
      showNotification('Address updated successfully!', 'success');
    } catch (error) {
      console.error('Update address error:', error);
      showNotification(error.response?.data?.message || 'Failed to update address', 'error');
    }
    setSaving(false);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await deleteAddress(addressId);
      await fetchDashboardData(); // Refresh data
      showNotification('Address deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete address error:', error);
      showNotification(error.response?.data?.message || 'Failed to delete address', 'error');
    }
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({ ...address });
    } else {
      setEditingAddress(null);
      resetAddressForm();
    }
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'home',
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Kenya',
      isDefault: false,
      instructions: ''
    });
  };

  // Payment Methods Management
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addPaymentMethod(paymentForm);
      await fetchDashboardData(); // Refresh data
      setShowPaymentModal(false);
      resetPaymentForm();
      showNotification('Payment method added successfully!', 'success');
    } catch (error) {
      console.error('Add payment error:', error);
      showNotification(error.response?.data?.message || 'Failed to add payment method', 'error');
    }
    setSaving(false);
  };

  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePaymentMethod(editingPayment._id, paymentForm);
      await fetchDashboardData(); // Refresh data
      setShowPaymentModal(false);
      setEditingPayment(null);
      resetPaymentForm();
      showNotification('Payment method updated successfully!', 'success');
    } catch (error) {
      console.error('Update payment error:', error);
      showNotification(error.response?.data?.message || 'Failed to update payment method', 'error');
    }
    setSaving(false);
  };

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      await deletePaymentMethod(paymentId);
      await fetchDashboardData(); // Refresh data
      showNotification('Payment method deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete payment error:', error);
      showNotification(error.response?.data?.message || 'Failed to delete payment method', 'error');
    }
  };

  const openPaymentModal = (payment = null) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({ ...payment });
    } else {
      setEditingPayment(null);
      resetPaymentForm();
    }
    setShowPaymentModal(true);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: 'mpesa',
      name: '',
      phone: '',
      isDefault: false
    });
  };

  // Account Deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showNotification('Please enter your password to confirm deletion', 'error');
      return;
    }

    setSaving(true);
    try {
      await deleteAccount({ password: deletePassword });
      showNotification('Account deleted successfully', 'success');
      logout();
    } catch (error) {
      console.error('Delete account error:', error);
      showNotification(error.response?.data?.message || 'Failed to delete account', 'error');
    }
    setSaving(false);
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  // Order Card Component
  const OrderCard = ({ order, compact = false }) => (
    <div className={`order-card ${compact ? 'compact' : ''}`}>
      <div className="order-header">
        <div>
          <h4>Order #{order.orderNumber || order._id}</h4>
          <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="order-total">
          KES {order.totalAmount?.toLocaleString() || '0'}
        </div>
      </div>
      
      {!compact && order.items && (
        <div className="order-items">
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <span>{item.quantity}x {item.name}</span>
              <span>KES {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="order-footer">
        <div className="order-status">
          <span className={`status-badge ${order.status || 'pending'}`}>
            {order.status || 'Pending'}
          </span>
          {order.trackingNumber && (
            <span className="tracking">Tracking: {order.trackingNumber}</span>
          )}
        </div>
        <div className="order-actions">
          <button className="btn-outline">View Details</button>
          {order.status === 'delivered' && (
            <button className="btn-primary">Reorder</button>
          )}
        </div>
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ title, children, onClose }) => (
    <motion.div 
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );

  // Tab Components
  const OverviewTab = () => (
    <div className="dashboard-tab">
      <div className="welcome-section">
        <motion.div 
          className="welcome-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>
            Welcome back, {dashboardData.user.firstName}!
            <span className="coffee-emoji">☕</span>
          </h2>
          <p>Ready for your next coffee adventure?</p>
          <div className="welcome-stats">
            <span>Member since {new Date().getFullYear()}</span>
            <span className="tier-badge">{dashboardData.user.loyalty.tier}</span>
          </div>
        </motion.div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">
            <FaShoppingBag />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon loyalty">
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.user.loyalty.points}</h3>
            <p>Loyalty Points</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon heart">
            <FaHeart />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.stats.favoritesCount}</h3>
            <p>Favorites</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon address">
            <FaMapMarkerAlt />
          </div>
          <div className="stat-info">
            <h3>{dashboardData.addresses.length}</h3>
            <p>Saved Addresses</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="recent-orders-section">
          <div className="section-header">
            <h3>Recent Orders</h3>
            <button 
              className="btn-text"
              onClick={() => setActiveTab('orders')}
            >
              View All
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="orders-list compact">
              {recentOrders.map(order => (
                <OrderCard key={order._id} order={order} compact />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaShoppingCart className="empty-icon" />
              <h4>No orders yet</h4>
              <p>Your order history will appear here</p>
              <button className="btn-primary">Start Shopping</button>
            </div>
          )}
        </div>

        <div className="loyalty-section">
          <h3>Loyalty Program</h3>
          <div className="loyalty-card">
            <div className="tier-info">
              <div className="tier-badge large">{dashboardData.user.loyalty.tier}</div>
              <p>Next: {dashboardData.user.loyalty.nextTier} at 1000 points</p>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${dashboardData.user.loyalty.progress}%` }}
              ></div>
            </div>
            <div className="points-info">
              <span>{dashboardData.user.loyalty.points} points</span>
              <span>1000 points</span>
            </div>
            <div className="loyalty-benefits">
              <div className="benefit">
                <FaStar />
                <span>Earn 1 point per KES 100 spent</span>
              </div>
              <div className="benefit">
                <FaGift />
                <span>Exclusive member discounts</span>
              </div>
              <div className="benefit">
                <FaClock />
                <span>Priority customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div className="dashboard-tab">
      <div className="section-header">
        <h3>Personal Information</h3>
        <button 
          className="btn-outline"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>Cancel</>
          ) : (
            <><FaEdit /> Edit</>
          )}
        </button>
      </div>

      <form onSubmit={handleProfileUpdate} className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                firstName: e.target.value
              }))}
              disabled={!isEditing}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                lastName: e.target.value
              }))}
              disabled={!isEditing}
              required
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
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                phone: e.target.value
              }))}
              disabled={!isEditing}
              placeholder="+254 XXX XXX XXX"
            />
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={profileForm.dateOfBirth}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                dateOfBirth: e.target.value
              }))}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              value={profileForm.gender}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                gender: e.target.value
              }))}
              disabled={!isEditing}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      <div className="preferences-section">
        <div className="section-header">
          <h3>Coffee Preferences</h3>
          <button 
            className="btn-outline"
            onClick={handlePreferencesUpdate}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="preferences-grid">
          <div className="preference-item">
            <label>Favorite Roast</label>
            <select
              value={preferencesForm.favoriteRoast}
              onChange={(e) => setPreferencesForm(prev => ({
                ...prev,
                favoriteRoast: e.target.value
              }))}
            >
              <option value="">Select roast level</option>
              <option value="light">Light Roast</option>
              <option value="medium">Medium Roast</option>
              <option value="dark">Dark Roast</option>
            </select>
          </div>
          
          <div className="preference-item">
            <label>Brew Method</label>
            <select
              value={preferencesForm.brewMethod}
              onChange={(e) => setPreferencesForm(prev => ({
                ...prev,
                brewMethod: e.target.value
              }))}
            >
              <option value="">Select method</option>
              <option value="espresso">Espresso</option>
              <option value="pour-over">Pour Over</option>
              <option value="french-press">French Press</option>
              <option value="aeropress">AeroPress</option>
              <option value="cold-brew">Cold Brew</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const AddressesTab = () => (
    <div className="dashboard-tab">
      <div className="section-header">
        <h3>Saved Addresses</h3>
        <button 
          className="btn-primary"
          onClick={() => openAddressModal()}
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {dashboardData.addresses.length > 0 ? (
        <div className="addresses-grid">
          {dashboardData.addresses.map(address => (
            <div key={address._id} className="address-card">
              <div className="address-header">
                <h4>{address.name}</h4>
                <div className="address-badges">
                  <span className="type-badge">{address.type}</span>
                  {address.isDefault && <span className="default-badge">Default</span>}
                </div>
              </div>
              <div className="address-details">
                <p>{address.street}</p>
                <p>{address.city}, {address.postalCode}</p>
                <p>{address.country}</p>
                {address.instructions && (
                  <p className="instructions">Note: {address.instructions}</p>
                )}
              </div>
              <div className="address-actions">
                <button 
                  className="btn-outline"
                  onClick={() => openAddressModal(address)}
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button 
                    className="btn-text danger"
                    onClick={() => handleDeleteAddress(address._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaMapMarkerAlt className="empty-icon" />
          <h4>No addresses saved</h4>
          <p>Add your first address to make checkout easier</p>
          <button 
            className="btn-primary"
            onClick={() => openAddressModal()}
          >
            Add Address
          </button>
        </div>
      )}

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <Modal 
            title={editingAddress ? 'Edit Address' : 'Add New Address'}
            onClose={() => {
              setShowAddressModal(false);
              setEditingAddress(null);
              resetAddressForm();
            }}
          >
            <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Address Name *</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      street: e.target.value
                    }))}
                    placeholder="123 Coffee Street"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      city: e.target.value
                    }))}
                    placeholder="Nairobi"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      postalCode: e.target.value
                    }))}
                    placeholder="00100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <select
                    value={addressForm.country}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      country: e.target.value
                    }))}
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Uganda">Uganda</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Delivery Instructions (Optional)</label>
                  <textarea
                    value={addressForm.instructions}
                    onChange={(e) => setAddressForm(prev => ({
                      ...prev,
                      instructions: e.target.value
                    }))}
                    placeholder="Any special delivery instructions..."
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm(prev => ({
                        ...prev,
                        isDefault: e.target.checked
                      }))}
                    />
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    resetAddressForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );

  const PaymentMethodsTab = () => (
    <div className="dashboard-tab">
      <div className="section-header">
        <h3>Payment Methods</h3>
        <button 
          className="btn-primary"
          onClick={() => openPaymentModal()}
        >
          <FaPlus /> Add Payment Method
        </button>
      </div>

      {dashboardData.paymentMethods.length > 0 ? (
        <div className="payment-methods-list">
          {dashboardData.paymentMethods.map(payment => (
            <div key={payment._id} className="payment-card">
              <div className="payment-info">
                <div className={`payment-icon ${payment.type}`}>
                  {payment.type === 'mpesa' ? <FaCreditCard /> : <FaCreditCard />}
                </div>
                <div>
                  <h4>{payment.name}</h4>
                  <p>
                    {payment.type === 'mpesa' 
                      ? `Phone: ${payment.phone}` 
                      : `Card: •••• ${payment.card?.last4 || '1234'}`
                    }
                  </p>
                </div>
              </div>
              <div className="payment-actions">
                {payment.isDefault && <span className="default-badge">Default</span>}
                <button 
                  className="btn-outline"
                  onClick={() => openPaymentModal(payment)}
                >
                  Edit
                </button>
                {!payment.isDefault && (
                  <button 
                    className="btn-text danger"
                    onClick={() => handleDeletePaymentMethod(payment._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaCreditCard className="empty-icon" />
          <h4>No payment methods</h4>
          <p>Add a payment method for faster checkout</p>
          <button 
            className="btn-primary"
            onClick={() => openPaymentModal()}
          >
            Add Payment Method
          </button>
        </div>
      )}

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <Modal 
            title={editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
            onClose={() => {
              setShowPaymentModal(false);
              setEditingPayment(null);
              resetPaymentForm();
            }}
          >
            <form onSubmit={editingPayment ? handleUpdatePaymentMethod : handleAddPaymentMethod}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Type</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={paymentForm.name}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="e.g., My M-Pesa, Primary Card"
                    required
                  />
                </div>

                {paymentForm.type === 'mpesa' ? (
                  <div className="form-group full-width">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={paymentForm.phone}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      placeholder="+254 XXX XXX XXX"
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group full-width">
                    <label>Card Details</label>
                    <p className="info-text">Card payment integration coming soon</p>
                  </div>
                )}

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={paymentForm.isDefault}
                      onChange={(e) => setPaymentForm(prev => ({
                        ...prev,
                        isDefault: e.target.checked
                      }))}
                    />
                    Set as default payment method
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                    resetPaymentForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingPayment ? 'Update Payment Method' : 'Add Payment Method')}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );

  const OrdersTab = () => (
    <div className="dashboard-tab">
      <div className="section-header">
        <h3>Order History</h3>
        <div className="orders-filters">
          <div className="search-box">
            <FaSearch />
            <input type="text" placeholder="Search orders..." />
          </div>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {ordersLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="orders-list detailed">
            {orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
          
          <div className="pagination">
            <button 
              className="btn-outline"
              disabled={ordersPage === 1}
              onClick={() => setOrdersPage(prev => prev - 1)}
            >
              <FaArrowLeft /> Previous
            </button>
            <span>Page {ordersPage}</span>
            <button 
              className="btn-outline"
              onClick={() => setOrdersPage(prev => prev + 1)}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <FaHistory className="empty-icon" />
          <h4>No orders yet</h4>
          <p>Your order history will appear here once you place an order</p>
          <button className="btn-primary">Start Shopping</button>
        </div>
      )}
    </div>
  );

  const SecurityTab = () => (
    <div className="dashboard-tab">
      <div className="section-header">
        <h3>Security Settings</h3>
      </div>
      
      <div className="security-settings">
        <form onSubmit={handlePasswordUpdate} className="security-form">
          <div className="security-card">
            <div className="security-info">
              <div className="security-icon">
                <FaShieldAlt />
              </div>
              <div>
                <h4>Change Password</h4>
                <p>Update your password to keep your account secure</p>
              </div>
            </div>
            
            <div className="password-fields">
              <div className="form-group">
                <label>Current Password *</label>
                <div className="password-input">
                  <input
                    type={passwordForm.showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    placeholder="Enter current password"
                    required
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setPasswordForm(prev => ({
                      ...prev,
                      showPassword: !prev.showPassword
                    }))}
                  >
                    {passwordForm.showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>New Password *</label>
                <input
                  type={passwordForm.showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="Enter new password"
                  required
                />
                <div className="password-requirements">
                  <span className={passwordForm.newPassword.length >= 8 ? 'met' : ''}>
                    • 8+ characters
                  </span>
                  <span className={/[A-Z]/.test(passwordForm.newPassword) ? 'met' : ''}>
                    • 1 uppercase letter
                  </span>
                  <span className={/[a-z]/.test(passwordForm.newPassword) ? 'met' : ''}>
                    • 1 lowercase letter
                  </span>
                  <span className={/\d/.test(passwordForm.newPassword) ? 'met' : ''}>
                    • 1 number
                  </span>
                  <span className={/[@$!%*?&]/.test(passwordForm.newPassword) ? 'met' : ''}>
                    • 1 special character
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type={passwordForm.showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="Confirm new password"
                  required
                />
                {passwordForm.newPassword && passwordForm.confirmPassword && 
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <span className="error-text">Passwords do not match</span>
                )}
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
        
        <div className="security-card danger-zone">
          <div className="security-info">
            <div className="security-icon">
              <FaExclamationTriangle />
            </div>
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
          </div>
          <button 
            className="btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <Modal 
            title="Delete Your Account"
            onClose={() => {
              setShowDeleteConfirm(false);
              setDeletePassword('');
            }}
          >
            <div className="delete-warning">
              <FaExclamationTriangle className="warning-icon" />
              <h4>This action cannot be undone</h4>
              <p>All your data including orders, addresses, and preferences will be permanently deleted.</p>
              
              <div className="form-group">
                <label>Enter your password to confirm:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={saving || !deletePassword}
                >
                  {saving ? 'Deleting...' : 'Delete Account Permanently'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    { id: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
    { id: 'payments', label: 'Payments', icon: <FaCreditCard /> },
    { id: 'orders', label: 'Orders', icon: <FaShoppingBag /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      case 'addresses': return <AddressesTab />;
      case 'payments': return <PaymentMethodsTab />;
      case 'orders': return <OrdersTab />;
      case 'security': return <SecurityTab />;
      default: return <OverviewTab />;
    }
  };

  if (loading && !dashboardData.user.firstName) {
    return (
      <div className="account-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="account-dashboard">
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <div className="dashboard-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">
              {dashboardData.user.profilePicture ? (
                <img src={dashboardData.user.profilePicture} alt={`${dashboardData.user.firstName} ${dashboardData.user.lastName}`} />
              ) : (
                <FaUserCircle />
              )}
            </div>
            <div className="user-info">
              <h3>{dashboardData.user.firstName} {dashboardData.user.lastName}</h3>
              <p>{dashboardData.user.email}</p>
              <div className="user-tier">
                <span className="tier-badge small">{dashboardData.user.loyalty.tier}</span>
                <span className="points">{dashboardData.user.loyalty.points} points</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AccountDashboard;