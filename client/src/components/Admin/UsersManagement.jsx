// src/components/Admin/UsersManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaCalendar, FaSync, FaTimes, FaShoppingBag, FaMapMarkerAlt, FaTrash, FaUserTag } from 'react-icons/fa';
import './UsersManagement.css';

const UsersManagement = () => {
  const { showAlert, fetchAdminUsers, updateUserRole, deleteUser, token } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetchAdminUsers(filters);

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Users fetch error:', error);
      showAlert('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole });
        }
      }
    } catch (error) {
      console.error('Role update error:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await deleteUser(userId);
      if (response.success) {
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setShowUserModal(false);
        }
      }
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const UserRow = ({ user }) => (
    <tr className="user-row">
      <td>
        <div className="user-info">
          <div className="user-avatar">
            <FaUser />
          </div>
          <div className="user-details">
            <h4>{user.firstName} {user.lastName}</h4>
            <span className="user-role">{user.userType || 'customer'}</span>
          </div>
        </div>
      </td>
      <td>
        <div className="user-contact">
          <FaEnvelope className="contact-icon" />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="user-contact">
            <FaPhone className="contact-icon" />
            <span>{user.phone}</span>
          </div>
        )}
      </td>
      <td>
        <div className="user-date">
          <FaCalendar className="date-icon" />
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td>
        <span className={`status-badge ${user.isVerified ? 'active' : 'inactive'}`}>
          {user.isVerified ? 'Verified' : 'Pending'}
        </span>
      </td>
      <td>
        <div className="user-actions">
          <button
            className="btn-view"
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
          >
            Details
          </button>
          <button
            className="btn-delete"
            onClick={() => handleDeleteUser(user._id)}
            title="Delete User"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="users-management">
      <div className="page-header">
        <div className="header-title">
          <h1>Users Management</h1>
          <p>Manage your customer accounts and profiles</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-refresh"
            onClick={fetchUsers}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <FaUser className="empty-icon" />
                      <p>No users found</p>
                      {filters.search && (
                        <button
                          className="btn-clear-search"
                          onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                        >
                          Clear search
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <UserRow key={user._id} user={user} />
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {filters.page} of {pagination.pages}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

// User Details Modal Component
const UserDetailModal = ({ user, onRoleChange, onDelete, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Details</h3>
          <button className="close-modal" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="user-profile-header">
          <div className="large-avatar">
            <FaUser />
          </div>
          <div className="profile-main-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <span className={`status-badge ${user.userType}`}>{user.userType}</span>
          </div>
        </div>

        <div className="user-details-grid">
          <div className="detail-section">
            <h4><FaEnvelope /> Contact Info</h4>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
          </div>

          <div className="detail-section">
            <h4><FaCalendar /> Account Info</h4>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {user.isVerified ? 'Verified' : 'Unverified'}</p>
            <p><strong>ID:</strong> {user._id}</p>
          </div>

          <div className="detail-section">
            <h4><FaUserTag /> System Role</h4>
            <div className="role-selector">
              <select
                value={user.role || 'customer'}
                onChange={(e) => onRoleChange(user._id, e.target.value)}
                className="modal-select"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>
            <p className="role-warning">Changing a role grants/revokes administrative access.</p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-outline danger" onClick={() => onDelete(user._id)}>
            <FaTrash /> Delete Account
          </button>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;