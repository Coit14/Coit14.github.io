import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutCancel.css';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-cancel-container">
      <div className="checkout-cancel-card">
        <div className="cancel-icon">
          <i className="fas fa-times-circle"></i>
        </div>
        <h1>Checkout Cancelled</h1>
        <p>Your checkout was cancelled. No charges were made.</p>
        <p>You can return to your cart to try again or continue shopping.</p>
        <button className="return-button" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    </div>
  );
};

export default CheckoutCancel; 