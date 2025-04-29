import React, { useState, useEffect } from 'react';
import { printifyService } from '../services/printifyService';
import BASE_URL, { API_URL } from '../config/config';

const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
};

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const calculatePriceRange = (variants) => {
    if (!variants || variants.length === 0) return 'NaN';
    
    const enabledVariants = variants.filter(v => v.is_enabled);
    const prices = enabledVariants.map(variant => variant.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return minPrice === maxPrice ? 
        formatPrice(minPrice) : 
        `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

const PrintifyTest = () => {
    const [testResult, setTestResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [expandedVariants, setExpandedVariants] = useState({});
    const [selectedColor, setSelectedColor] = useState({});

    useEffect(() => {
        const testConnection = async () => {
            try {
                setLoading(true);
                const result = await printifyService.testConnection();
                setTestResult(result);
                setError(null);
            } catch (err) {
                console.error('Printify test error:', err);
                setError('Failed to connect to Printify');
            } finally {
                setLoading(false);
            }
        };

        testConnection();
    }, []);

    const toggleVariants = (productId) => {
        setExpandedVariants(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const selectColor = (productId, color) => {
        setSelectedColor(prev => ({
            ...prev,
            [productId]: color
        }));
    };

    // Helper function to determine if a string is a size
    const isSize = (str) => sizeOrder.includes(str);

    // Group variants by color
    const groupVariantsByColor = (variants, productImages) => {
        return variants.reduce((acc, variant) => {
            const parts = variant.title.split(' / ');
            
            // Determine which part is the color and which is the size
            let color, size;
            if (isSize(parts[0])) {
                // If first part is a size, then second part is color
                size = parts[0];
                color = parts[1];
            } else {
                // If first part is color, then second part is size
                color = parts[0];
                size = parts[1];
            }

            if (!acc[color]) {
                // Find the matching image for this variant
                const variantImage = productImages.find(img => img.variant_ids.includes(variant.id));
                acc[color] = {
                    variants: [],
                    previewImage: variantImage ? variantImage.src : null
                };
            }
            acc[color].variants.push({...variant, size: size});
            return acc;
        }, {});
    };

    // Sort variants by size
    const sortVariantsBySize = (variants) => {
        return variants.sort((a, b) => {
            return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
        });
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
            console.log('Products data:', data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching products:', err);
        }
        setLoading(false);
    };

    const handleDeleteSpecificProducts = async () => {
        try {
            const response = await fetch('/api/printify/products/delete-specific', {
                method: 'DELETE'
            });
            const result = await response.json();
            console.log('Deletion result:', result);
            // Refresh your product list after deletion
        } catch (error) {
            console.error('Failed to delete products:', error);
        }
    };

    if (loading) return <div>Testing Printify connection...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Printify Connection Test</h2>
            <pre>{JSON.stringify(testResult, null, 2)}</pre>

            <h2>Printify Products</h2>
            
            <button 
                onClick={fetchProducts}
                disabled={loading}
                style={{
                    padding: '8px 16px',
                    background: '#814d49',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Loading Products...' : 'List Products'}
            </button>

            <button onClick={handleDeleteSpecificProducts}>
                Delete Specific Products
            </button>

            {products.length > 0 ? (
                <div style={{ marginTop: '20px' }}>
                    {products.map(product => {
                        const enabledVariants = product.variants.filter(v => v.is_enabled);
                        const variantsByColor = groupVariantsByColor(enabledVariants, product.images || []);
                        
                        console.log('Product:', product.title);
                        console.log('Images:', product.images);
                        console.log('Variants by color:', variantsByColor);

                        return (
                            <div key={product.id} style={{ 
                                padding: '20px',
                                marginBottom: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                background: 'white'
                            }}>
                                <h3>{product.title}</h3>
                                <div style={{ color: '#666', marginBottom: '10px' }}>
                                    ID: {product.id}
                                </div>
                                <div style={{ 
                                    fontSize: '1.2em', 
                                    color: '#814d49', 
                                    fontWeight: 'bold',
                                    marginBottom: '15px'
                                }}>
                                    Price Range: {calculatePriceRange(product.variants)}
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Tags:</strong> {product.tags.join(', ')}
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <button 
                                        onClick={() => toggleVariants(product.id)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#814d49',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {expandedVariants[product.id] ? 'Hide' : 'Show'} Variants
                                    </button>
                                </div>
                                
                                {expandedVariants[product.id] && (
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <h4>Available Colors:</h4>
                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                {Object.entries(variantsByColor).map(([color, data]) => (
                                                    <div key={color} style={{ 
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        padding: '10px',
                                                        width: '200px',
                                                        background: selectedColor[product.id] === color ? '#f5f5f3' : 'white'
                                                    }}>
                                                        {data.previewImage && (
                                                            <img 
                                                                src={data.previewImage}
                                                                alt={`${product.title} - ${color}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '200px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px',
                                                                    marginBottom: '10px'
                                                                }}
                                                            />
                                                        )}
                                                        <button
                                                            onClick={() => selectColor(product.id, color)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px 16px',
                                                                background: selectedColor[product.id] === color ? '#814d49' : '#f5f5f3',
                                                                color: selectedColor[product.id] === color ? 'white' : 'black',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {color}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Size Table for Selected Color */}
                                        {selectedColor[product.id] && (
                                            <div style={{ 
                                                padding: '15px',
                                                background: '#f5f5f3',
                                                borderRadius: '4px'
                                            }}>
                                                <h4>Sizes for {selectedColor[product.id]}:</h4>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ textAlign: 'left', padding: '8px' }}>Size</th>
                                                            <th style={{ textAlign: 'right', padding: '8px' }}>Price</th>
                                                            <th style={{ textAlign: 'right', padding: '8px' }}>Cost</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortVariantsBySize(variantsByColor[selectedColor[product.id]].variants).map(variant => (
                                                            <tr key={variant.id} style={{ borderBottom: '1px solid #ddd' }}>
                                                                <td style={{ padding: '8px' }}>{variant.size}</td>
                                                                <td style={{ textAlign: 'right', padding: '8px' }}>
                                                                    {formatPrice(variant.price)}
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '8px' }}>
                                                                    {formatPrice(variant.cost)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Add new section for all color images */}
                                <div style={{ 
                                    marginTop: '20px',
                                    padding: '15px',
                                    background: '#f5f5f3',
                                    borderRadius: '4px'
                                }}>
                                    <h4>All Available Images:</h4>
                                    {Object.entries(variantsByColor).map(([color, data]) => (
                                        <div key={color} style={{ marginBottom: '20px' }}>
                                            <h5 style={{ 
                                                marginBottom: '10px',
                                                padding: '5px 10px',
                                                background: '#814d49',
                                                color: 'white',
                                                borderRadius: '4px',
                                                display: 'inline-block'
                                            }}>
                                                {color}
                                            </h5>
                                            <div style={{ 
                                                display: 'flex',
                                                gap: '10px',
                                                overflowX: 'auto',
                                                padding: '10px 0'
                                            }}>
                                                {product.images
                                                    .filter(img => img.variant_ids.some(id => 
                                                        data.variants.some(variant => variant.id === id)
                                                    ))
                                                    .map((image, index) => (
                                                        <img 
                                                            key={image.id}
                                                            src={image.src}
                                                            alt={`${product.title} - ${color} - View ${index + 1}`}
                                                            style={{
                                                                width: '150px',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd'
                                                            }}
                                                        />
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ 
                                    marginTop: '20px',
                                    padding: '10px',
                                    background: '#f5f5f3',
                                    borderRadius: '4px',
                                    fontSize: '0.9em'
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ 
                    marginTop: '20px',
                    padding: '20px',
                    background: '#f5f5f3',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#666'
                }}>
                    {loading ? 'Loading...' : 'No products found'}
                </div>
            )}
        </div>
    );
};

export default PrintifyTest; 