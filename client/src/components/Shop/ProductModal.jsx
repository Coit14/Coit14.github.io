import React, { useState, useEffect } from 'react';
import './ProductModal.css';
import { useCart } from '../../contexts/CartContext';
import ProductModalMobile from './ProductModalMobile';

const formatPrice = (price) => {
    if (!price) return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
};

const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'One size'];

const ProductModal = ({ product, onClose }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
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
    const productInfo = product.sync_product || {};
    const imageUrl = productInfo.thumbnail_url;
    const productName = productInfo.name;
    const description = productInfo.description || '';

    // Get unique colors and sizes
    const uniqueColors = Array.from(new Set(variants.map(v => v.color)));
    const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));

    // Helper: are all sizes 'One size'?
    const allOneSize = uniqueSizes.length === 1 && uniqueSizes[0] === 'One size';

    // Color selection logic
    const colorOptions = uniqueColors;
    const sizeOptions = selectedColor
        ? Array.from(new Set(variants.filter(v => v.color === selectedColor).map(v => v.size)))
        : uniqueSizes;

    // Find the selected variant
    useEffect(() => {
        if (allOneSize && selectedColor) {
            setSelectedVariant(variants.find(v => v.color === selectedColor));
        } else if (!allOneSize && selectedColor && selectedSize) {
            setSelectedVariant(variants.find(v => v.color === selectedColor && v.size === selectedSize));
        } else if (!allOneSize && !selectedColor && sizeOptions.length === 1) {
            // Only one color, multiple sizes
            setSelectedVariant(variants.find(v => v.size === selectedSize));
        } else if (variants.length === 1) {
            setSelectedVariant(variants[0]);
        } else {
            setSelectedVariant(null);
        }
    }, [selectedColor, selectedSize, allOneSize, variants, sizeOptions.length]);

    // Set default color/size on open
    useEffect(() => {
        if (allOneSize && colorOptions.length > 0) {
            setSelectedColor(colorOptions[0]);
        } else if (!allOneSize && colorOptions.length > 0) {
            setSelectedColor(colorOptions[0]);
            setSelectedSize(sizeOptions[0]);
        } else if (sizeOptions.length > 0) {
            setSelectedSize(sizeOptions[0]);
        }
    }, [product]);

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
            <div className="modal-content product-modal-styled" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <h2>{productName}</h2>
                    {description && (
                        <div className="product-type" dangerouslySetInnerHTML={{ __html: description }} />
                    )}
                </div>
                <div className="modal-product-layout styled-layout">
                    <div className="main-image-container styled-image">
                        <img 
                            src={imageUrl}
                            alt={productName}
                            className="main-image"
                        />
                    </div>
                    <div className="product-details styled-details">
                        <div className="product-price-modal styled-price">
                            {startingPrice && (
                                <span>From {formatPrice(startingPrice)}</span>
                            )}
                        </div>
                        {/* Color selection if multiple colors */}
                        {colorOptions.length > 1 && (
                            <div className="color-options-section">
                                <h3>Choose Color</h3>
                                <div className="color-options-grid">
                                    {colorOptions.map(color => (
                                        <button
                                            key={color}
                                            className={`color-swatch-btn${selectedColor === color ? ' selected' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                            style={{ background: selectedColor === color ? '#b12220' : '#fff', color: selectedColor === color ? '#fff' : '#222', border: '1.5px solid #b12220', marginRight: 8, marginBottom: 8, padding: '0.5rem 1.2rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Size selection if multiple sizes and not all one size */}
                        {!allOneSize && sizeOptions.length > 1 && (
                            <div className="size-options-section">
                                <h3>Choose Size</h3>
                                <div className="size-grid styled-size-grid">
                                    {sizeOptions.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)).map(size => (
                                        <button
                                            key={size}
                                            className={`size-button${selectedSize === size ? ' selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                            style={{ background: selectedSize === size ? '#b12220' : '#fff', color: selectedSize === size ? '#fff' : '#222', border: '1.5px solid #b12220', marginRight: 8, marginBottom: 8, padding: '0.5rem 1.2rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Variant details */}
                        {selectedVariant && (
                            <div className="variant-details styled-variant-details">
                                <p className="variant-color">Color: {selectedVariant.color}</p>
                                <p className="variant-size">Size: {selectedVariant.size}</p>
                                <p className="variant-price">Price: {formatPrice(selectedVariant.retail_price)}</p>
                            </div>
                        )}
                        <button 
                            className={`add-to-cart-button styled-add-to-cart ${!selectedVariant ? 'disabled' : ''}`}
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