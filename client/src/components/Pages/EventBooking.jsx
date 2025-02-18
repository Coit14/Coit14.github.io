import React, { useState } from 'react';
import './EventBooking.css';

const EventBooking = () => {
    const [formData, setFormData] = useState({
        isPublicEvent: '',
        isLargeEvent: '',
        eventName: '',
        eventDateTime: '',
        eventAddress: '',
        contactEmail: '',
        additionalNotes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/submit-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            
            if (response.ok) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Event request submitted successfully! We will review and respond shortly.'
                });
                setFormData({
                    isPublicEvent: '',
                    isLargeEvent: '',
                    eventName: '',
                    eventDateTime: '',
                    eventAddress: '',
                    contactEmail: '',
                    additionalNotes: ''
                });
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="event-booking-container animate-in">
            <h1>Book an Event</h1>
            <p className="booking-intro">
                Fill out the form below to request an event booking. 
                We'll review your request and respond within 24-48 hours.
            </p>

            {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label>Is this a public event?</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="isPublicEvent"
                                value="yes"
                                checked={formData.isPublicEvent === 'yes'}
                                onChange={handleInputChange}
                                required
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="isPublicEvent"
                                value="no"
                                checked={formData.isPublicEvent === 'no'}
                                onChange={handleInputChange}
                            />
                            No
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Will there be more than 100 customers?</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="isLargeEvent"
                                value="yes"
                                checked={formData.isLargeEvent === 'yes'}
                                onChange={handleInputChange}
                                required
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="isLargeEvent"
                                value="no"
                                checked={formData.isLargeEvent === 'no'}
                                onChange={handleInputChange}
                            />
                            No
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="eventName">Event Name</label>
                    <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={formData.eventName}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="eventDateTime">Event Date and Time</label>
                    <input
                        type="datetime-local"
                        id="eventDateTime"
                        name="eventDateTime"
                        value={formData.eventDateTime}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="eventAddress">Event Address</label>
                    <input
                        type="text"
                        id="eventAddress"
                        name="eventAddress"
                        value={formData.eventAddress}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contactEmail">Contact Email</label>
                    <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="additionalNotes">Additional Notes</label>
                    <textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        rows="4"
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default EventBooking; 