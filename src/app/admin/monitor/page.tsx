'use client';

import React, { useState, useEffect } from 'react';
import { dataconnect, GOOGLE_MAPS_API_KEY, MAP_LIBRARIES, DEFAULT_MAP_ID } from '@/lib/firebase-client';
import { executeMutation, executeQuery, mutationRef, queryRef } from 'firebase/data-connect';
import { ListEventsData, GetEmergencyEventsData, Event, EmergencyEvent, LogEmergencyEventVariables } from '@/types/dataconnect';
import { GoogleMap, useJsApiLoader, InfoWindow, HeatmapLayer } from '@react-google-maps/api';
import { enhanceBroadcastText } from '@/app/actions/ai';

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

  // Broadcast Hub State
  const [broadcastText, setBroadcastText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<'EVENT' | 'GLOBAL'>('EVENT');
  const [broadcastType, setBroadcastType] = useState<'tactical' | 'promotional'>('tactical');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });

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

  useEffect(() => {
    const event = events.find(e => e.id === selectedEventId);
    if (event) setSelectedEvent(event);
  }, [selectedEventId, events]);

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

  const handleAIByGemini = async () => {
    if (!broadcastText) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceBroadcastText(broadcastText, broadcastType);
      setBroadcastText(enhanced);
    } catch (err) {
      console.error('AI Enhancement failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText) return;
    setIsBroadcasting(true);
    try {
      const ref = mutationRef<any, LogEmergencyEventVariables>(dataconnect, 'LogEmergencyEvent', {
        type: broadcastTarget === 'GLOBAL' ? 'COMMUNITY_BROADCAST' : 'EVENT_BROADCAST',
        priority: broadcastType === 'tactical' ? 'HIGH' : 'LOW',
        details: broadcastText,
        lat: null,
        lng: null,
        eventId: broadcastTarget === 'GLOBAL' ? null : selectedEventId
      });
      await executeMutation(ref);
      setBroadcastText('');
      alert('Broadcast sent successfully!');
    } catch (err: any) {
      console.error('Broadcast failed:', err);
      alert('Failed to send broadcast: ' + err.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 p-4 md:p-6 min-h-0 overflow-auto">
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
              onChange={(e) => setSelectedEventId(e.target.value)}
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
            {/* Heatmap Layer for Aggregate Density */}
            {emergencyEvents.length > 0 && (
              <HeatmapLayer 
                data={emergencyEvents
                  .filter(e => e.lat && e.lng)
                  .map(e => new google.maps.LatLng(e.lat!, e.lng!))
                }
                options={{
                  radius: 30,
                  opacity: 0.5
                }}
              />
            )}

            <AdvancedMarker 
              map={map}
              position={{ lat: selectedEvent.venueLat, lng: selectedEvent.venueLng }}
              title="VENUE CENTER"
              iconUrl="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            />
            
            {emergencyEvents.map((ev) => {
              if (ev.lat && ev.lng) {
                return (
                  <AdvancedMarker 
                    key={ev.id}
                    map={map}
                    position={{ lat: ev.lat, lng: ev.lng }}
                    title={ev.type}
                    onClick={() => setSelectedMarker(ev)}
                    iconUrl={ev.priority === 'HIGH' ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png" : "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"}
                    isBouncing={ev.status === 'PENDING'}
                  />
                );
              }
              return null;
            })}

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

        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
            <div className="w-[200%] h-1 bg-primary/10 transform rotate-45 translate-y-96 shadow-[0_0_20px_rgba(188,199,222,0.1)] opacity-30 animate-pulse"></div>
        </div>
      </section>

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

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
          {emergencyEvents.length === 0 ? (
            <div className="text-center py-16 opacity-30 select-none flex flex-col items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant">
                <path d="M1 6l5 5 4-4 4 4 5-5M1 12l5 5 4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm font-medium">Scanning for signals...</p>
            </div>
          ) : (
            emergencyEvents.map((event) => (
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
            ))
          )}
        </div>

        {/* AI Broadcast Hub - Removed and Migrated to Alerts Page */}
      </section>
    </div>
  );
}
