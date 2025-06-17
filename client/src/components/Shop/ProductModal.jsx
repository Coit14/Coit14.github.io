import React, { useState, useEffect } from 'react';
import './ProductModal.css';
import { useCart } from '../../contexts/CartContext';
import ProductModalMobile from './ProductModalMobile';
import * as printService from '../../services/printfulService';

const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
};

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const ProductModal = ({ productId, onClose, isOpen }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Fetch product data when modal opens
    useEffect(() => {
        if (!productId) {
            console.error('ProductModal: No productId provided');
            setError('Invalid product ID');
            setIsLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const productData = await printService.getProduct(productId);
                if (!productData) {
                    throw new Error('No product data received');
                }
                setProduct(productData);
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError('Failed to load product details. Please try again.');
                setProduct(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart({
                productId: product.id,
                variantId: selectedVariant.id,
                name: product.name,
                price: selectedVariant.retail_price,
                image: product.thumbnail_url || product.files[0].preview_url,
                size: selectedVariant.size,
                color: selectedVariant.color
            });
            onClose();
            setIsCartOpen(true);
        }
    };

    const handleViewCart = () => {
        setIsCartOpen(true);
        onClose();
    };

    const handleContinueShopping = () => {
        setShowSuccess(false);
        onClose();
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isLoading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="error-message">{error}</div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    if (isMobile) {
        return <ProductModalMobile 
            productId={productId}
            onClose={onClose}
        />;
    }

    if (!product) return null;

    const availableVariants = product.variants.filter(v => v.is_available);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                
                <div className="modal-header">
                    <h2>{product.name}</h2>
                    <div className="product-type" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>

                <div className="modal-product-layout">
                    {/* Left Side - Product Image */}
                    <div className="main-image-container">
                        <img 
                            src={product.thumbnail_url || product.files[0].preview_url}
                            alt={product.name}
                            className="main-image"
                        />
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="product-details">
                        {/* Variant Selection */}
                        <div className="variant-options">
                            <h3>Select Size</h3>
                            <div className="size-grid">
                                {availableVariants
                                    .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
                                    .map(variant => (
                                        <button
                                            key={variant.id}
                                            className={`size-button ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedVariant(variant)}
                                        >
                                            {variant.size}
                                        </button>
                                    ))
                                }
                            </div>

                            {selectedVariant && (
                                <div className="variant-details">
                                    <p className="variant-color">Color: {selectedVariant.color}</p>
                                    <p className="variant-price">
                                        Price: {formatPrice(selectedVariant.retail_price)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart */}
                        <button 
                            className={`add-to-cart-button ${!selectedVariant ? 'disabled' : ''}`}
                            disabled={!selectedVariant}
                            onClick={handleAddToCart}
                        >
                            Add to Bag
                        </button>
                    </div>
                </div>

                {showSuccess && (
                    <div className="success-overlay">
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <h3>Added to Cart!</h3>
                            <p>{product.name} - {selectedVariant.size} ({selectedVariant.color})</p>
                            <div className="success-buttons">
                                <button 
                                    className="view-cart-button"
                                    onClick={handleViewCart}
                                >
                                    View Cart
                                </button>
                                <button 
                                    className="continue-shopping-button"
                                    onClick={handleContinueShopping}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductModal;