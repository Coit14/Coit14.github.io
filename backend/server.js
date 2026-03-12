import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { initializeCache, getCachedProducts } from './services/cacheService.js';
import { FEATURES } from './config/features.js';
// import printifyRoutes from './routes/printifyRoutes.js';
import printfulRoutes from './routes/printfulRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import cron from 'node-cron';
import { exec } from 'child_process';
import productsRouter from './api/products.js';

// Import route handlers - keeping these as they're actively used
import { handler as sendEmailHandler } from './api/sendEmail.js';
import { handler as printfulWebhookHandler } from './api/printful-webhook.js';
import { handler as eventBookingResponseHandler } from './api/eventBookingResponse.js';
import { handler as calendarEventsHandler } from './api/calendarEvents.js';
// import { handler as printifyWebhookHandler } from './api/printify-webhook.js';

if (FEATURES.MERCH) {
    console.log('Printful API Key:', process.env.PRINTFUL_API_KEY ? 'exists' : 'missing');
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware: single PUBLIC_SITE_URL used for CORS and for redirects (see sendEmail, stripeRoutes)
const publicSiteUrl = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
app.use(cors(publicSiteUrl ? { origin: publicSiteUrl } : {}));
app.use(express.json());

// Minimal request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Shop routes only when MERCH enabled
if (FEATURES.MERCH) {
    app.use('/api/printful', printfulRoutes);
    app.use('/api/checkout', stripeRoutes);
}

function setupCoreRoutes() {
    app.post('/api/event-booking', sendEmailHandler);
    app.post('/api/event-booking/respond', eventBookingResponseHandler);
    app.get('/api/calendar/events', calendarEventsHandler);

    if (FEATURES.MERCH) {
        app.use('/api/products', productsRouter);
        app.post('/api/printful-webhook', printfulWebhookHandler);
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
        cron.schedule('0 3 * * 0', () => {
            console.log('Running weekly Printful product sync...');
            exec('node ./api/syncPrintfulProducts.js', (error, stdout, stderr) => {
                if (error) console.error(`Sync error: ${error.message}`);
                if (stderr) console.error(`Sync stderr: ${stderr}`);
                if (stdout) console.log(`Sync stdout: ${stdout}`);
            });
        });
    } else {
        app.use('/api/products', (req, res, next) => res.status(200).json([]));
        app.get('/api/products/all', (req, res) => res.json([]));
    }

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

if (FEATURES.MERCH) {
    console.log('Initializing product cache...');
    initializeCache()
        .then(() => {
            console.log('Cache initialized successfully, setting up routes...');
            setupCoreRoutes();
        })
        .catch((error) => {
            console.error('Failed to initialize cache:', error);
            process.exit(1);
        });
} else {
    setupCoreRoutes();
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: err.message 
    });
});
