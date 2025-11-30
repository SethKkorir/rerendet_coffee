// src/components/Admin/UsersManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaCalendar, FaSync } from 'react-icons/fa';
import './UsersManagement.css';

const UsersManagement = () => {
  const { showAlert, fetchAdminUsers } = useContext(AppContext);
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
            onClick={() => showAlert('View user details feature coming soon', 'info')}
          >
            View Details
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
    </div>
  );
};

export default UsersManagement;