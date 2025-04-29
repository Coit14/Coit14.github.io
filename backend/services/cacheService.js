import printifyService from '../services/printifyService.js';

// Cache storage
let cachedProducts = null;
let lastCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Validate individual product
function isValidProduct(product) {
    // Check required fields
    if (!product.id || !product.title) {
        return false;
    }

    // Check for at least one image
    if (!product.images?.length) {
        return false;
    }

    // Check for at least one truly active variant (both enabled and available)
    const activeVariants = product.variants?.filter(v => v.is_enabled && v.is_available) || [];
    if (activeVariants.length === 0) {
        return false;
    }

    return true;
}

// Function to fetch and process products from Printify
async function fetchProductsFromPrintify() {
    try {
        // Get shops first
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            throw new Error('No shop found');
        }
        
        const shopId = shops[0].id;
        const productsResponse = await printifyService.getProducts(shopId);
        
        // First, strictly filter products and variants before any logging
        const filteredProducts = productsResponse.data.data
            .filter(p => !p.is_deleted && p.visible)
            .map(product => {
                // Only get variants that are both enabled AND available
                const activeVariants = product.variants
                    .filter(v => v.is_enabled === true && v.is_available === true)
                    .map(variant => ({
                        id: variant.id,
                        title: variant.title,
                        sku: variant.sku,
                        price: variant.price,
                        cost: variant.cost,
                        grams: variant.grams,
                        options: variant.options,
                        is_enabled: true,
                        is_available: true
                    }));

                // Skip products with no active variants
                if (activeVariants.length === 0) return null;

                return {
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    images: product.images.map(img => ({
                        src: img.src,
                        variant_ids: img.variant_ids
                    })),
                    tags: product.tags,
                    variants: activeVariants
                };
            })
            .filter(p => p !== null);

        // Only log products that made it through filtering
        if (filteredProducts.length > 0) {
            console.log('\n📦 Cache Summary:');
            console.log(`Found ${filteredProducts.length} products with active variants:`);
            
            filteredProducts.forEach(product => {
                console.log(`\n✅ ${product.title}:`);
                console.log(`   ${product.variants.length} variants:`);
                console.log('   ' + product.variants.map(v => v.title).join(', '));
            });
            
            const totalVariants = filteredProducts.reduce((sum, p) => sum + p.variants.length, 0);
            console.log(`\nTotal: ${filteredProducts.length} products with ${totalVariants} variants`);
        } else {
            console.log('No products found with active variants');
        }
        
        return filteredProducts;
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