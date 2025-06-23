import React from 'react';
import './ProductCard.css';

const formatPrice = (price) => {
    if (!price) return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
};

const ProductCard = ({ product, onClick }) => {
    const getStartingPrice = () => {
        if (!product.sync_variants?.length) return null;
        const prices = product.sync_variants.map(v => parseFloat(v.retail_price));
        return Math.min(...prices);
    };

    const getFirstVariantImage = () => {
        if (!product.sync_variants?.length) return null;
        
        // Get the first variant (which is black)
        const firstVariant = product.sync_variants[0];
        
        // Get images array using the same logic as the modal
        let images = [];
        if (firstVariant.files && firstVariant.files.length > 1) {
            images = firstVariant.files
                .slice(1) // skip the first file (usually the uploaded design)
                .filter(f => f.type === 'preview' && f.preview_url)
                .map(f => f.preview_url);
        }
        // fallback: if no valid mockups, try product.image
        if (images.length === 0 && firstVariant.product?.image) {
            images = [firstVariant.product.image];
        }
        // Fallback to product thumbnail if no images
        if (images.length === 0 && product.sync_product?.thumbnail_url) {
            images = [product.sync_product.thumbnail_url];
        }

        return images[0] || null;
    };

    const startingPrice = getStartingPrice();
    const productImage = getFirstVariantImage();

    return (
        <div className="product-card">
            <div className="product-image-container">
                {productImage ? (
                    <img
                        src={productImage}
                        alt={product.sync_product?.name || 'Coit\'s product'}
                        className="product-image"
                        loading="lazy"
                    />
                ) : (
                    <div className="no-image">No image available</div>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-title">{product.sync_product?.name}</h3>
                {startingPrice && (
                    <p className="product-price">
                        {formatPrice(startingPrice)}
                    </p>
                )}
                <button
                    className="view-details-button"
                    onClick={() => onClick(product.sync_product.id)}
                >
                    View Options
                </button>
            </div>
        </div>
    );
};

export default ProductCard; 