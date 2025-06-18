import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const handleCheckout = async (items) => {
  try {
    const stripe = await stripePromise;
    
    // Call your backend to create a checkout session
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

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