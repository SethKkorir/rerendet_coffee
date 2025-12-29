import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useLocation } from '../../context/LocationContext';
import { FaEye, FaTimes, FaShoppingBag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './CoffeeShop.css';

const CoffeeShop = () => {
  const { addToCart, showAlert } = useContext(AppContext);
  const { formatPrice } = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?category=coffee-beans');

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
      if (selectedProduct) setSelectedProduct(null); // Close modal if open
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
              <motion.div
                key={product.variationKey} // Use variationKey for React rendering
                className="coffee-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
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

                  {/* Overlays */}
                  <div className="image-overlay-actions">
                    <button
                      className="quick-view-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                      title="Quick View"
                    >
                      <FaEye />
                    </button>
                  </div>

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
                  <div className="coffee-header">
                    <h3 className="coffee-title">{product.name}</h3>
                  </div>

                  <p className="coffee-origin">{product.origin} • {product.roastLevel} • {product.size}</p>

                  <div className="flavor-notes">
                    {product.flavorNotes && product.flavorNotes.slice(0, 3).map((note, idx) => (
                      <span key={idx} className="flavor-tag">{note}</span>
                    ))}
                  </div>

                  <div className="coffee-footer-row">
                    <div className="coffee-price-large">
                      {formatPrice(product.price)}
                    </div>
                    <button
                      className={`btn-add-large ${!productInStock || addingToCart === product.variationKey ? 'disabled' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={!productInStock || addingToCart === product.variationKey}
                    >
                      {addingToCart === product.variationKey ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick View Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            >
              <motion.div
                className="quick-view-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}><FaTimes /></button>

                <div className="modal-content-grid">
                  <div className="modal-image">
                    <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
                  </div>
                  <div className="modal-details">
                    <span className="modal-badge">{selectedProduct.roastLevel} Roast</span>
                    <h2>{selectedProduct.name}</h2>
                    <p className="modal-origin">{selectedProduct.origin}</p>
                    <div className="modal-price">{formatPrice(selectedProduct.price)}</div>
                    <p className="modal-desc">{selectedProduct.description}</p>

                    <div className="modal-flavors">
                      <strong>Flavor Notes:</strong>
                      <div className="flavor-tags">
                        {selectedProduct.flavorNotes?.map((note, i) => (
                          <span key={i} className="flavor-tag">{note}</span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="modal-add-btn"
                      onClick={() => handleAddToCart(selectedProduct)}
                      disabled={addingToCart === selectedProduct.variationKey}
                    >
                      {addingToCart === selectedProduct.variationKey ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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