import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaBox } from 'react-icons/fa';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const { showNotification } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();

      const response = await fetch(`/api/admin/products?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Products fetch error:', error);
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete product');

      const data = await response.json();
      
      if (data.success) {
        showNotification('Product deleted successfully', 'success');
        fetchProducts();
      }
    } catch (error) {
      console.error('Delete product error:', error);
      showNotification('Failed to delete product', 'error');
    }
  };

  const ProductRow = ({ product }) => (
    <tr className="product-row">
      <td>
        <div className="product-info">
          {product.images?.[0] && (
            <img 
              src={product.images[0].url} 
              alt={product.name}
              className="product-image"
            />
          )}
          <div>
            <h4>{product.name}</h4>
            <p className="product-category">{product.category}</p>
          </div>
        </div>
      </td>
      <td>KES {product.price?.toLocaleString()}</td>
      <td>
        <span className={`stock-badge ${product.stock <= 10 ? 'low' : 'good'}`}>
          {product.stock}
        </span>
      </td>
      <td>{product.category}</td>
      <td>
        <div className="product-actions">
          <button 
            className="btn-icon"
            onClick={() => {
              setEditingProduct(product);
              setShowProductModal(true);
            }}
            title="Edit Product"
          >
            <FaEdit />
          </button>
          <button 
            className="btn-icon danger"
            onClick={() => handleDeleteProduct(product._id)}
            title="Delete Product"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="products-management">
      <div className="page-header">
        <h1>Products Management</h1>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
          >
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="coffee-beans">Coffee Beans</option>
          <option value="brewing-equipment">Brewing Equipment</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <ProductRow key={product._id} product={product} />
              ))}
            </tbody>
          </table>
        )}

        {!loading && products.length === 0 && (
          <div className="empty-state">
            <FaBox className="empty-icon" />
            <p>No products found</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, onClose, onSave }) => {
  const { showNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || 'coffee-beans',
    images: product?.images || []
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = product 
        ? `/api/admin/products/${product._id}`
        : '/api/admin/products';
      
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save product');

      const data = await response.json();
      
      if (data.success) {
        showNotification(
          product ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Save product error:', error);
      showNotification('Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Price (KES) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="coffee-beans">Coffee Beans</option>
                <option value="brewing-equipment">Brewing Equipment</option>
                <option value="accessories">Accessories</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="4"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label>Product Images (URLs)</label>
              <input
                type="text"
                placeholder="Enter image URL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = e.target.value.trim();
                    if (url) {
                      setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, { url }]
                      }));
                      e.target.value = '';
                    }
                  }
                }}
              />
              <div className="image-previews">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsManagement;