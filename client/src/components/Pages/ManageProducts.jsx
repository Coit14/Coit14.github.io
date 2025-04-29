import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageProducts.css';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch products from the backend
        axios.get('/api/products')
            .then(response => {
                console.log('Fetched products:', response.data); // Log the response
                setProducts(response.data);
            })
            .catch(error => console.error('Error fetching products:', error));
    }, []);

    const publishProduct = (id) => {
        axios.post(`/api/products/${id}/publish`)
            .then(response => {
                alert(response.data.message);
                // Update product status locally
                setProducts(products.map(product => 
                    product.id === id ? { ...product, status: 'Published' } : product
                ));
            })
            .catch(error => console.error('Error publishing product:', error));
    };

    const deleteProduct = (id) => {
        axios.delete(`/api/products/${id}`)
            .then(response => {
                alert(response.data.message);
                // Remove product from local state
                setProducts(products.filter(product => product.id !== id));
            })
            .catch(error => console.error('Error deleting product:', error));
    };

    return (
        <div className="manage-products">
            <h1>Manage Products</h1>
            <table>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td><img src={product.thumbnail} alt={product.title} /></td>
                            <td>{product.title}</td>
                            <td>{product.status}</td>
                            <td>
                                <button onClick={() => publishProduct(product.id)}>Publish</button>
                                <button onClick={() => deleteProduct(product.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageProducts; 