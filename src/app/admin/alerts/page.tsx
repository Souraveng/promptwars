'use client';

import React, { useState, useEffect } from 'react';
import { dataconnect } from '@/lib/firebase-client';
import { executeMutation, executeQuery, mutationRef, queryRef } from 'firebase/data-connect';
import { ListEventsData, Event, LogEmergencyEventVariables } from '@/types/dataconnect';
import { enhanceBroadcastText } from '@/app/actions/ai';

export default function AlertsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'EVENT' | 'GLOBAL'>('EVENT');
  const [broadcastType, setBroadcastType] = useState<'tactical' | 'promotional'>('tactical');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const qRef = queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {});
        const result = await executeQuery(qRef);
        if (result.data?.events) {
          setEvents(result.data.events);
          const active = result.data.events.find(e => e.isActive);
          if (active) setSelectedEventId(active.id);
          else if (result.data.events.length > 0) setSelectedEventId(result.data.events[0].id);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    };
    fetchEvents();
  }, []);

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

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText) return;
    if (broadcastTarget === 'EVENT' && !selectedEventId) {
      setStatusMessage({ type: 'error', text: 'Please select a target event.' });
      return;
    }

    setIsBroadcasting(true);
    setStatusMessage(null);
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
      setStatusMessage({ type: 'success', text: 'Broadcast dispatched successfully!' });
    } catch (err: any) {
      console.error('Broadcast failed:', err);
      setStatusMessage({ type: 'error', text: 'Broadcast failed: ' + err.message });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const applyTemplate = (text: string) => {
    setBroadcastText(text);
    setBroadcastType('tactical');
  };

  return (
    <div className="flex flex-col bg-background relative max-w-7xl mx-auto z-10 w-full p-4 sm:p-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface mb-2 italic uppercase">Broadcast Hub</h1>
          <p className="text-sm text-on-surface-variant font-body">Manage emergency communications and tactical PWA updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#4edea3]"></div>
            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary font-bold">PWA Network Active</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 overflow-hidden">
        {/* Left Column: Composer */}
        <div className="col-span-12 lg:col-span-12 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-[2.5rem] p-8 relative overflow-hidden border border-outline-variant/10 shadow-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_20px_var(--color-primary)]"></div>
            
            <form onSubmit={handleSendBroadcast} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Target Section */}
                <div className="space-y-4">
                  <label className="block font-label text-[10px] uppercase tracking-[0.3em] font-black text-on-surface-variant">Command Scope</label>
                  <div className="flex p-1.5 bg-surface-container rounded-2xl border border-outline-variant/10 gap-2">
                    <button 
                      type="button"
                      onClick={() => setBroadcastTarget('EVENT')}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${broadcastTarget === 'EVENT' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:bg-white/5'}`}
                    >
                      Event Specific
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBroadcastTarget('GLOBAL')}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${broadcastTarget === 'GLOBAL' ? 'bg-secondary text-white shadow-lg' : 'text-on-surface-variant hover:bg-white/5'}`}
                    >
                      Community (Global)
                    </button>
                  </div>

                  {broadcastTarget === 'EVENT' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <select 
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:border-primary/50 transition-all"
                      >
                        <option value="">Select Target Event...</option>
                        {events.map(e => (
                          <option key={e.id} value={e.id}>{e.title} {e.isActive ? '(ACTIVE)' : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Operations Mode */}
                <div className="space-y-4">
                  <label className="block font-label text-[10px] uppercase tracking-[0.3em] font-black text-on-surface-variant">Operations Mode</label>
                  <div className="flex p-1.5 bg-surface-container rounded-2xl border border-outline-variant/10 gap-2">
                    <button 
                      type="button"
                      onClick={() => setBroadcastType('tactical')}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${broadcastType === 'tactical' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant opacity-50'}`}
                    >
                      Tactical Brief
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBroadcastType('promotional')}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${broadcastType === 'promotional' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'text-on-surface-variant opacity-50'}`}
                    >
                      Promotional
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Composer */}
              <div className="relative group">
                <label className="block font-label text-[10px] uppercase tracking-[0.3em] font-black text-on-surface-variant mb-4">Transmission Content</label>
                <div className="relative">
                  <textarea 
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-[2rem] p-6 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 min-h-[200px] resize-none transition-all shadow-inner font-mono" 
                    placeholder="Enter urgent tactical update or community briefing..."
                  />
                  
                  <button 
                    type="button"
                    onClick={handleAIByGemini}
                    disabled={isEnhancing || !broadcastText}
                    className="absolute right-6 bottom-6 p-4 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 group/ai"
                  >
                    <span className={`material-symbols-outlined text-lg ${isEnhancing ? 'animate-spin' : 'group-hover/ai:rotate-12 transition-transform'}`}>auto_awesome</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Enhance briefing</span>
                  </button>
                </div>
              </div>

              {/* Status & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-6">
                <div className="flex flex-wrap items-center gap-6">
                   {statusMessage && (
                     <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in fade-in duration-300 ${statusMessage.type === 'success' ? 'text-secondary' : 'text-error'}`}>
                       <span className="material-symbols-outlined text-sm">{statusMessage.type === 'success' ? 'done_all' : 'error'}</span>
                       {statusMessage.text}
                     </div>
                   )}
                </div>
                
                <button 
                  type="submit"
                  disabled={isBroadcasting || !broadcastText}
                  className="bg-primary text-on-primary w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(var(--color-primary-rgb),0.3)] disabled:opacity-50"
                >
                  {isBroadcasting ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined">send</span>
                  )}
                  Execute Broadcast
                </button>
              </div>
            </form>
          </div>

          {/* Quick Hub Templates */}
          <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/10 grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={() => applyTemplate("High traffic detected at North Gate. Please redirect visitors to East Gate for immediate clearance.")} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5 text-left hover:border-primary/20 transition-all group">
              <span className="text-[9px] font-black text-primary uppercase block mb-1">Gate Flow</span>
              <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">Congestion at North Gate...</p>
            </button>
            <button onClick={() => applyTemplate("Severe lightning detected within 5 miles. Initiate immediate shelter-in-place protocol for all open-air sections.")} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5 text-left hover:border-error/20 transition-all group">
              <span className="text-[9px] font-black text-error uppercase block mb-1">Weather Alert</span>
              <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">Lightning detected nearby...</p>
            </button>
            <button onClick={() => applyTemplate("Technical delay in arena setup. Main event starts in T-minus 20 minutes. Concourse amenities remain open.")} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5 text-left hover:border-secondary/20 transition-all group">
              <span className="text-[9px] font-black text-secondary uppercase block mb-1">Schedule Log</span>
              <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">Event delay update...</p>
            </button>
            <button onClick={() => applyTemplate("Limited edition merchandise now available at Store 14. Stock levels indicate immediate sell-out potential.")} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/5 text-left hover:border-primary/20 transition-all group">
              <span className="text-[9px] font-black text-primary uppercase block mb-1">Promo Drop</span>
              <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">Merch drop alert...</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
