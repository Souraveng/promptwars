"use client";
import React, { useState, useEffect, useRef } from 'react';
import { dataconnect, GOOGLE_MAPS_API_KEY, MAP_LIBRARIES, DEFAULT_MAP_ID } from '@/lib/firebase-client';
import { executeMutation, executeQuery, mutationRef, queryRef } from 'firebase/data-connect';
import { ListEventsData, Event, ListVenueLayoutsData, VenueLayout } from '@/types/dataconnect';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const MAP_ID = DEFAULT_MAP_ID;


function AdvancedMarker({ map, position, title }: { map: google.maps.Map | null, position: google.maps.LatLngLiteral, title?: string }) {
  useEffect(() => {
    if (!map || !position || !google?.maps?.marker) return;

    // We use a small timeout to ensure map is ready and libraries are loaded
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title,
      gmpDraggable: false
    });

    return () => {
      marker.map = null;
    };
  }, [map, position, title]);

  return null;
}

function NewEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    venueName: '',
    description: '',
    date: '',
    time: '',
    lat: -34.397, // Default starting lat
    lng: 150.644, // Default starting lng
    isActive: false,
    layoutId: '',
    minAge: 0,
  });
  const [layouts, setLayouts] = useState<VenueLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<VenueLayout | null>(null);
  const [sectionCapacities, setSectionCapacities] = useState<Record<string, number>>({});

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });


  useEffect(() => {
    if (!isLoaded || !google.maps.places) return;

    // Create the new PlaceAutocompleteElement (Web Component)
    const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: ['us', 'in'] } // Added common regions
    });

    // Handle selection via the modern 'gmp-select' event
    const handlePlaceSelect = async (event: any) => {
      const { placePrediction } = event;
      if (!placePrediction) return;

      // Convert prediction to a real Place object
      const place = await placePrediction.toPlace();

      // Fetch the specific fields required for tactical pinning
      await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] });

      if (place.location) {
        const newLat = place.location.lat();
        const newLng = place.location.lng();

        setFormData(prev => ({
          ...prev,
          lat: newLat,
          lng: newLng,
          venueName: place.displayName || prev.venueName
        }));

        if (map) {
          map.panTo({ lat: newLat, lng: newLng });
          map.setZoom(17);
        }
      }
    };

    const searchInputContainer = document.getElementById('place-autocomplete-container');
    if (searchInputContainer) {
      searchInputContainer.innerHTML = ''; // Clear any existing
      searchInputContainer.appendChild(autocompleteElement);
      autocompleteElement.addEventListener('gmp-select', handlePlaceSelect);

      // Styling the web component to match tactical UI
      autocompleteElement.classList.add('tactical-search');
    }

    return () => {
      autocompleteElement.removeEventListener('gmp-placeselect', handlePlaceSelect);
    };
  }, [isLoaded, map]);

  useEffect(() => {
    const fetchLayouts = async () => {
      console.log('[TacticalOS] Fetching layouts for deployment modal...');
      try {
        const qRef = queryRef<ListVenueLayoutsData, {}>(dataconnect, 'ListVenueLayouts', {});
        const result = await executeQuery(qRef);
        console.log('[TacticalOS] Layout fetch raw result:', JSON.stringify(result.data));
        
        if (result.data?.venueLayouts) {
          console.log(`[TacticalOS] Successfully loaded ${result.data.venueLayouts.length} layouts.`);
          setLayouts(result.data.venueLayouts);
        } else {
          console.warn('[TacticalOS] No venueLayouts found in response.');
        }
      } catch (err) {
        console.error('[TacticalOS] Failed to fetch layouts:', err);
      }
    };

    fetchLayouts();

    // Listen for saves from the Venue Builder tab/window
    window.addEventListener('venue-layout-saved', fetchLayouts);
    return () => window.removeEventListener('venue-layout-saved', fetchLayouts);
  }, []);

  useEffect(() => {
    if (formData.layoutId) {
      const layout = layouts.find(l => l.id === formData.layoutId);
      if (layout) {
        setSelectedLayout(layout);
        try {
          const elements = JSON.parse(layout.elements) as any[];
          const initialCaps: Record<string, number> = {};
          
          console.log(`[TacticalOS] Importing layout "${layout.name}" with ${elements.length} elements...`);
          
          elements.forEach(el => {
            // Include ALL types that might have capacity (zone, polygon, seat, stall)
            const capacityTypes = ['zone', 'polygon', 'seat', 'stall', 'rectangle'];
            if (capacityTypes.includes(el.type)) {
              initialCaps[el.id] = el.capacity || 0;
            }
          });
          
          console.log('[TacticalOS] Imported Capacities:', initialCaps);
          setSectionCapacities(initialCaps);
        } catch (err) {
          console.error('[TacticalOS] Layout parse failed:', err);
        }
      }
    } else {
      setSelectedLayout(null);
      setSectionCapacities({});
    }
  }, [formData.layoutId, layouts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('[TacticalOS] Attempting to create event:', formData);

    try {
      const mRef = mutationRef(dataconnect, 'CreateEvent', {
        title: formData.title,
        venueName: formData.venueName,
        venueLat: formData.lat,
        venueLng: formData.lng,
        description: formData.description,
        isActive: formData.isActive,
        minAge: formData.minAge,
        layoutId: formData.layoutId || null,
        layoutConfig: JSON.stringify(sectionCapacities)
      });

      const result = await executeMutation(mRef);
      console.log('[TacticalOS] Mutation result:', result);

      onCreated();
      onClose();
    } catch (err: any) {
      console.error('[TacticalOS] Failed to create event:', err);
      alert(`Deployment Failed: ${err.message || 'Unknown Error'}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-[0_32px_64px_rgba(6,14,32,0.6)] flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 sticky top-0 bg-surface-container-low z-10">
          <h3 className="text-xl font-headline font-bold text-on-surface">New Tactical Event</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface p-1">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form className="flex flex-col gap-5 p-6" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Event Name</label>
                <input
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  type="text"
                  placeholder="e.g. Stadium Finals 2024"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Venue Name</label>
                <input
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  type="text"
                  placeholder="e.g. Central Arena"
                  value={formData.venueName}
                  onChange={e => setFormData({ ...formData, venueName: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-on-surface">Set as Active Event</label>
              </div>

              <div>
                <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Min. Age Requirement</label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                  value={formData.minAge}
                  onChange={e => setFormData({ ...formData, minAge: parseInt(e.target.value) })}
                >
                  <option value={0}>All Ages</option>
                  <option value={12}>12+ (PG)</option>
                  <option value={16}>16+ (Teen)</option>
                  <option value={18}>18+ (Adult)</option>
                  <option value={21}>21+ (Restricted)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold flex justify-between items-center">
                <span>Venue Picker (Search or Pin)</span>
                {formData.lat !== -34.397 && (
                  <span className="text-[10px] text-secondary font-bold tracking-widest animate-pulse flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">location_searching</span>
                    POSITION LOCKED
                  </span>
                )}
              </label>
              {isLoaded ? (
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <div id="place-autocomplete-container" className="relative tactical-autocomplete-wrapper z-20" />
                    <p className="text-[9px] text-on-surface-variant mt-1.5 px-1 opacity-70">
                      If suggestions don't appear, check API key restrictions in Google Console.
                    </p>
                  </div>

                  <div className="h-56 w-full rounded-2xl overflow-hidden border border-outline-variant/30 relative shadow-inner group">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{ lat: formData.lat, lng: formData.lng }}
                      zoom={formData.lat === -34.397 ? 2 : 15}
                      onLoad={m => setMap(m)}
                      onClick={(e) => {
                        if (e.latLng) {
                          setFormData({ ...formData, lat: e.latLng.lat(), lng: e.latLng.lng() });
                        }
                      }}
                      options={{
                        disableDefaultUI: true,
                        mapId: MAP_ID,
                        gestureHandling: 'greedy'
                      }}
                    >
                      <AdvancedMarker map={map} position={{ lat: formData.lat, lng: formData.lng }} title={formData.venueName} />
                    </GoogleMap>

                    {/* Map Instructions Overlay */}
                    {formData.lat === -34.397 && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none group-hover:bg-black/20 transition-all">
                        <div className="text-center px-6">
                          <span className="material-symbols-outlined text-3xl text-primary mb-2">touch_app</span>
                          <p className="text-xs text-white font-medium">Click on the map or search above to set venue location</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-56 w-full bg-surface-container flex items-center justify-center rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] text-primary font-bold tracking-widest">TACTICAL MAP LOADING</p>
                  </div>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-surface-container-lowest/50 p-2 rounded-lg border border-outline-variant/10">
                  <p className="text-[8px] text-on-surface-variant uppercase font-bold mb-0.5">Latitude</p>
                  <p className="text-xs font-mono text-primary">{formData.lat.toFixed(6)}</p>
                </div>
                <div className="bg-surface-container-lowest/50 p-2 rounded-lg border border-outline-variant/10">
                  <p className="text-[8px] text-on-surface-variant uppercase font-bold mb-0.5">Longitude</p>
                  <p className="text-xs font-mono text-primary">{formData.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Venue Layout & Capacity</label>
            <div className="flex flex-col gap-4 bg-surface-container-lowest/30 p-4 rounded-xl border border-outline-variant/10">
              <select
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
                value={formData.layoutId}
                onChange={e => setFormData({ ...formData, layoutId: e.target.value })}
              >
                <option value="">No Layout (Default)</option>
                {layouts.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>

              {selectedLayout && (
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center justify-between border-b border-outline-variant/10 pb-2">
                    <span>Section / Block</span>
                    <span>Max Capacity</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-style">
                    {(() => {
                      const elements = JSON.parse(selectedLayout.elements) as any[];
                      return Object.entries(sectionCapacities).map(([id, cap]) => {
                        const el = elements.find(e => e.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between gap-4 p-2 bg-surface-container rounded-lg border border-outline-variant/5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: el?.color || '#3B82F6' }}></div>
                              <span className="text-xs font-medium text-on-surface">{el?.label || 'Unknown Sector'}</span>
                            </div>
                            <input
                              type="number"
                              className="w-20 bg-surface-container-lowest border border-outline-variant/20 rounded-md px-2 py-1 text-xs text-secondary font-bold focus:outline-none focus:border-secondary/50"
                              value={cap}
                              onChange={e => setSectionCapacities({ ...sectionCapacities, [id]: Number(e.target.value) })}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total Seat Capacity</span>
                    <span className="text-sm font-headline font-bold text-primary">
                      {Object.values(sectionCapacities).reduce((a, b) => a + b, 0).toLocaleString()} SEATS
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Description</label>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm text-on-surface resize-none leading-relaxed"
              rows={3}
              placeholder="Operational goals for this deployment..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 bg-surface-container-highest text-on-surface py-2.5 rounded-xl text-sm font-medium hover:bg-surface-bright"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl text-sm font-semibold hover:contrast-125 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Finalize Deployment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    console.log('[TacticalOS] Fetching events list...');
    try {
      const qRef = queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {});
      const result = await executeQuery(qRef);
      console.log('[TacticalOS] Fetch results:', result.data);

      if (result.data?.events) {
        console.log(`[TacticalOS] Found ${result.data.events.length} events.`);
        setEvents(result.data.events);
      } else {
        console.warn('[TacticalOS] No events array found in response.');
      }
    } catch (err) {
      console.error('[TacticalOS] Failed to list events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('open-new-event', handler);
    return () => window.removeEventListener('open-new-event', handler);
  }, []);

  const handleSetActive = async (id: string) => {
    try {
      // For simplicity, we just set this one to true. 
      // A robust implementation would unset others first.
      const mRef = mutationRef(dataconnect, 'SetActiveEvent', { id, isActive: true });
      await executeMutation(mRef);
      fetchEvents();
    } catch (err) {
      console.error('Failed to set active event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("CRITICAL ACTION: Permanently delete this deployment and ALL associated tactical data (Tickets, Emergency Logs)? This cannot be undone.")) return;
    
    setLoading(true);
    try {
      // Cascade Delete Part 1: Tickets
      const tRef = mutationRef(dataconnect, 'DeleteTicketsByEvent', { eventId: id });
      await executeMutation(tRef);

      // Cascade Delete Part 2: Emergency Logs
      const eRef = mutationRef(dataconnect, 'DeleteEmergencyEventsByEvent', { eventId: id });
      await executeMutation(eRef);

      // Final Step: Delete the event record
      const evRef = mutationRef(dataconnect, 'DeleteEvent', { id });
      await executeMutation(evRef);
      
      console.log(`[TacticalOS] Deployment ${id} wiped.`);
      fetchEvents();
    } catch (err) {
      console.error('[TacticalOS] Deletion crash:', err);
      alert("Deletion failed. Check console for tactical reports.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && <NewEventModal onClose={() => setShowModal(false)} onCreated={fetchEvents} />}

      <div className="flex flex-col gap-4 w-full p-4 sm:p-6">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-headline text-on-surface font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-fixed-dim">Events Schedule</h2>
            <p className="text-sm text-on-surface-variant mt-1">Manage tactical venue deployments.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-bold hover:contrast-125 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Deployment
          </button>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Search events..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-bright transition-colors border border-outline-variant/10">All</button>
            <button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors">Upcoming</button>
            <button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors">Past</button>
          </div>
        </div>

        {/* Event Cards */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-on-surface-variant text-center p-12">Loading Tactical Data...</div>
          ) : events.length === 0 ? (
            <div className="text-on-surface-variant text-center p-12 bg-surface-container rounded-2xl border border-dashed border-outline-variant/30">
              No tactical events scheduled.
            </div>
          ) : events.map((event) => (
            <div
              key={event.id}
              className={`bg-surface-container p-5 rounded-xl border-l-4 relative overflow-hidden group hover:bg-surface-container-high transition-colors shadow-lg shadow-background/50 ${event.isActive ? 'border-l-secondary' : 'border-l-outline-variant'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-3 items-center mb-1">
                    {event.isActive ? (
                      <div className="bg-secondary/20 text-secondary px-2 py-0.5 rounded text-[0.625rem] font-bold tracking-widest uppercase flex items-center gap-1.5 border border-secondary/30">
                        <div className="w-1 h-1 rounded-full bg-secondary animate-pulse"></div>
                        Active Monitoring
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSetActive(event.id)}
                        className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[0.625rem] font-bold tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors border border-primary/20"
                      >
                        Set as Active
                      </button>
                    )}
                    <span className="text-[10px] text-on-surface-variant font-medium font-mono uppercase">ID: {event.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">{event.title}</h3>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span> {event.venueName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Venue Location</p>
                  <p className="text-xs font-mono text-primary">{event.venueLat?.toFixed(4)}, {event.venueLng?.toFixed(4)}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-outline-variant hover:text-error hover:bg-error/10 rounded-lg transition-all flex items-center gap-1.5"
                      title="Wipe Tactical Deployment"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover:block">Wipe Data</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 border-t border-outline-variant/10 mt-4 pt-4">
                <div className="flex-1">
                  <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Description</p>
                  <p className="text-sm text-on-surface leading-snug">{event.description || 'No description provided.'}</p>
                </div>
                <div className="flex gap-4 border-l border-outline-variant/10 pl-6">
                  <div className="text-center">
                    <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Min Age</p>
                    <p className="text-sm font-bold text-primary">{event.minAge ? `${event.minAge}+` : 'All Ages'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Capacity</p>
                    <p className="text-sm font-bold text-secondary">
                      {event.layoutConfig 
                        ? Object.values(JSON.parse(event.layoutConfig) as Record<string, number>).reduce((a, b) => a + b, 0)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
