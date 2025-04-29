import React, { useState } from 'react';
import { sendContactEmail } from '../../services/api';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            await sendContactEmail(formData);
            setSubmitStatus({
                type: 'success',
                message: 'Message sent successfully! We will get back to you soon.'
            });
            resetForm();
        } catch (error) {
            console.error('Error sending message:', error);
            setSubmitStatus({
                type: 'error',
                message: 'Failed to send message. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            message: ''
        });
        setFormErrors({});
        window.scrollTo(0, 0);
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            errors.email = 'Invalid email address';
        }

        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.length < 10) {
            errors.message = 'Message must be at least 10 characters long';
        }

        return errors;
    };

    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            {submitStatus && (
                <div className={`alert ${submitStatus.type}`}>
                    {submitStatus.message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={formErrors.name ? 'error' : ''}
                        disabled={isSubmitting}
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={formErrors.email ? 'error' : ''}
                        disabled={isSubmitting}
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message:</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={formErrors.message ? 'error' : ''}
                        disabled={isSubmitting}
                        rows="6"
                    />
                    {formErrors.message && <span className="error-message">{formErrors.message}</span>}
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
};

export default Contact; 