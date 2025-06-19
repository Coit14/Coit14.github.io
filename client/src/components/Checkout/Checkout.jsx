import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from 'react-router-dom';
import ShippingForm from './ShippingForm';
// import PaymentForm from './PaymentForm'; // Removed
import OrderReview from './OrderReview';
import { API_URL } from '../../config/config';
import { handleCheckout } from '../../services/stripeService';
import './Checkout.css';

const CheckoutSteps = {
    SHIPPING: 'shipping',
    PAYMENT: 'payment',
    REVIEW: 'review'
};

const fetchShippingOptions = async (shippingInfo, cartItems) => {
    try {
        // Validate cart items before making the request
        if (!cartItems || cartItems.length === 0) {
            console.error('❌ Shipping calculation blocked: Cart is empty');
            throw new Error('Cart is empty. Cannot calculate shipping.');
        }

        // Format the payload according to Printful's API requirements
        const payload = {
            recipient: {
                address1: shippingInfo.address1,
                address2: shippingInfo.address2 || '',
                city: shippingInfo.city,
                country_code: shippingInfo.country,
                state_code: shippingInfo.state,
                zip: shippingInfo.zipCode
            },
            items: cartItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity
            }))
        };

        console.log('📦 Shipping calculation payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(`${API_URL}/api/printful/shipping-rates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Shipping calculation failed:', errorData);
            throw new Error(errorData.error || 'Failed to fetch shipping options');
        }

        const data = await response.json();
        console.log('✅ Received shipping options:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching shipping options:', error);
        throw error;
    }
};

