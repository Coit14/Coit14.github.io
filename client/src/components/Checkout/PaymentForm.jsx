import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { API_URL } from '../../config/config';
import './PaymentForm.css';

const PaymentForm = ({ onSubmit, orderSummary, shippingInfo, selectedShipping }) => {
    const { cartItems } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const createPrintfulOrder = async () => {
        try {
            const response = await fetch(`${API_URL}/api/printful/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipient: {
                        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                        email: shippingInfo.email,
                        address1: shippingInfo.address1,
                        address2: shippingInfo.address2 || '',
                        city: shippingInfo.city,
                        state_code: shippingInfo.state,
                        country_code: shippingInfo.country,
                        zip: shippingInfo.zipCode
                    },
                    items: cartItems.map(item => ({
                        variant_id: item.variant_id,
                        quantity: item.quantity
                    })),
                    shipping: {
                        method: selectedShipping?.name,
                        rate: selectedShipping?.rate
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const orderData = await response.json();
            console.log('✅ Printful order created:', orderData);
            return orderData;
        } catch (error) {
            console.error('❌ Error creating Printful order:', error);
            throw new Error(error.message || 'Failed to create order. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        try {
            // Create Printful order first
            const printfulOrder = await createPrintfulOrder();
            
            // TODO: Add Stripe payment processing here
            // For now, we'll just proceed to review
            onSubmit(printfulOrder);
        } catch (error) {
            setError(error.message || 'An error occurred while processing your order');
        } finally {
            setIsProcessing(false);
        }
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
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="item-details">
                                    <h4>{item.name}</h4>
                                    <p className="variant-title">{item.color} - {item.size}</p>
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
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
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
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
            </div>
        </div>
    );
};

export default PaymentForm; 