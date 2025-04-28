import React, { useState } from 'react';
import './EventBooking.css';

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
        canAdvertise: '',
        advertisingDetails: '',
        parkingInfo: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
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
            const response = await fetch('https://coit14-github-io.vercel.app/api/sendEmail', {
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
                    message: 'Event request submitted successfully! Check your email for confirmation.'
                });
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
                    canAdvertise: '',
                    advertisingDetails: '',
                    parkingInfo: '',
                });
                window.scrollTo(0, 0);
            } else {
                throw new Error(data.error || 'Submission failed');
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Failed to submit form. Please try again.'
            });
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="event-booking-container animate-in">
            <div className="form-header">
                <h2 className="animate-in animate-delay-1">Event Booking Request</h2>
                <p className="intro-text animate-in animate-delay-2">
                    Please fill out the form and we'll try to respond within a week! 
                    (Please note, we do not operate in the winter and rarely schedule private events November through March due to weather.)
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
                    />
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
                    />
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
                    />
                </div>
                <div className="form-group time-range">
                    <label>Event Time <span className="required-asterisk">*</span></label>
                    <div className="time-inputs">
                        <div className="time-input">
                            <label htmlFor="eventStartTime">From:</label>
                            <input
                                type="time"
                                id="eventStartTime"
                                name="eventStartTime"
                                value={formData.eventStartTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="time-input">
                            <label htmlFor="eventEndTime">To:</label>
                            <input
                                type="time"
                                id="eventEndTime"
                                name="eventEndTime"
                                value={formData.eventEndTime}
                                onChange={handleChange}
                                required
                            />
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

                <div className="advertising-section">
                    <div className="minimum-sales-note">
                        <p>We often require a minimum of $1,000. However, if we are able to advertise to the public then the minimum may be reduced or waived.</p>
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
                    <label htmlFor="parkingInfo">Arrival and setup timeframe for event; earliest tear down time; parking tips; minimum quantity; contract specifications; for Corporate events: does company pay or do customers pay? Is power or a clean water supply available?</label>
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