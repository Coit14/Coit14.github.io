import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
const OUTPUT_PATH = path.resolve(__dirname, 'products.json');

async function fetchPrintfulProducts() {
    const response = await fetch('https://api.printful.com/store/products', {
        headers: {
            'Authorization': `Bearer ${PRINTFUL_API_KEY}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    return data.result;
}

async function fetchProductDetails(productId) {
    const response = await fetch(`https://api.printful.com/store/products/${productId}`, {
        headers: {
            'Authorization': `Bearer ${PRINTFUL_API_KEY}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch product ${productId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.result;
}

async function syncProducts() {
    try {
        console.log('Fetching product list from Printful...');
        const products = await fetchPrintfulProducts();
        const detailedProducts = [];
        for (const product of products) {
            const details = await fetchProductDetails(product.id);
            detailedProducts.push(details);
        }
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(detailedProducts, null, 2));
        console.log(`Synced ${detailedProducts.length} products to ${OUTPUT_PATH}`);
    } catch (err) {
        console.error('Error syncing products:', err);
    }
}

syncProducts(); 