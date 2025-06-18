import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      navigate('/');
      return;
    }

    // Retrieve order info from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const shippingInfo = JSON.parse(localStorage.getItem('shippingInfo') || '{}');
    const selectedShipping = JSON.parse(localStorage.getItem('selectedShipping') || 'null');

    if (!cartItems.length || !shippingInfo || !selectedShipping) {
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

    fetch('/api/printful/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
      .then(res => res.json())
      .then(data => {
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
        setError('Failed to create Printful order.');
        setOrderStatus('error');
      });
  }, [navigate]);

  if (orderStatus === 'processing') {
    return <div className="checkout-success"><h1>Processing your order...</h1></div>;
  }
  if (orderStatus === 'missing') {
    return <div className="checkout-success"><h1>Order info missing.</h1></div>;
  }
  if (orderStatus === 'error') {
    return <div className="checkout-success"><h1>Order Error</h1><p>{error}</p></div>;
  }

  return (
    <div className="checkout-success">
      <h1>Thank you for your order!</h1>
      <p>Your payment was successful and your order has been placed.</p>
      <button onClick={() => navigate('/')}>Return to Home</button>
    </div>
  );
};

export default CheckoutSuccess; 