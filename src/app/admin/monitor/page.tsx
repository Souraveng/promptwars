'use client';

import React, { useState, useEffect } from 'react';
import { dataconnect, GOOGLE_MAPS_API_KEY, MAP_LIBRARIES, DEFAULT_MAP_ID } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { ListEventsData, GetEmergencyEventsData, Event, EmergencyEvent } from '@/types/dataconnect';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';

const MAP_ID = DEFAULT_MAP_ID;

function EmergencyIcon({ type }: { type: string }) {
  const icon = type.includes('SOS') ? 'warning' : 'medical_services';
  return <span className="material-symbols-outlined text-sm">{icon}</span>;
}

function AdvancedMarker({ map, position, title, iconUrl, onClick, isBouncing }: { 
  map: google.maps.Map | null, 
  position: google.maps.LatLngLiteral, 
  title?: string, 
  iconUrl?: string,
  onClick?: () => void,
  isBouncing?: boolean
}) {
  useEffect(() => {
    if (!map || !position || !google.maps.marker) return;

    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    
    // Create a tactical-looking pin
    if (iconUrl) {
      const img = document.createElement('img');
      img.src = iconUrl;
      img.style.width = '32px';
      img.style.height = '32px';
      if (isBouncing) img.className = 'animate-bounce';
      markerElement.appendChild(img);
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title,
      content: markerElement,
    });

    if (onClick) {
      const listener = marker.addListener('click', onClick);
      return () => {
        listener.remove();
        marker.map = null;
      };
    }

    return () => {
      marker.map = null;
    };
  }, [map, position, title, iconUrl, onClick, isBouncing]);

  return null;
}

export default function AdminMonitorPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });

  // Fetch all events to populate the switcher
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const qRef = queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {});
        const result = await executeQuery(qRef);
        if (result.data?.events) {
          setEvents(result.data.events);
          const activeEvent = result.data.events.find((e: any) => e.isActive);
          if (activeEvent) {
            setSelectedEventId(activeEvent.id);
            setSelectedEvent(activeEvent);
          } else if (result.data.events.length > 0) {
            setSelectedEventId(result.data.events[0].id);
            setSelectedEvent(result.data.events[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load events list:', err);
      }
    };
    fetchEvents();
  }, []);

  // Update selected event object when ID changes
  useEffect(() => {
    const event = events.find(e => e.id === selectedEventId);
    if (event) setSelectedEvent(event);
  }, [selectedEventId, events]);

  // Polling for emergencies for the specific event
  useEffect(() => {
    if (!selectedEventId) return;

    const poll = async () => {
      try {
        const qRef = queryRef<GetEmergencyEventsData, { eventId: string }>(dataconnect, 'GetEmergencyEvents', { eventId: selectedEventId });
        const result = await executeQuery(qRef);
        if (result.data?.emergencyEvents) {
          setEmergencyEvents(result.data.emergencyEvents);
          setError(null);
        }
      } catch (err: any) {
        console.error('Polling failed:', err);
        setError(err.message || 'Polling error');
      }
    };

    poll();
    const timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [selectedEventId]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 p-6 overflow-hidden">
      {/* Header with Selector */}
      <header className="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-on-surface">Tactical Monitor</h1>
            <p className="text-xs text-on-surface-variant">Real-time emergency telemetry for venue ops</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Switch Event Context:</label>
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm text-on-surface font-semibold focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
          >
            <option value="">Select an Event...</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title} {e.isActive ? '(Active)' : ''}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Map Area */}
        <div className="flex-1 bg-surface-container rounded-3xl border border-outline-variant/10 relative overflow-hidden shadow-2xl">
          {isLoaded && selectedEvent ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: selectedEvent.venueLat, lng: selectedEvent.venueLng }}
              zoom={16}
              onLoad={m => setMap(m)}
              options={{ 
                mapId: MAP_ID,
                disableDefaultUI: false,
                mapTypeControl: false,
                streetViewControl: false
              }}
            >
              <AdvancedMarker 
                map={map}
                position={{ lat: selectedEvent.venueLat, lng: selectedEvent.venueLng }}
                title="VENUE CENTER"
                iconUrl="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              />
              
              {emergencyEvents.map((ev) => (ev.lat && ev.lng) && (
                <AdvancedMarker 
                  key={ev.id}
                  map={map}
                  position={{ lat: ev.lat, lng: ev.lng }}
                  title={ev.type}
                  onClick={() => setSelectedMarker(ev)}
                  iconUrl={ev.priority === 'HIGH' ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png" : "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"}
                  isBouncing={ev.status === 'PENDING'}
                />
              ))}

              {selectedMarker && (
                <InfoWindow 
                  position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 min-w-[150px] bg-[#0b162c] text-white rounded">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">{selectedMarker.type}</p>
                    <p className="text-sm font-medium">{selectedMarker.details}</p>
                    <p className="text-[9px] text-gray-400 mt-2">{new Date(selectedMarker.timestamp).toLocaleTimeString()}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0b162c]">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-primary font-bold tracking-widest uppercase animate-pulse">Initializing Tactical Map</p>
            </div>
          )}

          {/* Map Overlay Stats */}
          <div className="absolute top-4 left-4 flex gap-3 pointer-events-none">
            <div className="bg-surface-container-high/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/20 shadow-xl pointer-events-auto">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Live Occupancy</p>
              <p className="text-2xl font-headline font-bold text-on-surface">14,208</p>
            </div>
            <div className="bg-surface-container-high/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/20 shadow-xl pointer-events-auto">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Capacity</p>
              <p className="text-2xl font-headline font-bold text-on-surface">71%</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Feed */}
        <div className="w-[380px] flex flex-col gap-4 overflow-hidden">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl flex flex-col min-h-0 flex-1">
            <header className="p-5 border-b border-outline-variant/10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-headline font-bold text-on-surface">Active Stream</h2>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                  <p className="text-[10px] uppercase font-bold text-secondary tracking-widest">System & Emergency Feed</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary opacity-50">security</span>
            </header>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-mono">
                  {error}
                </div>
              )}
              
              {emergencyEvents.length === 0 ? (
                <div className="text-center py-20 opacity-30 select-none">
                  <span className="material-symbols-outlined text-4xl mb-2">signal_cellular_nfc</span>
                  <p className="text-sm font-medium">Scanning for signals...</p>
                </div>
              ) : emergencyEvents.map((event) => (
                <div 
                  key={event.id}
                  className="bg-surface-container-highest p-4 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group relative"
                  onClick={() => event.lat && setSelectedMarker(event)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${event.priority === 'HIGH' ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                      <EmergencyIcon type={event.type} />
                    </div>
                    <span className="text-[9px] font-mono text-on-surface-variant">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface uppercase tracking-tight">{event.type}</h4>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{event.details}</p>
                  <div className="mt-3 pt-3 border-t border-outline-variant/5 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-[9px] text-primary-fixed-dim font-bold">
                      <span className="material-symbols-outlined text-[10px]">location_on</span>
                      {event.lat && event.lng ? `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}` : 'NO_LOCATION'}
                    </div>
                    <button className="text-[10px] font-bold text-secondary hover:text-white transition-colors bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">ACKNOWLEDGE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
