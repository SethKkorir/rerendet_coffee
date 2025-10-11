// Updated CartSidebar.jsx
import React, { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaTimes, FaArrowRight, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './CartSidebar.css';

function CartSidebar() {
  const {
    cart,
    cartSummary,
    cartLoading,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    showAlert
  } = useContext(AppContext);
  
  const navigate = useNavigate();

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.classList.remove('menu-open');
  }, [setIsCartOpen]);

  const proceedToCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      showAlert('Your cart is empty', 'warning');
      return;
    }

    closeCart();
    navigate('/checkout');
  };

  const handleQuantityUpdate = async (itemId, delta) => {
    try {
      await updateQuantity(itemId, delta);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  // Calculate display values
  const displayCart = cart || { items: [] };
  const displayTotal = cart?.totalPrice || cart?.finalPrice || 0;
  const itemCount = cart?.itemsCount || cartSummary.itemsCount || 0;

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
            <h2>Your Shopping Cart</h2>
            {itemCount > 0 && (
              <span className="cart-count-badge">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
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
        
        {/* Cart Items */}
        <div className="cart-content">
          {cartLoading && (
            <div className="cart-loading">
              <div className="loading-spinner"></div>
              <p>Updating cart...</p>
            </div>
          )}
          
          <div className="cart-items">
            {!displayCart.items || displayCart.items.length === 0 ? (
              <div className="cart-empty">
                <div className="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious coffee to get started!</p>
                <button 
                  className="btn primary" 
                  onClick={closeCart}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              displayCart.items.map(item => (
                <div 
                  className={`cart-item ${cartLoading ? 'updating' : ''}`} 
                  key={item._id || item.id}
                >
                  <div className="cart-item-image">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-coffee.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="cart-item-details">
                    <div className="cart-item-title">{item.name}</div>
                    
                    {item.variant && (
                      <div className="cart-item-variant">{item.variant}</div>
                    )}
                    
                    <div className="cart-item-pricing">
                      <div className="cart-item-price">KSh {item.price?.toLocaleString()}</div>
                      <div className="cart-item-subtotal">
                        KSh {(item.price * item.quantity)?.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button 
                          onClick={() => handleQuantityUpdate(item._id || item.id, -1)}
                          disabled={item.quantity <= 1 || cartLoading}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityUpdate(item._id || item.id, 1)}
                          disabled={cartLoading}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <button 
                        className="remove-item" 
                        onClick={() => handleRemoveItem(item._id || item.id)}
                        disabled={cartLoading}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Footer with Totals */}
        {displayCart.items && displayCart.items.length > 0 && (
          <div className="cart-footer">
            {/* Pricing Breakdown */}
            <div className="cart-pricing-breakdown">
              <div className="price-row">
                <span>Subtotal:</span>
                <span>KSh {displayCart.subtotal?.toLocaleString() || displayTotal.toLocaleString()}</span>
              </div>
              
              {displayCart.shippingPrice !== undefined && (
                <div className="price-row">
                  <span>Shipping:</span>
                  <span className={displayCart.shippingPrice === 0 ? 'free-shipping' : ''}>
                    {displayCart.shippingPrice === 0 ? 'FREE' : `KSh ${displayCart.shippingPrice.toLocaleString()}`}
                  </span>
                </div>
              )}
              
              {displayCart.taxPrice !== undefined && displayCart.taxPrice > 0 && (
                <div className="price-row">
                  <span>Tax:</span>
                  <span>KSh {displayCart.taxPrice.toLocaleString()}</span>
                </div>
              )}
              
              {displayCart.discountAmount !== undefined && displayCart.discountAmount > 0 && (
                <div className="price-row discount">
                  <span>Discount:</span>
                  <span>-KSh {displayCart.discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="price-row total">
                <span>Total:</span>
                <span>KSh {displayTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Free Shipping Progress */}
            {displayCart.subtotal > 0 && displayCart.subtotal < 5000 && (
              <div className="free-shipping-progress">
                <div className="progress-text">
                  Add <strong>KSh {(5000 - displayCart.subtotal).toLocaleString()}</strong> more for free shipping!
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(displayCart.subtotal / 5000) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <button 
              className="btn btn-primary checkout-btn" 
              onClick={proceedToCheckout}
              disabled={cartLoading}
            >
              {cartLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <FaArrowRight />
                </>
              )}
            </button>
            
            {/* Continue Shopping */}
            <button 
              className="btn secondary continue-shopping" 
              onClick={closeCart}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;