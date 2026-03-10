import { listCalendarEvents } from '../services/googleCalendarService.js';

export async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const events = await listCalendarEvents();
        return res.status(200).json({ events });
    } catch (error) {
        console.error('Calendar events fetch failed:', error);
        return res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
}
