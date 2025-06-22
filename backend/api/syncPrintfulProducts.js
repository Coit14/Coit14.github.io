import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import printfulApi from '../config/printful.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const OUTPUT_PATH = path.resolve(__dirname, 'products.json');

async function fetchPrintfulProducts() {
    const response = await printfulApi.get('/store/products');
    return response.data.result;
}

async function fetchProductDetails(productId) {
    const response = await printfulApi.get(`/store/products/${productId}`);
    return response.data.result;
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