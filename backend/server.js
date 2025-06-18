import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { initializeCache, getCachedProducts } from './services/cacheService.js';
// import printifyRoutes from './routes/printifyRoutes.js';
import printfulRoutes from './routes/printfulRoutes.js';
import cron from 'node-cron';
import { exec } from 'child_process';

// Import route handlers - keeping these as they're actively used
import { handler as productsHandler } from './api/products.js';
import { handler as sendEmailHandler } from './api/sendEmail.js';
import { handler as printfulWebhookHandler } from './api/printful-webhook.js';
// import { handler as printifyWebhookHandler } from './api/printify-webhook.js';

console.log('Printful API Key:', process.env.PRINTFUL_API_KEY ? 'exists' : 'missing');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Minimal request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Use printify routes
// app.use('/api/printify', printifyRoutes);
app.use('/api/printful', printfulRoutes);

// Initialize cache before setting up routes
console.log('Initializing product cache...');
initializeCache().then(() => {
    console.log('Cache initialized successfully, setting up routes...');
    
    // API routes - keeping these as they're actively used in the application
    app.post('/api/event-booking', sendEmailHandler);
    app.get('/api/products', productsHandler);
    app.post('/api/printful-webhook', printfulWebhookHandler);
    // app.post('/api/printify-webhook', printifyWebhookHandler);

    // Products route for fetching all products - using cache
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

    // Schedule to run every Sunday at 3am
    cron.schedule('0 3 * * 0', () => {
        console.log('Running weekly Printful product sync...');
        exec('node ./api/syncPrintfulProducts.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Sync error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Sync stderr: ${stderr}`);
                return;
            }
            console.log(`Sync stdout: ${stdout}`);
        });
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
