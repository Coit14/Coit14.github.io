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
    const [imageIndex, setImageIndex] = useState(0);
    const [fade, setFade] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Reset image index and animate fade on color/variant change
    useEffect(() => {
        setFade(true);
        setImageIndex(0);
        const timeout = setTimeout(() => setFade(false), 250);
        return () => clearTimeout(timeout);
    }, [selectedVariant]);

    if (!product) return null;

    const getStartingPrice = () => {
        if (!variants.length) return null;
        const prices = variants.map(v => parseFloat(v.retail_price));
        return Math.min(...prices);
    };
    const startingPrice = getStartingPrice();
    const priceToShow = selectedVariant ? selectedVariant.retail_price : startingPrice;

    // Get only valid mockup images for the selected variant
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

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setFade(true);
        setTimeout(() => {
            setImageIndex((prev) => (prev - 1 + images.length) % images.length);
            setFade(false);
        }, 150);
    };
    const handleNextImage = (e) => {
        e.stopPropagation();
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

    if (isMobile) {
        return <ProductModalMobile product={product} onClose={onClose} />;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content product-modal-styled" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--brand-dark)' }}>{productName}</h2>
                    </div>
                    {description && (
                        <div className="product-type" dangerouslySetInnerHTML={{ __html: description }} />
                    )}
                </div>
                <div className="modal-product-layout styled-layout">
                    <div className="main-image-container styled-image" style={{ position: 'relative', justifyContent: 'center', alignItems: 'center', minHeight: 260 }}>
                        {images.length > 1 && (
                            <button className="carousel-arrow left" onClick={handlePrevImage} aria-label="Previous image" disabled={images.length <= 1}>
                                &#8592;
                            </button>
                        )}
                        <img 
                            src={images[imageIndex]}
                            alt={productName}
                            className={`main-image${fade ? ' fade' : ''}`}
                            style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', transition: 'opacity 0.25s' }}
                        />
                        {images.length > 1 && (
                            <button className="carousel-arrow right" onClick={handleNextImage} aria-label="Next image" disabled={images.length <= 1}>
                                &#8594;
                            </button>
                        )}
                    </div>
                    <div className="product-details styled-details">
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
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Size selection if more than one unique size */}
                        {sizeOptions.length > 1 && (
                            <div className="size-options-section">
                                <h3>Choose Size</h3>
                                <div className="size-grid styled-size-grid">
                                    {sizeOptions.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)).map(size => (
                                        <button
                                            key={size}
                                            className={`size-button${selectedSize === size ? ' selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Price just above Add to Bag button */}
                        <div className="styled-price prominent-price" style={{ margin: '2rem 0 0.5rem 0', textAlign: 'center' }}>
                            {formatPrice(priceToShow)}
                        </div>
                        <button 
                            className={`add-to-cart-button styled-add-to-cart ${!selectedVariant ? 'disabled' : ''}`}
                            disabled={!selectedVariant}
                            onClick={handleAddToCart}
                            style={{ width: '100%', margin: '0 0 1.5rem 0', alignSelf: 'center' }}
                        >
                            Add to Bag
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;