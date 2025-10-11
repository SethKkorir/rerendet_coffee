// Updated CoffeeShop.jsx - Using real product images
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import './CoffeeShop.css';

const CoffeeShop = () => {
  const { addToCart, showAlert } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const mockProducts = [
          {
            _id: "bomet-sunrise-250",
            name: "Bomet Sunrise Blend",
            description: "A bright and uplifting blend with citrus notes and smooth finish. Perfect for starting your day with energy and positivity.",
            sizes: [
              { size: "250g", price: 850 },
              { size: "500g", price: 1600 },
              { size: "1000g", price: 3000 }
            ],
            images: [
              {
                url: "/images/coffee/bomet-sunrise.png",
                public_id: "bomet_sunrise"
              }
            ],
            badge: "Morning Favorite",
            category: "blend",
            roastLevel: "medium",
            flavorNotes: ["Citrus", "Caramel", "Honey"],
            origin: "Kenya",
            inStock: true,
            inventory: {
              stock: 10,
              lowStockAlert: 5
            }
          },
          {
            _id: "dark-forest-250",
            name: "Dark Forest Blend",
            description: "Rich and bold with deep chocolate notes and earthy undertones. A robust blend for those who prefer intense flavors.",
            sizes: [
              { size: "250g", price: 900 },
              { size: "500g", price: 1700 },
              { size: "1000g", price: 3200 }
            ],
            images: [
              {
                url: "/images/coffee/dark-forest.png",
                public_id: "dark_forest"
              }
            ],
            badge: "Bold & Rich",
            category: "blend",
            roastLevel: "dark",
            flavorNotes: ["Dark Chocolate", "Earthy", "Spice"],
            origin: "Blend",
            inStock: true,
            inventory: {
              stock: 8,
              lowStockAlert: 5
            }
          },
          {
            _id: "caramel-cloud-250",
            name: "Caramel Cloud",
            description: "Smooth and sweet with creamy caramel notes and a velvety texture. A delightful treat for any time of day.",
            sizes: [
              { size: "250g", price: 950 },
              { size: "500g", price: 1800 },
              { size: "1000g", price: 3400 }
            ],
            images: [
              {
                url: "/images/coffee/caramel-cloud.jpg",
                public_id: "caramel_cloud"
              }
            ],
            badge: "Sweet & Smooth",
            category: "blend",
            roastLevel: "medium-light",
            flavorNotes: ["Caramel", "Cream", "Vanilla"],
            origin: "Blend",
            inStock: true,
            inventory: {
              stock: 12,
              lowStockAlert: 5
            }
          },
          {
            _id: "highland-espresso-250",
            name: "Highland Espresso",
            description: "Intense and full-bodied espresso roast with notes of dark berries and a hint of spice. Perfect for espresso lovers.",
            sizes: [
              { size: "250g", price: 920 },
              { size: "500g", price: 1750 },
              { size: "1000g", price: 3300 }
            ],
            images: [
              {
                url: "/images/coffee/highland-expresso.png",
                public_id: "highland_espresso"
              }
            ],
            badge: "Espresso Blend",
            category: "blend",
            roastLevel: "espresso",
            flavorNotes: ["Dark Berries", "Spice", "Cocoa"],
            origin: "Central Kenya",
            inStock: true,
            inventory: {
              stock: 15,
              lowStockAlert: 5
            }
          }
        ];
        
        // Generate all product variations with different sizes
        const allProducts = [];
        mockProducts.forEach(product => {
          product.sizes.forEach(sizeOption => {
            allProducts.push({
              ...product,
              _id: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${sizeOption.size.replace('g', '')}`,
              size: sizeOption.size,
              price: sizeOption.price,
              displayName: `${product.name} - ${sizeOption.size}`,
              // Ensure images array is preserved
              images: product.images || []
            });
          });
        });
        
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Failed to load products', 'error');
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
    setAddingToCart(product._id);
    try {
      await addToCart(product, 1);
      // Success message is handled in AppContext
    } catch (error) {
      console.log('Error adding to cart:', error);
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
                key={product._id}
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
                      !productInStock || addingToCart === product._id ? 'disabled' : ''
                    }`}
                    onClick={() => handleAddToCart(product)}
                    disabled={!productInStock || addingToCart === product._id}
                  >
                    {addingToCart === product._id ? (
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
      </div>
    </section>
  );
};

export default CoffeeShop;