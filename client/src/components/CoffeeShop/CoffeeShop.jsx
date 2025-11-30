// CoffeeShop.jsx - COMPLETELY REWRITTEN WITH FIXED PRODUCT ID ISSUE
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import './CoffeeShop.css';

const CoffeeShop = () => {
  const { addToCart, showAlert } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?category=coffee-beans&inStock=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data.products)) {
          // Generate all product variations with different sizes - FIXED ID ISSUE
          const allProducts = [];
          result.data.products.forEach(product => {
            // Only process products that have sizes
            if (product.sizes && product.sizes.length > 0) {
              product.sizes.forEach(sizeOption => {
                allProducts.push({
                  // Preserve all original product data
                  ...product,
                  // KEEP THE ORIGINAL _id - don't modify it!
                  _id: product._id, // Keep original MongoDB ObjectId
                  size: sizeOption.size,
                  price: sizeOption.price,
                  displayName: `${product.name} - ${sizeOption.size}`,
                  // Store size separately for cart operations
                  selectedSize: sizeOption.size,
                  // Ensure images array is preserved
                  images: product.images || [],
                  // Add a unique key for React rendering only (not for database operations)
                  variationKey: `${product._id}-${sizeOption.size.replace('g', '')}`
                });
              });
            } else {
              // If product has no sizes, add it as-is with default values
              allProducts.push({
                ...product,
                size: '250g',
                price: product.price || 0,
                displayName: product.name,
                selectedSize: '250g',
                images: product.images || [],
                variationKey: product._id
              });
            }
          });
          
          setProducts(allProducts);
        } else {
          // If no products found, set empty array
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Failed to load products. Please try again later.', 'error');
        // Set empty array on error so UI doesn't break
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showAlert]);

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0 && product.images[0].url) {
      return product.images[0].url;
    }
    // Fallback to the old image property if images array doesn't exist
    if (product.image) {
      return product.image;
    }
    // Final fallback - placeholder
    return `https://via.placeholder.com/300x300/6F4E37/ffffff?text=${encodeURIComponent(product.name)}`;
  };

  // Helper function to check stock
  const isInStock = (product) => {
    // Use inventory.stock if available, otherwise use countInStock or inStock
    if (product.inventory && product.inventory.stock !== undefined) {
      return product.inventory.stock > 0;
    }
    if (product.countInStock !== undefined) {
      return product.countInStock > 0;
    }
    return product.inStock !== false;
  };

  // Helper function to get stock count
  const getStockCount = (product) => {
    if (product.inventory && product.inventory.stock !== undefined) {
      return product.inventory.stock;
    }
    if (product.countInStock !== undefined) {
      return product.countInStock;
    }
    return product.inStock ? 10 : 0; // Default to 10 if inStock is true but no count
  };

 const handleAddToCart = async (product) => {
  setAddingToCart(product.variationKey);
  try {
    // Create a clean product object for the cart that includes sizes array
    const cartProduct = {
      _id: product._id, // Use the original MongoDB ObjectId
      name: product.name,
      price: product.price, // Include the pre-calculated price
      size: product.selectedSize || product.size, // Include the selected size
      images: product.images || [],
      category: product.category,
      roastLevel: product.roastLevel,
      origin: product.origin,
      flavorNotes: product.flavorNotes,
      badge: product.badge,
      // Include the sizes array for price validation
      sizes: product.sizes || []
    };
    
    await addToCart(cartProduct, 1, product.selectedSize || product.size);
  } catch (error) {
    console.error('Error adding to cart:', error);
    showAlert('Failed to add product to cart', 'error');
  } finally {
    setAddingToCart(null);
  }
};
  if (loading) {
    return (
      <section id="coffee-shop" className="coffee-shop">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading our premium coffees...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="coffee-shop" className="coffee-shop">
      <div className="container">
        <h2 className="section-title">Shop Our Premium Coffee Blends</h2>
        <p className="section-subtitle">
          Carefully crafted blends roasted to perfection. Available in 250g, 500g, and 1000g packages.
        </p>
        
        <div className="coffee-grid">
          {products.map((product, index) => {
            const productInStock = isInStock(product);
            const stockCount = getStockCount(product);
            
            return (
              <div 
                key={product.variationKey} // Use variationKey for React rendering
                className="coffee-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="coffee-image">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.displayName || product.name}
                    onError={(e) => {
                      // If image fails to load, use placeholder
                      e.target.src = `https://via.placeholder.com/300x300/6F4E37/ffffff?text=${encodeURIComponent(product.name)}`;
                    }}
                  />
                  {product.badge && (
                    <div className="coffee-badge">{product.badge}</div>
                  )}
                  {!productInStock && (
                    <div className="out-of-stock-badge">Out of Stock</div>
                  )}
                  {productInStock && stockCount <= 5 && (
                    <div className="low-stock-badge">Low Stock</div>
                  )}
                </div>
                
                <div className="coffee-info">
                  <h3 className="coffee-title">{product.name}</h3>
                  <p className="coffee-origin">{product.origin}</p>
                  <p className="coffee-description">
                    {product.description.length > 120 
                      ? `${product.description.substring(0, 120)}...` 
                      : product.description
                    }
                  </p>
                  
                  <div className="flavor-notes">
                    {product.flavorNotes && product.flavorNotes.map((note, idx) => (
                      <span key={idx} className="flavor-tag">#{note}</span>
                    ))}
                  </div>
                  
                  <div className="coffee-meta">
                    <span className="coffee-size">{product.size}</span>
                    <span className="coffee-roast">{product.roastLevel} Roast</span>
                    <span className="coffee-price">KES {product.price.toLocaleString()}</span>
                  </div>
                  
                  <button 
                    className={`btn primary add-to-cart ${
                      !productInStock || addingToCart === product.variationKey ? 'disabled' : ''
                    }`}
                    onClick={() => handleAddToCart(product)}
                    disabled={!productInStock || addingToCart === product.variationKey}
                  >
                    {addingToCart === product.variationKey ? (
                      <>
                        <div className="btn-spinner"></div>
                        Adding...
                      </>
                    ) : productInStock ? (
                      'Add to Cart'
                    ) : (
                      'Out of Stock'
                    )}
                  </button>

                  {productInStock && stockCount <= 10 && (
                    <div className="stock-info">
                      Only {stockCount} left in stock
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && products.length === 0 && (
          <div className="empty-state">
            <p>No coffee products found at the moment.</p>
            <p>Please check back later or contact us for availability.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoffeeShop;