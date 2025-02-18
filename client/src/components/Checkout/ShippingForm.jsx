import React, { useState } from 'react';
import './ShippingForm.css';

const ShippingForm = ({ 
    onSubmit, 
    shippingMethods, 
    selectedShipping, 
    onSelectShipping 
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zipCode'];
        
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm() && selectedShipping) {
            onSubmit(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="shipping-form-container">
            <form onSubmit={handleSubmit} className="shipping-form">
                <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={errors.firstName ? 'error' : ''}
                            />
                            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={errors.lastName ? 'error' : ''}
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                </div>

                <div className="form-section">
                    <h3>Shipping Address</h3>
                    <div className="form-group">
                        <label htmlFor="address1">Address Line 1</label>
                        <input
                            type="text"
                            id="address1"
                            name="address1"
                            value={formData.address1}
                            onChange={handleChange}
                            className={errors.address1 ? 'error' : ''}
                        />
                        {errors.address1 && <span className="error-message">{errors.address1}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="address2">Address Line 2 (Optional)</label>
                        <input
                            type="text"
                            id="address2"
                            name="address2"
                            value={formData.address2}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={errors.city ? 'error' : ''}
                            />
                            {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={errors.state ? 'error' : ''}
                            />
                            {errors.state && <span className="error-message">{errors.state}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="zipCode">ZIP Code</label>
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                className={errors.zipCode ? 'error' : ''}
                            />
                            {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Shipping Method</h3>
                    <div className="shipping-methods">
                        {shippingMethods.map(method => (
                            <div 
                                key={method.id}
                                className={`shipping-method ${selectedShipping?.id === method.id ? 'selected' : ''}`}
                                onClick={() => onSelectShipping(method)}
                            >
                                <div className="method-info">
                                    <span className="method-name">{method.name}</span>
                                    <span className="method-time">{method.delivery_time}</span>
                                </div>
                                <span className="method-price">
                                    ${(method.rate / 100).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="continue-button"
                    disabled={!selectedShipping}
                >
                    Continue to Payment
                </button>
            </form>
        </div>
    );
};

export default ShippingForm; 