require('dotenv').config();

const PRINTIFY_CONFIG = {
    API_BASE_URL: 'https://api.printify.com/v1',
    API_TOKEN: process.env.PRINTIFY_API_KEY,
    SHOP_ID: process.env.SHOP_ID,
    HEADERS: {
        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
    }
};

// Enhanced validation
if (!PRINTIFY_CONFIG.API_TOKEN) {
    console.error('ERROR: Printify API token is not set. Please check your .env file.');
    process.exit(1);
}

// Log config (without showing full token)
console.log('Printify Configuration:', {
    API_BASE_URL: PRINTIFY_CONFIG.API_BASE_URL,
    API_TOKEN: PRINTIFY_CONFIG.API_TOKEN ? `${PRINTIFY_CONFIG.API_TOKEN.substr(0, 5)}...` : 'NOT SET',
    SHOP_ID: PRINTIFY_CONFIG.SHOP_ID,
    HEADERS: {
        ...PRINTIFY_CONFIG.HEADERS,
        Authorization: PRINTIFY_CONFIG.HEADERS.Authorization ? 'Bearer [HIDDEN]' : 'NOT SET'
    }
});

module.exports = PRINTIFY_CONFIG;