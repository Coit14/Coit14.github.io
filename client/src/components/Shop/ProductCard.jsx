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

    const startingPrice = getStartingPrice();

    return (
        <div className="product-card">
            <div className="product-image-container">
                {product.sync_product?.thumbnail_url ? (
                    <img
                        src={product.sync_product.thumbnail_url}
                        alt={product.sync_product.name || 'Coit\'s product'}
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
                    View Details
                </button>
            </div>
        </div>
    );
};

export default ProductCard; 