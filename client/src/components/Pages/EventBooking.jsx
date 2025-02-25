import React, { useState } from 'react';
import './EventBooking.css';

const EventBooking = () => {
    const [formData, setFormData] = useState({
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
        arrivalSetupTime: '',
        tearDownTime: '',
        parkingInfo: '',
        corporatePayment: '',
        powerSupply: '',
        waterSupply: ''
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
            const response = await fetch('https://coits-food-truck.vercel.app/api/sendEmail', {
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
                    arrivalSetupTime: '',
                    tearDownTime: '',
                    parkingInfo: '',
                    corporatePayment: '',
                    powerSupply: '',
                    waterSupply: ''
                });
            } else {
                throw new Error(data.error || 'Submission failed');
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Failed to submit form. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="event-booking-container">
            <div className="form-header">
                <h2>Event Booking Request</h2>
                <p className="intro-text">
                    Please fill out the form to request an event booking. We'll review your request and try to respond within a week! 
                    (Please note, we do not operate in the winter and rarely schedule private events November through March due to weather.)
                </p>
            </div>

            {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="event-booking-form">
                {/* Contact Information Section */}
                <section className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
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
                </section>

                {/* Event Information Section */}
                <section className="form-section">
                    <h3>Event Information</h3>
                    <div className="form-group">
                        <label htmlFor="eventName">Event Name/Description *</label>
                        <small>Please include details about other vendors, entertainment, and charitable activities.</small>
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
                        <label htmlFor="eventDate">Event Date *</label>
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
                        <label>Event Time *</label>
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
                        <label htmlFor="eventAddress">Event Address & City *</label>
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
                        <label>Expected Event Size *</label>
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
                </section>

                {/* Event Type & Advertising Section */}
                <section className="form-section">
                    <h3>Event Type & Advertising</h3>
                    <div className="form-group">
                        <label>Is this a private event? *</label>
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
                        <label htmlFor="corporatePayment">Corporate Events Payment Info</label>
                        <small>For corporate events, does the company pay, or do customers pay?</small>
                        <input
                            type="text"
                            id="corporatePayment"
                            name="corporatePayment"
                            value={formData.corporatePayment}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Can we advertise it to the public?</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="canAdvertise"
                                    value="yes"
                                    checked={formData.canAdvertise === 'yes'}
                                    onChange={handleChange}
                                /> Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="canAdvertise"
                                    value="no"
                                    checked={formData.canAdvertise === 'no'}
                                    onChange={handleChange}
                                /> No
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="advertisingDetails">Event Advertising Details</label>
                        <textarea
                            id="advertisingDetails"
                            name="advertisingDetails"
                            value={formData.advertisingDetails}
                            onChange={handleChange}
                            placeholder="Is any advertising planned? (Social media, radio, TV, print). Any vendor fees/space fees? Is there a deadline to respond?"
                        />
                    </div>
                </section>

                {/* Site Details Section */}
                <section className="form-section">
                    <h3>Site Details</h3>
                    <div className="form-group">
                        <label htmlFor="arrivalSetupTime">Arrival and Setup Timeframe</label>
                        <input
                            type="text"
                            id="arrivalSetupTime"
                            name="arrivalSetupTime"
                            value={formData.arrivalSetupTime}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tearDownTime">Earliest Tear Down Time</label>
                        <input
                            type="text"
                            id="tearDownTime"
                            name="tearDownTime"
                            value={formData.tearDownTime}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="parkingInfo">Parking Tips</label>
                        <textarea
                            id="parkingInfo"
                            name="parkingInfo"
                            value={formData.parkingInfo}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Is power available on site? *</label>
                        <p className="helper-text"><i>If no, we will use our generator</i></p>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="powerSupply"
                                    value="yes"
                                    checked={formData.powerSupply === 'yes'}
                                    onChange={handleChange}
                                /> Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="powerSupply"
                                    value="no"
                                    checked={formData.powerSupply === 'no'}
                                    onChange={handleChange}
                                /> No
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Is clean water available on site? *</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="waterSupply"
                                    value="yes"
                                    checked={formData.waterSupply === 'yes'}
                                    onChange={handleChange}
                                /> Yes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="waterSupply"
                                    value="no"
                                    checked={formData.waterSupply === 'no'}
                                    onChange={handleChange}
                                /> No
                            </label>
                        </div>
                    </div>
                </section>

                <div className="minimum-sales-note">
                    <p>We often require a minimum of $1,000. However, if we are able to advertise the event to the public, this minimum may be reduced or waived.</p>
                </div>

                <button type="submit" className="submit-button">Submit Booking Request</button>
            </form>
        </div>
    );
};

export default EventBooking; 