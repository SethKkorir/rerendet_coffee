// src/components/CoffeeShop/CoffeeShop.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import './CoffeeShop.css';

const CoffeeShop = () => {
  const { addToCart, showNotification } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Replace with actual API call
        const mockProducts = [
          {
            id: "bomet-sunrise-250",
            name: "Bomet Sunrise Blend",
            description: "A bright and uplifting blend with citrus notes and smooth finish. Perfect for starting your day with energy and positivity.",
            sizes: [
              { size: "250g", price: 850 },
              { size: "500g", price: 1600 },
              { size: "1000g", price: 3000 }
            ],
            image: "/api/placeholder/300/300",
            badge: "Morning Favorite",
            category: "blend",
            roastLevel: "medium",
            flavorNotes: ["Citrus", "Caramel", "Honey"],
            origin: "Kenya",
            inStock: true
          },
          {
            id: "dark-forest-250",
            name: "Dark Forest Blend",
            description: "Rich and bold with deep chocolate notes and earthy undertones. A robust blend for those who prefer intense flavors.",
            sizes: [
              { size: "250g", price: 900 },
              { size: "500g", price: 1700 },
              { size: "1000g", price: 3200 }
            ],
            image: "/api/placeholder/300/300",
            badge: "Bold & Rich",
            category: "blend",
            roastLevel: "dark",
            flavorNotes: ["Dark Chocolate", "Earthy", "Spice"],
            origin: "Blend",
            inStock: true
          },
          {
            id: "caramel-cloud-250",
            name: "Caramel Cloud",
            description: "Smooth and sweet with creamy caramel notes and a velvety texture. A delightful treat for any time of day.",
            sizes: [
              { size: "250g", price: 950 },
              { size: "500g", price: 1800 },
              { size: "1000g", price: 3400 }
            ],
            image: "/api/placeholder/300/300",
            badge: "Sweet & Smooth",
            category: "blend",
            roastLevel: "medium-light",
            flavorNotes: ["Caramel", "Cream", "Vanilla"],
            origin: "Blend",
            inStock: true
          }
        ];
        
        // Generate all product variations with different sizes
        const allProducts = [];
        mockProducts.forEach(product => {
          product.sizes.forEach(sizeOption => {
            allProducts.push({
              ...product,
              id: `${product.name.toLowerCase().replace(/\s+/g, '-')}-${sizeOption.size.replace('g', '')}`,
              size: sizeOption.size,
              price: sizeOption.price,
              displayName: `${product.name} - ${sizeOption.size}`
            });
          });
        });
        
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showNotification]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.displayName,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    showNotification(`${product.displayName} added to cart!`, 'success');
  };

  if (loading) {
    return (
      <section id="coffee-shop" className="coffee-shop">
        <div className="container">
          <div className="loading">Loading our premium coffees...</div>
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
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="coffee-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="coffee-image">
                <img 
                  src={product.image} 
                  alt={product.displayName}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300x300/6F4E37/ffffff?text=${encodeURIComponent(product.name)}`;
                  }}
                />
                {product.badge && (
                  <div className="coffee-badge">{product.badge}</div>
                )}
                {!product.inStock && (
                  <div className="out-of-stock-badge">Out of Stock</div>
                )}
              </div>
              
              <div className="coffee-info">
                <h3 className="coffee-title">{product.name}</h3>
                <p className="coffee-origin">{product.origin}</p>
                <p className="coffee-description">{product.description}</p>
                
                <div className="flavor-notes">
                  {product.flavorNotes.map((note, idx) => (
                    <span key={idx} className="flavor-tag">#{note}</span>
                  ))}
                </div>
                
                <div className="coffee-meta">
                  <span className="coffee-size">{product.size}</span>
                  <span className="coffee-roast">{product.roastLevel} Roast</span>
                  <span className="coffee-price">KES {product.price.toLocaleString()}</span>
                </div>
                
                <button 
                  className={`btn primary add-to-cart ${!product.inStock ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoffeeShop;