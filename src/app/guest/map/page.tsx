'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGuest } from '../GuestContext';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { dataconnect, GOOGLE_MAPS_API_KEY, MAP_LIBRARIES } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { GetVenueLayoutData } from '@/types/dataconnect';
import TacticalLayoutRenderer from './TacticalLayoutRenderer';

export default function GuestMapPage() {
  const router = useRouter();
  const { activeTicket } = useGuest();
  const [layoutElements, setLayoutElements] = useState<any[]>([]);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });

  // Authorization Guard
  useEffect(() => {
    const now = new Date();
    const isExpired = activeTicket?.event?.expiryDate && new Date(activeTicket.event.expiryDate) < now;
    const isEventActive = activeTicket?.event?.isActive;
    const isValid = activeTicket && isEventActive && !isExpired;

    if (!isValid) {
      router.replace('/guest/dashboard?locked=true');
    }
  }, [activeTicket, router]);

  // Fetch Venue Layout
  useEffect(() => {
    const fetchLayout = async () => {
      if (!activeTicket?.event?.layoutId) return;
      try {
        const qRef = queryRef<GetVenueLayoutData, { id: string }>(dataconnect, 'GetVenueLayout', { id: activeTicket.event.layoutId });
        const result = await executeQuery(qRef);
        if (result.data?.venueLayout) {
          setLayoutElements(JSON.parse(result.data.venueLayout.elements));
        }
      } catch (err) {
        console.error('Failed to fetch layout:', err);
      }
    };
    fetchLayout();
  }, [activeTicket]);

  const venueCenter = {
    lat: activeTicket?.event?.venueLat || 0,
    lng: activeTicket?.event?.venueLng || 0
  };

  return (
    <main className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-[#0A0C10]">
      {/* Navigation Backdrop */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)]"></div>

      {/* Main Map Layer */}
      <div className={`absolute inset-0 z-0 transition-all duration-700 ${showMiniMap ? 'scale-110 blur-sm brightness-50' : 'scale-100'}`}>
        {isLoaded && activeTicket ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={venueCenter}
            zoom={17}
            options={{
              disableDefaultUI: true,
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
                { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
                { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
                { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
                { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
                { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
                { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
                { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
              ]
            }}
          >
            <Marker 
              position={venueCenter} 
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
            />
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full text-primary/40 animate-pulse">
            <span className="material-symbols-outlined text-6xl">map</span>
          </div>
        )}
      </div>

      {/* Backdrop for Focus Mode */}
      <div 
        className={`absolute inset-0 bg-[#0A0C10]/60 backdrop-blur-md z-40 transition-opacity duration-500 ${showMiniMap ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowMiniMap(false)}
      ></div>

      {/* Mini Layout Overlay (Premium Modal) */}
      <div className={`absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-500 transform ${showMiniMap ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="w-full max-w-5xl aspect-video md:aspect-[21/9] bg-[#0A0C10]/95 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
          <div className="p-4 md:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-xl md:text-2xl">view_quilt</span>
              </div>
              <div>
                <h3 className="text-base md:text-xl font-bold text-on-surface uppercase tracking-[0.2em]">Tactical Layout</h3>
                <p className="text-[9px] md:text-[11px] text-primary/60 font-mono uppercase tracking-widest font-bold">Indoor Orientation Array // Sector Alpha</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMiniMap(false)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 p-2 md:p-6 bg-black/20">
             <TacticalLayoutRenderer 
               elements={layoutElements}
               highlightSeat={activeTicket?.seat}
               highlightGate={activeTicket?.gate}
             />
          </div>
        </div>
      </div>

      {/* Floating UI: Search Bar */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-10 transition-all duration-500 ${showMiniMap ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-[#222a3e]/60 backdrop-blur-xl rounded-xl flex items-center px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.4)] border-l border-primary/20">
          <span className="material-symbols-outlined text-surface-tint mr-3" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm font-label uppercase tracking-widest text-on-surface placeholder-on-surface-variant/40 w-full" placeholder="LOCATE SECTION, SEAT, OR AMENITY" type="text"/>
          <span className="material-symbols-outlined text-on-surface-variant/40" data-icon="mic">mic</span>
        </div>
      </div>

      {/* Floating UI: Tactical Controls */}
      <div className={`absolute top-24 left-6 flex flex-col gap-4 z-10 transition-all duration-500 ${showMiniMap ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        <button 
          onClick={() => setShowMiniMap(!showMiniMap)}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${showMiniMap ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-[#222a3e]/60 backdrop-blur-xl text-on-surface-variant border border-white/5'}`} 
          title="Floor Selection"
        >
          <span className="material-symbols-outlined text-xl mb-0.5">{showMiniMap ? 'grid_view' : 'domain'}</span>
          <span className="text-[8px] font-bold uppercase tracking-widest">Layout</span>
        </button>
        <button className="w-14 h-14 bg-[#222a3e]/60 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center text-on-surface-variant border border-white/5" title="Recenter">
          <span className="material-symbols-outlined text-xl mb-0.5" data-icon="my_location">my_location</span>
          <span className="text-[8px] font-bold uppercase tracking-widest">Center</span>
        </button>
      </div>

      {/* Floating UI: Floor Selection */}
      <div className={`absolute top-24 right-6 flex flex-col gap-2 z-10 transition-all duration-500 ${showMiniMap ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        {['L3', 'L2', 'L1'].map(floor => (
          <button key={floor} className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline text-xs font-bold transition-all ${floor === 'L1' ? 'bg-primary text-on-primary shadow-lg border border-primary/20' : 'bg-[#222a3e]/40 backdrop-blur-md text-on-surface-variant/40 border border-white/5'}`}>
            {floor}
          </button>
        ))}
      </div>

      {/* Info Overlay: Route Card */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-20 transition-all duration-500 
        ${showMiniMap ? 'opacity-0 translate-y-10 pointer-events-none' : isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
        <div className="bg-[#1A1C24]/80 backdrop-blur-2xl rounded-3xl overflow-hidden relative border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] px-1 pt-1">
          {/* Close button inside card */}
          <button 
            onClick={() => setIsCardVisible(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant/40 hover:text-on-surface transition-colors"
            title="Minimize"
          >
            <span className="material-symbols-outlined text-sm">keyboard_double_arrow_down</span>
          </button>

          {/* Scanning line effect */}
          <div className="absolute left-0 -top-[100px] w-full h-[100px] bg-gradient-to-b from-transparent via-[rgba(59,130,246,0.1)] to-transparent pointer-events-none animate-[scan_4s_linear_infinite]"></div>
          
          <div className="p-6 flex flex-col gap-6 relative z-10">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                    <span className="material-symbols-outlined" data-icon="qr_code_2">qr_code_2</span>
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-0.5">AUTHENTICATED ACCESS</div>
                    <div className="text-[9px] text-on-surface-variant font-mono flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                       DEVICE_LINKED // ENCRYPTED
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">ACCESS_GATE</div>
                 <div className="text-white font-headline font-black text-xl">{activeTicket?.gate}</div>
              </div>
            </div>

            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight mb-1 italic">Active Zone: {activeTicket?.section}-{activeTicket?.seat}</h2>
              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em] flex items-center gap-2 translate-x-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {activeTicket?.event?.venueName} • Sector Alpha 
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'SECTION', value: activeTicket?.section, color: 'text-secondary' },
                { label: 'ROW', value: activeTicket?.row, color: 'text-on-surface' },
                { label: 'SEAT', value: activeTicket?.seat, color: 'text-primary' }
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
                  <div className="text-[8px] text-on-surface-variant/40 font-bold uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className={`text-lg font-headline font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowMiniMap(true)}
              className="w-full bg-gradient-to-r from-primary to-blue-600 p-5 rounded-2xl font-headline font-black text-on-primary uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all hover:brightness-110 group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform" data-icon="center_focus_strong">center_focus_strong</span>
              Open Tactical Layout
            </button>
          </div>
        </div>
      </div>
      
      {/* Restore Card Floating Action */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ${!isCardVisible && !showMiniMap ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <button 
          onClick={() => setIsCardVisible(true)}
          className="bg-primary/20 backdrop-blur-xl border border-primary/40 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:bg-primary/30 active:scale-95 transition-all group"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.3em]">Show Mission Data</span>
          <span className="material-symbols-outlined text-sm group-hover:-translate-y-0.5 transition-transform">keyboard_double_arrow_up</span>
        </button>
      </div>

      {/* Contextual Telemetry */}
      <div className={`hidden md:flex fixed right-6 top-64 flex-col gap-6 w-48 z-40 transition-all duration-500 ${showMiniMap ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
        <div className="bg-surface-container-high/40 backdrop-blur-md p-3 rounded-lg border-l border-primary/20 shadow-xl">
          <div className="text-[10px] text-primary font-headline font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
            System Live
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-on-surface-variant/60">LATENCY</span>
              <span className="text-on-surface font-mono">14ms</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-2/3 shadow-[0_0_8px_#4edea3]"></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high/40 backdrop-blur-md p-3 rounded-lg border-l border-secondary/20 shadow-xl">
          <div className="text-[10px] text-on-surface-variant/60 font-headline font-bold uppercase tracking-widest mb-1">ENV_DATA</div>
          <div className="text-xl font-headline font-black text-on-surface">24°C / 42%</div>
          <div className="text-[9px] text-on-surface-variant/40 mt-1 uppercase leading-none tracking-tighter">OPTIMIZED HVAC ACTVE // SECTOR_G</div>
        </div>
      </div>
    </main>
  );
}
