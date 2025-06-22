import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const formatPrice = (price) => {
    if (!price) return '$0.00';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
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
                                <div key={`${item.productId}-${item.variantId}`} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-header">
                                            <h3>{item.name}</h3>
                                            <button 
                                                className="remove-item"
                                                onClick={() => removeFromCart(item.productId, item.variantId)}
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p className="variant-details">
                                            {item.size}{item.color && ` - ${item.color}`}
                                        </p>
                                        <p className="item-price">{formatPrice(item.price)}</p>
                                        <div className="quantity-controls">
                                            <button 
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
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