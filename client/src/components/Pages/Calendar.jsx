import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { fetchCalendarEvents } from '../../services/api';
import { socialLinks } from '../../config/social';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const localizer = momentLocalizer(moment);

const SimpleToolbar = ({ label, date, onNavigate }) => {
    const today = new Date();
    const viewedYear = date.getFullYear();
    const viewedMonth = date.getMonth();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);

    const isCurrentMonth = viewedYear === currentYear && viewedMonth === currentMonth;
    const isNextMonth = viewedYear === nextMonth.getFullYear() && viewedMonth === nextMonth.getMonth();

    const prevDisabled = isCurrentMonth;
    const nextDisabled = isNextMonth;

    return (
        <div className="calendar-simple-toolbar">
            <button
                type="button"
                className={`calendar-nav-button ${prevDisabled ? 'calendar-nav-button--disabled' : ''}`}
                onClick={() => !prevDisabled && onNavigate('PREV')}
                aria-label="Previous month"
                disabled={prevDisabled}
            >
                &#8592;
            </button>
            <h3 className="calendar-current-label">{label}</h3>
            <button
                type="button"
                className={`calendar-nav-button ${nextDisabled ? 'calendar-nav-button--disabled' : ''}`}
                onClick={() => !nextDisabled && onNavigate('NEXT')}
                aria-label="Next month"
                disabled={nextDisabled}
            >
                &#8594;
            </button>
        </div>
    );
};

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

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return calendarEvents
            .filter((event) => event.end >= now)
            .sort((a, b) => a.start - b.start)
            .slice(0, 8);
    }, [calendarEvents]);

    return (
        <div className="calendar-page-container animate-in">
            <div className="calendar-shell">
                <div className="calendar-header">
                    <h2 className="animate-in animate-delay-1">Event Calendar</h2>
                    <p className="intro-text animate-in animate-delay-2">
                        See upcoming events and availability at a glance.
                    </p>
                    <p className="calendar-facebook-note animate-in animate-delay-2">
                        For exact times and updates, see our <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="calendar-facebook-link">Facebook</a>.
                    </p>
                </div>

                {error && <div className="status-message error">{error}</div>}

                {isLoading ? (
                    <div className="calendar-loading">Loading calendar events...</div>
                ) : (
                    <div className="calendar-layout">
                        <div className="calendar-main animate-in animate-delay-3">
                            <div className="calendar-wrapper">
                                <BigCalendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: 600 }}
                                    popup
                                    onSelectEvent={setSelectedEvent}
                                    views={['month']}
                                    defaultView="month"
                                    components={{ toolbar: SimpleToolbar }}
                                />
                            </div>

                            {selectedEvent && (
                                <div className="calendar-event-card">
                                    <h3>{selectedEvent.title}</h3>
                                    <p>
                                        <strong>When:</strong>{' '}
                                        {moment(selectedEvent.start).format('MMM D, YYYY')}
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
                        </div>

                        <aside className="upcoming-events-panel animate-in animate-delay-4">
                            <h3>Upcoming Events</h3>
                            {upcomingEvents.length === 0 ? (
                                <p className="upcoming-empty">No upcoming events scheduled.</p>
                            ) : (
                                <ul className="upcoming-events-list">
                                    {upcomingEvents.map((event) => (
                                        <li
                                            key={`${event.title}-${event.start.toISOString()}`}
                                            className="upcoming-event-item"
                                        >
                                            <h4>{event.title}</h4>
                                            <p className="upcoming-event-time">
                                                {moment(event.start).format('ddd, MMM D, YYYY')}
                                            </p>
                                            {event.location && <p className="upcoming-event-location">{event.location}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
