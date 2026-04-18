'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { dataconnect } from '@/lib/firebase-client';
import { mutationRef, executeMutation, executeQuery, queryRef } from 'firebase/data-connect';
import { GetActiveEventData, LogEmergencyEventVariables } from '@/types/dataconnect';

export default function GuestSecurityPage() {
  const router = useRouter();
  const { lat, lng, getLocation, isMock } = useLocation();
  const [isTriggered, setIsTriggered] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const qRef = queryRef<GetActiveEventData, {}>(dataconnect, 'GetActiveEvent', {});
        const result = await executeQuery(qRef);
        if (result.data?.events && result.data.events.length > 0) {
          setActiveEventId(result.data.events[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch active event info:', err);
      }
    };
    fetchActiveEvent();
  }, []);

  const handleTrigger = async () => {
    if (selectedIds.length === 0 || isTriggered) return;
    setIsTriggered(true);
    
    // Vibrate device if supported
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }

    try {
      // 1. Get Live Location
      const coords = await getLocation();
      
      // 2. Log to Backend
      const ref = mutationRef<any, LogEmergencyEventVariables>(dataconnect, 'LogEmergencyEvent', {
        type: 'SECURITY TRIGGERED',
        priority: 'HIGH',
        details: `UNIT_REQUEST: ${selectedIds.join(', ')}${isMock ? ' (MOCK_LOC)' : ''}`,
        lat: coords.lat,
        lng: coords.lng,
        eventId: activeEventId
      });
      await executeMutation(ref);
      
      console.log('Security emergency logged successfully');
    } catch (err) {
      console.error('Failed to log security emergency:', err);
      // Fallback
      try {
        const fallbackRef = mutationRef<any, LogEmergencyEventVariables>(dataconnect, 'LogEmergencyEvent', {
          type: 'SECURITY TRIGGERED',
          priority: 'HIGH',
          details: `UNIT_REQUEST: ${selectedIds.join(', ')} (NO_LOCATION)${isMock ? ' [MOCK_FAIL]' : ''}`,
          lat: null,
          lng: null,
          eventId: activeEventId
        });
        await executeMutation(fallbackRef);
      } catch (innerErr) {
        console.error('Final fallback log failed:', innerErr);
      }
    }
  };

  const toggleSelection = (id: string) => {
    if (isTriggered) return;
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const categories = [
    {
      id: 'conflict',
      title: 'Physical Conflict',
      desc: 'Active altercation or aggressive behavior. Maintain safe distance and wait for intervention.',
      icon: 'swords',
      priority: 'CRITICAL',
      color: 'tertiary',
      colSpan: 'md:col-span-2'
    },
    {
      id: 'suspicious',
      title: 'Suspicious Activity',
      desc: 'Unattended baggage or suspicious behavior observed in the immediate vicinity.',
      icon: 'visibility',
      priority: 'URGENT',
      color: 'primary',
      colSpan: 'md:col-span-1'
    },
    {
      id: 'theft',
      title: 'Theft / Lost Property',
      desc: 'Missing belongings or observed theft. Report details for surveillance review.',
      icon: 'inventory_2',
      priority: 'STANDARD',
      color: 'secondary',
      colSpan: 'md:col-span-1'
    },
    {
      id: 'harassment',
      title: 'Harassment',
      desc: 'Code of conduct violation. Security dispatched for guest protection and resolution.',
      icon: 'gavel',
      priority: 'URGENCY_HIGH',
      color: 'primary',
      colSpan: 'md:col-span-2'
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Top Tactical Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0B1326]/60 backdrop-blur-md flex justify-between items-center h-16 px-6 shadow-[0_1px_0_0_rgba(219,226,253,0.05)]">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${isTriggered ? 'text-tertiary animate-pulse' : 'text-primary'}`} data-icon="policy">policy</span>
          <span className="text-sm font-bold tracking-[0.2em] text-[#DBE2FD] font-headline uppercase">
            {isTriggered ? 'SECURITY LOCK' : 'Security Protocol'}
          </span>
        </div>
        <div className="font-headline uppercase tracking-widest text-xs text-[#DBE2FD]/60">SENTINEL LENS</div>
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-24 px-6 relative overflow-y-auto scroll-smooth text-on-surface">
        {/* Telemetry Grid */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl border border-white/5">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">UNIT STATUS</p>
            <p className={`font-headline text-2xl font-bold ${isTriggered ? 'text-tertiary shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'text-secondary'}`}>
              {isTriggered ? 'DEPLOYED' : 'DISPATCHING'}
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 text-right">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">GPS LOCK</p>
            <p className={`font-headline text-sm font-bold truncate ${lat ? 'text-secondary' : 'text-tertiary animate-pulse'}`}>
              {lat ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'ACQUIRING...'}
            </p>
          </div>
        </section>

        {/* Location Lock */}
        <section className="glass-card p-6 rounded-2xl mb-6 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTriggered ? 'bg-error animate-ping shadow-[0_0_15px_#f43f5e]' : 'bg-tertiary animate-pulse shadow-[0_0_10px_#f43f5e]'}`}></div>
              <span className={`text-[10px] font-label uppercase tracking-widest ${isTriggered ? 'text-error' : 'text-tertiary'}`}>
                {isTriggered ? 'Tactical Lock Active' : 'Tactical Lock'}
              </span>
            </div>
          </div>
          <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant block mb-1">Target Sector</label>
          <h2 className="font-headline text-3xl font-bold tracking-tight">Section 114, Row G</h2>
        </section>

        {/* Option Grid */}
        <section className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transition-opacity ${isTriggered ? 'opacity-50 pointer-events-none' : ''}`}>
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <div 
                key={cat.id}
                onClick={() => toggleSelection(cat.id)}
                className={`${cat.colSpan} glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:bg-surface-container-high transition-all active:scale-95 ${isSelected ? 'ring-2 ring-tertiary bg-tertiary/10 border-tertiary/30' : 'border-white/5'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                {/* Selection Dot */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isSelected ? 'bg-tertiary border-tertiary shadow-[0_0_10px_#f43f5e]' : 'border-on-surface-variant/30'}`}></div>
                </div>

                <div className="flex justify-between items-start z-10 mb-8">
                  <span className={`material-symbols-outlined text-${cat.color} text-4xl`} data-icon={cat.icon}>{cat.icon}</span>
                  <span className={`font-label text-[10px] px-2 py-1 rounded bg-${cat.color}/10 text-${cat.color}`}>{cat.priority}</span>
                </div>
                <div className="z-10">
                  <h3 className="font-headline text-xl font-bold mb-1">{cat.title}</h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Immediate Assistance CTA */}
        <button 
          onClick={handleTrigger}
          disabled={selectedIds.length === 0}
          className={`w-full h-20 rounded-2xl relative overflow-hidden group mb-4 transition-all ${isTriggered ? 'opacity-100 shadow-[0_0_40px_rgba(244,63,94,0.6)]' : selectedIds.length > 0 ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${isTriggered ? 'from-error to-[#7f1d1d]' : 'from-tertiary-container to-tertiary'} transition-transform duration-500 group-hover:scale-105`}></div>
          <div className={`absolute inset-0 ${isTriggered ? '' : 'shadow-[0_0_40px_rgba(244,63,94,0.4)]'}`}></div>
          <div className="relative flex items-center justify-center gap-4 z-10">
            <span className="material-symbols-outlined text-on-tertiary-container text-3xl" data-icon={isTriggered ? "lock_open" : "security"} style={{ fontVariationSettings: "'FILL' 1" }}>{isTriggered ? "lock_open" : "security"}</span>
            <span className="font-headline font-bold text-xl uppercase tracking-[0.15em] text-on-tertiary-container text-shadow-sm">
              {isTriggered ? "Units Dispatched" : "Dispatch Units"}
            </span>
          </div>
          <div className="scanning-line opacity-30"></div>
        </button>
      </main>

      {/* Bottom Tactical Nav */}
      <footer className="fixed bottom-0 w-full z-50 pb-safe bg-[#0B1326]/80 backdrop-blur-lg flex justify-around items-center h-20 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => router.push('/guest/sos')}
          className="flex flex-col items-center justify-center text-[#DBE2FD]/40 active:scale-90 transition-all duration-300"
        >
          <span className="material-symbols-outlined mb-1" data-icon="arrow_back">arrow_back</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-tighter">Back to SOS</span>
        </button>
        <button 
          onClick={() => router.push('/guest/alerts')}
          className="flex flex-col items-center justify-center text-primary active:scale-90 transition-all duration-300"
        >
          <span className="material-symbols-outlined mb-1" data-icon="notifications">notifications</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>
      </footer>
    </div>
  );
}
