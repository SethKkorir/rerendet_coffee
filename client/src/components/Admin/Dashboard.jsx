// src/components/Admin/Dashboard.jsx - UPDATED FOR YOUR CSS
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FaShoppingBag, FaDollarSign, FaUsers, FaBox, 
  FaArrowUp, FaArrowDown, FaEye, FaChartLine,
  FaFilePdf, FaFileCsv, FaDownload, FaShoppingCart,
  FaCoffee
} from 'react-icons/fa';
import moment from 'moment';
import './Dashboard.css';

const Dashboard = () => {
  const { showAlert } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/dashboard/stats?timeframe=${timeframe}`, {
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
        setLowStockProducts(data.data.lowStockProducts || []);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      showAlert('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color, subtitle }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
        {subtitle && <small style={{color: '#777', fontSize: '0.8rem'}}>{subtitle}</small>}
        {change !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            color: change > 0 ? '#27ae60' : change < 0 ? '#e74c3c' : '#777',
            marginTop: '5px'
          }}>
            {change > 0 ? <FaArrowUp /> : change < 0 ? <FaArrowDown /> : null}
            {change !== 0 ? `${Math.abs(change)}%` : 'No change'}
          </div>
        )}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="setting-card" style={{marginBottom: '20px'}}>
      <h3>Quick Actions</h3>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
        <button 
          className="btn-add" 
          onClick={() => window.location.href = '/admin/products'}
          style={{justifyContent: 'center'}}
        >
          <FaBox />
          <span>Manage Products</span>
        </button>
        <button 
          className="btn-add" 
          onClick={() => window.location.href = '/admin/orders'}
          style={{justifyContent: 'center'}}
        >
          <FaShoppingBag />
          <span>View Orders</span>
        </button>
        <button 
          className="btn-add" 
          onClick={() => window.location.href = '/admin/users'}
          style={{justifyContent: 'center'}}
        >
          <FaUsers />
          <span>Manage Customers</span>
        </button>
        <button 
          className="btn-add" 
          onClick={() => setActiveTab('reports')}
          style={{justifyContent: 'center'}}
        >
          <FaChartLine />
          <span>Generate Reports</span>
        </button>
      </div>
    </div>
  );

  const RecentOrdersSection = () => (
    <div className="recent-orders">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h3>Recent Orders</h3>
        <button 
          className="btn-view"
          onClick={() => window.location.href = '/admin/orders'}
        >
          View All
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <tr key={order._id}>
                  <td>#{order.orderNumber}</td>
                  <td>
                    {order.user?.firstName} {order.user?.lastName}
                    <br />
                    <small style={{color: '#777'}}>{order.user?.email}</small>
                  </td>
                  <td>KES {order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{moment(order.createdAt).format('MMM D, YYYY')}</td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => window.location.href = `/admin/orders/${order._id}`}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                  No recent orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const LowStockSection = () => (
    <div className="setting-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h3>Low Stock Alert</h3>
        <button 
          className="btn-view"
          onClick={() => window.location.href = '/admin/products?lowStock=true'}
        >
          View All
        </button>
      </div>
      <div>
        {lowStockProducts.length > 0 ? (
          lowStockProducts.map(product => (
            <div key={product._id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #eee'
            }}>
              <div>
                <h4 style={{margin: '0 0 5px 0'}}>{product.name}</h4>
                <p style={{margin: 0, color: '#777', fontSize: '0.9rem'}}>
                  Current Stock: {product.inventory?.stock || 0}
                </p>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  backgroundColor: product.inventory?.stock <= 5 ? '#fde8e8' : '#fff4e5',
                  color: product.inventory?.stock <= 5 ? '#e74c3c' : '#f39c12'
                }}>
                  {product.inventory?.stock <= 5 ? 'Critical' : 'Low'}
                </span>
                <button 
                  className="btn-view"
                  onClick={() => window.location.href = `/admin/products/edit/${product._id}`}
                >
                  Restock
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{textAlign: 'center', color: '#777', padding: '20px'}}>
            All products are well stocked
          </p>
        )}
      </div>
    </div>
  );

  const ReportsSection = () => {
    const [dateRange, setDateRange] = useState({
      start: moment().startOf('month').format('YYYY-MM-DD'),
      end: moment().endOf('month').format('YYYY-MM-DD')
    });

    const generateReport = async (type) => {
      try {
        const token = localStorage.getItem('token');
        let url = '';
        let filename = '';
        
        switch (type) {
          case 'monthly':
            url = `/api/reports/sales/monthly?month=${moment().month() + 1}&year=${moment().year()}`;
            filename = `monthly-report-${moment().format('YYYY-MM')}.pdf`;
            break;
          case 'csv':
            url = `/api/reports/orders/export?startDate=${dateRange.start}&endDate=${dateRange.end}`;
            filename = `orders-export-${moment().format('YYYY-MM-DD')}.csv`;
            break;
          case 'analytics':
            url = `/api/reports/analytics?period=${timeframe}`;
            filename = `analytics-${timeframe}-${moment().format('YYYY-MM-DD')}.json`;
            break;
          default:
            return;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully`, 'success');
        } else {
          throw new Error('Failed to generate report');
        }
      } catch (error) {
        console.error('Report generation error:', error);
        showAlert('Failed to generate report', 'error');
      }
    };

    return (
      <div>
        <div className="products-header">
          <h2>Reports & Analytics</h2>
        </div>

        <div className="settings-grid">
          <div className="setting-card">
            <div style={{textAlign: 'center', marginBottom: '15px'}}>
              <FaFilePdf size={40} color="#6F4E37" />
            </div>
            <h3>Monthly Sales Report</h3>
            <p style={{color: '#777', marginBottom: '20px'}}>
              Comprehensive PDF report with sales analytics, top products, and order statistics
            </p>
            <button 
              onClick={() => generateReport('monthly')} 
              className="btn-add"
              style={{width: '100%', justifyContent: 'center'}}
            >
              <FaDownload /> Download PDF
            </button>
          </div>

          <div className="setting-card">
            <div style={{textAlign: 'center', marginBottom: '15px'}}>
              <FaFileCsv size={40} color="#6F4E37" />
            </div>
            <h3>Orders Export</h3>
            <p style={{color: '#777', marginBottom: '15px'}}>
              Export order data to CSV for spreadsheet analysis
            </p>
            <div style={{marginBottom: '15px'}}>
              <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={{fontSize: '0.8rem', color: '#777'}}>From:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
                <div style={{flex: 1}}>
                  <label style={{fontSize: '0.8rem', color: '#777'}}>To:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => generateReport('csv')} 
              className="btn-add"
              style={{width: '100%', justifyContent: 'center'}}
            >
              <FaDownload /> Export CSV
            </button>
          </div>

          <div className="setting-card">
            <div style={{textAlign: 'center', marginBottom: '15px'}}>
              <FaChartLine size={40} color="#6F4E37" />
            </div>
            <h3>Analytics Data</h3>
            <p style={{color: '#777', marginBottom: '20px'}}>
              Raw analytics data in JSON format for custom analysis and external tools
            </p>
            <button 
              onClick={() => generateReport('analytics')} 
              className="btn-add"
              style={{width: '100%', justifyContent: 'center'}}
            >
              <FaDownload /> Export JSON
            </button>
          </div>
        </div>

        <div className="setting-card">
          <h3>Quick Analytics</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
            <div style={{textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px'}}>
              <div style={{fontSize: '0.9rem', color: '#777', marginBottom: '5px'}}>Total Revenue</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6F4E37'}}>
                KES {stats?.overview?.totalRevenue?.toLocaleString() || '0'}
              </div>
            </div>
            <div style={{textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px'}}>
              <div style={{fontSize: '0.9rem', color: '#777', marginBottom: '5px'}}>Total Orders</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6F4E37'}}>
                {stats?.overview?.totalOrders?.toLocaleString() || '0'}
              </div>
            </div>
            <div style={{textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px'}}>
              <div style={{fontSize: '0.9rem', color: '#777', marginBottom: '5px'}}>Conversion Rate</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6F4E37'}}>
                {stats?.overview?.conversionRate || '0'}%
              </div>
            </div>
            <div style={{textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '6px'}}>
              <div style={{fontSize: '0.9rem', color: '#777', marginBottom: '5px'}}>Avg. Order Value</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6F4E37'}}>
                KES {stats?.overview?.averageOrderValue?.toFixed(2) || '0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column'}}>
          <FaCoffee size={40} color="#6F4E37" />
          <p style={{marginTop: '20px', color: '#777'}}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="products-header">
        <h2>Dashboard Overview</h2>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <div className="filter-dropdown">
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              style={{border: 'none', outline: 'none'}}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <div style={{display: 'flex', background: '#f3f4f6', borderRadius: '6px', padding: '4px'}}>
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: activeTab === 'overview' ? 'white' : 'transparent',
                borderRadius: '4px',
                color: activeTab === 'overview' ? '#6F4E37' : '#777',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: activeTab === 'reports' ? 'white' : 'transparent',
                borderRadius: '4px',
                color: activeTab === 'reports' ? '#6F4E37' : '#777',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Revenue"
              value={`KES ${stats?.overview?.totalRevenue?.toLocaleString() || '0'}`}
              change={stats?.revenueAnalytics?.growth}
              icon={<FaDollarSign />}
              color="revenue"
              subtitle="All time revenue"
            />
            <StatCard
              title="Total Orders"
              value={stats?.overview?.totalOrders?.toLocaleString() || '0'}
              change={12}
              icon={<FaShoppingBag />}
              color="orders"
              subtitle={`${stats?.overview?.todayOrders || 0} today`}
            />
            <StatCard
              title="Total Customers"
              value={stats?.overview?.totalUsers?.toLocaleString() || '0'}
              change={8}
              icon={<FaUsers />}
              color="customers"
              subtitle="Registered users"
            />
            <StatCard
              title="Total Products"
              value={stats?.overview?.totalProducts?.toLocaleString() || '0'}
              change={5}
              icon={<FaBox />}
              color="avg-order"
              subtitle={`${lowStockProducts.length} low stock`}
            />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Content Grid */}
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px'}}>
            <RecentOrdersSection />
            <LowStockSection />
          </div>

          {/* Charts Placeholder */}
          <div className="chart-card">
            <h3>Revenue Trends</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              background: '#f8f9fa',
              borderRadius: '6px',
              color: '#777'
            }}>
              <FaChartLine size={48} />
              <p style={{marginTop: '10px'}}>Revenue charts will be implemented with Chart.js</p>
              <small>Visualize sales trends and performance metrics</small>
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