import React, { useState, useEffect } from 'react';
import './ProductModal.css';
import { useCart } from '../../contexts/CartContext';
import ProductModalMobile from './ProductModalMobile';

const formatPrice = (price) => {
    if (!price) return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
};

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const ProductModal = ({ product, onClose }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!product) return null;

    const variants = product.sync_variants || [];
    const availableVariants = variants.filter(v => v.is_available !== false);
    const productInfo = product.sync_product || {};
    const imageUrl = productInfo.thumbnail_url;
    const productName = productInfo.name;
    const description = productInfo.description || '';

    const getStartingPrice = () => {
        if (!variants.length) return null;
        const prices = variants.map(v => parseFloat(v.retail_price));
        return Math.min(...prices);
    };
    const startingPrice = getStartingPrice();

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart({
                productId: productInfo.id,
                variantId: selectedVariant.id,
                name: productName,
                price: selectedVariant.retail_price,
                image: imageUrl,
                size: selectedVariant.size,
                color: selectedVariant.color
            });
            setShowSuccess(true);
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

    if (isMobile) {
        return <ProductModalMobile product={product} onClose={onClose} />;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <h2>{productName}</h2>
                    {description && (
                        <div className="product-type" dangerouslySetInnerHTML={{ __html: description }} />
                    )}
                </div>
                <div className="modal-product-layout">
                    <div className="main-image-container">
                        <img 
                            src={imageUrl}
                            alt={productName}
                            className="main-image"
                        />
                    </div>
                    <div className="product-details">
                        <div className="product-price-modal">
                            {startingPrice && (
                                <span>From {formatPrice(startingPrice)}</span>
                            )}
                        </div>
                        {availableVariants.length > 0 && (
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
                        )}
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
                            <p>{productName} - {selectedVariant.size} ({selectedVariant.color})</p>
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