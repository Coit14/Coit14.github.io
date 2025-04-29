import printifyService from '../services/printifyService.js';

// Cache storage
let cachedProducts = null;
let lastCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Validate individual product
function isValidProduct(product) {
    // Check required fields
    if (!product.id || !product.title) {
        console.warn(`Skipping invalid product: ${product.id || 'unknown'} — missing id or title`);
        return false;
    }

    // Check for at least one image
    if (!product.images?.length) {
        console.warn(`Skipping invalid product: ${product.id} — no images`);
        return false;
    }

    // Check for at least one enabled variant
    const hasEnabledVariant = product.variants?.some(v => v.is_enabled);
    if (!hasEnabledVariant) {
        console.warn(`Skipping invalid product: ${product.id} — no enabled variants`);
        return false;
    }

    return true;
}

// Function to fetch and process products from Printify
async function fetchProductsFromPrintify() {
    try {
        console.log('Fetching products from Printify API...');
        
        // Get shops first
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            throw new Error('No shop found');
        }
        
        const shopId = shops[0].id;
        const productsResponse = await printifyService.getProducts(shopId);
        
        // Process and filter products with sanitized data
        const products = productsResponse.data.data
            // First filter out non-visible and deleted products silently
            .filter(product => product.visible && !product.is_deleted)
            // Then validate and map remaining products
            .filter(isValidProduct)
            .map(product => ({
                id: product.id,
                title: product.title,
                description: product.description,
                images: product.images.map(img => ({
                    src: img.src,
                    variant_ids: img.variant_ids
                })),
                tags: product.tags,
                variants: product.variants
                    .filter(v => v.is_enabled)
                    .map(variant => ({
                        id: variant.id,
                        title: variant.title,
                        sku: variant.sku,
                        price: variant.price,
                        cost: variant.cost,
                        grams: variant.grams,
                        options: variant.options,
                        is_enabled: variant.is_enabled,
                        is_available: variant.is_available
                    }))
            }));

        console.log(`Successfully cached ${products.length} products with ${products.reduce((sum, p) => sum + p.variants.length, 0)} total variants`);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        throw error;
    }
}

// Schedule next 3 AM refresh
function scheduleNextRefresh() {
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0); // Set to 3:00:00.000 AM

    // If it's already past 3 AM, schedule for next day
    if (now > next3AM) {
        next3AM.setDate(next3AM.getDate() + 1);
    }

    const msUntilNext3AM = next3AM.getTime() - now.getTime();
    
    console.log(`Next cache refresh scheduled for ${next3AM.toLocaleString('en-US', { 
        timeZone: 'America/Chicago',
        dateStyle: 'short',
        timeStyle: 'short'
    })}`);

    return msUntilNext3AM;
}

// Initialize cache
export async function initializeCache() {
    try {
        console.log('Initializing product cache...');
        cachedProducts = await fetchProductsFromPrintify();
        lastCacheTime = Date.now();
        
        // Schedule first refresh at next 3 AM CT
        const msUntilNext3AM = scheduleNextRefresh();
        
        // Set up the first refresh
        setTimeout(async () => {
            try {
                console.log('Performing scheduled cache refresh...');
                cachedProducts = await fetchProductsFromPrintify();
                lastCacheTime = Date.now();
                console.log('Cache refresh complete');
                
                // Set up subsequent daily refreshes
                setInterval(async () => {
                    try {
                        console.log('Performing scheduled cache refresh...');
                        cachedProducts = await fetchProductsFromPrintify();
                        lastCacheTime = Date.now();
                        console.log('Cache refresh complete');
                    } catch (error) {
                        console.error('Cache refresh failed:', error.message);
                    }
                }, CACHE_DURATION);
                
            } catch (error) {
                console.error('Initial cache refresh failed:', error.message);
            }
        }, msUntilNext3AM);
        
    } catch (error) {
        console.error('Cache initialization failed:', error.message);
        throw error;
    }
}

// Get products from cache
export function getCachedProducts() {
    if (!cachedProducts) {
        throw new Error('Cache not initialized');
    }
    return cachedProducts;
}

// Force refresh cache
export async function refreshCache() {
    try {
        console.log('Manual cache refresh requested...');
        cachedProducts = await fetchProductsFromPrintify();
        lastCacheTime = Date.now();
        console.log('Manual cache refresh complete');
        return true;
    } catch (error) {
        console.error('Manual cache refresh failed:', error.message);
        throw error;
    }
}

// Get cache status
export function getCacheStatus() {
    return {
        isInitialized: !!cachedProducts,
        lastUpdated: lastCacheTime,
        productCount: cachedProducts ? cachedProducts.length : 0,
        variantCount: cachedProducts ? cachedProducts.reduce((sum, p) => sum + p.variants.length, 0) : 0,
        nextRefresh: new Date(lastCacheTime + CACHE_DURATION).toLocaleString('en-US', {
            timeZone: 'America/Chicago',
            dateStyle: 'short',
            timeStyle: 'short'
        })
    };
} 