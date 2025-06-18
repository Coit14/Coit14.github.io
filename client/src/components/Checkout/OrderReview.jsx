import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderReview.css';

const OrderReview = ({ orderSummary, shippingInfo, printfulOrder }) => {
    const navigate = useNavigate();

    return (
        <div className="order-review-container">
            <div className="success-message">
                <div className="success-icon">✓</div>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
                {printfulOrder?.id && (
                    <p className="order-id">Order ID: {printfulOrder.id}</p>
                )}
            </div>

            <div className="order-details">
                <div className="section">
                    <h3>Order Summary</h3>
                    <div className="summary-details">
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>${Number(orderSummary.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping:</span>
                            <span>${Number(orderSummary.shipping).toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Tax:</span>
                            <span>${Number(orderSummary.tax).toFixed(2)}</span>
                        </div>
                        <div className="summary-line total">
                            <span>Total:</span>
                            <span>${Number(orderSummary.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <h3>Shipping Information</h3>
                    <div className="shipping-details">
                        <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                        <p>{shippingInfo.address1}</p>
                        {shippingInfo.address2 && <p>{shippingInfo.address2}</p>}
                        <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                        <p>{shippingInfo.email}</p>
                    </div>
                </div>

                {printfulOrder?.status && (
                    <div className="section">
                        <h3>Order Status</h3>
                        <div className="order-status">
                            <p>Status: {printfulOrder.status}</p>
                            {printfulOrder.external_id && (
                                <p>External ID: {printfulOrder.external_id}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button 
                    className="continue-shopping"
                    onClick={() => navigate('/shop')}
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default OrderReview; 