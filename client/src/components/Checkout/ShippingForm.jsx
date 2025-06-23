import React, { useState, useEffect } from 'react';
import './ShippingForm.css';
import LoadingSpinner from '../common/LoadingSpinner';

// US States data with full names and abbreviations
const US_STATES = [
    { name: 'Alabama', code: 'AL' },
    { name: 'Alaska', code: 'AK' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' },
    { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' },
    { name: 'Delaware', code: 'DE' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' },
    { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Indiana', code: 'IN' },
    { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' },
    { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Minnesota', code: 'MN' },
    { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' },
    { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' },
    { name: 'New Hampshire', code: 'NH' },
    { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' },
    { name: 'New York', code: 'NY' },
    { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' },
    { name: 'Pennsylvania', code: 'PA' },
    { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' },
    { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' },
    { name: 'Utah', code: 'UT' },
    { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' },
    { name: 'Washington', code: 'WA' },
    { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' },
    { name: 'Wyoming', code: 'WY' },
    { name: 'District of Columbia', code: 'DC' }
];

const ShippingForm = ({ 
    shippingStage, // 'address' | 'method'
    onAddressSubmit, 
    onShippingMethodSubmit, 
    shippingMethods, 
    selectedShipping, 
    onSelectShipping,
    shippingInfo,
    isLoading,
    error
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
        
        // Basic required field validation
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // ZIP code validation for US addresses
        if (formData.country === 'US' && formData.zipCode) {
            const zipRegex = /^\d{5}(-\d{4})?$/;
            if (!zipRegex.test(formData.zipCode)) {
                newErrors.zipCode = 'Please enter a valid ZIP code';
            }
        }

        // State validation for US addresses - now just check if it's selected
        if (formData.country === 'US' && formData.state) {
            const validStateCodes = US_STATES.map(state => state.code);
            if (!validStateCodes.includes(formData.state)) {
                newErrors.state = 'Please select a valid state';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Address submit handler
    const handleAddressSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // State is already in correct format from dropdown
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
            {isLoading && (
                <div className="loading-overlay">
                    <LoadingSpinner />
                </div>
            )}
            {error && (
                <div className="error-message">{error}</div>
            )}
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
                            <select
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={errors.state ? 'error' : ''}
                                disabled={shippingStage === 'method'}
                            >
                                <option value="">Select a state</option>
                                {US_STATES.map(state => (
                                    <option key={state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
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
                            {isLoading ? (
                                <div className="loading-message">Calculating shipping rates...</div>
                            ) : shippingMethods.length === 0 ? (
                                <div>No shipping methods available for this address.</div>
                            ) : (
                                shippingMethods.map(method => {
                                    // Format rate display
                                    const rate = parseFloat(method.rate);
                                    const rateDisplay = !isNaN(rate) ? `$${rate.toFixed(2)}` : 'Price unavailable';
                                    
                                    // Format delivery time display
                                    const deliveryTime = method.delivery_time || 'Delivery time unavailable';

                                    return (
                                        <div 
                                            key={method.id || Math.random()}
                                            className={`shipping-method ${selectedShipping?.id === method.id ? 'selected' : ''}`}
                                            onClick={() => method.id ? onSelectShipping(method) : null}
                                        >
                                            <div className="method-info">
                                                <div className="method-name">{method.name}</div>
                                                <div className="method-delivery">{deliveryTime}</div>
                                            </div>
                                            <div className="method-price">{rateDisplay}</div>
                                        </div>
                                    );
                                })
                            )}
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Calculating...' : 'Continue to Shipping Options'}
                        </button>
                    )}
                    {shippingStage === 'method' && (
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="continue-button"
                                onClick={handleShippingMethodSubmit}
                                disabled={!selectedShipping?.id || isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Continue to Payment'}
                            </button>
                            {shippingMethods.length === 0 && !isLoading && (
                                <div className="error-message">No shipping methods available for this address</div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ShippingForm; 