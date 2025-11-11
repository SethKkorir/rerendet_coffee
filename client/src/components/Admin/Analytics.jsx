import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaChartLine, FaShoppingCart, FaUsers, FaBox } from 'react-icons/fa';
import './Analytics.css';

const Analytics = () => {
  const { showNotification } = useContext(AppContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/analytics/sales?period=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      showNotification('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [timeframe, showNotification]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <div className="header-actions">
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
          <button className="btn-primary" onClick={fetchAnalytics}>
            Refresh
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {/* Sales Overview */}
        <div className="analytics-section">
          <h2>Sales Overview</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <FaChartLine className="metric-icon" />
              <div className="metric-content">
                <h3>KES {analytics?.salesData?.totalRevenue?.toLocaleString() || '0'}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="metric-card">
              <FaShoppingCart className="metric-icon" />
              <div className="metric-content">
                <h3>{analytics?.salesData?.totalOrders || '0'}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="metric-card">
              <FaUsers className="metric-icon" />
              <div className="metric-content">
                <h3>{analytics?.customerStats?.totalCustomers || '0'}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className="metric-card">
              <FaBox className="metric-icon" />
              <div className="metric-content">
                <h3>{analytics?.topProducts?.length || '0'}</h3>
                <p>Products Sold</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="analytics-section">
          <h2>Revenue Trends</h2>
          <div className="chart-placeholder">
            <p>Revenue charts will be implemented with Chart.js</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="analytics-section">
          <h2>Top Performing Products</h2>
          <div className="top-products">
            {analytics?.topProducts?.map((product, index) => (
              <div key={product._id} className="product-rank">
                <span className="rank">#{index + 1}</span>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>
                <div className="product-stats">
                  <span className="revenue">KES {product.totalRevenue?.toLocaleString()}</span>
                  <span className="sold">{product.totalSold} sold</span>
                </div>
              </div>
            )) || (
              <div className="empty-state">
                <p>No product data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;