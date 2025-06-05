// src/components/CoffeeShop/CoffeeShop.jsx
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import './CoffeeShop.css';

const CoffeeShop = () => {
  const { addToCart } = useContext(AppContext);
  
  const products = [
    {
      id: "1",
      name: "Premium Blend",
      description: "A medium roast with notes of chocolate and citrus.",
      size: "250g",
      price: 950,
      image: "https://via.placeholder.com/300x300?text=Premium+Blend",
      badge: "Bestseller"
    },
    {
      id: "2",
      name: "Single Origin",
      description: "Light roast with bright, fruity notes and a clean finish.",
      size: "250g",
      price: 1200,
      image: "https://via.placeholder.com/300x300?text=Single+Origin"
    },
    {
      id: "3",
      name: "Dark Roast",
      description: "Bold and rich with smoky undertones and a smooth finish.",
      size: "250g",
      price: 1050,
      image: "https://via.placeholder.com/300x300?text=Dark+Roast",
      badge: "New"
    },
    {
      id: "4",
      name: "Espresso Blend",
      description: "Perfect for espresso with caramel sweetness and nutty tones.",
      size: "250g",
      price: 1100,
      image: "https://via.placeholder.com/300x300?text=Espresso+Blend"
    }
  ];

  return (
    <section id="coffee-shop" className="coffee-shop">
      <div className="container">
        <h2 className="section-title">Shop Our Coffee</h2>
        <p className="section-subtitle">Discover our premium coffee selection</p>
        
        <div className="coffee-grid">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="coffee-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="coffee-image">
                <img src={product.image} alt={product.name} />
                {product.badge && <div className="coffee-badge">{product.badge}</div>}
              </div>
              <div className="coffee-info">
                <h3 className="coffee-title">{product.name}</h3>
                <p className="coffee-description">{product.description}</p>
                <div className="coffee-meta">
                  <span className="coffee-size">{product.size}</span>
                  <span className="coffee-price">KSh {product.price}</span>
                </div>
                <button 
                  className="btn primary add-to-cart"
                  onClick={() => addToCart({
                    ...product,
                    quantity: 1
                  })}
                >
                  Add to Cart
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