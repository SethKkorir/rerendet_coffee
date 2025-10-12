// components/Cart/CartSidebar.jsx
import React, { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaTimes, FaArrowRight, FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import './CartSidebar.css';

function CartSidebar() {
  const {
    user,
    cart,
    cartLoading,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    showNotification
  } = useContext(AppContext);
  
  const navigate = useNavigate();

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.classList.remove('cart-open');
  }, [setIsCartOpen]);

  const openShop = () => {
    closeCart();
    navigate('/shop');
  };

  const proceedToCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      showNotification('Your cart is empty', 'warning');
      return;
    }

    if (!user) {
      showNotification('Please sign in to proceed to checkout', 'warning');
      closeCart();
      return;
    }

    closeCart();
    navigate('/checkout');
  };

  const handleQuantityUpdate = async (itemId, delta) => {
    try {
      await updateQuantity(itemId, delta);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Calculate display values
  const displayCart = cart || { items: [] };
  const displayTotal = cart?.finalPrice || cart?.totalPrice || 0;
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

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
          {cartLoading && (
            <div className="cart-loading">
              <div className="loading-spinner"></div>
              <p>Updating cart...</p>
            </div>
          )}
          
          <div className="cart-items">
            {!displayCart.items || displayCart.items.length === 0 ? (
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
              displayCart.items.map(item => (
                <div 
                  className={`cart-item ${cartLoading ? 'updating' : ''}`} 
                  key={item._id || item.id}
                >
                  <div className="cart-item-image">
                    <img 
                      src={item.image || '/images/placeholder-coffee.jpg'} 
                      alt={item.name} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-coffee.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.name}</h4>
                    
                    <div className="cart-item-price">KSh {item.price?.toLocaleString()}</div>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button 
                          onClick={() => handleQuantityUpdate(item._id || item.id, -1)}
                          disabled={item.quantity <= 1 || cartLoading}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="quantity-btn"
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityUpdate(item._id || item.id, 1)}
                          disabled={cartLoading}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="quantity-btn"
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
                      </button>
                    </div>
                    
                    <div className="cart-item-total">
                      KSh {(item.price * item.quantity)?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Cart Footer - SIMPLIFIED */}
        {displayCart.items && displayCart.items.length > 0 && (
          <div className="cart-footer">
            {/* Simple Total Only */}
            <div className="cart-total-simple">
              <div className="total-amount">
                <span>Total:</span>
                <span className="total-price">KSh {displayTotal.toLocaleString()}</span>
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
                disabled={cartLoading || !user}
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
              
              <button 
                className="btn secondary continue-btn" 
                onClick={openShop}
                disabled={cartLoading}
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