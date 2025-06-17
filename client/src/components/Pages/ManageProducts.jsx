import React, { useState, useEffect } from 'react';
import * as printService from '../../services/printfulService';
import LoadingSpinner from '../common/LoadingSpinner';
import './ManageProducts.css';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [publishingProducts, setPublishingProducts] = useState(new Set());

    // Load products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const fetchedProducts = await printService.getPublishedProducts();
                if (fetchedProducts && Array.isArray(fetchedProducts)) {
                    setProducts(fetchedProducts);
                    setError(null);
                } else {
                    throw new Error('Invalid product data received');
                }
            } catch (error) {
                console.error('Failed to load products:', error.message);
                setError('Unable to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProducts();
    }, []);

    const getVariantSummary = (product) => {
        if (!product.variants?.length) return 'No variants';
        
        const colors = new Set(product.variants.map(v => v.options?.color)).size;
        const sizes = new Set(product.variants.map(v => v.options?.size)).size;
        
        return `${colors} colors • ${sizes} sizes • Total ${product.variants.length} variants`;
    };

    if (isLoading) {
        return (
            <div className="manage-products-loading">
                <LoadingSpinner />
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="manage-products-error">
                <h2>Oops!</h2>
                <p>{error}</p>
                <button 
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!products?.length) {
        return (
            <div className="manage-products-empty">
                <h2>No Products Available</h2>
                <p>No products found in the system.</p>
            </div>
        );
    }

    return (
        <div className="manage-products">
            <h1>Manage Products</h1>
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product Details</th>
                        <th>Variants</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>
                                {product.images?.[0] ? (
                                    <img 
                                        src={product.images[0].src} 
                                        alt={product.title}
                                        className="product-image"
                                    />
                                ) : (
                                    <div className="no-image">No image</div>
                                )}
                            </td>
                            <td>
                                <strong>{product.title}</strong><br />
                                <small>{product.description || 'No description'}</small>
                            </td>
                            <td>{getVariantSummary(product)}</td>
                            <td>
                                {publishingProducts.has(product.id) ? 'Publishing...' : (product.status || 'Unpublished')}
                            </td>
                            <td>
                                {/* Remove publish/unpublish/delete logic for now */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageProducts; 