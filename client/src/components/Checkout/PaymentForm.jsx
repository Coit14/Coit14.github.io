import React from 'react';
import { useCart } from '../../contexts/CartContext';
import './PaymentForm.css';

const PaymentForm = ({ onSubmit, orderSummary }) => {
    const { cartItems } = useCart();

    const handleSubmit = (e) => {
        e.preventDefault();
        // We'll add Stripe payment logic here later
        onSubmit();
    };

    return (
        <div className="payment-form-container">
            <div className="payment-form-content">
                <div className="form-section">
                    <h3>Order Summary</h3>
                    <div className="order-items">
                        {cartItems.map(item => (
                            <div key={item.variantId} className="order-item">
                                <div className="item-image">
                                    <img src={item.image} alt={item.title} />
                                </div>
                                <div className="item-details">
                                    <h4>{item.title}</h4>
                                    <p className="variant-title">{item.variantTitle}</p>
                                    <p className="item-quantity">Quantity: {item.quantity}</p>
                                </div>
                                <div className="item-price">
                                    ${((item.price * item.quantity) / 100).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h3>Payment Details</h3>
                    <div className="payment-placeholder">
                        {/* Stripe Elements will be inserted here */}
                        <p>Stripe payment form will be integrated here</p>
                    </div>
                </div>

                <div className="order-total">
                    <div className="total-line">
                        <span>Subtotal</span>
                        <span>${(orderSummary.subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="total-line">
                        <span>Shipping</span>
                        <span>${(orderSummary.shipping / 100).toFixed(2)}</span>
                    </div>
                    <div className="total-line">
                        <span>Tax</span>
                        <span>${(orderSummary.tax / 100).toFixed(2)}</span>
                    </div>
                    <div className="total-line grand-total">
                        <span>Total</span>
                        <span>${(orderSummary.total / 100).toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="submit-payment-button"
                    onClick={handleSubmit}
                >
                    Place Order
                </button>
            </div>
        </div>
    );
};

export default PaymentForm; 