import { useState, useCallback } from 'react';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  isMock?: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    error: null,
    loading: false,
    isMock: false,
  });

  const getLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      const isDev = typeof window !== 'undefined' && 
                   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (!navigator.geolocation) {
        if (isDev) {
          console.warn('[Location] Geolocation not supported. Using Mock coordinates.');
          const mock = { lat: 34.0522, lng: -118.2437, isMock: true };
          setState(prev => ({ ...prev, ...mock, loading: false }));
          resolve(mock);
          return;
        }
        const err = 'Geolocation is not supported by your browser';
        setState(prev => ({ ...prev, error: err, loading: false }));
        reject(err);
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({
            ...coords,
            error: null,
            loading: false,
            isMock: false,
          });
          resolve(coords);
        },
        (error) => {
          if (isDev) {
            console.warn(`[Location] Real GPS failed (${error.message}). Falling back to Mock.`);
            const mock = { lat: 34.0522, lng: -118.2437, isMock: true };
            setState(prev => ({ ...prev, ...mock, loading: false }));
            resolve(mock);
            return;
          }

          let errorMessage = 'An unknown error occurred while fetching location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
          }
          setState(prev => ({ ...prev, error: errorMessage, loading: false }));
          reject(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return { ...state, getLocation };
}
