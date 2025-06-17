import React from 'react';
import './ProductCard.css';

const formatPrice = (price) => {
    if (!price) return '';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
};

const ProductCard = ({ product, onClick }) => {
    const price = product.retail_price || product.price;
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
                {price && (
                    <div className="product-price">{formatPrice(price)}</div>
                )}
                <button
                    className="view-details-button"
                    onClick={onClick}
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default ProductCard; 