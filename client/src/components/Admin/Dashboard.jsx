// src/components/Admin/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FaShoppingBag, FaDollarSign, FaUsers, FaBox, 
  FaArrowUp, FaArrowDown, FaEye
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { showNotification } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/dashboard/analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setRecentOrders(data.data.recentOrders || []);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && (
          <div className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <div className="timeframe-selector">
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="timeframe-select"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={`KES ${stats?.revenueAnalytics?.current?.totalRevenue?.toLocaleString() || '0'}`}
          change={stats?.revenueAnalytics?.growth}
          icon={<FaDollarSign />}
          color="#10b981"
        />
        <StatCard
          title="Total Orders"
          value={stats?.overview?.totalOrders?.toLocaleString() || '0'}
          change={12} // You would calculate this from analytics
          icon={<FaShoppingBag />}
          color="#3b82f6"
        />
        <StatCard
          title="Total Customers"
          value={stats?.overview?.totalUsers?.toLocaleString() || '0'}
          change={8}
          icon={<FaUsers />}
          color="#8b5cf6"
        />
        <StatCard
          title="Total Products"
          value={stats?.overview?.totalProducts?.toLocaleString() || '0'}
          change={5}
          icon={<FaBox />}
          color="#f59e0b"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="dashboard-content">
        {/* Sales Chart - Placeholder */}
        <div className="chart-section">
          <div className="section-header">
            <h3>Sales Overview</h3>
            <button className="btn-outline">View Report</button>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <p>Sales chart will be implemented with Chart.js</p>
              {/* You can integrate Chart.js here */}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <div className="section-header">
            <h3>Recent Orders</h3>
            <button className="btn-text">View All</button>
          </div>
          <div className="orders-list">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <h4>#{order.orderNumber}</h4>
                    <p>{order.user?.firstName} {order.user?.lastName}</p>
                  </div>
                  <div className="order-amount">
                    KES {order.totalAmount?.toLocaleString()}
                  </div>
                  <div className={`order-status ${order.status}`}>
                    {order.status}
                  </div>
                  <div className="order-actions">
                    <button className="btn-outline sm">
                      <FaEye /> View
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <h4>Conversion Rate</h4>
            <div className="stat-value">3.2%</div>
          </div>
          <div className="stat-item">
            <h4>Avg. Order Value</h4>
            <div className="stat-value">
              KES {stats?.revenueAnalytics?.current?.averageOrderValue?.toFixed(2) || '0'}
            </div>
          </div>
          <div className="stat-item">
            <h4>Pending Orders</h4>
            <div className="stat-value">12</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;