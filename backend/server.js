import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Import the products handler
const productsHandler = require('./api/products');

dotenv.config();

console.log('API Key:', process.env.PRINTIFY_API_KEY ? 'exists' : 'missing');
console.log('Shop ID:', process.env.SHOP_ID ? 'exists' : 'missing');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Add the new products route while keeping the existing one
app.get('/api/products', (req, res) => {
    // Call the products handler with req and res
    return productsHandler(req, res);
});

// Existing route preserved
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

// Add logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
