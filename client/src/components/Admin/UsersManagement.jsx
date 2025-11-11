// src/components/Admin/UsersManagement.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import './UsersManagement.css';

const UsersManagement = () => {
  const { showNotification } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Users fetch error:', error);
      showNotification('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const UserRow = ({ user }) => (
    <tr className="user-row">
      <td>
        <div className="user-info">
          <FaUser className="user-avatar" />
          <div>
            <h4>{user.firstName} {user.lastName}</h4>
            <p className="user-role capitalize">{user.role}</p>
          </div>
        </div>
      </td>
      <td>
        <div className="user-contact">
          <FaEnvelope />
          <span>{user.email}</span>
        </div>
        {user.phone && (
          <div className="user-contact">
            <FaPhone />
            <span>{user.phone}</span>
          </div>
        )}
      </td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div className="user-actions">
          <button className="btn-outline sm">View Details</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="users-management">
      <div className="page-header">
        <h1>Users Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchUsers}>
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
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
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
              {users.map(user => (
                <UserRow key={user._id} user={user} />
              ))}
            </tbody>
          </table>
        )}

        {!loading && users.length === 0 && (
          <div className="empty-state">
            <FaUser className="empty-icon" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;