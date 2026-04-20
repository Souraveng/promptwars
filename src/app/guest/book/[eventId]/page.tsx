'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGuest } from '../../GuestContext';
import { executeQuery, executeMutation, queryRef, mutationRef } from 'firebase/data-connect';
import { dataconnect } from '@/lib/firebase-client';
import { 
  GetVenueLayoutData, 
  ListTicketsData, 
  Event, 
  ListEventsData 
} from '@/types/dataconnect';
import VenueSeatingChart from '@/components/shared/VenueSeatingChart';

export default function GuestBookingPage() {
  const { eventId } = useParams() as { eventId: string };
  const router = useRouter();
  const { profile, user, refreshTickets } = useGuest();

  const [event, setEvent] = useState<Event | null>(null);
  const [layout, setLayout] = useState<any>(null);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [selectedEl, setSelectedEl] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // JIT Profile Data (Fallback if profile is missing)
  const [jitData, setJitData] = useState({
    name: profile?.name || user?.displayName || '',
    age: profile?.age?.toString() || '',
    idCardNumber: profile?.idCardNumber || '',
    phone: profile?.phone || '',
    email: profile?.email || user?.email || ''
  });

  // Sync JIT data if profile loads late
  useEffect(() => {
    if (profile) {
      setJitData({
        name: profile.name,
        age: profile.age.toString(),
        idCardNumber: profile.idCardNumber,
        phone: profile.phone,
        email: profile.email
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eRef = queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {});
        const eResult = await executeQuery(eRef);
        const currentEvent = eResult.data?.events.find(e => e.id === eventId);
        if (!currentEvent) throw new Error('Event context not found');
        setEvent(currentEvent);

        if (currentEvent.layoutId) {
          const lRef = queryRef<GetVenueLayoutData, { id: string }>(dataconnect, 'GetVenueLayout', { id: currentEvent.layoutId });
          const lResult = await executeQuery(lRef);
          if (lResult.data?.venueLayout) {
            setLayout({
              ...lResult.data.venueLayout,
              elements: JSON.parse(lResult.data.venueLayout.elements)
            });
          }
        }

        const tRef = queryRef<ListTicketsData, { eventId: string }>(dataconnect, 'ListTickets', { eventId });
        const tResult = await executeQuery(tRef);
        if (tResult.data?.tickets) {
          const counts: Record<string, number> = {};
          tResult.data.tickets.forEach(t => {
            counts[t.seat] = (counts[t.seat] || 0) + 1;
          });
          setTicketCounts(counts);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleBooking = async () => {
    if (!selectedEl || !event || !user) return;
    
    // Validate JIT fields
    if (!jitData.name || !jitData.age || !jitData.idCardNumber || !jitData.phone) {
      setError('Please provide required tactical metadata');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const mRef = mutationRef(dataconnect, 'IssueTicket', {
        eventId: event.id,
        gate: selectedEl.access === 'restricted' ? 'VIP Gate' : 'Main Entrance',
        section: selectedEl.label,
        row: 'A',
        seat: selectedEl.id,
        guestName: jitData.name,
        guestAge: parseInt(jitData.age),
        guestIdNumber: jitData.idCardNumber,
        guestMobile: jitData.phone,
        guestEmail: jitData.email,
        userId: user.uid
      });

      const result = await executeMutation(mRef);
      console.log('[GuestBooking] Ticket issued:', result.data);
      
      setIsSuccess(true);
      await refreshTickets();
      
      // Delay redirect to allow user to see success state
      setTimeout(() => {
        router.push('/guest/tickets');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-6 bg-[#060D20]"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const showJitForm = !profile;

  return (
    <div className="min-h-screen bg-[#060D20] text-[#DBE2FD] flex flex-col p-4 md:p-8 font-body">
       <header className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container/20 hover:bg-primary/20 transition-all border border-outline-variant/10 text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline text-2xl font-black italic tracking-tighter text-on-surface uppercase">{event?.title}</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black opacity-60">Deployment Authorization Required</p>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          
          <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-6">
             <div className="bg-[#0b1429] rounded-[2.5rem] border border-outline-variant/10 overflow-hidden min-h-[400px] md:min-h-[500px] shadow-2xl relative">
                {/* Mobile Scroll Container */}
                <div className="w-full h-full overflow-x-auto overflow-y-hidden md:overflow-hidden touch-pan-x">
                   <div className="min-w-[600px] md:min-w-0 h-full">
                      <VenueSeatingChart 
                        elements={layout?.elements || []}
                        ticketCounts={ticketCounts}
                        selectedId={selectedEl?.id}
                        onSelect={setSelectedEl}
                      />
                   </div>
                </div>
                
                <div className="absolute bottom-6 left-6 flex gap-4 p-4 bg-[#060d20]/80 backdrop-blur-xl rounded-2xl border border-white/5">
                   <Legend label="Ready" color="bg-[#4EDEA3]" />
                   <Legend label="Saturated" color="bg-[#FF5252]" />
                   <Legend label="Selected" color="bg-[#4D8EFF]" />
                </div>
             </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
             <div className="bg-[#0b1429] border border-outline-variant/10 rounded-[2.5rem] p-8 shadow-2xl space-y-8 h-full">
                <div>
                   <h2 className="font-headline text-xl font-black italic tracking-tighter text-on-surface uppercase">Deployment Briefing</h2>
                   <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mt-1 opacity-40">Finalizing operative assignments</p>
                </div>

                <div className="space-y-6">
                   {showJitForm ? (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                           <span className="material-symbols-outlined text-primary text-sm animate-pulse">info</span>
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">
                              Operative Metadata Missing: Details Required
                           </p>
                        </div>
                        <JitInput label="Operative Name" icon="person" value={jitData.name} onChange={(v: string) => setJitData({...jitData, name: v})} />
                        <div className="grid grid-cols-2 gap-4">
                           <JitInput label="Age" type="number" icon="calendar_today" value={jitData.age} onChange={(v: string) => setJitData({...jitData, age: v})} />
                           <JitInput label="Phone" type="tel" icon="call" value={jitData.phone} onChange={(v: string) => setJitData({...jitData, phone: v})} />
                        </div>
                        <JitInput label="ID Card Number" icon="fingerprint" value={jitData.idCardNumber} onChange={(v: string) => setJitData({...jitData, idCardNumber: v})} placeholder="NAT-XXXXXXXX" />
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <SummaryRow label="Operative" value={profile?.name} />
                        <SummaryRow label="Tactical ID" value={profile?.idCardNumber} />
                     </div>
                   )}

                   <div className="h-px bg-outline-variant/10" />
                   
                   <SummaryRow label="Target Zone" value={selectedEl?.label || 'Selection Pending'} highlight={!!selectedEl} />
                   <SummaryRow label="Priority Clearance" value={selectedEl?.access === 'restricted' ? 'Level 2 (VIP)' : 'Level 1 (Standard)'} />
                </div>

                {error && (
                   <div className="p-4 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-error text-lg">warning</span>
                      <p className="text-[11px] text-error font-bold uppercase tracking-tight leading-tight">{error}</p>
                   </div>
                 )}

                <button 
                  disabled={!selectedEl || booking}
                  onClick={handleBooking}
                  className="w-full py-6 bg-primary text-on-primary rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_16px_48px_rgba(var(--color-primary-rgb),0.3)] disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                   {booking ? <span className="material-symbols-outlined animate-spin">sync</span> : (
                     <>
                        <span className="material-symbols-outlined text-lg">token</span>
                        Authorize Deployment
                     </>
                   )}
                </button>

                <p className="text-center text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.4em]">
                   Sentinel Dynamics &bull; Secure Handshake
                </p>
             </div>
          </div>

       </div>

       {/* Success Overlay */}
       {isSuccess && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#060D20]/90 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-[#0b1429] border border-primary/20 rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(78,222,163,0.2)] max-w-md w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                 <span className="material-symbols-outlined text-5xl text-primary animate-bounce">verified_user</span>
              </div>
              <h2 className="font-headline text-3xl font-black italic tracking-tighter text-on-surface uppercase mb-4">Deployment Certified</h2>
              <p className="text-on-surface-variant text-sm font-medium uppercase tracking-[0.2em] opacity-60 leading-relaxed">
                 Your tactical credentials have been generated and synced to the secure vault.
              </p>
              <div className="mt-12 flex flex-col gap-4">
                 <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
                 </div>
                 <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Redirecting to Secure Portfolio...</p>
              </div>
           </div>
         </div>
       )}
    </div>
  );
}

interface JitInputProps {
  label: string;
  type?: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function JitInput({ label, type = 'text', icon, value, onChange, placeholder }: JitInputProps) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[9px] uppercase tracking-[0.2em] font-black text-on-surface-variant/40 ml-1">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-base opacity-40">{icon}</span>
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-container/20 border border-outline-variant/10 rounded-xl py-3 pl-10 pr-4 text-[12px] focus:border-primary/50 outline-none transition-all placeholder:text-on-surface-variant/20"
        />
      </div>
    </div>
  );
}

function Legend({ label, color }: { label: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-sm ${color}`} />
      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</span>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[9px] uppercase tracking-[0.3em] font-black opacity-30">{label}</span>
      <span className={`text-sm font-bold truncate max-w-[150px] ${highlight ? 'text-primary' : 'text-on-surface'}`}>{value || '---'}</span>
    </div>
  );
}
