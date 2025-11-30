// src/components/Admin/Analytics.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaChartLine, FaShoppingCart, FaUsers, FaBox, FaSync } from 'react-icons/fa';
import './Analytics.css';

const Analytics = () => {
  const { showAlert, fetchSalesAnalytics } = useContext(AppContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetchSalesAnalytics(timeframe);
      
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      showAlert('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const MetricCard = ({ title, value, icon, description }) => (
    <div className="metric-card">
      <div className="metric-icon">
        {icon}
      </div>
      <div className="metric-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {description && <span className="metric-description">{description}</span>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics & Reports</h1>
          <p>Detailed insights into your business performance</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            className="btn-refresh"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {/* Key Metrics */}
        <div className="metrics-section">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <MetricCard
              title="Total Revenue"
              value={`KES ${analytics?.totalRevenue?.toLocaleString() || '0'}`}
              icon={<FaChartLine />}
              description={`Period: ${timeframe}`}
            />
            <MetricCard
              title="Total Orders"
              value={analytics?.totalOrders || '0'}
              icon={<FaShoppingCart />}
              description="Completed orders"
            />
            <MetricCard
              title="Active Customers"
              value={analytics?.activeCustomers || '0'}
              icon={<FaUsers />}
              description="Customers with orders"
            />
            <MetricCard
              title="Products Sold"
              value={analytics?.productsSold || '0'}
              icon={<FaBox />}
              description="Total items sold"
            />
          </div>
        </div>

        {/* Sales Data */}
        <div className="sales-section">
          <h2>Sales Performance</h2>
          <div className="sales-data">
            {analytics?.salesData?.length > 0 ? (
              <div className="sales-list">
                {analytics.salesData.map((day, index) => (
                  <div key={index} className="sales-day">
                    <span className="date">{day._id}</span>
                    <span className="revenue">KES {day.total?.toLocaleString()}</span>
                    <span className="orders">{day.count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-data">
                <FaChartLine />
                <p>No sales data available for the selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Insights */}
        <div className="insights-section">
          <h2>Business Insights</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Average Order Value</h4>
              <p className="insight-value">
                KES {analytics?.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="insight-card">
              <h4>Conversion Rate</h4>
              <p className="insight-value">
                {analytics?.conversionRate || '0'}%
              </p>
            </div>
            <div className="insight-card">
              <h4>Customer Retention</h4>
              <p className="insight-value">
                {analytics?.retentionRate || '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;