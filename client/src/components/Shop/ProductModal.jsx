import React, { useState, useEffect } from 'react';
import './ProductModal.css';
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

const ProductModal = ({ product, preloadedContent, onClose }) => {
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [variantsByColor, setVariantsByColor] = useState({});
    const [modalData, setModalData] = useState(preloadedContent || null);

    // Helper function to determine if a string is a size
    const isSize = (str) => sizeOrder.includes(str);

    // Group variants by color (similar to PrintifyTest)
    const groupVariantsByColor = (variants, productImages) => {
        return variants.reduce((acc, variant) => {
            const parts = variant.title.split(' / ');
            
            // Determine which part is the color and which is the size
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

    // Organize variants by color when component mounts
    useEffect(() => {
        if (product && product.variants) {
            const enabledVariants = product.variants.filter(v => v.is_enabled);
            const groupedVariants = groupVariantsByColor(enabledVariants, product.images || []);
            setVariantsByColor(groupedVariants);
            
            // Set initial color if available
            const colors = Object.keys(groupedVariants);
            if (colors.length > 0) {
                setSelectedColor(colors[0]);
            }
        }
    }, [product]);

    // Get all images for the selected color
    const getColorImages = (color) => {
        if (!product?.images || !variantsByColor[color]) return [];
        return product.images.filter(img => 
            img.variant_ids.some(id => 
                variantsByColor[color].variants.some(variant => variant.id === id)
            )
        );
    };

    const currentColorImages = selectedColor ? getColorImages(selectedColor) : [];

    useEffect(() => {
        if (!preloadedContent) {
            // Only fetch if content wasn't preloaded
            const fetchModalData = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/products/${product.id}`);
                    const data = await response.json();
                    setModalData(data);
                } catch (error) {
                    console.error('Error fetching modal data:', error);
                }
            };
            
            fetchModalData();
        }
    }, [product.id, preloadedContent]);

    const handleAddToCart = () => {
        const selectedVariant = variantsByColor[selectedColor]?.variants
            .find(v => v.size === selectedSize);
            
        if (selectedVariant) {
            addToCart(product, selectedVariant);
            setShowSuccess(true);
            // Hide success message after 5 seconds if user doesn't interact
            setTimeout(() => setShowSuccess(false), 5000);
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

    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                
                <div className="modal-header">
                    <h2>{product.title}</h2>
                    <p className="product-type">{product.description}</p>
                    <p className="product-price">{calculatePrice(product.variants)}</p>
                </div>

                <div className="modal-product-layout">
                    {/* Left Side - Variant Images */}
                    <div className="variant-thumbnails">
                        {currentColorImages.map((image, index) => (
                            <div 
                                key={image.id}
                                className={`thumbnail ${selectedImage === index ? 'selected' : ''}`}
                                onClick={() => setSelectedImage(index)}
                            >
                                <img src={image.src} alt={`View ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    {/* Center - Main Image */}
                    <div className="main-image-container">
                        {currentColorImages.length > 0 && (
                            <img 
                                src={currentColorImages[selectedImage].src}
                                alt={`${product.title} - ${selectedColor}`}
                                className="main-image"
                            />
                        )}
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="product-details">
                        {/* Color Variants */}
                        <div className="variant-options">
                            <h3>Select Color</h3>
                            <div className="color-options">
                                {Object.entries(variantsByColor).map(([color, data]) => (
                                    <div 
                                        key={color}
                                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedColor(color);
                                            setSelectedImage(0);
                                            setSelectedSize('');
                                        }}
                                    >
                                        <img 
                                            src={data.previewImage} 
                                            alt={color} 
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Size Selection - Moved inside variant-options */}
                            <h3>Select Size</h3>
                            <div className="size-grid">
                                {selectedColor && variantsByColor[selectedColor]?.variants
                                    .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))
                                    .map(variant => (
                                        <button
                                            key={variant.id}
                                            className={`size-button ${selectedSize === variant.size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(variant.size)}
                                        >
                                            {variant.size}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button 
                            className={`add-to-cart-button ${!selectedSize ? 'disabled' : ''}`}
                            disabled={!selectedSize}
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
                            <p>{product.title} - {selectedSize} ({selectedColor})</p>
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