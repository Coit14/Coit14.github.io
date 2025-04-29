import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import ProductModal from './ProductModal';
import './Shop.css';
import { printifyService } from '../../services/printifyService';
import LoadingSpinner from '../common/LoadingSpinner';
import { fetchShopProducts, getProductImage } from '../../services/api';

const Shop = () => {
    const { products, setProducts } = useCart();
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [preloadedModals, setPreloadedModals] = useState({});
    const [preloadedImages, setPreloadedImages] = useState({});
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

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                const products = await fetchShopProducts();
                setProducts(products);
                // Preload modal content for each product
                products.forEach(product => {
                    preloadModalContent(product);
                });
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    const preloadModalContent = async (product) => {
        try {
            const imageUrl = await getProductImage(product);
            setPreloadedImages(prev => ({
                ...prev,
                [product.id]: imageUrl
            }));
        } catch (error) {
            console.error(`Error preloading modal content for product ${product.id}:`, error);
        }
    };

    // Add some debug logging
    useEffect(() => {
        console.log('Current products state:', products);
    }, [products]);

    const handleProductClick = (product) => {
        // For mobile devices, scroll to top before opening modal
        if (isMobile) {
            window.scrollTo({
                top: 0,
                behavior: 'auto' // Use 'auto' for immediate scrolling without animation
            });
            
            // Small timeout to ensure scroll completes before modal opens
            setTimeout(() => {
                setSelectedProduct(product);
            }, 10);
        } else {
            // On desktop, just open the modal
            setSelectedProduct(product);
        }
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
                    preloadedContent={preloadedModals[selectedProduct.id]?.content}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default Shop;
