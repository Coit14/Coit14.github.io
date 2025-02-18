import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => (
    <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
    </div>
);

export default LoadingSpinner; 