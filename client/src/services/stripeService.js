import { loadStripe } from '@stripe/stripe-js';
import { API_URL } from '../config/config';

// Log the Stripe publishable key for debugging (will be undefined in production if not set)
console.log('REACT_APP_STRIPE_PUBLISHABLE_KEY:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Fallback to a placeholder test key if not defined
// REMINDER: Set REACT_APP_STRIPE_PUBLISHABLE_KEY in Render dashboard (frontend build settings)
// set in render, good for production.
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export const handleCheckout = async (items) => {
  if (!stripePromise) {
    console.error('Stripe is not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in your environment.');
    return;
  }
  try {
    const stripe = await stripePromise;
    
    // Call your backend to create a checkout session
    const response = await fetch(`${API_URL}/api/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId,
    });

    if (result.error) {
      console.error('Error:', result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}; 