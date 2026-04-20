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
      <div className="absolute inset-0 z-0">
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

      {/* Mini Layout Overlay (Phone View Customization) */}
      <div className={`absolute top-24 left-6 right-6 bottom-40 z-30 transition-all duration-700 transform ${showMiniMap ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="w-full h-full bg-[#0A0C10]/95 backdrop-blur-2xl rounded-[2.5rem] border border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">view_quilt</span>
              <div>
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Tactical Layout</h3>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase">Indoor Orientation Array</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMiniMap(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 p-4">
             <TacticalLayoutRenderer 
               elements={layoutElements}
               highlightSeat={activeTicket?.seat}
               highlightGate={activeTicket?.gate}
             />
          </div>
        </div>
      </div>

      {/* Floating UI: Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-10">
        <div className="bg-[#222a3e]/60 backdrop-blur-xl rounded-xl flex items-center px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.4)] border-l border-primary/20">
          <span className="material-symbols-outlined text-surface-tint mr-3" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm font-label uppercase tracking-widest text-on-surface placeholder-on-surface-variant/40 w-full" placeholder="LOCATE SECTION, SEAT, OR AMENITY" type="text"/>
          <span className="material-symbols-outlined text-on-surface-variant/40" data-icon="mic">mic</span>
        </div>
      </div>

      {/* Floating UI: Tactical Controls */}
      <div className="absolute top-24 left-6 flex flex-col gap-4 z-10">
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

      {/* Floating UI: Floor Selection (Simplified) */}
      <div className="absolute top-24 right-6 flex flex-col gap-2 z-10">
        {['L3', 'L2', 'L1'].map(floor => (
          <button key={floor} className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline text-xs font-bold transition-all ${floor === 'L1' ? 'bg-primary text-on-primary shadow-lg border border-primary/20' : 'bg-[#222a3e]/40 backdrop-blur-md text-on-surface-variant/40 border border-white/5'}`}>
            {floor}
          </button>
        ))}
      </div>

      {/* Info Overlay: Route Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-20">
        <div className="bg-[#222a3e]/60 backdrop-blur-xl rounded-xl overflow-hidden relative border-t border-primary/10 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
          {/* Scanning line effect */}
          <div className="absolute left-0 -top-[100px] w-full h-[100px] bg-gradient-to-b from-transparent via-[rgba(194,198,214,0.05)] to-transparent pointer-events-none animate-[scan_3s_linear_infinite]"></div>
          
          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-label font-bold text-secondary uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" data-icon="verified" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  AUTHENTICATED ACCESS
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">Active Zone: {activeTicket?.section}-{activeTicket?.seat}</h2>
                <p className="text-xs text-on-surface-variant/70 font-label flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-[14px]">stadium</span>
                  {activeTicket?.event?.venueName} • Level 1
                </p>
              </div>
              <div className="bg-primary/20 px-3 py-1 rounded text-primary font-headline text-[10px] font-bold border border-primary/20 uppercase tracking-widest">
                GATE {activeTicket?.gate}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest p-3 rounded-2xl border border-white/5">
                <div className="text-[9px] text-on-surface-variant/50 font-label uppercase mb-1">Section</div>
                <div className="text-sm font-headline font-bold text-secondary">{activeTicket?.section}</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-2xl border border-white/5">
                <div className="text-[9px] text-on-surface-variant/50 font-label uppercase mb-1">Row</div>
                <div className="text-sm font-headline font-bold text-on-surface">{activeTicket?.row}</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-2xl border border-white/5">
                <div className="text-[9px] text-on-surface-variant/50 font-label uppercase mb-1">Seat</div>
                <div className="text-sm font-headline font-bold text-primary">{activeTicket?.seat}</div>
              </div>
            </div>

            <button 
              onClick={() => setShowMiniMap(true)}
              className="w-full bg-gradient-to-r from-primary to-primary-container py-4 rounded-2xl font-headline font-bold text-on-primary-container uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" data-icon="explore">explore</span>
              Open Tactical Layout
            </button>
          </div>
        </div>
      </div>
      
      {/* Contextual Telemetry (Decorative Side Elements) */}
      <div className="hidden md:flex fixed right-6 top-64 flex-col gap-6 w-48 z-40">
        <div className="bg-surface-container-high/40 backdrop-blur-md p-3 rounded-lg border-l border-primary/20">
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
              <div className="bg-secondary h-full w-2/3"></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high/40 backdrop-blur-md p-3 rounded-lg border-l border-primary/20">
          <div className="text-[10px] text-on-surface-variant/60 font-headline font-bold uppercase tracking-widest mb-1">ENV_DATA</div>
          <div className="text-xl font-headline font-bold text-on-surface">24°C / 42%</div>
          <div className="text-[9px] text-on-surface-variant/40 mt-1">OPTIMIZED HVAC ACTVE</div>
        </div>
      </div>
    </main>
  );
}
