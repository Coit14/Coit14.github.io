import React, { useState, useEffect } from 'react';
import { printifyService } from '../../services/printifyService';
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
                const fetchedProducts = await printifyService.getPublishedProducts();
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

    const publishProduct = async (id) => {
        try {
            setPublishingProducts(prev => new Set([...prev, id]));
            const response = await printifyService.publishProduct(id);
            if (response.success) {
                setProducts(products.map(product => 
                    product.id === id ? { ...product, status: 'Published' } : product
                ));
                alert('Product and all its variants published successfully');
            } else {
                // Handle specific error cases
                const errorMessage = response.error || 'Failed to publish product';
                if (response.status === 400) {
                    alert(`Publishing failed: ${errorMessage}\n\nPlease ensure the product has:\n- A title\n- A description\n- At least one variant`);
                } else {
                    alert(`Publishing failed: ${errorMessage}`);
                }
            }
        } catch (error) {
            console.error('Error publishing product:', error);
            alert('Failed to publish product: ' + (error.message || 'Unknown error occurred'));
        } finally {
            setPublishingProducts(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const unpublishProduct = async (id) => {
        try {
            const response = await printifyService.unpublishProduct(id);
            if (response.success) {
                setProducts(products.map(product => 
                    product.id === id ? { ...product, status: 'Unpublished' } : product
                ));
                alert('Product and all its variants unpublished successfully');
            } else {
                alert(`Unpublishing failed: ${response.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
            console.error('Error unpublishing product:', error);
            alert('Failed to unpublish product: ' + (error.message || 'Unknown error occurred'));
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product and all its variants?')) {
            return;
        }
        
        try {
            const response = await printifyService.deleteProduct(id);
            if (response.success) {
                setProducts(products.filter(product => product.id !== id));
                alert('Product and all its variants deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product and its variants');
        }
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
                                <button 
                                    onClick={() => unpublishProduct(product.id)}
                                    title="Unpublish all variants"
                                    className="unpublish-button"
                                    disabled={publishingProducts.has(product.id)}
                                >
                                    Unpublish All
                                </button>
                                <button 
                                    onClick={() => publishProduct(product.id)}
                                    title="Publish all variants"
                                    disabled={publishingProducts.has(product.id)}
                                >
                                    {publishingProducts.has(product.id) ? 'Publishing...' : 'Publish All'}
                                </button>
                                <button 
                                    onClick={() => deleteProduct(product.id)}
                                    title="Delete product and all its variants"
                                    className="delete-button"
                                    disabled={publishingProducts.has(product.id)}
                                >
                                    Delete All
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageProducts; 