import { useState, useEffect, useCallback } from 'react';
import { dataconnect } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { ListEventsData, Event } from '@/types/dataconnect';

/**
 * Tactical hook for managing the event registry.
 * Provides synchronized event listings and active context tracking.
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!dataconnect) return;
    setLoading(true);
    try {
      const qRef = queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {});
      const result = await executeQuery(qRef);
      
      if (result.data?.events) {
        setEvents(result.data.events);
        
        // Prioritize active event if not already selected
        const activeEvent = result.data.events.find((e) => e.isActive);
        if (activeEvent) {
          setSelectedEventId(activeEvent.id);
          setSelectedEvent(activeEvent);
        } else if (result.data.events.length > 0 && !selectedEventId) {
          setSelectedEventId(result.data.events[0].id);
          setSelectedEvent(result.data.events[0]);
        }
      }
      setError(null);
    } catch (err) {
      console.error('[TacticalRegistry] Sync Failure:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectEvent = useCallback((id: string) => {
    setSelectedEventId(id);
    const event = events.find(e => e.id === id);
    if (event) setSelectedEvent(event);
  }, [events]);

  return {
    events,
    selectedEventId,
    selectedEvent,
    loading,
    error,
    selectEvent: handleSelectEvent,
    refreshEvents: fetchEvents
  };
}
