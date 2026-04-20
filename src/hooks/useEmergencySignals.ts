import { useState, useEffect, useCallback, useRef } from 'react';
import { dataconnect } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { GetEmergencyEventsData, EmergencyEvent } from '@/types/dataconnect';

/**
 * Tactical hook for high-frequency emergency signal monitoring.
 * Optimized with polling and automatic cleanup to preserve system resources.
 */
export function useEmergencySignals(eventId: string | null) {
  const [signals, setSignals] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSignals = useCallback(async () => {
    if (!dataconnect || !eventId) return;
    try {
      const qRef = queryRef<GetEmergencyEventsData, { eventId: string }>(
        dataconnect, 
        'GetEmergencyEvents', 
        { eventId }
      );
      const result = await executeQuery(qRef);
      if (result.data?.emergencyEvents) {
        setSignals(result.data.emergencyEvents);
        setError(null);
      }
    } catch (err: any) {
      console.error('[TacticalSignals] Polling Error:', err);
      setError(err.message || 'Polling error');
    }
  }, [eventId]);

  useEffect(() => {
    // Initial fetch
    if (eventId) {
      setLoading(true);
      fetchSignals().finally(() => setLoading(false));
      
      // Start polling loop
      pollTimer.current = setInterval(fetchSignals, 3000);
    } else {
      setSignals([]);
    }

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [eventId, fetchSignals]);

  return {
    signals,
    loading,
    error,
    refreshSignals: fetchSignals
  };
}
