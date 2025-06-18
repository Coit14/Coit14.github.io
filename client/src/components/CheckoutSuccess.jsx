import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // You could verify the session here if needed
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="checkout-success">
      <h1>Thank you for your order!</h1>
      <p>Your payment was successful and your order has been placed.</p>
      <button onClick={() => navigate('/')}>Return to Home</button>
    </div>
  );
};

export default CheckoutSuccess; 