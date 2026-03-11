import { google } from 'googleapis';

/**
 * Very standard Google Calendar service-account setup.
 *
 * Uses three env vars:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL  (from the JSON key's client_email)
 * - GOOGLE_PRIVATE_KEY            (from the JSON key's private_key)
 * - GOOGLE_CALENDAR_ID            (target calendar ID)
 *
 * The only trick is making sure the private key has real newlines. On most hosts,
 * setting GOOGLE_PRIVATE_KEY with literal "\n" sequences and calling .replace(/\\n/g, '\n')
 * is enough.
 */
function getCalendarClient() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Minimal, non-secret diagnostics
    console.log('[CalendarAuth] env summary', {
        hasEmail: !!clientEmail,
        hasKey: !!privateKey,
        keyLength: privateKey ? privateKey.length : 0,
    });

    if (!clientEmail || !privateKey) {
        throw new Error('Google Calendar credentials are not configured');
    }

    // Turn literal "\n" sequences into real newlines so PEM is valid
    const rawKeySample = privateKey.slice(0, 40);
    privateKey = privateKey.replace(/\\n/g, '\n');

    console.log('[CalendarAuth] key format check', {
        startsWithBegin: privateKey.startsWith('-----BEGIN'),
        endsWithEnd: privateKey.trim().endsWith('END PRIVATE KEY-----'),
        containsNewlines: privateKey.includes('\n'),
        rawSample: rawKeySample,
    });

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
}

export const listCalendarEvents = async () => {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
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
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
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
