'use client';

import React, { useCallback, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, MAP_LIBRARIES } from '@/lib/firebase-client';
import { useEvents } from '@/hooks/useEvents';
import { useEmergencySignals } from '@/hooks/useEmergencySignals';
import SignalMap from '@/components/admin/SignalMap';
import SignalStream from '@/components/admin/SignalStream';

/**
 * Tactical Admin Monitor
 * Orchestrated with modular hooks and memoized components for peak efficiency.
 */
export default function AdminMonitorPage() {
  const { 
    events, 
    selectedEventId, 
    selectedEvent, 
    selectEvent 
  } = useEvents();

  const { 
    signals, 
    error 
  } = useEmergencySignals(selectedEventId);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });

  const handleSignalInteraction = useCallback((signal: any) => {
    // Logic for interacting with signal from either map or stream
    console.info(`[TacticalMonitor] Signal Interaction: ${signal.id}`);
  }, []);

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 p-4 md:p-6 min-h-0 overflow-auto">
      {/* Map Section - Column Span 8 */}
      <section className="xl:col-span-8 relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/10 shadow-2xl flex flex-col" style={{ minHeight: '300px', height: 'clamp(300px, 50vw, 500px)' }}>
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-start gap-2 pointer-events-none">
          <div className="flex gap-2 pointer-events-none flex-wrap">
            <div className="bg-surface-container-high/90 backdrop-blur-md px-3 py-2 rounded-xl border border-outline-variant/20 shadow-xl pointer-events-auto">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Live Occupancy</p>
              <p className="text-lg font-headline font-bold text-on-surface">14,208</p>
            </div>
            <div className="bg-surface-container-high/90 backdrop-blur-md px-3 py-2 rounded-xl border border-outline-variant/20 shadow-xl pointer-events-auto">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Capacity</p>
              <p className="text-lg font-headline font-bold text-on-surface">71%</p>
            </div>
          </div>
          
          <div className="bg-surface-container-high/90 backdrop-blur-md p-2 rounded-xl border border-outline-variant/20 shadow-xl pointer-events-auto flex items-center gap-2">
            <label className="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant pl-1 hidden sm:block">Context:</label>
            <select 
              value={selectedEventId}
              onChange={(e) => selectEvent(e.target.value)}
              className="bg-surface-container-highest border border-outline-variant/30 rounded-lg px-2 py-1.5 text-xs text-on-surface font-semibold focus:outline-none max-w-[140px] sm:max-w-none"
            >
              <option value="">Select Event...</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title} {e.isActive ? '(Active)' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoaded && selectedEvent ? (
          <SignalMap 
            selectedEvent={selectedEvent} 
            emergencyEvents={signals} 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0b162c]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-primary font-bold tracking-widest uppercase animate-pulse">Initializing Tactical Map</p>
          </div>
        )}

        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
            <div className="w-[200%] h-1 bg-primary/10 transform rotate-45 translate-y-96 shadow-[0_0_20px_rgba(188,199,222,0.1)] opacity-30 animate-pulse"></div>
        </div>
      </section>

      {/* Stream Section - Column Span 4 */}
      <section className="xl:col-span-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-xl flex flex-col" style={{ minHeight: '300px' }}>
        <header className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/50 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">Emergency Stream</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <p className="text-[10px] uppercase font-bold text-secondary tracking-widest">Active Incident Logs</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-secondary opacity-50">security</span>
        </header>

        <SignalStream 
          signals={signals} 
          onSignalClick={handleSignalInteraction} 
        />
        
        {error && (
          <div className="p-2 text-center bg-error/10 text-error text-[10px] uppercase font-bold tracking-widest">
            Handshake Error: {error}
          </div>
        )}
      </section>
    </div>
  );
}
