"use client";
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { dataconnect } from '@/lib/firebase-client';
import { executeQuery } from 'firebase/data-connect';
import { ListEventsData, Event, ListTicketsData, Ticket } from '@/types/dataconnect';

export default function TicketManagementPage() {
  const [loading, setLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<{ id: string, url: string, guestName: string } | null>(null);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<any>(null);
  
  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  // Registration Form State
  const [guestData, setGuestData] = useState({
    guestName: '',
    guestAge: '',
    guestIdNumber: '',
    guestMobile: '',
    guestEmail: '',
    gate: 'North Node',
    section: 'General Admission',
    row: 'G',
    seat: '1'
  });

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [selectedEventId]);

  const fetchData = async () => {
    try {
      // Fetch Events
      const eRef = await import('firebase/data-connect').then(m => m.queryRef<ListEventsData, {}>(dataconnect, 'ListEvents', {}));
      const eResult = await executeQuery(eRef);
      if (eResult.data?.events) {
        setEvents(eResult.data.events);
        if (!selectedEventId && eResult.data.events.length > 0) {
          setSelectedEventId(eResult.data.events[0].id);
        }
      }

      // Fetch Recent Tickets for selected event - Only if CID is valid
      if (selectedEventId) {
        const tRef = await import('firebase/data-connect').then(m => m.queryRef<ListTicketsData, { eventId: string }>(dataconnect, 'ListTickets', { eventId: selectedEventId }));
        const tResult = await executeQuery(tRef);
        if (tResult.data?.tickets) setTickets(tResult.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Failed to fetch ticket data:', err);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Calculate Total Capacity for the throughput metric
  const totalCapacity = selectedEvent?.layoutConfig 
    ? Object.values(JSON.parse(selectedEvent.layoutConfig) as Record<string, number>).reduce((a, b) => a + b, 0)
    : 0;

  const handleGenerateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Age Verification
    const age = parseInt(guestData.guestAge);
    if (selectedEvent && selectedEvent.minAge && age < selectedEvent.minAge) {
      setError(`Age Verification Failed: This event requires minimum age of ${selectedEvent.minAge}. Guest is ${age}.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/generate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...guestData,
          eventId: selectedEventId
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      
      const fullUrl = `${window.location.origin}${data.url}`;
      setGeneratedTicket({ 
        id: data.ticketId, 
        url: fullUrl, 
        guestName: guestData.guestName 
      });
      
      fetchData(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.querySelector('.print-ticket');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print the ticket.");
      return;
    }

    const canvases = printContent.querySelectorAll('canvas');
    const canvasImages = Array.from(canvases).map(canvas => canvas.toDataURL('image/png'));

    const style = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
      
      @page { margin: 0; size: auto; }
      body {
        margin: 0; padding: 0; background: white;
        display: flex; justify-content: center; align-items: flex-start;
        padding-top: 1cm; font-family: 'Inter', sans-serif;
      }
      .print-ticket {
        width: 8.5cm; min-height: 11cm; height: auto; padding: 0.8cm;
        border: 2px solid #000; background: #fff !important;
        display: flex; flex-direction: column; justify-content: flex-start;
        align-items: center; box-sizing: border-box;
        overflow: visible; page-break-inside: avoid; position: relative;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-ticket * { color: #000 !important; visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .material-symbols-outlined { font-family: 'Material Symbols Outlined' !important; font-size: 24px; line-height: 1; display: inline-block; }
      
      /* Essential Layout Mappings */
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      .flex-1 { flex: 1 1 0% !important; }
      .justify-between { justify-content: space-between !important; }
      .justify-center { justify-content: center !important; }
      .items-start { align-items: flex-start !important; }
      .items-center { align-items: center !important; }
      .items-end { align-items: flex-end !important; }
      .grid { display: grid !important; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .gap-1 { gap: 0.25rem !important; }
      .gap-2 { gap: 0.5rem !important; }
      .gap-4 { gap: 1rem !important; }
      .gap-5 { gap: 1.25rem !important; }
      
      /* Padding & Margin */
      .mb-1 { margin-bottom: 0.25rem !important; }
      .mb-6 { margin-bottom: 1.5rem !important; }
      .mt-4 { margin-top: 1rem !important; }
      .pt-4 { padding-top: 1rem !important; }
      .pb-3 { padding-bottom: 0.75rem !important; }
      .p-2 { padding: 0.5rem !important; }
      .p-3 { padding: 0.75rem !important; }
      .p-4 { padding: 1rem !important; }
      
      /* Borders & Corners */
      .border-2 { border-width: 2px !important; }
      .border-b { border-bottom: 1px solid rgba(0,0,0,0.1) !important; }
      .border-t { border-top: 1px solid rgba(0,0,0,0.05) !important; }
      .border-dashed { border-style: dashed !important; }
      .rounded-lg { border-radius: 0.5rem !important; }
      .rounded-xl { border-radius: 0.75rem !important; }
      .rounded-\\[1\\.5rem\\] { border-radius: 1.5rem !important; }
      .rounded-\\[2rem\\] { border-radius: 2rem !important; }
      
      /* Backgrounds & Colors */
      .bg-white { background-color: #fff !important; }
      .bg-black { background-color: #000 !important; color: #fff !important; }
      .bg-black\\/5 { background-color: rgba(0,0,0,0.05) !important; }
      .text-black { color: #000 !important; }
      .text-white { color: #fff !important; }
      .text-black\\/40 { color: rgba(0,0,0,0.4) !important; }
      .text-black\\/60 { color: rgba(0,0,0,0.6) !important; }
      .opacity-40 { opacity: 0.4 !important; }
      .opacity-\\[0\\.03\\] { opacity: 0.03 !important; }
      
      /* Typography */
      .text-\\[9px\\] { font-size: 9px !important; }
      .text-\\[7px\\] { font-size: 7px !important; }
      .text-\\[8px\\] { font-size: 8px !important; }
      .text-\\[6px\\] { font-size: 6px !important; }
      .text-xs { font-size: 0.75rem !important; }
      .text-sm { font-size: 0.875rem !important; }
      .text-lg { font-size: 1.125rem !important; }
      .text-2xl { font-size: 1.5rem !important; }
      .font-black { font-weight: 900 !important; }
      .font-bold { font-weight: 700 !important; }
      .font-mono { font-family: monospace !important; }
      .uppercase { text-transform: uppercase !important; }
      .tracking-\\[0\\.3em\\] { letter-spacing: 0.3em !important; }
      .tracking-\\[0\\.4em\\] { letter-spacing: 0.4em !important; }
      .tracking-widest { letter-spacing: 0.1em !important; }
      .tracking-tighter { letter-spacing: -0.05em !important; }
      .leading-none { line-height: 1 !important; }
      .leading-tight { line-height: 1.25 !important; }
      .leading-\\[0\\.9\\] { line-height: 0.9 !important; }
      
      /* Absolute Position Micro-pattern */
      .absolute { position: absolute !important; }
      .inset-0 { top: 0; right: 0; bottom: 0; left: 0 !important; }
      .z-10 { z-index: 10 !important; }
      .transform { transform: translate(0,0) !important; }
      .-rotate-45 { transform: rotate(-45deg) !important; }
      
      .no-print { display: none !important; }
      img { max-width: 100% !important; height: auto !important; }
      canvas { display: none !important; }
    `;

    let contentHtml = printContent.innerHTML;
    canvases.forEach((_, index) => {
      contentHtml = contentHtml.replace(/<canvas[^>]*><\/canvas>/i, `<img src="${canvasImages[index]}" style="width: 160px; height: 160px;" />`);
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Tactical ID</title>
          <style>${style}</style>
        </head>
        <body>
          <div class="print-ticket">
            ${contentHtml}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleEmailDemo = () => {
    alert(`DEMO: Ticket attached for ${generatedTicket?.guestName} and sent to ${guestData.guestEmail} via internal relay.`);
  };

  const handleOpenMap = async () => {
    if (!selectedEvent?.layoutId) {
      alert("This tactical context does not have a venue layout deployment.");
      return;
    }
    
    try {
      const qRef = await import('firebase/data-connect').then(m => m.queryRef<any, { id: string }>(dataconnect, 'GetVenueLayout', { id: selectedEvent.layoutId! }));
      const result = await executeQuery(qRef);
      if (result.data?.venueLayout) {
        setCurrentLayout(result.data.venueLayout);
        setShowMap(true);
      }
    } catch (err) {
      console.error("Layout acquisition failed:", err);
    }
  };

  const onSelectMapZone = (el: any) => {
    setGuestData(prev => ({
      ...prev,
      section: el.label,
      gate: el.access === 'restricted' ? 'VIP Gate' : 'Main Entrance'
    }));
    setShowMap(false);
  };

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 pb-20">

      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 no-print">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1">Ticket Operations</h1>
          <p className="text-on-surface-variant text-sm font-body">
            Security Node / {selectedEvent ? `Active Context: ${selectedEvent.title}` : 'Initializing...'}
          </p>
        </div>
        <div className="flex gap-3">
        </div>
      </header>
      
      <div className="grid grid-cols-12 gap-6 no-print">
        {/* Left Column: Metrics & History */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-4 font-headline">Operations Throughput</div>
          <div className="flex items-end gap-4">
            <div className="font-headline text-[3.5rem] leading-none font-bold text-primary">
              {totalCapacity > 0 ? Math.min(100, (tickets.length / totalCapacity) * 100).toFixed(0) : 0}
              <span className="text-2xl text-on-surface-variant">%</span>
            </div>
            <div className="pb-2 text-sm text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              LIVE
            </div>
          </div>
          <div className="mt-4 flex h-2 rounded-full overflow-hidden bg-surface-container-lowest border border-outline-variant/5">
            <div 
              className="bg-gradient-to-r from-secondary to-secondary-fixed transition-all duration-1000" 
              style={{ width: `${totalCapacity > 0 ? Math.min(100, (tickets.length / totalCapacity) * 100) : 0}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-on-surface-variant font-bold tracking-widest uppercase pt-2">
            <span>Verified: 0</span>
            <span>Issued: {tickets.length} / {totalCapacity > 0 ? totalCapacity : 'N/A'}</span>
          </div>
        </div>
            
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-center border border-outline-variant/10">
                <div className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Target Contexts</div>
                <div className="font-headline text-3xl font-bold text-inverse-surface">{events.length}<span className="text-xl text-outline"> Active</span></div>
              </div>
              <div className={`rounded-xl p-5 flex flex-col justify-center relative overflow-hidden border transition-all ${selectedEvent?.minAge ? 'bg-error-container/5 border-error/20' : 'bg-secondary-container/5 border-secondary/20'}`}>
                <div className={`absolute right-0 top-0 bottom-0 w-1 ${selectedEvent?.minAge ? 'bg-error' : 'bg-secondary'}`}></div>
                <div className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Age Restriction</div>
                <div className={`font-headline text-3xl font-bold ${selectedEvent?.minAge ? 'text-error' : 'text-secondary'}`}>
                  {selectedEvent?.minAge ? `${selectedEvent.minAge}+` : 'None'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Ticket Activity Log */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-2xl border border-outline-variant/10 overflow-hidden">
            <h2 className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-6">Recent Tactical Issuance</h2>
            <div className="flex flex-col gap-2 overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] text-outline font-bold uppercase tracking-widest border-b border-outline-variant/5">
                  <div className="col-span-4">Guest Info</div>
                  <div className="col-span-3">Gate / Seat</div>
                  <div className="col-span-2 text-right">Age</div>
                  <div className="col-span-3 text-right">Timestamp</div>
                </div>
                
                {tickets.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant opacity-50 flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl mb-2">subtitles_off</span>
                    <p className="text-xs uppercase tracking-widest">No tickets issued for this event context</p>
                  </div>
                ) : tickets.map(t => (
                  <div key={t.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors items-center">
                    <div className="col-span-4">
                      <div className="font-bold text-sm text-inverse-surface truncate font-headline">{t.guestName}</div>
                      <div className="text-[10px] text-outline truncate font-mono">{t.guestIdNumber.slice(0, 4)}****</div>
                    </div>
                    <div className="col-span-3 text-sm text-primary font-body">
                      <div className="text-[10px] opacity-60 uppercase font-bold tracking-widest mb-0.5">{t.gate}</div>
                      <div className="font-bold font-headline">{t.section} · {t.row}{t.seat}</div>
                    </div>
                    <div className="col-span-2 text-right font-headline text-sm font-bold">{t.guestAge}</div>
                    <div className="col-span-3 text-right text-[10px] text-outline font-mono">
                      {new Date(t.issuedAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Minting Form */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 self-start">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 shadow-2xl sticky top-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">fingerprint</span>
              </span>
              <div>
                <h2 className="font-headline text-lg font-bold text-primary tracking-tight leading-tight">Mint Tactical Ticket</h2>
                <p className="text-[10px] text-outline font-bold tracking-widest uppercase">Verified Guest Issuance</p>
              </div>
            </div>
            
            <form onSubmit={handleGenerateSingle} className="space-y-4">
              {generatedTicket ? (
                <div className="space-y-4 animate-fade-in no-print">
                  {/* Scrollable Preview Container */}
                  <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar rounded-[2rem] border border-outline-variant/10 bg-black/10 p-4">
                    <div className="bg-white p-8 rounded-[2rem] flex flex-col items-center justify-between shadow-2xl print-ticket border-2 border-black/5 relative overflow-hidden min-h-[11cm] w-[8.5cm] mx-auto">
                      {/* Security Micro-pattern background */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 p-4">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="text-[10px] font-mono transform -rotate-45 text-black">SENTINEL-SECURE</div>
                        ))}
                      </div>

                      <div className="w-full flex justify-between items-start mb-6 z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                            <p className="text-black text-[9px] font-bold uppercase tracking-[0.3em]">Operational Pass</p>
                          </div>
                          <h4 className="text-black font-headline text-2xl font-black leading-[0.9] tracking-tighter max-w-[180px]">{selectedEvent?.title}</h4>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="w-10 h-10 border-2 border-black/10 rounded-lg flex items-center justify-center bg-white">
                            <span className="material-symbols-outlined text-black text-2xl">lens_blur</span>
                          </div>
                          <p className="text-[7px] text-black font-mono mt-1 opacity-40 uppercase">Auth: V3-909</p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 border-[3px] border-black rounded-[1.5rem] mb-6 shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                        <QRCodeCanvas value={generatedTicket.url} size={160} level={"H"} fgColor="#000000" />
                      </div>
                      
                      <div className="w-full space-y-5 z-10">
                        <div className="flex justify-between items-end border-b border-black/10 pb-3">
                          <div>
                            <p className="text-[8px] uppercase font-bold text-black/40 tracking-widest mb-1">Authenticated Guest</p>
                            <p className="text-lg font-black font-headline text-black leading-none">{generatedTicket.guestName}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] uppercase font-bold text-black/40 tracking-widest mb-1">Age Check</p>
                             <p className="text-sm font-bold text-black">{guestData.guestAge}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-black/5 rounded-xl border border-black/5 flex flex-col justify-center">
                            <p className="text-[7px] uppercase font-bold text-black/40 tracking-widest mb-1">Tactical Zone</p>
                            <p className="text-xs font-black text-black uppercase leading-tight">{guestData.section}</p>
                          </div>
                          <div className="p-3 bg-black border border-black rounded-xl flex flex-col justify-center">
                            <p className="text-[7px] uppercase font-bold text-white/50 tracking-widest mb-1">Entry Gate</p>
                            <p className="text-xs font-black text-white uppercase leading-tight">{guestData.gate}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-black/5 p-2 rounded-lg border border-dashed border-black/20">
                          <p className="text-[7px] font-mono text-black/60 font-bold uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap mr-2">Pass ID: {generatedTicket.id?.toString().slice(0, 12) || 'PENDING'}</p>
                          <p className="text-[7px] font-mono text-black/60 whitespace-nowrap">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-black/5 w-full text-center">
                        <p className="text-[6px] text-black/40 font-bold uppercase tracking-[0.4em]">Proprietary Cryptographic Signature Encoded</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 no-print">
                    <button type="button" onClick={handlePrint} className="flex flex-col items-center gap-2 p-3 bg-primary group hover:bg-primary/90 rounded-xl text-on-primary transition-all shadow-lg">
                      <span className="material-symbols-outlined">print</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Print Physical Pass</span>
                    </button>
                    <button type="button" onClick={handleEmailDemo} className="flex flex-col items-center gap-2 p-3 bg-surface-container-highest hover:bg-surface-bright border border-outline-variant/20 rounded-xl text-on-surface transition-all">
                      <span className="material-symbols-outlined">mail</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Send Digital Copy</span>
                    </button>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => { setGeneratedTicket(null); fetchData(); }} 
                    className="w-full py-3 text-xs text-outline underline hover:text-on-surface font-label tracking-widest uppercase no-print"
                  >
                    Issue Next Tactical ID
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">Target Context</label>
                      <select 
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm focus:border-primary outline-none appearance-none"
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
                      >
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group space-y-2">
                       <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">Tactical Zone (Section)</label>
                       <div className="flex gap-2">
                         <input 
                           required
                           className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-3 text-sm focus:border-primary outline-none"
                           value={guestData.section}
                           onChange={e => setGuestData({...guestData, section: e.target.value})}
                           placeholder="General Admission"
                         />
                         <button 
                           type="button"
                           onClick={handleOpenMap}
                           className="w-12 h-12 flex items-center justify-center bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary hover:text-on-secondary transition-all shadow-lg"
                           title="Select from Map"
                         >
                           <span className="material-symbols-outlined">map</span>
                         </button>
                       </div>
                    </div>

                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/10 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">Full Name</label>
                          <input required type="text" value={guestData.guestName} onChange={e => setGuestData({...guestData, guestName: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-sm focus:border-primary transition-colors outline-none" placeholder="Guest Name" />
                        </div>
                        <div>
                          <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">Age</label>
                          <input required type="number" value={guestData.guestAge} onChange={e => setGuestData({...guestData, guestAge: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-sm focus:border-primary transition-colors outline-none" placeholder="25" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">ID Card Number (for Verification)</label>
                          <input required type="text" value={guestData.guestIdNumber} onChange={e => setGuestData({...guestData, guestIdNumber: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-sm focus:border-primary transition-colors outline-none" placeholder="NAT-XXXXXXXX" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">Mobile</label>
                          <input required type="tel" value={guestData.guestMobile} onChange={e => setGuestData({...guestData, guestMobile: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-sm focus:border-primary transition-colors outline-none" placeholder="+1..." />
                        </div>
                        <div>
                          <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 block">Email</label>
                          <input required type="email" value={guestData.guestEmail} onChange={e => setGuestData({...guestData, guestEmail: e.target.value})} className="w-full bg-surface-container border border-outline-variant/20 rounded-lg p-2 text-sm focus:border-primary transition-colors outline-none" placeholder="guest@mail.com" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex items-start gap-2">
                      <span className="material-symbols-outlined text-error text-lg">warning</span>
                      <p className="text-[10px] text-error font-bold leading-tight uppercase tracking-tight">{error}</p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button 
                      disabled={loading || !selectedEventId} 
                      className="w-full bg-primary hover:contrast-125 text-on-primary font-bold text-[13px] tracking-wider uppercase py-4 rounded-xl shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-3 group" 
                      type="submit"
                    >
                      {loading ? (
                        <span className="material-symbols-outlined animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">verified_user</span>
                      )}
                      {loading ? 'Minting Tactical ID...' : `Mint ${selectedEvent?.minAge ? `${selectedEvent.minAge}+` : ''} Ticket`}
                    </button>
                    <p className="text-center mt-3 text-[9px] text-outline font-bold tracking-[0.2em] uppercase">
                      Hardware Cryptographic Signature Required
                    </p>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Venue Map Modal */}
      {showMap && currentLayout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowMap(false)} />
          <div className="relative w-full max-w-4xl bg-surface-container-low border border-outline-variant/20 rounded-3xl shadow-[0_32px_128px_rgba(6,14,32,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50 backdrop-blur-xl">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary">Interactive Venue Deployment</h3>
                <p className="text-[10px] text-outline font-bold tracking-[0.2em] uppercase mt-1">Select Tactical Zone to populate register</p>
              </div>
              <button onClick={() => setShowMap(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden p-8 flex items-center justify-center bg-[#07090c]">
              <div className="relative w-full aspect-[5/3] max-w-[800px] border border-outline-variant/5 rounded-2xl bg-black/40 shadow-inner overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {JSON.parse(currentLayout.elements).map((el: any) => {
                    if (el.type === 'zone' || el.type === 'polygon' || el.type === 'seat') {
                      return (
                        <g 
                          key={el.id} 
                          onClick={() => onSelectMapZone(el)}
                          className="cursor-pointer group"
                        >
                          {el.type === 'polygon' ? (
                            <polygon 
                              points={el.points.map((p: any) => `${p.x + el.x},${p.y + el.y}`).join(' ')}
                              fill={el.color}
                              fillOpacity={el.opacity / 150}
                              stroke={el.color}
                              strokeWidth="0.5"
                              className="group-hover:fill-opacity-80 transition-all duration-300"
                            />
                          ) : (
                            <rect 
                              x={el.x} y={el.y} width={el.w} height={el.h}
                              fill={el.color}
                              fillOpacity={el.opacity / 150}
                              stroke={el.color}
                              strokeWidth="0.5"
                              rx="1"
                              className="group-hover:fill-opacity-80 transition-all duration-300"
                            />
                          )}
                          <text 
                            x={el.x + (el.w ? el.w/2 : 0)} 
                            y={el.y + (el.h ? el.h/2 : 0)} 
                            fill="white" 
                            fontSize="2" 
                            fontWeight="bold"
                            textAnchor="middle" 
                            alignmentBaseline="middle"
                            className="pointer-events-none drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {el.label}
                          </text>
                        </g>
                      )
                    }
                    return null;
                  })}
                </svg>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest/30 border-t border-outline-variant/10 text-center">
              <p className="text-[10px] text-outline-variant font-medium">Click on any highlighted zone to designate context in the registration form.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
