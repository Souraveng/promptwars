'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuest } from '../GuestContext';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { dataconnect } from '@/lib/firebase-client';
import { ListEventsData, Event } from '@/types/dataconnect';

export default function GuestDashboardPage() {
  const router = useRouter();
  const { user, profile, activeTicket, tickets, loading: guestLoading } = useGuest();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eRef = queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {});
        const result = await executeQuery(eRef);
        if (result.data?.events) setEvents(result.data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (guestLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeTicketsCount = tickets.filter(t => t.event.isActive).length;

  return (
    <main className="px-4 py-8 max-w-7xl mx-auto space-y-10">
      
      {/* Hero / Greeting */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Authenticated Operative</p>
          <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter">
            HELLO, <span className="text-on-surface-variant font-light">{profile?.name.split(' ')[0].toUpperCase() || 'USER'}</span>
          </h1>
        </div>
        {activeTicket && (
          <div className="hidden md:flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Deployment: {activeTicket.event.title}</span>
          </div>
        )}
      </section>

      {/* ── Active Ticket Highlight ── */}
      {activeTicket ? (
        <section className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary-container rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
           <div className="relative bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              {/* Event Banner Sub-card */}
              <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shadow-xl border border-outline-variant/20 shrink-0">
                <img 
                  src={activeTicket.event.bannerUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt={activeTicket.event.title}
                />
              </div>

              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border mb-4 ${activeTicket.event.isActive ? 'bg-primary/20 text-primary border-primary/30' : 'bg-on-surface/5 text-on-surface-variant border-outline-variant/20'}`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${activeTicket.event.isActive ? 'bg-primary animate-pulse' : 'bg-outline-variant/40'}`} />
                     {activeTicket.event.isActive ? 'LIVE ACCESS GRANTED' : 'SCHEDULED DEPLOYMENT'}
                   </span>
                   <h2 className="font-headline text-3xl font-black tracking-tight">{activeTicket.event.title}</h2>
                   <p className="text-on-surface-variant flex items-center justify-center md:justify-start gap-2 font-medium mt-1">
                      <span className="material-symbols-outlined text-lg opacity-40">location_on</span>
                      {activeTicket.event.venueName}
                   </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                   <StatBlock label="Gate" value={activeTicket.gate} />
                   <StatBlock label="Section" value={activeTicket.section} />
                   <StatBlock label="Row" value={activeTicket.row} />
                   <StatBlock label="Seat" value={activeTicket.seat} />
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3">
                 <button 
                   onClick={() => router.push(activeTicket.event.isActive ? '/guest/sos' : '/guest/tickets')}
                   className="w-full md:w-48 py-4 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-[0_8px_24px_rgba(78,222,163,0.3)] hover:translate-y-[-2px] active:translate-y-[0] transition-all"
                 >
                   {activeTicket.event.isActive ? 'Open Tactical OS' : 'Identify Pass'}
                 </button>
                 <button 
                    onClick={() => router.push('/guest/tickets')}
                    className="w-full md:w-48 py-4 bg-surface-container-highest/20 hover:bg-surface-container-highest/40 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-outline-variant/10 transition-all"
                 >
                   View Security ID
                 </button>
              </div>
           </div>
        </section>
      ) : (
        /* Empty State for Tickets */
        <section className="bg-surface-container-low rounded-[2rem] p-12 border border-dashed border-outline-variant/20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-on-surface/5 flex items-center justify-center text-on-surface-variant/40 mb-6">
              <span className="material-symbols-outlined text-4xl">confirmation_number</span>
            </div>
            <h2 className="font-headline text-xl font-bold mb-2">No Active Tickets Detected</h2>
            <p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-8">You need an active event ticket to access tactical map, medical, and security features.</p>
            <div className="flex gap-1 items-center text-primary animate-bounce">
              <span className="material-symbols-outlined">arrow_downward</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Browse Events Below</span>
            </div>
        </section>
      )}

      {/* ── Event Marketplace ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-label text-[10px] uppercase tracking-[0.4em] font-black text-on-surface-variant pt-4">Operations Marketplace / Upcoming Lineup</h3>
          <span className="px-2 py-1 bg-surface-container border border-outline-variant/10 rounded-lg text-[10px] font-mono opacity-40">{events.length} CONTEXTS FOUND</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {events.filter(e => e.isActive).map((event) => (
             <EventBanner key={event.id} event={event} onBook={() => router.push(`/guest/book/${event.id}`)} />
           ))}
        </div>
      </section>

    </main>
  );
}

function StatBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center md:text-left">
      <p className="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant mb-0.5">{label}</p>
      <p className="font-headline font-black text-lg text-primary">{value}</p>
    </div>
  );
}

function EventBanner({ event, onBook }: { event: Event, onBook: () => void }) {
  return (
    <div className="group relative bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/10 transition-all hover:translate-y-[-4px] hover:shadow-2xl">
       <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#060D20] to-transparent z-10" />
          <img 
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80'} 
            className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            alt={event.title}
          />
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
             <span className="px-2 py-1 bg-primary text-on-primary text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg">LIVE</span>
             <span className="px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-full border border-white/10">TACTICAL READY</span>
          </div>
       </div>

       <div className="p-6 space-y-4">
          <div>
            <h4 className="font-headline text-lg font-bold truncate">{event.title}</h4>
            <p className="text-on-surface-variant text-xs flex items-center gap-1.5 opacity-60 mt-1">
               <span className="material-symbols-outlined text-[14px]">stadium</span>
               {event.venueName}
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
             <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
             {event.minAge && (
               <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">person</span>
                  AGE {event.minAge}+
               </div>
             )}
          </div>

          <button 
            onClick={onBook}
            className="w-full py-3 bg-white/5 hover:bg-primary hover:text-on-primary border border-outline-variant/20 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
          >
            Deploy Ticket
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
       </div>
    </div>
  );
}
