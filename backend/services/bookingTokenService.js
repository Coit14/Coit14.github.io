import crypto from 'crypto';

const getSigningSecret = () => process.env.BOOKING_ACTION_SECRET || 'dev-booking-secret-change-me';

export const createBookingToken = (bookingData) => {
    const payload = Buffer.from(
        JSON.stringify({
            bookingData,
            issuedAt: Date.now(),
        })
    ).toString('base64url');

    const signature = crypto
        .createHmac('sha256', getSigningSecret())
        .update(payload)
        .digest('hex');

    return `${payload}.${signature}`;
};

export const verifyBookingToken = (token) => {
    if (!token || !token.includes('.')) {
        throw new Error('Invalid token format');
    }

    const [payload, signature] = token.split('.');
    const expectedSignature = crypto
        .createHmac('sha256', getSigningSecret())
        .update(payload)
        .digest('hex');

    if (signature !== expectedSignature) {
        throw new Error('Invalid token signature');
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return decoded.bookingData;
};
