import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderReview from './OrderReview';
import { API_URL } from '../../config/config';
import './Checkout.css';

const CheckoutSteps = {
    SHIPPING: 'shipping',
    PAYMENT: 'payment',
    REVIEW: 'review'
};

const fetchShippingOptions = async (shippingInfo, cartItems) => {
    try {
        console.log('Fetching shipping rates with:', {
            address: shippingInfo,
            items: cartItems
        });
        
        const response = await fetch(`${API_URL}/api/printify/shipping-rates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: {
                    first_name: shippingInfo.firstName,
                    last_name: shippingInfo.lastName,
                    email: shippingInfo.email,
                    country: shippingInfo.country,
                    region: shippingInfo.state,
                    city: shippingInfo.city,
                    address1: shippingInfo.address1,
                    address2: shippingInfo.address2,
                    zip: shippingInfo.zipCode,
                },
                items: cartItems.map(item => ({
                    id: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                }))
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Shipping calculation failed:', errorData);
            throw new Error(errorData.error || 'Failed to fetch shipping options');
        }

        const data = await response.json();
        console.log('Received shipping options:', data);
        return data;
    } catch (error) {
        console.error('Error fetching shipping options:', error);
        return [];
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

    const handleAddressSubmit = async (info) => {
        setShippingInfo(info);
        setSelectedShipping(null);
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
        }
    };

    const handleShippingMethodSubmit = () => {
        if (selectedShipping) {
            setOrderSummary(prev => ({
                ...prev,
                shipping: selectedShipping.rate,
                total: prev.subtotal + selectedShipping.rate + prev.tax
            }));
            setCurrentStep(CheckoutSteps.PAYMENT);
            setShippingStage('address');
        }
    };

    const handlePaymentSubmit = async () => {
        try {
            // We'll add payment processing later
            setCurrentStep(CheckoutSteps.REVIEW);
        } catch (error) {
            console.error('Payment failed:', error);
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