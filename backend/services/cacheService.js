import printifyService from '../services/printifyService.js';

// Cache storage
let cachedProducts = null;
let lastCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to fetch and process products from Printify
async function fetchProductsFromPrintify() {
    try {
        console.log('Fetching fresh products from Printify API...');
        
        // Get shops first
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            throw new Error('No shop found');
        }
        
        const shopId = shops[0].id;
        const productsResponse = await printifyService.getProducts(shopId);
        
        // Process and filter products
        const products = productsResponse.data.data
            .filter(product => product.visible && !product.is_deleted)
            .map(product => ({
                id: product.id,
                title: product.title,
                description: product.description,
                images: product.images,
                tags: product.tags,
                variants: product.variants
                    .filter(v => v.is_enabled)
            }));

        console.log(`Cached ${products.length} products successfully`);
        return products;
    } catch (error) {
        console.error('Error fetching products from Printify:', error);
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
    
    console.log(`Scheduling next cache refresh for ${next3AM.toLocaleString('en-US', { 
        timeZone: 'America/Chicago',
        dateStyle: 'full',
        timeStyle: 'long'
    })}`);

    return msUntilNext3AM;
}

// Initialize cache
export async function initializeCache() {
    try {
        cachedProducts = await fetchProductsFromPrintify();
        lastCacheTime = Date.now();
        console.log('Product cache initialized successfully');
        
        // Schedule first refresh at next 3 AM CT
        const msUntilNext3AM = scheduleNextRefresh();
        
        // Set up the first refresh
        setTimeout(async () => {
            try {
                console.log('Performing scheduled cache refresh...');
                cachedProducts = await fetchProductsFromPrintify();
                lastCacheTime = Date.now();
                console.log('Cache refreshed successfully');
                
                // Set up subsequent daily refreshes
                setInterval(async () => {
                    try {
                        console.log('Performing scheduled cache refresh...');
                        cachedProducts = await fetchProductsFromPrintify();
                        lastCacheTime = Date.now();
                        console.log('Cache refreshed successfully');
                    } catch (error) {
                        console.error('Failed to refresh cache:', error);
                        // Keep the old cache if refresh fails
                    }
                }, CACHE_DURATION);
                
            } catch (error) {
                console.error('Failed to refresh cache:', error);
                // Keep the old cache if refresh fails
            }
        }, msUntilNext3AM);
        
    } catch (error) {
        console.error('Failed to initialize cache:', error);
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
        console.log('Manually refreshing product cache...');
        cachedProducts = await fetchProductsFromPrintify();
        lastCacheTime = Date.now();
        console.log('Cache manually refreshed successfully');
        return true;
    } catch (error) {
        console.error('Failed to refresh cache:', error);
        throw error;
    }
}

// Get cache status
export function getCacheStatus() {
    return {
        isInitialized: !!cachedProducts,
        lastUpdated: lastCacheTime,
        productCount: cachedProducts ? cachedProducts.length : 0,
        nextRefresh: new Date(lastCacheTime + CACHE_DURATION).toLocaleString('en-US', {
            timeZone: 'America/Chicago',
            dateStyle: 'full',
            timeStyle: 'long'
        })
    };
} 