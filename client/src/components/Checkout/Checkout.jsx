import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderReview from './OrderReview';
import './Checkout.css';

const CheckoutSteps = {
    SHIPPING: 'shipping',
    PAYMENT: 'payment',
    REVIEW: 'review'
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

    const handleShippingSubmit = (info) => {
        setShippingInfo(info);
        setCurrentStep(CheckoutSteps.PAYMENT);
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
                        onSubmit={handleShippingSubmit}
                        shippingMethods={shippingMethods}
                        selectedShipping={selectedShipping}
                        onSelectShipping={setSelectedShipping}
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