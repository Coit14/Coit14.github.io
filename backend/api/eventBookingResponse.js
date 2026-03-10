import nodemailer from 'nodemailer';
import { verifyBookingToken } from '../services/bookingTokenService.js';
import { createCalendarEventFromBooking } from '../services/googleCalendarService.js';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const normalizeAction = (value) => (value || '').toLowerCase();

const mergeBookingWithModifications = (bookingData, modifications = {}) => ({
    ...bookingData,
    ...Object.fromEntries(
        Object.entries(modifications).filter(([, value]) => value !== undefined && value !== null && value !== '')
    ),
});

const sendCustomerDecisionEmail = async (bookingData, action) => {
    const actionLabel = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'updated';

    const subject =
        action === 'accept'
            ? `Booking Approved - ${bookingData.eventName}`
            : action === 'decline'
                ? `Booking Update - ${bookingData.eventName}`
                : `Booking Time Updated - ${bookingData.eventName}`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2 style="color: #814d49;">Your booking request has been ${actionLabel}</h2>
            <p>Hello ${bookingData.fullName},</p>
            <p>Here is the latest status for your event request:</p>
            <ul>
                <li><strong>Event:</strong> ${bookingData.eventName}</li>
                <li><strong>Date:</strong> ${bookingData.eventDate}</li>
                <li><strong>Time:</strong> ${bookingData.eventStartTime} - ${bookingData.eventEndTime}</li>
                <li><strong>Location:</strong> ${bookingData.eventAddress}</li>
            </ul>
            ${bookingData.adminNotes ? `<p><strong>Notes:</strong> ${bookingData.adminNotes}</p>` : ''}
            <p>Thank you,<br/>Coit's Food Truck</p>
        </div>
    `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: bookingData.email,
        subject,
        html,
        text: `Your booking request for ${bookingData.eventName} was ${actionLabel}.`,
    });
};

export async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, action, modifications } = req.body || {};
        const normalizedAction = normalizeAction(action);

        if (!token || !['accept', 'decline', 'modify'].includes(normalizedAction)) {
            return res.status(400).json({ error: 'Invalid token or action' });
        }

        const originalBooking = verifyBookingToken(token);
        const updatedBooking =
            normalizedAction === 'modify'
                ? mergeBookingWithModifications(originalBooking, modifications)
                : originalBooking;

        if (normalizedAction === 'accept' || normalizedAction === 'modify') {
            try {
                const createdEvent = await createCalendarEventFromBooking(updatedBooking);
                console.log(`Calendar event created: ${createdEvent?.id}`);
            } catch (calendarError) {
                console.error('Calendar event creation failed:', calendarError.message);
            }
        }

        await sendCustomerDecisionEmail(updatedBooking, normalizedAction);

        return res.status(200).json({
            message:
                normalizedAction === 'accept'
                    ? 'Booking accepted. Customer notified.'
                    : normalizedAction === 'decline'
                        ? 'Booking declined. Customer notified.'
                        : 'Booking modified. Calendar and customer updated.',
        });
    } catch (error) {
        console.error('Booking response error:', error);
        return res.status(500).json({ error: 'Failed to process booking response' });
    }
}
