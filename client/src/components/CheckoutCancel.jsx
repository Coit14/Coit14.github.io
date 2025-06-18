import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-cancel">
      <h1>Checkout Cancelled</h1>
      <p>Your checkout was cancelled. No charges were made.</p>
      <button onClick={() => navigate('/')}>Return to Home</button>
    </div>
  );
};

export default CheckoutCancel; 