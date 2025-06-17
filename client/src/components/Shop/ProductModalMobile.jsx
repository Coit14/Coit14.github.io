import React, { useState, useEffect } from 'react';
import './ProductModalMobile.css';
import { useCart } from '../../contexts/CartContext';
import * as printService from '../../services/printfulService';

const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
};

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const ProductModalMobile = ({ productId, onClose }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch product data when modal opens
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await printService.getProduct(productId);
                setProduct(productData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError('Failed to load product details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
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

    if (isLoading) {
        return (
            <div className="mobile-modal-overlay">
                <div className="mobile-modal-content">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mobile-modal-overlay">
                <div className="mobile-modal-content">
                    <div className="error-message">{error}</div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const availableVariants = product.variants.filter(v => v.is_available);

    return (
        <div className="mobile-modal-overlay" onClick={onClose}>
            <div 
                className="mobile-modal-content" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    className="mobile-modal-close" 
                    onClick={onClose}
                >
                    &times;
                </button>
                
                {/* Product Image */}
                <div className="mobile-image-container">
                    <img 
                        src={product.thumbnail_url || product.files[0].preview_url}
                        alt={product.name}
                        className="mobile-product-image"
                    />
                </div>

                {/* Product Info */}
                <div className="mobile-product-info">
                    <h2>{product.name}</h2>
                    <div className="product-type" dangerouslySetInnerHTML={{ __html: product.description }} />
                    
                    {/* Size Selection */}
                    <div className="mobile-size-selection">
                        <h3>Size</h3>
                        <div className="mobile-size-grid">
                            {availableVariants
                                .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
                                .map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`mobile-size-button ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedVariant(variant)}
                                    >
                                        {variant.size}
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    {selectedVariant && (
                        <div className="mobile-variant-details">
                            <p className="mobile-variant-color">Color: {selectedVariant.color}</p>
                            <p className="mobile-variant-price">
                                Price: {formatPrice(selectedVariant.retail_price)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Add to Cart Button - Fixed at bottom */}
                <div className="mobile-add-to-cart-container">
                    <button 
                        className={`mobile-add-to-cart-button ${!selectedVariant ? 'disabled' : ''}`}
                        disabled={!selectedVariant}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModalMobile; 