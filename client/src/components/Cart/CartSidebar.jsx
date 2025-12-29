// components/Cart/CartSidebar.jsx
import React, { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useLocation } from '../../context/LocationContext';
import { FaTimes, FaArrowRight, FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import './CartSidebar.css';

function CartSidebar() {
  const {
    user,
    cart,
    isCartOpen,
    setIsCartOpen,
    // addToCart,
    removeFromCart,
    updateCartQuantity,
    showNotification
  } = useContext(AppContext);

  const { formatPrice } = useLocation();

  const navigate = useNavigate();

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.classList.remove('cart-open');
  }, [setIsCartOpen]);

  const openShop = () => {
    closeCart();
    navigate('/');
    // Allow time for navigation before scrolling
    setTimeout(() => {
      const shopSection = document.getElementById('coffee-shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const proceedToCheckout = () => {
    if (!cart || cart.length === 0) {
      showNotification('Your cart is empty', 'warning');
      return;
    }

    if (!user) {
      showNotification('Please sign in to proceed to checkout', 'warning');
      closeCart();
      navigate('/login');
      return;
    }

    closeCart();
    navigate('/checkout');
  };

  const handleQuantityUpdate = (productId, delta) => {
    const product = cart.find(item => item.id === productId || item._id === productId);
    if (!product) return;

    const newQuantity = product.quantity + delta;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // Calculate display values
  const itemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const displayTotal = cart?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;

  // Close cart when clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, closeCart]);

  // Add/remove body class for cart open state
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
  }, [isCartOpen]);

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0 && product.images[0].url) {
      return product.images[0].url;
    }
    if (product.image) {
      return product.image;
    }
    return '/images/placeholder-coffee.jpg';
  };

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={handleOverlayClick}
      />

      <div
        className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <h2>Shopping Cart</h2>
            {itemCount > 0 && (
              <span className="cart-count-badge">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <button
            className="close-cart"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <FaTimes />
          </button>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          <div className="cart-items">
            {!cart || cart.length === 0 ? (
              <div className="cart-empty">
                <div className="empty-cart-icon">
                  <FaShoppingBag />
                </div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious coffee to get started!</p>
                <button
                  className="btn primary"
                  onClick={openShop}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div
                  className="cart-item"
                  key={item.id || item._id}
                >
                  <div className="cart-item-image">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-coffee.jpg';
                      }}
                    />
                  </div>

                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    {item.size && (
                      <div className="cart-item-size">Size: {item.size}</div>
                    )}

                    <div className="cart-item-price">{formatPrice(item.price)}</div>

                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button
                          onClick={() => handleQuantityUpdate(item.id || item._id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="quantity-btn"
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityUpdate(item.id || item._id, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="quantity-btn"
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <button
                        className="remove-item"
                        onClick={() => handleRemoveItem(item.id || item._id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Footer */}
        {cart && cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-simple">
              <div className="total-amount">
                <span>Total:</span>
                <span className="total-price">{formatPrice(displayTotal)}</span>
              </div>
              <div className="total-note">
                Shipping & taxes calculated at checkout
              </div>
            </div>

            {/* Guest User Notice */}
            {!user && (
              <div className="guest-notice">
                <p>Please sign in to proceed to checkout</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="cart-actions">
              <button
                className="btn checkout-btn"
                onClick={proceedToCheckout}
                disabled={!user}
              >
                Proceed to Checkout
                <FaArrowRight />
              </button>

              <button
                className="btn secondary continue-btn"
                onClick={openShop}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;