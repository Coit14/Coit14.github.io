import dotenv from 'dotenv';
import printfulApi from './config/printful.js';

dotenv.config();

async function testPrintfulAPI() {
    console.log('🔍 Testing Printful API Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log('- PRINTFUL_API_KEY:', process.env.PRINTFUL_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('- PRINTFUL_STORE_ID:', process.env.PRINTFUL_STORE_ID || '❌ Not set');
    console.log('');
    
    try {
        // Test 1: Try to get products first (this might work with different permissions)
        console.log('🧪 Test 1: Getting products...');
        const productsResponse = await printfulApi.get('/store/products');
        console.log('✅ Products found:', productsResponse.data.result.length);
        
        if (productsResponse.data.result.length > 0) {
            const firstProduct = productsResponse.data.result[0];
            console.log('✅ First product:', firstProduct.sync_product.name);
            console.log('✅ Variants:', firstProduct.sync_variants.length);
            
            // Extract store ID from the first product if available
            if (firstProduct.sync_product.store_id) {
                console.log('✅ Store ID from product:', firstProduct.sync_product.store_id);
            }
            
            // Test 2: Test shipping rates with the first product
            if (firstProduct.sync_variants.length > 0) {
                console.log('');
                console.log('🧪 Test 2: Testing shipping rates calculation...');
                
                const testShippingData = {
                    recipient: {
                        address1: "123 Test St",
                        city: "New York",
                        country_code: "US",
                        state_code: "NY",
                        zip: "10001"
                    },
                    items: [{
                        variant_id: firstProduct.sync_variants[0].variant_id,
                        quantity: 1
                    }]
                };
                
                console.log('📦 Test shipping data:', JSON.stringify(testShippingData, null, 2));
                
                try {
                    const shippingResponse = await printfulApi.post('/shipping/rates', testShippingData);
                    console.log('✅ Shipping rates found:', shippingResponse.data.result.length);
                    
                    if (shippingResponse.data.result.length > 0) {
                        console.log('✅ First shipping option:', shippingResponse.data.result[0].name);
                    }
                } catch (shippingError) {
                    console.error('❌ Shipping test failed:', shippingError.response?.data || shippingError.message);
                    if (shippingError.response?.status === 403) {
                        console.error('💡 Shipping calculation requires shipping:calculate scope.');
                    }
                }
            }
        }
        
        console.log('');
        console.log('🎉 Products test passed! Your Printful API can access products.');
        console.log('⚠️  Note: Some features may require additional API scopes.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            
            if (error.response.status === 401) {
                console.error('💡 This usually means your API key is invalid or expired.');
            } else if (error.response.status === 403) {
                console.error('💡 This usually means your API key lacks required permissions.');
                console.error('💡 Required scopes: stores_list/read, shipping:calculate');
            }
        }
        
        process.exit(1);
    }
}

testPrintfulAPI(); 