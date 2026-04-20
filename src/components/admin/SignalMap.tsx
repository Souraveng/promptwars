import React, { useState, useEffect, memo } from 'react';
import { GoogleMap, InfoWindow, HeatmapLayer } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, MAP_LIBRARIES, DEFAULT_MAP_ID } from '@/lib/firebase-client';
import { EmergencyEvent, Event } from '@/types/dataconnect';

interface SignalMapProps {
  selectedEvent: Event;
  emergencyEvents: EmergencyEvent[];
}

/**
 * Tactical Signal Map
 * Optimized with Advanced Marker Element and memoization for high-refresh monitoring.
 */
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

const SignalMap = memo(({ selectedEvent, emergencyEvents }: SignalMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<EmergencyEvent | null>(null);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={{ lat: selectedEvent.venueLat, lng: selectedEvent.venueLng }}
      zoom={16}
      onLoad={m => setMap(m)}
      options={{ 
        mapId: DEFAULT_MAP_ID,
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
          options={{ radius: 30, opacity: 0.5 }}
        />
      )}

      {/* Venue Center */}
      <AdvancedMarker 
        map={map}
        position={{ lat: selectedEvent.venueLat, lng: selectedEvent.venueLng }}
        title="VENUE CENTER"
        iconUrl="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      />
      
      {/* Dynamic Incident Markers */}
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
          position={{ lat: selectedMarker.lat!, lng: selectedMarker.lng! }}
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
  );
});

SignalMap.displayName = 'SignalMap';
export default SignalMap;
