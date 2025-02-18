import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import ProductModal from './ProductModal';
import './Shop.css';

const Shop = () => {
    const { products } = useCart(); // Use products from context
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [preloadedModals, setPreloadedModals] = useState({});

    // Preload modals when shop component mounts
    useEffect(() => {
        const preloadModals = async () => {
            const modalStates = {};
            products.forEach(product => {
                modalStates[product.id] = {
                    loaded: false,
                    content: null
                };
            });
            setPreloadedModals(modalStates);

            // Preload each modal content
            for (const product of products) {
                try {
                    // Assuming you need to fetch additional data for the modal
                    const response = await fetch(`http://localhost:3001/api/products/${product.id}`);
                    const modalData = await response.json();
                    
                    setPreloadedModals(prev => ({
                        ...prev,
                        [product.id]: {
                            loaded: true,
                            content: modalData
                        }
                    }));
                } catch (error) {
                    console.error(`Error preloading modal for product ${product.id}:`, error);
                }
            }
        };

        if (products.length > 0) {
            preloadModals();
        }
    }, [products]);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    // Helper function to get the default image
    const getDefaultImage = (product) => {
        if (!product.images || product.images.length === 0) {
            console.log('No images for product:', product.title);
            return null;
        }
        const defaultImage = product.images[0]?.src;
        console.log('Default image for', product.title, ':', defaultImage);
        return defaultImage;
    };

    // Add this helper function at the top with other helpers
    const formatPrice = (cents) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    const calculatePrice = (variants) => {
        if (!variants || variants.length === 0) return 'Price not available';
        
        const enabledVariants = variants.filter(v => v.is_enabled);
        // Just take the first enabled variant's price since they'll all be the same
        return formatPrice(enabledVariants[0].price);
    };

    return (
        <div className="shop-container">
            <div className="shop-header">
                <h1>Shop Our Merchandise</h1>
                <p className="shop-subtitle">Support Coit's and look great doing it!</p>
            </div>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="product-image-container">
                                {product.images && product.images[0] ? (
                                    <img
                                        src={product.images[0].src}
                                        alt={product.title}
                                        className="product-image"
                                    />
                                ) : (
                                    <div className="no-image">No image available</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3 className="product-title">{product.title}</h3>
                                <p className="product-price">
                                    {calculatePrice(product.variants)}
                                </p>
                                <button
                                    className="view-details-button"
                                    onClick={() => handleProductClick(product)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    preloadedContent={preloadedModals[selectedProduct.id]?.content}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default Shop;
