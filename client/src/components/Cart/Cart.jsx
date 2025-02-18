import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
};

const Cart = () => {
    const navigate = useNavigate();
    const { 
        cartItems, 
        isCartOpen, 
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        getCartTotal
    } = useCart();

    const handleCheckout = () => {
        setIsCartOpen(false); // Close the cart
        navigate('/checkout'); // Navigate to checkout
    };

    if (!isCartOpen) return null;

    return (
        <>
            <div 
                className="cart-backdrop open" 
                onClick={() => setIsCartOpen(false)}
            />
            <div className="cart-overlay open">
                <div className="cart-container">
                    <div className="cart-header">
                        <h2>Your Cart</h2>
                        <button 
                            className="close-cart"
                            onClick={() => setIsCartOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="cart-items">
                        {cartItems.length === 0 ? (
                            <p className="empty-cart">Your cart is empty</p>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.variantId} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.title} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h3>{item.title}</h3>
                                        <p className="variant-title">{item.variantTitle}</p>
                                        <p className="item-price">{formatPrice(item.price)}</p>
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        className="remove-item"
                                        onClick={() => removeFromCart(item.variantId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>{formatPrice(getCartTotal())}</span>
                            </div>
                            <button 
                                className="checkout-button"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart; 