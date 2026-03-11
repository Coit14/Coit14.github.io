import { google } from 'googleapis';

/**
 * Google Calendar auth supports three env patterns:
 * 1. GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 — base64-encoded full service account JSON (recommended on Render to avoid ERR_OSSL_UNSUPPORTED / private key newline issues).
 * 2. GOOGLE_CREDENTIALS — raw JSON string of the service account (same shape as the JSON key file).
 * 3. GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (with GOOGLE_CALENDAR_ID for all).
 *
 * Normalize private key so it works when env vars have newlines stripped or altered (e.g. on Render).
 * Accepts: literal \n in one line, or multi-line paste, or BEGIN/END with spaces instead of newlines.
 */
function normalizePrivateKey(raw) {
    if (!raw || typeof raw !== 'string') return raw;
    let key = raw.trim();
    // Replace literal backslash-n with real newlines (single-line paste from JSON key)
    key = key.replace(/\\n/g, '\n');
    // Also handle envs where \n is stored as two chars (backslash + n) - split/join ensures real newlines
    if (key.includes('\\n')) key = key.split('\\n').join('\n');
    // Normalize line endings (no \r)
    key = key.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // If env turned newlines into spaces, fix PEM: "-----BEGIN PRIVATE KEY----- MIIE... -----END..."
    if (key.includes('-----BEGIN') && key.includes('-----END') && !/-----BEGIN PRIVATE KEY-----\n/.test(key)) {
        key = key
            .replace(/\s*-----BEGIN PRIVATE KEY-----\s*/g, '-----BEGIN PRIVATE KEY-----\n')
            .replace(/\s*-----END PRIVATE KEY-----\s*/g, '\n-----END PRIVATE KEY-----\n')
            .replace(/\n+/g, '\n')
            .trim();
    }
    return key;
}

/**
 * Get credentials from env. Prefer base64 JSON or raw JSON to avoid private key newline issues on Render.
 */
function getCredentialsFromEnv() {
    const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
    if (base64) {
        try {
            const json = Buffer.from(base64, 'base64').toString('utf-8');
            const creds = JSON.parse(json);
            if (creds.private_key) creds.private_key = normalizePrivateKey(creds.private_key);
            return { credentials: creds, calendarId: process.env.GOOGLE_CALENDAR_ID };
        } catch (e) {
            throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: ' + (e.message || e));
        }
    }
    const rawJson = process.env.GOOGLE_CREDENTIALS;
    if (rawJson) {
        try {
            const creds = JSON.parse(rawJson);
            if (creds.private_key) creds.private_key = normalizePrivateKey(creds.private_key);
            return { credentials: creds, calendarId: process.env.GOOGLE_CALENDAR_ID };
        } catch (e) {
            throw new Error('Invalid GOOGLE_CREDENTIALS JSON: ' + (e.message || e));
        }
    }
    return null;
}

const getCalendarConfig = () => {
    const fromJson = getCredentialsFromEnv();
    if (fromJson) {
        return {
            credentials: fromJson.credentials,
            calendarId: fromJson.calendarId,
        };
    }
    return {
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
        calendarId: process.env.GOOGLE_CALENDAR_ID,
    };
};

const getCalendarClient = () => {
    const config = getCalendarConfig();
    const calendarId = config.calendarId;

    if (config.credentials) {
        const auth = new google.auth.GoogleAuth({
            credentials: config.credentials,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        return google.calendar({ version: 'v3', auth });
    }

    const { clientEmail, privateKey } = config;
    if (!clientEmail || !privateKey) {
        throw new Error('Google Calendar credentials are not configured');
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
};

export const listCalendarEvents = async () => {
    const { calendarId } = getCalendarConfig();
    if (!calendarId) {
        throw new Error('GOOGLE_CALENDAR_ID is not configured');
    }

    const calendar = getCalendarClient();
    const now = new Date();
    const future = new Date(now);
    future.setMonth(future.getMonth() + 6);

    const response = await calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
    });

    return (response.data.items || []).map((event) => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        location: event.location || '',
        description: event.description || '',
    }));
};

export const createCalendarEventFromBooking = async (bookingData) => {
    const { calendarId } = getCalendarConfig();
    if (!calendarId) {
        throw new Error('GOOGLE_CALENDAR_ID is not configured');
    }

    const calendar = getCalendarClient();
    const start = `${bookingData.eventDate}T${bookingData.eventStartTime}:00`;
    const end = `${bookingData.eventDate}T${bookingData.eventEndTime}:00`;

    const response = await calendar.events.insert({
        calendarId,
        requestBody: {
            summary: bookingData.eventName || 'Coit Event',
            location: bookingData.eventAddress || '',
            description: [
                `Booked by: ${bookingData.fullName || 'Unknown'}`,
                `Email: ${bookingData.email || 'N/A'}`,
                `Guest estimate: ${bookingData.eventSize || 'N/A'}`,
                bookingData.adminNotes ? `Admin notes: ${bookingData.adminNotes}` : '',
            ]
                .filter(Boolean)
                .join('\n'),
            start: {
                dateTime: start,
                timeZone: 'America/Chicago',
            },
            end: {
                dateTime: end,
                timeZone: 'America/Chicago',
            },
        },
    });

    return response.data;
};