const Checkout = () => {
    const { cartItems, getCartTotal } = useCart();
    const [currentStep, setCurrentStep] = useState(CheckoutSteps.SHIPPING);
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    });
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [orderSummary, setOrderSummary] = useState({
        subtotal: getCartTotal(),
        shipping: 0,
        tax: 0,
        total: getCartTotal()
    });
    const [shippingStage, setShippingStage] = useState('address');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checkoutCancelled, setCheckoutCancelled] = useState(false);
    const location = useLocation();

    const handleAddressSubmit = async (info) => {
        setShippingInfo(info);
        setSelectedShipping(null);
        setIsLoading(true);
        setError(null);
        try {
            const shippingOptions = await fetchShippingOptions(info, cartItems);
            setShippingMethods(
                shippingOptions.map(option => ({
                    id: option.id,
                    name: option.name,
                    rate: option.cost,
                    delivery_time: `${option.min_delivery_days}-${option.max_delivery_days} days`
                }))
            );
            setShippingStage('method');
        } catch (error) {
            console.error('Error fetching shipping options:', error);
            setError(error.message || 'Unable to calculate shipping rates. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShippingMethodSubmit = () => {
        if (selectedShipping) {
            const shippingRate = Number(selectedShipping.rate) || 0;
            setOrderSummary(prev => ({
                ...prev,
                shipping: shippingRate,
                total: prev.subtotal + shippingRate + prev.tax
            }));
            setCurrentStep(CheckoutSteps.PAYMENT);
            setShippingStage('address');
        }
    };

    const handlePaymentSubmit = async () => {
        try {
            // Format items for Stripe checkout
            const items = cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: Math.round(item.price * 100) // Convert to cents
            }));

            // Add shipping cost as a separate line item
            if (selectedShipping) {
                items.push({
                    name: `Shipping - ${selectedShipping.name}`,
                    quantity: 1,
                    price: Math.round(selectedShipping.rate * 100)
                });
            }

            // Persist order info for Printful order creation after payment
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
            localStorage.setItem('selectedShipping', JSON.stringify(selectedShipping));

            await handleCheckout(items);
        } catch (error) {
            console.error('Payment failed:', error);
            setError(error.message || 'Payment processing failed. Please try again.');
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("cancelled")) {
            setCheckoutCancelled(true);
        }
    }, [location.search]);

    return (
        <div className="checkout-container">
            <div className="checkout-steps">
                <div className={`step ${currentStep === CheckoutSteps.SHIPPING ? 'active' : ''}`}>
                    Shipping
                </div>
                <div className={`step ${currentStep === CheckoutSteps.PAYMENT ? 'active' : ''}`}>
                    Payment
                </div>
                <div className={`step ${currentStep === CheckoutSteps.REVIEW ? 'active' : ''}`}>
                    Review
                </div>
            </div>

            <div className="checkout-content">
                {checkoutCancelled && (
                    <div style={{ marginBottom: "1rem", color: "red", padding: "10px", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "4px" }}>
                        You cancelled your payment. No charges were made.
                    </div>
                )}
                
                {currentStep === CheckoutSteps.SHIPPING && (
                    <ShippingForm
                        shippingStage={shippingStage}
                        onAddressSubmit={handleAddressSubmit}
                        onShippingMethodSubmit={handleShippingMethodSubmit}
                        shippingMethods={shippingMethods}
                        selectedShipping={selectedShipping}
                        onSelectShipping={setSelectedShipping}
                        shippingInfo={shippingInfo}
                        isLoading={isLoading}
                        error={error}
                    />
                )}

                {currentStep === CheckoutSteps.PAYMENT && (
                    <div className="payment-step">
                        <div className="order-summary-section">
                            <h2>Order Summary</h2>
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
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="order-totals">
                                <div className="total-line">
                                    <span>Subtotal</span>
                                    <span>${orderSummary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="total-line">
                                    <span>Shipping ({selectedShipping?.name})</span>
                                    <span>${orderSummary.shipping.toFixed(2)}</span>
                                </div>
                                {orderSummary.tax > 0 && (
                                    <div className="total-line">
                                        <span>Tax</span>
                                        <span>${orderSummary.tax.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="total-line grand-total">
                                    <span>Total</span>
                                    <span>${orderSummary.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="payment-section">
                            <h2>Secure Payment</h2>
                            <div className="payment-info">
                                <div className="security-badges">
                                    <i className="fas fa-lock"></i>
                                    <span>Secure Checkout by Stripe</span>
                                </div>
                                <div className="payment-methods">
                                    <p>We accept:</p>
                                    <div className="card-icons">
                                        <i className="fab fa-cc-visa"></i>
                                        <i className="fab fa-cc-mastercard"></i>
                                        <i className="fab fa-cc-amex"></i>
                                        <i className="fab fa-cc-discover"></i>
                                    </div>
                                </div>
                                <div className="checkout-notice">
                                    <p>You'll be redirected to Stripe's secure payment page to complete your purchase.</p>
                                </div>
                            </div>

                            <div className="shipping-preview">
                                <h3>Shipping To:</h3>
                                <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                                <p>{shippingInfo.address1}</p>
                                {shippingInfo.address2 && <p>{shippingInfo.address2}</p>}
                                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                                <p>{shippingInfo.country}</p>
                            </div>

                            <button 
                                className="checkout-button"
                                onClick={handlePaymentSubmit} 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="button-content">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="button-content">
                                        <i className="fas fa-lock"></i>
                                        Pay ${orderSummary.total.toFixed(2)}
                                    </span>
                                )}
                            </button>
                            
                            {/* Temporary test button for debugging */}
                            <button 
                                className="checkout-button"
                                style={{ marginTop: '10px', backgroundColor: '#007bff' }}
                                onClick={() => {
                                    console.log('🧪 Test button clicked - navigating to success page');
                                    window.location.href = '/#/checkout/success?session_id=test_session_123';
                                }}
                            >
                                🧪 Test Success Page
                            </button>
                            
                            {error && <div className="checkout-error">{error}</div>}
                        </div>
                    </div>
                )}

                {currentStep === CheckoutSteps.REVIEW && (
                    <OrderReview
                        orderSummary={orderSummary}
                        shippingInfo={shippingInfo}
                    />
                )}
            </div>
        </div>
    );
};

export default Checkout; 