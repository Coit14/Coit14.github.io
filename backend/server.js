import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

// Import route handlers
import { handler as productsHandler } from './api/products.js';
import { handler as sendEmailHandler } from './api/sendEmail.js';
import { handler as printifyWebhookHandler } from './api/printify-webhook.js';
import { handler as printifyTestHandler } from './api/printify-test.js';

console.log('API Key:', process.env.PRINTIFY_API_KEY ? 'exists' : 'missing');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// API Routes
app.get('/api/products', productsHandler);
app.post('/api/sendEmail', sendEmailHandler);
app.post('/api/printify-webhook', printifyWebhookHandler);
app.get('/api/printify-test', printifyTestHandler);

// Products route for fetching all products
app.get('/api/products/all', async (req, res) => {
    try {
        const shopId = process.env.SHOP_ID;
        const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        res.json(data.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
