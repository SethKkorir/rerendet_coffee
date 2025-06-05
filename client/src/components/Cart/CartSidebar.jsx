// Updated CartSidebar.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import './CartSidebar.css';

function CartSidebar() {
  const {
    cart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart
  } = useContext(AppContext);
  
  const navigate = useNavigate();

  const closeCart = () => {
    setIsCartOpen(false);
    document.body.classList.remove('menu-open');
  };

  const proceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-cart" onClick={closeCart}>
            <FaTimes />
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <button className="btn primary" onClick={closeCart}>
                Shop Now
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-price">KSh {item.price} × {item.quantity}</div>
                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>KSh {cartTotal}</span>
            </div>
            <button 
              className="btn btn-primary checkout-btn" 
              onClick={proceedToCheckout}
            >
              Proceed to Checkout <FaArrowRight />
            </button>
          </div>
        )}
      </div>
      
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={closeCart} />
    </>
  );
}

export default CartSidebar;