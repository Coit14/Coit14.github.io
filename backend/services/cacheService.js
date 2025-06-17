// TODO: Update cache logic for Printful integration. Printify logic removed.

// Cache storage
let cachedProducts = null;
let lastCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Placeholder for future Printful cache logic

// Validate individual product
function isValidProduct(product) {
    if (!product.id || !product.title) return false;
    if (!product.images?.length) return false;
    const activeVariants = product.variants?.filter(v => v.is_enabled && v.is_available) || [];
    return activeVariants.length > 0;
}

// Function to fetch and process products from Printify
async function fetchProductsFromPrintify() {
    try {
        const shops = await printifyService.getShops();
        if (!Array.isArray(shops) || shops.length === 0) throw new Error('No shop found');

        const shopId = shops[0].id;
        const productsResponse = await printifyService.getProducts(shopId);

        // HOTFIX: Handle both API formats gracefully
        const allProducts = Array.isArray(productsResponse?.data)
            ? productsResponse.data
            : Array.isArray(productsResponse)
                ? productsResponse
                : null;

        if (!Array.isArray(allProducts)) throw new Error('Invalid products response structure');

        const filteredProducts = allProducts
            .filter(p => !p.is_deleted && p.visible)
            .map(product => {
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

        // Logging summary after filtering
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
    next3AM.setHours(3, 0, 0, 0);

    if (now > next3AM) next3AM.setDate(next3AM.getDate() + 1);

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

        const msUntilNext3AM = scheduleNextRefresh();

        setTimeout(async () => {
            try {
                console.log('Performing scheduled cache refresh...');
                cachedProducts = await fetchProductsFromPrintify();
                lastCacheTime = Date.now();
                console.log('Cache refresh complete');

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
    return cachedProducts;
}

// Force refresh
export async function refreshCache() {
    // TODO: Implement Printful product caching
    cachedProducts = [];
    lastCacheTime = Date.now();
    return true;
}

// Cache health check
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
