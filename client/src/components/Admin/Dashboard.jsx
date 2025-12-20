import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import {
  FaShoppingBag,
  FaDollarSign,
  FaUsers,
  FaBox,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaChartLine,
  FaFilePdf,
  FaFileCsv,
  FaDownload,
  FaCoffee,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { showAlert, fetchDashboardStats } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetchDashboardStats(timeframe);

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      showAlert('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const StatCard = ({ title, value, change, icon, color, subtitle }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        {change !== undefined && (
          <div className={`stat-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}`}>
            {change > 0 ? <FaArrowUp /> : change < 0 ? <FaArrowDown /> : null}
            <span>{change !== 0 ? `${Math.abs(change)}%` : 'No change'}</span>
          </div>
        )}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <button
          className="action-btn"
          onClick={() => navigate('/admin/products')}
        >
          <FaBox />
          <span>Manage Products</span>
        </button>
        <button
          className="action-btn"
          onClick={() => navigate('/admin/orders')}
        >
          <FaShoppingBag />
          <span>View Orders</span>
        </button>
        <button
          className="action-btn"
          onClick={() => navigate('/admin/users')}
        >
          <FaUsers />
          <span>Manage Customers</span>
        </button>
        <button
          className="action-btn"
          onClick={() => setActiveTab('reports')}
        >
          <FaChartLine />
          <span>Generate Reports</span>
        </button>
      </div>
    </div>
  );

  const RecentOrders = () => (
    <div className="recent-orders">
      <div className="section-header">
        <h3>Recent Orders</h3>
        <button
          className="btn-view-all"
          onClick={() => navigate('/admin/orders')}
        >
          View All
        </button>
      </div>
      <div className="orders-list">
        {stats?.recentOrders?.length > 0 ? (
          stats.recentOrders.slice(0, 5).map(order => (
            <div key={order._id} className="order-item">
              <div className="order-info">
                <span className="order-number">#{order.orderNumber}</span>
                <span className="order-customer">
                  {order.user?.firstName} {order.user?.lastName}
                </span>
              </div>
              <div className="order-details">
                <span className="order-amount">KES {order.total?.toLocaleString()}</span>
                <span className={`order-status ${order.status}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-section">
            <p>No recent orders</p>
          </div>
        )}
      </div>
    </div>
  );

  const LowStockAlert = () => (
    <div className="low-stock">
      <div className="section-header">
        <h3>Low Stock Alert</h3>
        <button
          className="btn-view-all"
          onClick={() => navigate('/admin/products?lowStock=true')}
        >
          View All
        </button>
      </div>
      <div className="stock-list">
        {stats?.lowStockProducts?.length > 0 ? (
          stats.lowStockProducts.slice(0, 5).map(product => (
            <div key={product._id} className="stock-item">
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="stock-level">
                  Stock: {product.inventory?.stock || 0}
                </span>
              </div>
              <span className={`stock-status ${product.inventory?.stock <= 5 ? 'critical' : 'low'}`}>
                {product.inventory?.stock <= 5 ? 'Critical' : 'Low'}
              </span>
            </div>
          ))
        ) : (
          <div className="empty-section">
            <FaBox />
            <p>All products are well stocked</p>
          </div>
        )}
      </div>
    </div>
  );

  const ReportsSection = () => (
    <div className="reports-section">
      <h2>Reports & Analytics</h2>
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">
            <FaFilePdf />
          </div>
          <h4>Sales Report</h4>
          <p>Generate comprehensive PDF sales reports</p>
          <button className="btn-download" onClick={() => showAlert('Sales report generation started...', 'success')}>
            <FaDownload />
            Download PDF
          </button>
        </div>

        <div className="report-card">
          <div className="report-icon">
            <FaFileCsv />
          </div>
          <h4>Data Export</h4>
          <p>Export order data to CSV format</p>
          <button className="btn-download" onClick={() => showAlert('CSV export started...', 'success')}>
            <FaDownload />
            Export CSV
          </button>
        </div>

        <div className="report-card">
          <div className="report-icon">
            <FaChartLine />
          </div>
          <h4>Analytics</h4>
          <p>View detailed analytics and insights</p>
          <button className="btn-download" onClick={() => navigate('/admin/analytics')}>
            <FaEye />
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <FaCoffee className="loading-icon" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <p>Welcome to your admin dashboard</p>
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

          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Statistics Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Revenue"
              value={`KES ${(stats?.overview?.totalRevenue || 0).toLocaleString()}`}
              change={12}
              icon={<FaDollarSign />}
              color="revenue"
              subtitle="All time revenue"
            />
            <StatCard
              title="Total Orders"
              value={(stats?.overview?.totalOrders || 0).toLocaleString()}
              change={8}
              icon={<FaShoppingBag />}
              color="orders"
              subtitle={`${stats?.overview?.todayOrders || 0} today`}
            />
            <StatCard
              title="Total Customers"
              value={(stats?.overview?.totalUsers || 0).toLocaleString()}
              change={5}
              icon={<FaUsers />}
              color="customers"
              subtitle="Registered users"
            />
            <StatCard
              title="Total Products"
              value={(stats?.overview?.totalProducts || 0).toLocaleString()}
              change={3}
              icon={<FaBox />}
              color="products"
              subtitle={`${stats?.lowStockProducts?.length || 0} low stock`}
            />
          </div>

          <QuickActions />

          <div className="dashboard-content">
            <RecentOrders />
            <LowStockAlert />
          </div>

          <div className="charts-section">
            <h3>Revenue Trends</h3>
            <div className="chart-container" style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Mon', revenue: 4000 },
                    { name: 'Tue', revenue: 3000 },
                    { name: 'Wed', revenue: 2000 },
                    { name: 'Thu', revenue: 2780 },
                    { name: 'Fri', revenue: 1890 },
                    { name: 'Sat', revenue: 2390 },
                    { name: 'Sun', revenue: 3490 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <ReportsSection />
      )}
    </div>
  );
};

export default Dashboard;