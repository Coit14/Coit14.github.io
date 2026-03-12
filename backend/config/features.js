/**
 * Feature flags. Mirror client FEATURES where needed.
 * Set ENABLE_MERCH=true in env (e.g. Render) to turn on shop/cache/Printful.
 */
export const FEATURES = {
    MERCH: process.env.ENABLE_MERCH === 'true',
};
