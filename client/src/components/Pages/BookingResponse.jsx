import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { respondToEventBooking } from '../../services/api';
import './BookingResponse.css';

const BookingResponse = () => {
    const [searchParams] = useSearchParams();
    const action = (searchParams.get('action') || '').toLowerCase();
    const token = searchParams.get('token') || '';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [modifyData, setModifyData] = useState({
        eventDate: '',
        eventStartTime: '',
        eventEndTime: '',
        eventAddress: '',
        eventName: '',
        adminNotes: '',
    });

    const isModify = useMemo(() => action === 'modify', [action]);
    const isValidAction = useMemo(
        () => ['accept', 'decline', 'modify'].includes(action),
        [action]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setModifyData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token || !isValidAction) {
            setStatus({
                type: 'error',
                message: 'Missing or invalid action link.',
            });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = {
                token,
                action,
                modifications: isModify ? modifyData : undefined,
            };

            const result = await respondToEventBooking(payload);
            setStatus({
                type: 'success',
                message: result.message || 'Request processed successfully.',
            });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Failed to process booking response.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="booking-response-container animate-in">
            <div className="form-header">
                <h2 className="animate-in animate-delay-1">Booking Request Response</h2>
                <p className="intro-text animate-in animate-delay-2">
                    Use this secure link to accept, decline, or modify the event request.
                </p>
            </div>

            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.message}
                </div>
            )}

            {!isValidAction ? (
                <div className="status-message error">Invalid action.</div>
            ) : (
                <form onSubmit={handleSubmit} className="event-booking-form animate-in animate-delay-3">
                    <div className="form-group">
                        <label>Requested Action</label>
                        <input type="text" value={action.toUpperCase()} disabled />
                    </div>

                    {isModify && (
                        <>
                            <div className="form-group">
                                <label htmlFor="eventDate">New Event Date</label>
                                <input id="eventDate" name="eventDate" type="date" value={modifyData.eventDate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventStartTime">New Start Time</label>
                                <input id="eventStartTime" name="eventStartTime" type="time" value={modifyData.eventStartTime} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventEndTime">New End Time</label>
                                <input id="eventEndTime" name="eventEndTime" type="time" value={modifyData.eventEndTime} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventAddress">Updated Location</label>
                                <input id="eventAddress" name="eventAddress" type="text" value={modifyData.eventAddress} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="eventName">Updated Event Name</label>
                                <input id="eventName" name="eventName" type="text" value={modifyData.eventName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="adminNotes">Notes to Customer</label>
                                <textarea id="adminNotes" name="adminNotes" value={modifyData.adminNotes} onChange={handleChange} maxLength={300} />
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : `Confirm ${action}`}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookingResponse;
