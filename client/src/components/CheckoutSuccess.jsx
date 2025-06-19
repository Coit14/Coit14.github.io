import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/config';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    console.log('🔍 CheckoutSuccess: session_id =', sessionId);
    
    if (!sessionId) {
      console.log('❌ No session_id found, redirecting to home');
      navigate('/');
      return;
    }

    // Retrieve order info from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
    const selectedShipping = JSON.parse(localStorage.getItem('selectedShipping') || 'null');

    console.log('📦 Retrieved from localStorage:', { cartItems, shippingInfo, selectedShipping });

    if (!cartItems.length || !shippingInfo || !selectedShipping) {
      console.log('❌ Missing order info, setting status to missing');
      setOrderStatus('missing');
      return;
    }

    // Prepare order payload for Printful
    const orderPayload = {
      recipient: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        address1: shippingInfo.address1,
        address2: shippingInfo.address2,
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
        method: selectedShipping.name,
        rate: selectedShipping.rate
      }
    };

    console.log('📤 Creating Printful order with payload:', orderPayload);

    fetch(`${API_URL}/api/printful/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
      .then(res => {
        console.log('📥 Printful API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('📥 Printful API response data:', data);
        if (data.error) {
          setError(data.error);
          setOrderStatus('error');
        } else {
          setOrderStatus('success');
          // Clear cart and checkout info
          localStorage.removeItem('cartItems');
          localStorage.removeItem('shippingInfo');
          localStorage.removeItem('selectedShipping');
        }
      })
      .catch(err => {
        console.error('❌ Error creating Printful order:', err);
        setError('Failed to create Printful order.');
        setOrderStatus('error');
      });
  }, [navigate]);

  if (orderStatus === 'processing') {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-card">
          <div className="success-icon processing">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <h1>Processing your order...</h1>
          <p>Please wait while we confirm your payment and create your order.</p>
        </div>
      </div>
    );
  }
  
  if (orderStatus === 'missing') {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-card error">
          <div className="success-icon error">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1>Order Information Missing</h1>
          <p>We couldn't find your order details. Please contact support if you believe this is an error.</p>
          <button className="return-button" onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }
  
  if (orderStatus === 'error') {
    return (
      <div className="checkout-success-container">
        <div className="checkout-success-card error">
          <div className="success-icon error">
            <i className="fas fa-times-circle"></i>
          </div>
          <h1>Order Error</h1>
          <p>There was an error processing your order: {error}</p>
          <p>Your payment was successful, but we couldn't create your order. Please contact support.</p>
          <button className="return-button" onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success-container">
      <div className="checkout-success-card">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h1>Thank you for your order!</h1>
        <p>Your payment was successful and your order has been placed.</p>
        <p>You will receive a confirmation email shortly.</p>
        <button className="return-button" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 