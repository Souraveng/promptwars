'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { dataconnect, GOOGLE_MAPS_API_KEY } from '@/lib/firebase-client';
import { mutationRef, executeMutation, executeQuery, queryRef } from 'firebase/data-connect';
import { GetActiveEventData, LogEmergencyEventVariables } from '@/types/dataconnect';
import { GoogleGenAI } from '@google/genai';
import { formatTriagePrompt, parseAiAdvice, getFallbackAdvice } from '@/lib/logic/medical-logic';

export default function GuestMedicalPage() {
  const router = useRouter();
  const { lat, lng, loading: locationLoading, error: locationError, getLocation, isMock } = useLocation();
  const [isTriggered, setIsTriggered] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const qRef = queryRef<GetActiveEventData, Record<string, never>>(dataconnect, 'GetActiveEvent', {});
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

  const getAiFirstAidAdvice = async (symptoms: string[]) => {
    setIsAiLoading(true);
    try {
      const client = new GoogleGenAI({ apiKey: GOOGLE_MAPS_API_KEY });
      const prompt = formatTriagePrompt(symptoms);

      const response = await client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      setAiAdvice(response.text || getFallbackAdvice());
    } catch (err) {
      console.error('AI Triage Error:', err);
      setAiAdvice(getFallbackAdvice());
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTrigger = async () => {
    if (selectedIds.length === 0 || isTriggered) return;
    setIsTriggered(true);
    
    // Vibrate device if supported
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }

    // Call AI Triage in background
    getAiFirstAidAdvice(selectedIds);

    try {
      // 1. Get Live Location
      const coords = await getLocation();
      
      // 2. Log to Backend
      const ref = mutationRef<any, LogEmergencyEventVariables>(dataconnect, 'LogEmergencyEvent', {
        type: 'MEDICAL TRIGGERED',
        priority: 'HIGH',
        details: `TRIAGE_REQUEST: ${selectedIds.join(', ')}${isMock ? ' (MOCK_GPS)' : ''}`,
        lat: coords.lat,
        lng: coords.lng,
        eventId: activeEventId
      });
      await executeMutation(ref);
      
      console.log('Medical emergency logged successfully');
    } catch (err) {
      console.error('Failed to log medical emergency (Detailed):', err);
      // Fallback
      try {
        const fallbackRef = mutationRef<any, LogEmergencyEventVariables>(dataconnect, 'LogEmergencyEvent', {
          type: 'MEDICAL TRIGGERED',
          priority: 'HIGH',
          details: `TRIAGE_REQUEST: ${selectedIds.join(', ')} (NO_LOCATION)${isMock ? ' [MOCK_FAIL]' : ''}`,
          lat: null,
          lng: null,
          eventId: activeEventId
        });
        await executeMutation(fallbackRef);
      } catch (innerErr) {
        console.error('Final fallback log failed (Detailed):', innerErr);
      }
    }
  };

  const toggleSelection = (id: string) => {
    if (isTriggered) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const categories = [
    {
      id: 'allergic',
      title: 'Allergic Reaction',
      desc: 'Anaphylaxis protocol activation. Monitor airway patency and administer epinephrine if available.',
      icon: 'vaccines',
      priority: 'PRIORITY_02',
      color: 'primary',
      colSpan: 'md:col-span-2'
    },
    {
      id: 'injury',
      title: 'Severe Injury',
      desc: 'Trauma baseline. Apply direct pressure to wound site. Elevate limb if appropriate.',
      icon: 'emergency',
      priority: 'URGENT',
      color: 'tertiary',
      colSpan: 'md:col-span-1'
    },
    {
      id: 'cardiac',
      title: 'Chest Pain',
      desc: 'Cardiac distress detected. Position patient in comfortable seated stance. No physical exertion.',
      icon: 'monitor_heart',
      priority: 'PRIORITY_01',
      color: 'primary',
      colSpan: 'md:col-span-1'
    },
    {
      id: 'general',
      title: 'General First Aid',
      desc: 'Minor lacerations, heat exhaustion, or general discomfort. Dispatch initiated.',
      icon: 'medical_services',
      priority: 'STANDARD',
      color: 'secondary',
      colSpan: 'md:col-span-2'
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Top Tactical Header */}
      <header className="fixed top-0 w-full z-30 bg-[#0B1326]/60 backdrop-blur-md flex justify-between items-center h-16 px-6 shadow-[0_1px_0_0_rgba(219,226,253,0.05)]" role="banner">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${isTriggered ? 'text-tertiary animate-pulse' : 'text-primary'}`} aria-hidden="true">medical_services</span>
          <h1 className="text-sm font-bold tracking-[0.2em] text-[#DBE2FD] font-headline uppercase">
            {isTriggered ? 'Emergency Activated' : 'Medical Triage'}
          </h1>
        </div>
        <div className="font-headline uppercase tracking-widest text-xs text-[#DBE2FD]/60">SENTINEL LENS</div>
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-24 px-6 relative overflow-y-auto scroll-smooth">
        
        {isTriggered && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500 mb-6" aria-labelledby="ai-triage-title">
            <div className="glass-card p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 relative overflow-hidden" role="region" aria-live="polite">
              <div className="absolute top-0 right-0 p-4">
                <span className="material-symbols-outlined text-primary animate-spin text-sm" aria-hidden="true" style={{ display: isAiLoading ? 'block' : 'none' }}>sync</span>
              </div>
              <h2 id="ai-triage-title" className="font-headline text-sm font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">psychiatry</span>
                AI Triage Protocols
              </h2>
              {aiAdvice ? (
                <div className="space-y-2">
                  {parseAiAdvice(aiAdvice).map((line, i) => (
                    <p key={i} className="text-[12px] font-bold text-on-surface flex items-start gap-2">
                      <span className="text-primary mt-0.5" aria-hidden="true">»</span>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="h-20 flex flex-col items-center justify-center gap-2" role="status" aria-label="Analyzing symptoms">
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-shimmer" style={{ width: '60%' }}></div>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">Analyzing Symptoms...</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Telemetry Grid */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl border border-white/5">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">SYSTEM STATUS</p>
            <p className={`font-headline text-2xl font-bold ${isTriggered ? 'text-tertiary shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'text-secondary'}`}>
              {isTriggered ? 'ALERT SENT' : 'NOMINAL'}
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 text-right">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">EST. RESPONSE</p>
            <p className="font-headline text-2xl font-bold text-primary">{isTriggered ? 'EN ROUTE' : '02:45 MIN'}</p>
          </div>
        </section>

        {/* Location Lock */}
        <section className="glass-card p-6 rounded-2xl mb-6 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTriggered ? 'bg-tertiary animate-ping shadow-[0_0_15px_#f43f5e]' : 'bg-secondary animate-pulse shadow-[0_0_10px_#4edea3]'}`}></div>
              <span className={`text-[10px] font-label uppercase tracking-widest ${isTriggered ? 'text-tertiary' : 'text-secondary'}`}>
                {isTriggered ? 'Live Beacon Active' : 'GPS Lock'}
              </span>
            </div>
          </div>
          <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant block mb-1">Current Sector</label>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Section 114, Row G</h2>
        </section>

        {/* Option Grid */}
        <section className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transition-all`} aria-label="Medical categories">
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <button 
                key={cat.id}
                onClick={() => toggleSelection(cat.id)}
                aria-pressed={isSelected}
                aria-label={`${cat.title}: ${cat.desc}. Priority ${cat.priority}`}
                className={`${cat.colSpan} glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group text-left transition-all border ${isSelected ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/5'} ${isTriggered && !isSelected ? 'opacity-30 pointer-events-none' : ''} active:scale-95`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" aria-hidden="true"></div>
                
                {/* Selection Dot */}
                <div className="absolute top-4 right-4 flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-on-surface-variant/30'}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>

                <div className="flex justify-between items-start z-10 mb-8">
                  <span className={`material-symbols-outlined text-${cat.color} text-4xl`} aria-hidden="true">{cat.icon}</span>
                  <span className={`font-label text-[10px] px-2 py-1 rounded bg-${cat.color}/10 text-${cat.color}`}>{cat.priority}</span>
                </div>
                <div className="z-10">
                  <h3 className="font-headline text-xl font-bold mb-1">{cat.title}</h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </section>

        {/* Immediate Assistance CTA */}
        <button 
          onClick={handleTrigger}
          disabled={selectedIds.length === 0 && !isTriggered}
          className={`w-full h-20 rounded-2xl relative overflow-hidden group mb-4 transition-all ${isTriggered ? 'opacity-100' : selectedIds.length > 0 ? 'opacity-100 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : 'opacity-50 grayscale'}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${isTriggered ? 'from-tertiary to-error' : 'from-primary to-[#1d4ed8]'} transition-transform duration-500 group-hover:scale-105`}></div>
          <div className={`absolute inset-0 ${isTriggered ? 'shadow-[0_0_60px_rgba(244,63,94,0.8)]' : ''}`}></div>
          <div className="relative flex items-center justify-center gap-4 z-10">
            <span className="material-symbols-outlined text-white text-3xl" data-icon={isTriggered ? "emergency_share" : "notifications_active"} style={{ fontVariationSettings: "'FILL' 1" }}>{isTriggered ? "emergency_share" : "notifications_active"}</span>
            <span className="font-headline font-bold text-xl uppercase tracking-[0.15em] text-white">
              {isTriggered ? "Signal Dispatched" : "Request Dispatch"}
            </span>
          </div>
          <div className="scanning-line opacity-30"></div>
        </button>
      </main>

      {/* Bottom Tactical Nav */}
      <footer className="fixed bottom-0 w-full z-30 pb-safe bg-[#0B1326]/80 backdrop-blur-lg flex justify-around items-center h-20 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
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

