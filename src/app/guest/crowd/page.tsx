'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api';
import { dataconnect, GOOGLE_MAPS_API_KEY, MAP_LIBRARIES, DEFAULT_MAP_ID } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { GetEmergencyEventsData, EmergencyEvent } from '@/types/dataconnect';
import { useGuest } from '@/app/guest/GuestContext';
import { useLocation } from '@/hooks/useLocation';

const MAP_ID = DEFAULT_MAP_ID;

export default function GuestCrowdPage() {
  const router = useRouter();
  const { activeTicket, loading: contextLoading } = useGuest();
  const { lat: userLat, lng: userLng, getLocation } = useLocation();
  const [incidents, setIncidents] = useState<EmergencyEvent[]>([]);
  const [isNearCrowd, setIsNearCrowd] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Authorization Guard
  useEffect(() => {
    if (contextLoading) return;
    const now = new Date();
    const isExpired = activeTicket?.event?.expiryDate && new Date(activeTicket.event.expiryDate) < now;
    const isEventActive = activeTicket?.event?.isActive;
    const isValid = activeTicket && isEventActive && !isExpired;

    if (!isValid) {
      router.replace('/guest/dashboard?locked=true');
    }
  }, [activeTicket, contextLoading, router]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });

  // Polling for Crowd Indicators
  useEffect(() => {
    if (!activeTicket?.eventId) return;

    const fetchCrowdData = async () => {
      try {
        const qRef = queryRef<GetEmergencyEventsData, { eventId: string }>(dataconnect, 'GetEmergencyEvents', { eventId: activeTicket.eventId });
        const result = await executeQuery(qRef);
        if (result.data?.emergencyEvents) {
          // Filter for crowd-related reports
          const crowdEvents = result.data.emergencyEvents.filter(e => 
            e.type.includes('CROWD') || e.type.includes('BOTTLENECK') || e.type.includes('CONGESTION')
          );
          setIncidents(crowdEvents);
        }
      } catch (err) {
        console.error('Failed to fetch crowd data:', err);
      }
    };

    fetchCrowdData();
    const timer = setInterval(fetchCrowdData, 10000); // 10s polling
    return () => clearInterval(timer);
  }, [activeTicket]);

  // Proximity Alert Logic
  useEffect(() => {
    if (!userLat || !userLng || incidents.length === 0) {
      setIsNearCrowd(false);
      return;
    }

    const checkProximity = () => {
      const threshold = 0.0005; // ~50 meters approx
      const nearby = incidents.some(incident => {
        if (!incident.lat || !incident.lng) return false;
        const dLat = Math.abs(incident.lat - userLat);
        const dLng = Math.abs(incident.lng - userLng);
        return dLat < threshold && dLng < threshold;
      });
      setIsNearCrowd(nearby);
    };

    checkProximity();
  }, [userLat, userLng, incidents]);

  // Heatmap Data Points
  const heatmapData = useMemo(() => {
    if (!incidents.length) return [];
    return incidents
      .filter(i => i.lat && i.lng)
      .map(i => new google.maps.LatLng(i.lat!, i.lng!));
  }, [incidents]);

  if (!isLoaded || contextLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1326] min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-primary tracking-widest uppercase">Initializing Tactical Visualization</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen w-full flex flex-col relative overflow-hidden font-body">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" data-alt="high-tech grid overlay"></div>

      {/* Hero Telemetry Section */}
      <main className="flex-1 flex flex-col p-4 md:p-8 space-y-6 z-10 overflow-y-auto">
        <header className="flex justify-between items-end border-b border-outline-variant/10 pb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Crowd Monitor</h1>
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isNearCrowd ? 'bg-tertiary animate-ping' : 'bg-secondary'}`}></span>
              {isNearCrowd ? 'High Density Alert' : 'Area Status: Nominal'}
            </p>
          </div>
          <div className="text-right">
             <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 block mb-1">Last Update</span>
             <span className="font-mono text-xs text-on-surface/80">{new Date().toLocaleTimeString()}</span>
          </div>
        </header>

        {/* Tactical Alerts Banner */}
        {isNearCrowd && (
          <div className="bg-tertiary/10 border border-tertiary/40 p-4 rounded-xl flex items-center gap-4 animate-pulse">
            <span className="material-symbols-outlined text-tertiary text-3xl">warning</span>
            <div>
              <h3 className="font-headline text-sm font-bold text-tertiary uppercase">Proximity Warning</h3>
              <p className="text-xs text-on-surface-variant">Elevated crowd density detected within 50 meters of your position. Exercise caution.</p>
            </div>
          </div>
        )}

        {/* Map Container */}
        <section className="flex-1 min-h-[400px] relative rounded-3xl overflow-hidden glass-card border border-outline-variant/10 shadow-2xl">
           <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ 
              lat: activeTicket?.event?.venueLat || 34.0522, 
              lng: activeTicket?.event?.venueLng || -118.2437 
            }}
            zoom={16}
            onLoad={setMap}
            options={{
              mapId: MAP_ID,
              disableDefaultUI: false,
              mapTypeControl: false,
              streetViewControl: false,
              styles: [
                {
                  "elementType": "geometry",
                  "stylers": [{ "color": "#121a2f" }]
                }
              ]
            }}
          >
            {/* User Presence (Privacy Compliant - Only show the current user to themselves) */}
            {userLat && userLng && (
              <div className="relative">
                {/* Visual marker implementation via custom component or OverlayView would go here if needed, 
                    but for now we focus on the Heatmap data provided by incidents */}
              </div>
            )}

            {/* Anonymous Heatmap Layer */}
            {heatmapData.length > 0 && (
              <HeatmapLayer 
                data={heatmapData}
                options={{
                  radius: 40,
                  opacity: 0.6,
                  gradient: [
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)'
                  ]
                }}
              />
            )}
          </GoogleMap>

          {/* Quick HUD Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 pointer-events-none">
             <div className="bg-[#0B1326]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-outline-variant/20 shadow-lg pointer-events-auto">
                <span className="font-label text-[9px] text-on-surface-variant uppercase block mb-1">Active Event</span>
                <span className="font-headline text-sm font-bold text-on-surface">{activeTicket?.event?.title || 'Unknown Deployment'}</span>
             </div>
             <div className="bg-[#0B1326]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-outline-variant/20 shadow-lg pointer-events-auto text-right ml-auto">
                <span className="font-label text-[9px] text-on-surface-variant uppercase block mb-1">Density Index</span>
                <span className={`font-headline text-sm font-bold ${isNearCrowd ? 'text-tertiary' : 'text-secondary'}`}>
                  {isNearCrowd ? 'CRITICAL' : 'OPTIMAL'}
                </span>
             </div>
          </div>
        </section>

        {/* Analytics Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="glass-card p-5 rounded-2xl border border-outline-variant/10">
              <h3 className="font-headline text-xs uppercase tracking-widest text-on-surface-variant mb-4">Flow Predictor</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface/60 font-medium">Main Gate Density</span>
                    <span className="text-xs font-bold text-secondary">Nominal</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface/60 font-medium">Concourse Flow</span>
                    <span className="text-xs font-bold text-primary">Balanced</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface/60 font-medium">Sector G Bottleneck</span>
                    <span className="text-xs font-bold text-tertiary">Reported</span>
                 </div>
              </div>
           </div>

           <div className="glass-card p-5 rounded-2xl border border-outline-variant/10 flex flex-col justify-between">
              <h3 className="font-headline text-xs uppercase tracking-widest text-on-surface-variant mb-4">Tactical Guidance</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sentinel Lens recommends utilizing <span className="text-primary font-bold">North Gate Sector 4</span> for minimal wait times. Total venue occupancy estimated at <span className="text-on-surface font-bold">68%</span>.
              </p>
              <button 
                onClick={() => router.push('/guest/map')}
                className="mt-4 w-full py-3 bg-surface-container-highest rounded-lg font-label text-[10px] uppercase font-heavy tracking-[0.2em] hover:bg-primary transition-all duration-300"
              >
                View Navigation Map
              </button>
           </div>
        </section>
      </main>
    </div>
  );
}
