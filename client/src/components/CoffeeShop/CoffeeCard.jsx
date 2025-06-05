function CoffeeCard({ product, onAddToCart }) {
  return (
    <div className="coffee-card">
      <div className="coffee-image">
        <img 
          src={`https://via.placeholder.com/300x300?text=${product.image}`} 
          alt={product.name}
        />
        {product.badge && <div className="coffee-badge">{product.badge}</div>}
      </div>
      <div className="coffee-info">
        <h3 className="coffee-title">{product.name}</h3>
        <p className="coffee-description">{product.description}</p>
        <div className="coffee-meta">
          <span className="coffee-size">250g</span>
          <span className="coffee-price">KSh {product.price}</span>
        </div>
        <button 
          className="btn primary add-to-cart"
          onClick={onAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}