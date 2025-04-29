import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import ProductModal from './ProductModal';
import './Shop.css';
import { printifyService } from '../../services/printifyService';
import LoadingSpinner from '../common/LoadingSpinner';

const Shop = () => {
    const { products, setProducts } = useCart();
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Check for mobile on resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load products only once when component mounts
    useEffect(() => {
        const loadProducts = async () => {
            // Don't fetch if we already have products
            if (products && products.length > 0) {
                return;
            }

            setIsLoading(true);
            try {
                const fetchedProducts = await printifyService.getPublishedProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, [products, setProducts]);

    const handleProductClick = (product) => {
        // For mobile devices, scroll to top before opening modal
        if (isMobile) {
            window.scrollTo({
                top: 0,
                behavior: 'auto'
            });
            setTimeout(() => {
                setSelectedProduct(product);
            }, 10);
        } else {
            setSelectedProduct(product);
        }
    };

    // Helper function to format price
    const formatPrice = (cents) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    const calculatePrice = (variants) => {
        if (!variants || variants.length === 0) return 'Price not available';
        
        const enabledVariants = variants.filter(v => v.is_enabled);
        return formatPrice(enabledVariants[0].price);
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (!products || !Array.isArray(products) || products.length === 0) {
        return <div>No products available.</div>;
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
                            {product.images && product.images[0] ? (
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
