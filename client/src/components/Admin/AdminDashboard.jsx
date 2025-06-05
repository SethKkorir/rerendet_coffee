// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaCoffee, FaShoppingCart, FaUsers, FaChartLine, 
  FaBox, FaCog, FaSignOutAlt, FaSearch, FaBell,
  FaPlus, FaEdit, FaTrash, FaFilter
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Coffee', stock: '' });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    // Simulate API calls to fetch data
    const fetchData = () => {
      // Mock orders data
      const mockOrders = [
        { id: '#RC-2023-78945', customer: 'Amani Hassan', date: '2023-11-15', status: 'Delivered', amount: 25.00 },
        { id: '#RC-2023-78946', customer: 'Samuel Kariuki', date: '2023-11-14', status: 'Processing', amount: 42.50 },
        { id: '#RC-2023-78947', customer: 'Wanjiku Mwangi', date: '2023-11-14', status: 'Shipped', amount: 36.75 },
        { id: '#RC-2023-78948', customer: 'David Omondi', date: '2023-11-13', status: 'Delivered', amount: 19.99 },
        { id: '#RC-2023-78949', customer: 'Grace Akinyi', date: '2023-11-12', status: 'Processing', amount: 54.30 },
      ];
      
      // Mock products data
      const mockProducts = [
        { id: 1, name: 'Ethiopian Yirgacheffe', category: 'Coffee', price: 12.50, stock: 42 },
        { id: 2, name: 'Guatemalan Antigua', category: 'Coffee', price: 11.75, stock: 28 },
        { id: 3, name: 'Colombian Supremo', category: 'Coffee', price: 13.25, stock: 35 },
        { id: 4, name: 'Kenya AA', category: 'Coffee', price: 14.99, stock: 19 },
        { id: 5, name: 'Aeropress', category: 'Equipment', price: 24.99, stock: 12 },
        { id: 6, name: 'Hario V60', category: 'Equipment', price: 18.50, stock: 8 },
      ];
      
      // Mock users data
      const mockUsers = [
        { id: 1, name: 'Amani Hassan', email: 'amani@example.com', joined: '2023-10-15', orders: 5 },
        { id: 2, name: 'Samuel Kariuki', email: 'samuel@example.com', joined: '2023-11-01', orders: 2 },
        { id: 3, name: 'Wanjiku Mwangi', email: 'wanjiku@example.com', joined: '2023-11-05', orders: 3 },
        { id: 4, name: 'David Omondi', email: 'david@example.com', joined: '2023-11-10', orders: 1 },
        { id: 5, name: 'Grace Akinyi', email: 'grace@example.com', joined: '2023-11-12', orders: 2 },
      ];
      
      setOrders(mockOrders);
      setProducts(mockProducts);
      setUsers(mockUsers);
      
      // Calculate stats
      const totalRevenue = mockOrders.reduce((sum, order) => sum + order.amount, 0);
      const totalOrders = mockOrders.length;
      const newCustomers = mockUsers.filter(user => {
        const joinDate = new Date(user.joined);
        const now = new Date();
        return (now - joinDate) < (30 * 24 * 60 * 60 * 1000); // Joined in last 30 days
      }).length;
      
      setStats({
        totalRevenue,
        totalOrders,
        newCustomers,
        avgOrderValue: totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0
      });
    };
    
    fetchData();
  }, []);

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { ...newProduct, id: newId, stock: parseInt(newProduct.stock) }]);
    setNewProduct({ name: '', price: '', category: 'Coffee', stock: '' });
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const revenueData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue (KES)',
        data: [12000, 19000, 15000, 18000, 22000, 25000, 21000],
        backgroundColor: 'rgba(111, 78, 55, 0.6)',
        borderColor: 'rgba(111, 78, 55, 1)',
        borderWidth: 1,
      },
    ],
  };

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Coffee Sales',
        data: [120, 190, 150, 180, 220, 250, 210, 240, 280, 300, 320, 350],
        borderColor: 'rgba(111, 78, 55, 1)',
        backgroundColor: 'rgba(111, 78, 55, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Equipment Sales',
        data: [80, 90, 70, 95, 110, 120, 130, 140, 150, 160, 170, 190],
        borderColor: 'rgba(169, 113, 66, 1)',
        backgroundColor: 'rgba(169, 113, 66, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon revenue">
                  <FaChartLine />
                </div>
                <div className="stat-info">
                  <h3>KES {stats.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon orders">
                  <FaShoppingCart />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon customers">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <h3>{stats.newCustomers}</h3>
                  <p>New Customers</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon avg-order">
                  <FaBox />
                </div>
                <div className="stat-info">
                  <h3>KES {stats.avgOrderValue}</h3>
                  <p>Avg. Order Value</p>
                </div>
              </div>
            </div>
            
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Weekly Revenue</h3>
                <Bar data={revenueData} options={{ responsive: true }} />
              </div>
              
              <div className="chart-card">
                <h3>Monthly Sales</h3>
                <Line data={salesData} options={{ responsive: true }} />
              </div>
            </div>
            
            <div className="recent-orders">
              <h3>Recent Orders</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                        <td>KES {order.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'products':
        return (
          <div className="products-content">
            <div className="products-header">
              <h2>Product Management</h2>
              <button className="btn-add" onClick={() => document.getElementById('addProductModal').showModal()}>
                <FaPlus /> Add Product
              </button>
            </div>
            
            <div className="filters">
              <div className="search-box">
                <FaSearch />
                <input type="text" placeholder="Search products..." />
              </div>
              <div className="filter-dropdown">
                <FaFilter />
                <select>
                  <option>All Categories</option>
                  <option>Coffee</option>
                  <option>Equipment</option>
                  <option>Accessories</option>
                </select>
              </div>
            </div>
            
            <div className="products-grid">
              {products.map(product => (
                <div className="product-card" key={product.id}>
                  <div className="product-image">
                    <div className="placeholder-img"></div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <div className="details">
                      <div className="price">KES {product.price.toFixed(2)}</div>
                      <div className={`stock ${product.stock < 10 ? 'low' : ''}`}>
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className="btn-edit">
                      <FaEdit />
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteProduct(product.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'orders':
        return (
          <div className="orders-content">
            <h2>Order Management</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>
                        <select className={`status-select ${order.status.toLowerCase()}`} defaultValue={order.status}>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>KES {order.amount.toFixed(2)}</td>
                      <td>
                        <button className="btn-view">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'customers':
        return (
          <div className="customers-content">
            <h2>Customer Management</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.joined}</td>
                      <td>{user.orders}</td>
                      <td>
                        <button className="btn-view">View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="settings-content">
            <h2>Settings</h2>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>General Settings</h3>
                <div className="setting-item">
                  <label>Store Name</label>
                  <input type="text" defaultValue="Rerendet Coffee" />
                </div>
                <div className="setting-item">
                  <label>Currency</label>
                  <select defaultValue="KES">
                    <option>KES</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Timezone</label>
                  <select defaultValue="Africa/Nairobi">
                    <option>Africa/Nairobi</option>
                    <option>UTC</option>
                  </select>
                </div>
              </div>
              
              <div className="setting-card">
                <h3>Payment Settings</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable M-Pesa Payments
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable Card Payments
                  </label>
                </div>
                <div className="setting-item">
                  <label>M-Pesa API Key</label>
                  <input type="password" defaultValue="****************" />
                </div>
              </div>
              
              <div className="setting-card">
                <h3>Shipping Settings</h3>
                <div className="setting-item">
                  <label>Standard Delivery Fee</label>
                  <input type="number" defaultValue="0" />
                </div>
                <div className="setting-item">
                  <label>Express Delivery Fee</label>
                  <input type="number" defaultValue="300" />
                </div>
                <div className="setting-item">
                  <label>Free Shipping Threshold</label>
                  <input type="number" defaultValue="2000" />
                </div>
              </div>
            </div>
            <div className="settings-actions">
              <button className="btn-save">Save Settings</button>
            </div>
          </div>
        );
        
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Add Product Modal */}
      <dialog id="addProductModal" className="modal">
        <div className="modal-content">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label>Product Name</label>
              <input 
                type="text" 
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (KES)</label>
                <input 
                  type="number" 
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input 
                  type="number" 
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option value="Coffee">Coffee</option>
                <option value="Equipment">Equipment</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => document.getElementById('addProductModal').close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn-save">Add Product</button>
            </div>
          </form>
        </div>
      </dialog>
      
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <FaCoffee className="logo-icon" />
          <h2>Rerendet Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine /> Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaCoffee /> Products
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart /> Orders
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <FaUsers /> Customers
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="search-container">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="header-actions">
            <button className="notification-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <div className="admin-profile">
              <div className="avatar">A</div>
              <span>Admin</span>
            </div>
          </div>
        </header>
        
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;