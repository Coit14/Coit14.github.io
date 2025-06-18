import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
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

            await handleCheckout(items);
        } catch (error) {
            console.error('Payment failed:', error);
            setError(error.message || 'Payment processing failed. Please try again.');
        }
    };

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
                    <PaymentForm
                        onSubmit={handlePaymentSubmit}
                        orderSummary={orderSummary}
                    />
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