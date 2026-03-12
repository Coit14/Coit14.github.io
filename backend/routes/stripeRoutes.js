import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', async (req, res) => {
  try {
    const { items } = req.body;
    
    const baseUrl = (process.env.PUBLIC_SITE_URL || 'https://coit14.github.io').replace(/\/$/, '');
    const successUrl = `${baseUrl}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/#/checkout/cancel`;
    
    console.log('🔧 Creating Stripe session with URLs:');
    console.log('🔧 Success URL:', successUrl);
    console.log('🔧 Cancel URL:', cancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log('✅ Stripe session created:', session.id);
    console.log('✅ Session success_url:', session.success_url);
    console.log('✅ Session cancel_url:', session.cancel_url);

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
});

export default router; 