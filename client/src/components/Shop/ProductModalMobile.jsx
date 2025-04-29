import React, { useState, useEffect } from 'react';
import './ProductModalMobile.css';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
};

// Size order for sorting
const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const calculatePrice = (variants) => {
    if (!variants || variants.length === 0) return 'Price not available';
    
    const enabledVariants = variants.filter(v => v.is_enabled);
    return formatPrice(enabledVariants[0].price);
};

const ProductModalMobile = ({ product, onClose }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [variantsByColor, setVariantsByColor] = useState({});
    
    // Helper function to determine if a string is a size
    const isSize = (str) => sizeOrder.includes(str);

    // Group variants by color
    const groupVariantsByColor = (variants, productImages) => {
        return variants.reduce((acc, variant) => {
            const parts = variant.title.split(' / ');
            let color, size;
            if (isSize(parts[0])) {
                size = parts[0];
                color = parts[1];
            } else {
                color = parts[0];
                size = parts[1];
            }

            if (!acc[color]) {
                const variantImage = productImages.find(img => img.variant_ids.includes(variant.id));
                acc[color] = {
                    variants: [],
                    previewImage: variantImage ? variantImage.src : null
                };
            }
            acc[color].variants.push({...variant, size});
            return acc;
        }, {});
    };

    useEffect(() => {
        if (product && product.variants) {
            const enabledVariants = product.variants.filter(v => v.is_enabled);
            const groupedVariants = groupVariantsByColor(enabledVariants, product.images || []);
            setVariantsByColor(groupedVariants);
            
            const colors = Object.keys(groupedVariants);
            if (colors.length > 0) {
                setSelectedColor(colors[0]);
            }
        }
    }, [product]);

    const getColorImages = (color) => {
        if (!product?.images || !variantsByColor[color]) return [];
        return product.images.filter(img => 
            img.variant_ids.some(id => 
                variantsByColor[color].variants.some(variant => variant.id === id)
            )
        );
    };

    const currentColorImages = selectedColor ? getColorImages(selectedColor) : [];

    const handleAddToCart = () => {
        const selectedVariant = variantsByColor[selectedColor]?.variants
            .find(v => v.size === selectedSize);
            
        if (selectedVariant) {
            addToCart(product, selectedVariant);
            onClose();
            setIsCartOpen(true);
        }
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setSelectedImage(prev => 
            prev === 0 ? currentColorImages.length - 1 : prev - 1
        );
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        setSelectedImage(prev => 
            prev === currentColorImages.length - 1 ? 0 : prev + 1
        );
    };

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
                
                {/* Image Carousel */}
                <div className="mobile-image-carousel">
                    {currentColorImages.map((image, index) => (
                        <img 
                            key={image.id}
                            src={image.src}
                            alt={`${product.title} view ${index + 1}`}
                            className={selectedImage === index ? 'active' : ''}
                        />
                    ))}
                    
                    {currentColorImages.length > 1 && (
                        <>
                            <button 
                                className="mobile-image-nav prev"
                                onClick={handlePrevImage}
                                aria-label="Previous image"
                            >
                                ‹
                            </button>
                            <button 
                                className="mobile-image-nav next"
                                onClick={handleNextImage}
                                aria-label="Next image"
                            >
                                ›
                            </button>
                        </>
                    )}

                    <div className="mobile-image-dots">
                        {currentColorImages.map((_, index) => (
                            <span 
                                key={index} 
                                className={`dot ${selectedImage === index ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(index);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="mobile-product-info">
                    <h2>{product.title}</h2>
                    <div className="product-type" dangerouslySetInnerHTML={{ __html: product.description }} />
                    <p className="mobile-price">{calculatePrice(product.variants)}</p>
                    
                    {/* Color Selection */}
                    <div className="mobile-color-selection">
                        <h3>Color</h3>
                        <div className="mobile-color-options">
                            {Object.entries(variantsByColor).map(([color, data]) => (
                                <div 
                                    key={color}
                                    className={`mobile-color-option ${selectedColor === color ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedColor(color);
                                        setSelectedImage(0);
                                        setSelectedSize('');
                                    }}
                                >
                                    <img src={data.previewImage} alt={color} />
                                    <span>{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mobile-size-selection">
                        <h3>Size</h3>
                        <div className="mobile-size-grid">
                            {selectedColor && variantsByColor[selectedColor]?.variants
                                .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
                                .map(variant => (
                                    <button
                                        key={variant.id}
                                        className={`mobile-size-button ${selectedSize === variant.size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(variant.size)}
                                    >
                                        {variant.size}
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>

                {/* Add to Cart Button - Fixed at bottom */}
                <div className="mobile-add-to-cart-container">
                    <button 
                        className={`mobile-add-to-cart-button ${!selectedSize ? 'disabled' : ''}`}
                        disabled={!selectedSize}
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