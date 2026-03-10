import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { fetchCalendarEvents } from '../../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const loadEvents = async () => {
            setIsLoading(true);
            setError('');

            try {
                const data = await fetchCalendarEvents();
                setEvents(data.events || []);
            } catch (err) {
                setError(err.message || 'Failed to load events.');
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, []);

    const calendarEvents = useMemo(() => {
        return events.map((event) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }));
    }, [events]);

    return (
        <div className="calendar-page-container animate-in">
            <div className="calendar-header">
                <h2 className="animate-in animate-delay-1">Event Calendar</h2>
                <p className="intro-text animate-in animate-delay-2">
                    See upcoming events and availability at a glance.
                </p>
            </div>

            {error && <div className="status-message error">{error}</div>}

            {isLoading ? (
                <div className="calendar-loading">Loading calendar events...</div>
            ) : (
                <>
                    <div className="calendar-wrapper animate-in animate-delay-3">
                        <BigCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 600 }}
                            popup
                            onSelectEvent={setSelectedEvent}
                        />
                    </div>

                    {selectedEvent && (
                        <div className="calendar-event-card">
                            <h3>{selectedEvent.title}</h3>
                            <p>
                                <strong>When:</strong>{' '}
                                {moment(selectedEvent.start).format('MMM D, YYYY h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                            </p>
                            {selectedEvent.location && (
                                <p>
                                    <strong>Where:</strong> {selectedEvent.location}
                                </p>
                            )}
                            {selectedEvent.description && (
                                <p>
                                    <strong>Details:</strong> {selectedEvent.description}
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CalendarPage;
