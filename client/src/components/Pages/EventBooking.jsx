import React, { useState } from 'react';
import './EventBooking.css';
import { sendEventBookingEmail } from '../../services/api';

const EventBooking = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        facebookUsername: '',
        eventName: '',
        eventDate: '',
        eventStartTime: '',
        eventEndTime: '',
        eventAddress: '',
        eventSize: '',
        isPrivateEvent: '',
        otherFoodTrucks: '',
        canAdvertise: '',
        advertisingDetails: '',
        parkingInfo: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for date to prevent past dates
        if (name === 'eventDate') {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
            
            if (selectedDate < today) {
                // If past date selected, don't update state
                return;
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = {
            fullName: 'Full Name',
            email: 'Email Address',
            eventName: 'Event Name/Description',
            eventDate: 'Event Date',
            eventStartTime: 'Event Start Time',
            eventEndTime: 'Event End Time',
            eventAddress: 'Event Address',
            eventSize: 'Expected Number of Guests',
            isPrivateEvent: 'Private Event Status',
            otherFoodTrucks: 'Other Food Trucks Status',
            canAdvertise: 'Advertisement Permission'
        };

        // Check each required field
        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!formData[field]) {
                newErrors[field] = `${label} is required`;
            }
        });

        // Additional date validation
        if (formData.eventDate) {
            const selectedDate = new Date(formData.eventDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.eventDate = 'Please select a future date';
            }
        }

        // Email format validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);

        // If there are errors, scroll to the first error
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        try {
            await sendEventBookingEmail(formData);
            setSubmitStatus({
                type: 'success',
                message: 'Event request submitted successfully! Check your email for confirmation.'
            });
            resetForm();
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus({
                type: 'error',
                message: 'Failed to submit form. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            email: '',
            facebookUsername: '',
            eventName: '',
            eventDate: '',
            eventStartTime: '',
            eventEndTime: '',
            eventAddress: '',
            eventSize: '',
            isPrivateEvent: '',
            otherFoodTrucks: '',
            canAdvertise: '',
            advertisingDetails: '',
            parkingInfo: '',
        });
        window.scrollTo(0, 0);
    };

    // Helper to get end time options based on selected start time
    const getEndTimeOptions = () => {
        if (!formData.eventStartTime) return [];
        // Start time in minutes from midnight
        const [startHour, startMinute] = formData.eventStartTime.split(":").map(Number);
        const startTotal = startHour * 60 + startMinute;
        // 2 hours after start
        const minEnd = startTotal + 120;
        // 10:00 PM is 22:00 (1320 minutes)
        const maxEnd = 22 * 60;
        const options = [];
        for (let t = minEnd; t <= maxEnd; t += 30) {
            const hour = Math.floor(t / 60);
            const minute = t % 60;
            const period = hour < 12 ? 'AM' : 'PM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const displayMinute = minute.toString().padStart(2, '0');
            options.push({
                value: `${hour.toString().padStart(2, '0')}:${displayMinute}`,
                label: `${displayHour}:${displayMinute} ${period}`
            });
        }
        return options;
    };

    // Get today's date in YYYY-MM-DD format for min attribute
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="event-booking-container animate-in">
            <div className="form-header">
                <h2 className="animate-in animate-delay-1">Event Booking Request</h2>
                <p className="intro-text animate-in animate-delay-2">
                    Please fill out the form and we'll try to respond within a week. 
                    (Note — We're closed during the winter months.)
                </p>
            </div>

            {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="event-booking-form animate-in animate-delay-3">
                <div className="form-group">
                    <label htmlFor="fullName">Full Name <span className="required-asterisk">*</span></label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className={errors.fullName ? 'error-input' : ''}
                    />
                    {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address <span className="required-asterisk">*</span></label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={errors.email ? 'error-input' : ''}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="facebookUsername">Facebook Username</label>
                    <input
                        type="text"
                        id="facebookUsername"
                        name="facebookUsername"
                        value={formData.facebookUsername}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="eventName">Event Name/Description <span className="required-asterisk">*</span></label>
                    <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        value={formData.eventName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="eventDate">Event Date <span className="required-asterisk">*</span></label>
                    <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        required
                        min={todayStr}
                    />
                </div>
                <div className="form-group time-range">
                    <label>Event Time <span className="required-asterisk">*</span></label>
                    <div className="time-inputs" style={{ flexDirection: 'column', gap: '20px' }}>
                        <div className="time-input">
                            <label htmlFor="eventStartTime">Start:</label>
                            <select
                                id="eventStartTime"
                                name="eventStartTime"
                                value={formData.eventStartTime}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select time</option>
                                {Array.from({ length: 33 }, (_, i) => {
                                    const slot = i + 12;
                                    const hour = Math.floor(slot/2);
                                    const minute = slot % 2 === 0 ? '00' : '30';
                                    const period = hour < 12 ? 'AM' : 'PM';
                                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                    return (
                                        <option 
                                            key={`${hour}:${minute}`} 
                                            value={`${hour.toString().padStart(2, '0')}:${minute}`}
                                        >
                                            {`${displayHour}:${minute} ${period}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="time-input">
                            <label htmlFor="eventEndTime">End:</label>
                            <select
                                id="eventEndTime"
                                name="eventEndTime"
                                value={formData.eventEndTime}
                                onChange={handleChange}
                                required
                                disabled={!formData.eventStartTime}
                                className={!formData.eventStartTime ? 'disabled-select' : ''}
                            >
                                <option value="">Select end time</option>
                                {getEndTimeOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="eventAddress">Event Address & City <span className="required-asterisk">*</span></label>
                    <input
                        type="text"
                        id="eventAddress"
                        name="eventAddress"
                        value={formData.eventAddress}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Expected Number of Guests <span className="required-asterisk">*</span></label>
                    <select
                        name="eventSize"
                        value={formData.eventSize}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select size</option>
                        <option value="<150">Less than 150</option>
                        <option value="150-300">150-300</option>
                        <option value="300-500">300-500</option>
                        <option value="500+">500+</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Is this a private event? <span className="required-asterisk">*</span></label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="isPrivateEvent"
                                value="yes"
                                checked={formData.isPrivateEvent === 'yes'}
                                onChange={handleChange}
                            /> Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="isPrivateEvent"
                                value="no"
                                checked={formData.isPrivateEvent === 'no'}
                                onChange={handleChange}
                            /> No
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Will there be other food trucks at the event? <span className="required-asterisk">*</span></label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="otherFoodTrucks"
                                value="yes"
                                checked={formData.otherFoodTrucks === 'yes'}
                                onChange={handleChange}
                                required
                            /> Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="otherFoodTrucks"
                                value="no"
                                checked={formData.otherFoodTrucks === 'no'}
                                onChange={handleChange}
                                required
                            /> No
                        </label>
                    </div>
                </div>

                <div className="advertising-section">
                    <div className="minimum-sales-note">
                        <p>We often require a minimum of $800. However, if we are able to advertise to the public then the minimum may be reduced or waived.</p>
                    </div>

                    <div className="form-group">
                        <label>Can we advertise it to the public? <span className="required-asterisk">*</span></label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="canAdvertise"
                                    value="yes"
                                    checked={formData.canAdvertise === 'yes'}
                                    onChange={handleChange}
                                    required
                                /> Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="canAdvertise"
                                    value="no"
                                    checked={formData.canAdvertise === 'no'}
                                    onChange={handleChange}
                                    required
                                /> No
                            </label>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="advertisingDetails">Is any advertising planned? (Social media, radio, TV, print). Any vendor fees/space fees? Is there a deadline to respond?</label>
                    <textarea
                        id="advertisingDetails"
                        name="advertisingDetails"
                        value={formData.advertisingDetails}
                        onChange={handleChange}
                        maxLength={200}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="parkingInfo">Please provide any additional information you would like to share about your event:</label>
                    <textarea
                        id="parkingInfo"
                        name="parkingInfo"
                        value={formData.parkingInfo}
                        onChange={handleChange}
                        maxLength={200}
                    />
                </div>
                <button type="submit" className="submit-button">Submit Booking Request</button>
            </form>
        </div>
    );
};

export default EventBooking; 