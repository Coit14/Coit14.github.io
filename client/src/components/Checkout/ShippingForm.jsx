import React, { useState, useEffect } from 'react';
import './ShippingForm.css';

const ShippingForm = ({ 
    shippingStage, // 'address' | 'method'
    onAddressSubmit, 
    onShippingMethodSubmit, 
    shippingMethods, 
    selectedShipping, 
    onSelectShipping,
    shippingInfo
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

    // If shippingInfo changes (e.g. user goes back), update formData
    useEffect(() => {
        setFormData(shippingInfo || {
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
    }, [shippingInfo]);

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

    // Address submit handler
    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onAddressSubmit(formData);
        }
    };

    // Shipping method submit handler
    const handleShippingMethodSubmit = (e) => {
        e.preventDefault();
        if (selectedShipping) {
            onShippingMethodSubmit();
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
            <form className="shipping-form">
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
                                disabled={shippingStage === 'method'}
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
                                disabled={shippingStage === 'method'}
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
                            disabled={shippingStage === 'method'}
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
                            disabled={shippingStage === 'method'}
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
                            disabled={shippingStage === 'method'}
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
                                disabled={shippingStage === 'method'}
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
                                disabled={shippingStage === 'method'}
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
                                disabled={shippingStage === 'method'}
                            />
                            {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                        </div>
                    </div>
                </div>

                {/* Shipping Method Section: Only show after address is submitted and shippingStage === 'method' */}
                {shippingStage === 'method' && (
                    <div className="form-section">
                        <h3>Shipping Method</h3>
                        <div className="shipping-methods">
                            {shippingMethods.length === 0 && (
                                <div>No shipping methods available for this address.</div>
                            )}
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
                )}

                {/* Buttons */}
                <div>
                    {shippingStage === 'address' && (
                        <button 
                            type="button"
                            className="continue-button"
                            onClick={handleAddressSubmit}
                        >
                            Continue to Shipping Options
                        </button>
                    )}
                    {shippingStage === 'method' && (
                        <button 
                            type="button"
                            className="continue-button"
                            onClick={handleShippingMethodSubmit}
                            disabled={!selectedShipping}
                        >
                            Continue to Payment
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ShippingForm; 