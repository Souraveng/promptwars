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
    <div className="grid grid-cols-12 gap-6 p-6 h-[calc(100vh-100px)] overflow-hidden">
      <section className="col-span-12 xl:col-span-8 relative rounded-3xl overflow-hidden bg-surface-container border border-outline-variant/10 shadow-2xl flex flex-col">
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex gap-3 pointer-events-none">
            <div className="bg-surface-container-high/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/20 shadow-xl pointer-events-auto">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Live Occupancy</p>
              <p className="text-2xl font-headline font-bold text-on-surface">14,208</p>
            </div>
            <div className="bg-surface-container-high/90 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/20 shadow-xl pointer-events-auto">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Capacity</p>
              <p className="text-2xl font-headline font-bold text-on-surface">71%</p>
            </div>
          </div>

          <div className="bg-surface-container-high/90 backdrop-blur-md p-2 rounded-xl border border-outline-variant/20 shadow-xl pointer-events-auto flex items-center gap-3">
            <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant pl-2">Context:</label>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm text-on-surface font-semibold focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
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

      <section className="col-span-12 xl:col-span-4 bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl flex flex-col min-h-0">
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
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-mono">
              {error}
            </div>
          )}
          
            ))
          )}
        </div>

        {/* AI Broadcast Hub */}
        <section className="p-5 border-t border-outline-variant/10 bg-surface-container-highest/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">campaign</span>
              Broadcast Hub
            </h3>
            <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/10">
              <button 
                onClick={() => setBroadcastTarget('EVENT')}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${broadcastTarget === 'EVENT' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                Event
              </button>
              <button 
                onClick={() => setBroadcastTarget('GLOBAL')}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${broadcastTarget === 'GLOBAL' ? 'bg-secondary text-white' : 'text-on-surface-variant'}`}
              >
                Global
              </button>
            </div>
          </div>

          <div className="relative group">
            <textarea 
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Enter broadcast message or tactical briefing..."
              className="w-full h-32 bg-surface-container-highest border border-outline-variant/20 rounded-2xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all resize-none mb-4 scrollbar-hide"
            />
            {isEnhancing && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-container-highest/60 backdrop-blur-[1px] rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <button 
              onClick={handleAIByGemini}
              disabled={isEnhancing || !broadcastText}
              className="absolute right-3 bottom-7 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg active:scale-90 disabled:opacity-50"
              title="Enhance with Gemini Flash"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </button>
          </div>

          <div className="flex gap-3">
             <div className="flex-1 flex bg-surface-container-low rounded-xl p-1 border border-outline-variant/10">
                <button 
                  onClick={() => setBroadcastType('tactical')}
                  className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${broadcastType === 'tactical' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant opacity-50'}`}
                >
                  Tactical
                </button>
                <button 
                  onClick={() => setBroadcastType('promotional')}
                  className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${broadcastType === 'promotional' ? 'bg-secondary/20 text-secondary' : 'text-on-surface-variant opacity-50'}`}
                >
                  Promo
                </button>
             </div>
             <button 
              onClick={handleSendBroadcast}
              disabled={isBroadcasting || !broadcastText}
              className="flex-[1.5] bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {isBroadcasting ? (
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">send</span>
                    Send
                  </>
                )}
             </button>
          </div>
        </section>
      </section>
    </div>
  );
}
