const { printifyController } = require('../../controllers/printifyController');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    // Get productId from the URL path
    const productId = req.url.split('/').pop();
    
    // Log for debugging
    console.log('URL:', req.url);
    console.log('Product ID:', productId);
    
    // Pass the productId directly
    await printifyController.getProduct({ 
      ...req, 
      params: { productId } 
    }, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 