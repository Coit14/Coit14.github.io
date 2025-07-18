import React, { useState, useEffect, useRef } from 'react';
import './ProductModalMobile.css';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (price) => {
    if (!price) return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
};

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'One size'];

const ProductModalMobile = ({ product, onClose }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [imageIndex, setImageIndex] = useState(0);
    const [fade, setFade] = useState(false);
    const prevVariantRef = useRef();

    useEffect(() => {
        prevVariantRef.current = selectedVariant;
    });
    const prevVariant = prevVariantRef.current;

    const variants = product?.sync_variants || [];
    const productInfo = product?.sync_product || {};
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

    // Get only valid mockup images for the selected variant - MOVED BEFORE useEffect
    const getImages = () => {
        let images = [];
        if (selectedVariant) {
            if (selectedVariant.files && selectedVariant.files.length > 1) {
                images = selectedVariant.files
                    .slice(1) // skip the first file (usually the uploaded design)
                    .filter(f => f.type === 'preview' && f.preview_url)
                    .map(f => f.preview_url);
            }
            // fallback: if no valid mockups, try product.image
            if (images.length === 0 && selectedVariant.product?.image) {
                images = [selectedVariant.product.image];
            }
        }
        // Fallback to product thumbnail if no images
        if (images.length === 0 && productInfo.thumbnail_url) {
            images = [productInfo.thumbnail_url];
        }
        return images;
    };

    const images = getImages();

    // Find the selected variant
    useEffect(() => {
        if (allOneSize && selectedColor) {
            setSelectedVariant(variants.find(v => v.color === selectedColor));
        } else if (!allOneSize && selectedColor && selectedSize) {
            setSelectedVariant(variants.find(v => v.color === selectedColor && v.size === selectedSize));
        } else if (!allOneSize && !selectedColor && sizeOptions.length === 1) {
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

    // Reset image index and animate fade on color/variant change
    useEffect(() => {
        setFade(true);
        setImageIndex(0);
        const timeout = setTimeout(() => setFade(false), 250);
        return () => clearTimeout(timeout);
    }, [selectedColor]);

    // Safety check: reset image index if it's out of bounds
    useEffect(() => {
        if (imageIndex >= images.length && images.length > 0) {
            setImageIndex(0);
        }
    }, [images.length, imageIndex]);

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (images.length <= 1) return;
        setFade(true);
        setTimeout(() => {
            setImageIndex((prev) => (prev - 1 + images.length) % images.length);
            setFade(false);
        }, 150);
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (images.length <= 1) return;
        setFade(true);
        setTimeout(() => {
            setImageIndex((prev) => (prev + 1) % images.length);
            setFade(false);
        }, 150);
    };

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart({
                productId: productInfo.id,
                variantId: selectedVariant.id,
                variant_id: selectedVariant.variant_id,
                name: productName,
                price: selectedVariant.retail_price,
                image: images[imageIndex] || images[0],
                size: selectedVariant.size,
                color: selectedVariant.color
            });
            setIsCartOpen(true);
            onClose();
        }
    };

    if (!product) return null;

    const getStartingPrice = () => {
        if (!variants.length) return null;
        const prices = variants.map(v => parseFloat(v.retail_price));
        return Math.min(...prices);
    };
    const startingPrice = getStartingPrice();
    const priceToShow = selectedVariant ? selectedVariant.retail_price : startingPrice;

    return (
        <div className="mobile-modal-overlay" onClick={onClose}>
            <div className="mobile-modal-content" onClick={e => e.stopPropagation()}>
                <button className="mobile-modal-close" onClick={onClose}>&times;</button>
                
                {/* Product Image */}
                <div className="mobile-image-container">
                    {images.length > 1 && (
                        <button className="mobile-image-nav prev" onClick={handlePrevImage} aria-label="Previous image">
                            &#8592;
                        </button>
                    )}
                    {images.length > 0 && images[imageIndex] ? (
                        <img 
                            src={images[imageIndex]}
                            alt={productName}
                            className={`mobile-product-image${fade ? ' fade' : ''}`}
                        />
                    ) : (
                        <div className="mobile-no-image">No image available</div>
                    )}
                    {images.length > 1 && (
                        <button className="mobile-image-nav next" onClick={handleNextImage} aria-label="Next image">
                            &#8594;
                        </button>
                    )}
                    {/* Carousel dots */}
                    {images.length > 1 && (
                        <div className="mobile-carousel-dots">
                            {images.slice(0, 3).map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`mobile-carousel-dot${imageIndex === idx ? ' active' : ''}`}
                                />
                            ))}
                            {images.length > 3 && imageIndex > 2 && (
                                <span className="mobile-carousel-dot more">...</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="mobile-product-info">
                    <h2>{productName}</h2>
                    {description && (
                        <div className="product-type" dangerouslySetInnerHTML={{ __html: description }} />
                    )}
                    
                    {/* Color Selection */}
                    {colorOptions.length > 1 && (
                        <div className="mobile-color-selection">
                            <h3>Choose Color</h3>
                            <div className="mobile-color-options">
                                {colorOptions.map(color => (
                                    <button
                                        key={color}
                                        className={`mobile-color-button ${selectedColor === color ? 'selected' : ''}`}
                                        onClick={() => setSelectedColor(color)}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    {!allOneSize && sizeOptions.length > 0 && (
                        <div className="mobile-size-selection">
                            <h3>Choose Size</h3>
                            <div className="mobile-size-grid">
                                {sizeOrder.filter(size => sizeOptions.includes(size)).map(size => (
                                    <button
                                        key={size}
                                        className={`mobile-size-button ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    {priceToShow && (
                        <div className="mobile-price">
                            {formatPrice(priceToShow)}
                        </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                <div className="mobile-add-to-cart-container">
                    <button 
                        className={`mobile-add-to-cart-button ${!selectedVariant ? 'disabled' : ''}`}
                        disabled={!selectedVariant}
                        onClick={handleAddToCart}
                    >
                        Add to Bag
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModalMobile; 