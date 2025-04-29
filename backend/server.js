import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { initializeCache, getCachedProducts } from './services/cacheService.js';
import printifyRoutes from './routes/printifyRoutes.js';

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

// Enhanced logging middleware
app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('======================\n');
    next();
});

// Use printify routes
app.use('/api/printify', printifyRoutes);

// Initialize cache before setting up routes
console.log('Initializing product cache...');
initializeCache().then(() => {
    console.log('Cache initialized successfully, setting up routes...');
    
    // API routes
    app.post('/api/event-booking', sendEmailHandler);
    app.get('/api/products', productsHandler);
    app.post('/api/printify-webhook', printifyWebhookHandler);
    app.get('/api/printify-test', printifyTestHandler);

    // Products route for fetching all products - now using cache
    app.get('/api/products/all', async (req, res) => {
        try {
            const products = getCachedProducts();
            console.log(`Serving ${products.length} products from cache via /api/products/all`);
            res.json(products);
        } catch (error) {
            console.error('Error serving products from cache:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    });

    // Start server
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize cache:', error);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: err.message 
    });
});
