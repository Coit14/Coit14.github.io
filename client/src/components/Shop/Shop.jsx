import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import ProductModal from './ProductModal';
import './Shop.css';
import * as printService from '../../services/printfulService';
import LoadingSpinner from '../common/LoadingSpinner';

const Shop = () => {
    const { products, setProducts } = useCart();
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(!products || products.length === 0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Check for mobile on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load products only if not already in context
    useEffect(() => {
        const loadProducts = async () => {
            // Skip if we already have products
            if (products && products.length > 0) {
                setIsLoading(false);
                return;
            }

            try {
                const fetchedProducts = await printService.getPublishedProducts();
                if (fetchedProducts && Array.isArray(fetchedProducts)) {
                    setProducts(fetchedProducts);
                    setError(null);
                } else {
                    throw new Error('Invalid product data received');
                }
            } catch (error) {
                console.error('Failed to load products:', error.message);
                setError(
                    error.message === 'Failed to fetch products' 
                        ? 'Unable to load products. Please try again later.'
                        : 'An unexpected error occurred. Please refresh the page.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (!products || products.length === 0) {
            loadProducts();
        }
    }, []); // Only run on mount

    const handleProductClick = (product) => {
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'auto' });
            setTimeout(() => setSelectedProduct(product), 10);
        } else {
            setSelectedProduct(product);
        }
    };

    const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

    const calculatePrice = (variants) => {
        if (!variants?.length) return 'Price not available';
        const enabledVariants = variants.filter(v => v.is_enabled);
        return enabledVariants.length ? formatPrice(enabledVariants[0].price) : 'Price not available';
    };

    if (isLoading) {
        return (
            <div className="shop-loading">
                <LoadingSpinner />
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shop-error">
                <h2>Oops!</h2>
                <p>{error}</p>
                <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!products?.length) {
        return (
            <div className="shop-empty">
                <h2>No Products Available</h2>
                <p>Check back soon for new merchandise!</p>
            </div>
        );
    }

    return (
        <div className="shop-container">
            <div className="shop-header">
                <h1>Shop Our Merchandise</h1>
                <p className="shop-subtitle">Support Coit's and look great doing it!</p>
            </div>

            <div className="products-grid">
                {products.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0].src}
                                    alt={product.title}
                                    className="product-image"
                                    loading="lazy"
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

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default Shop;
