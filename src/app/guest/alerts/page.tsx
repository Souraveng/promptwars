'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dataconnect, GOOGLE_MAPS_API_KEY } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { useGuest } from '../GuestContext';
import { EmergencyEvent } from '@/types/dataconnect';
import { GoogleGenAI } from '@google/genai';
import { formatBriefingPrompt, getFallbackBriefing, sortAlerts } from '@/lib/logic/alerts-logic';

export default function GuestAlertsPage() {
  const { activeTicket } = useGuest();
  const [alerts, setAlerts] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      let eventId = activeTicket?.eventId || null;

      if (!eventId) {
        const eventRef = queryRef<any, Record<string, never>>(dataconnect, 'GetActiveEvent', {});
        const eventResult = await executeQuery(eventRef);
        if (eventResult.data?.events?.[0]) {
          eventId = eventResult.data.events[0].id;
        }
      }

      const qRef = queryRef<any, { eventId: string | null }>(dataconnect, 'GetSystemAlerts', { 
        eventId: eventId 
      });
      const result = await executeQuery(qRef);
      
      const combined = sortAlerts([
        ...(result.data?.eventAlerts || []),
        ...(result.data?.communityAlerts || [])
      ]);
      
      setAlerts(combined);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 5000);
    return () => clearInterval(timer);
  }, [activeTicket]);

  const generateBriefing = async () => {
    if (alerts.length === 0) return;
    setIsAiLoading(true);
    try {
      const client = new GoogleGenAI({ apiKey: GOOGLE_MAPS_API_KEY });
      const prompt = formatBriefingPrompt(alerts as any);

      const response = await client.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      setAiSummary(response.text || getFallbackBriefing());
    } catch (err) {
      console.error('AI Briefing Error:', err);
      setAiSummary(getFallbackBriefing());
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (alerts.length > 0 && !aiSummary && !isAiLoading) {
      generateBriefing();
    }
  }, [alerts, aiSummary]);

  return (
    <main className="px-6 max-w-5xl mx-auto space-y-8 pt-8 min-h-[calc(100vh-8rem)] pb-24">
      {/* Hero Section */}
      <section>
        <h1 className="font-headline text-4xl font-bold tracking-tighter mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">System Broadcast</h1>
        <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.3em] font-bold">Secure Tactical Feed / Sentinel Lens 2.0</p>
      </section>

      {/* AI Briefing Card */}
      {alerts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-4">
                 <button 
                  onClick={generateBriefing}
                  aria-label="Refresh Briefing"
                  disabled={isAiLoading}
                  className={`text-primary hover:rotate-180 transition-transform duration-500 ${isAiLoading ? 'animate-spin' : ''}`}
                 >
                    <span className="material-symbols-outlined text-sm">sync</span>
                 </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                 Tactical Intelligence Brief
              </p>
              {aiSummary ? (
                <p className="text-sm font-bold text-on-surface leading-relaxed animate-in fade-in duration-1000">
                  {aiSummary}
                </p>
              ) : (
                <div className="space-y-2 opacity-20">
                  <div className="h-2 w-full bg-primary/20 rounded-full"></div>
                  <div className="h-2 w-2/3 bg-primary/20 rounded-full"></div>
                </div>
              )}
           </div>
        </section>
      )}

      {/* Connection Status */}
      <div className="bg-[#222a3e]/40 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary shadow-[0_0_10px_#4edea3]"></span>
          </span>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface font-bold">Secure Feed Active</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-on-surface-variant px-2 py-0.5 rounded bg-white/5 border border-white/5">LATENCY: 12ms</span>
          <span className="font-mono text-[10px] text-on-surface-variant font-bold">V-2.1.0_PRO</span>
        </div>
      </div>

      {/* Alerts Feed */}
      <section className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30" role="status" aria-label="Loading alerts">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-label text-xs uppercase tracking-widest">Decrypting signals...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
            <span className="material-symbols-outlined text-6xl" aria-hidden="true">radar</span>
            <p className="font-label text-xs uppercase tracking-widest">No active transmissions</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isTactical = alert.priority === 'HIGH';
            const isGlobal = !alert.eventId;
            
            return (
              <div 
                key={alert.id} 
                className={`group relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]
                  ${isTactical 
                    ? 'bg-error/5 border-error/20 shadow-[0_0_40px_rgba(244,63,94,0.1)]' 
                    : isGlobal 
                    ? 'bg-secondary/5 border-secondary/20' 
                    : 'bg-surface-container-low border-white/5'}`}
              >
                {/* Background Accent */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-transform duration-700 group-hover:scale-150
                  ${isTactical ? 'bg-error' : 'bg-primary'}`} aria-hidden="true"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${isTactical ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
                      <span className="material-symbols-outlined text-xl" aria-hidden="true">
                        {isTactical ? 'warning' : isGlobal ? 'campaign' : 'info'}
                      </span>
                    </div>
                    <div>
                      <span className={`font-label text-[10px] uppercase font-bold tracking-[0.2em] block
                        ${isTactical ? 'text-error' : 'text-secondary'}`}>
                        {isTactical ? 'PRIORITY OVERRIDE' : isGlobal ? 'COMMUNITY ALERT' : 'SYSTEM NOTICE'}
                      </span>
                      <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-tighter">
                        {isGlobal ? 'GLOBAL BROADCAST' : `EVENT_ID: ...${alert.eventId?.slice(-6)}`}
                      </span>
                    </div>
                  </div>
                  <time className="text-[10px] font-mono text-on-surface-variant font-bold bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>

                <h3 className={`font-headline text-xl font-bold mb-2 relative z-10 tracking-tight
                  ${isTactical ? 'text-error shadow-error/20' : 'text-on-surface'}`}>
                  {alert.type}
                </h3>
                
                <p className="font-body text-sm text-on-surface-variant leading-relaxed relative z-10 max-w-2xl">
                  {alert.details}
                </p>

                {/* Tactical HUD Element */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                   <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 grayscale opacity-50">
                         <span className="material-symbols-outlined text-[14px]" aria-hidden="true">share</span>
                         <span className="text-[9px] font-bold uppercase tracking-widest italic">Encrypted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <span className="material-symbols-outlined text-[14px] text-primary" aria-hidden="true">visibility</span>
                         <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70">Verified</span>
                      </div>
                   </div>
                   <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
                      <div className={`h-full w-2/3 ${isTactical ? 'bg-error' : 'bg-secondary'} animate-pulse`}></div>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
