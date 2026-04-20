'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuest } from '../GuestContext';
import { QRCodeCanvas } from 'qrcode.react';

export default function GuestTicketPage() {
  const router = useRouter();
  const { tickets, loading: guestLoading, activeTicket, setActiveTicket } = useGuest();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadMenu, setDownloadMenu] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Early loading state
  if (guestLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Syncing Secure Vault...</p>
      </div>
    );
  }

  // Early empty state
  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/20 mb-6">
           <span className="material-symbols-outlined text-5xl">no_accounts</span>
        </div>
        <h2 className="font-headline text-2xl font-bold mb-2">No Active Passes Found</h2>
        <p className="text-on-surface-variant text-sm max-w-xs mb-8">You haven't been assigned any tactical deployments yet. Visit the Discovery portal to browse operations.</p>
        <button 
          onClick={() => router.push('/guest/dashboard')}
          className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold uppercase tracking-widest text-[12px] shadow-xl hover:brightness-110 active:scale-95 transition-all"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  // Derive variables safely after checks
  const currentTicket = tickets[currentIndex];
  if (!currentTicket) return null; // Should not happen given length check but for safety

  const isActiveContext = activeTicket?.id === currentTicket?.id;
  const isExpired = currentTicket.event?.expiryDate && new Date(currentTicket.event.expiryDate) < new Date();
  const isEventActiveByAdmin = currentTicket.event?.isActive;
  const canActivate = isEventActiveByAdmin && !isExpired;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % tickets.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + tickets.length) % tickets.length);

  const handleActivate = () => {
    if (canActivate) {
      setActiveTicket(currentTicket);
      window.dispatchEvent(new CustomEvent('tactical-context-switched', { detail: currentTicket }));
    }
  };

  const handleDeactivate = () => setActiveTicket(null);

  const downloadPNG = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    setDownloadMenu(false);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 3, useCORS: true });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `pass-${currentTicket.id}.png`;
      a.click();
    } catch (e) { console.error('PNG failed', e); }
    setDownloading(false);
  };

  const downloadPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    setDownloadMenu(false);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 3, canvas.height / 3] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`pass-${currentTicket.id}.pdf`);
    } catch (e) { console.error('PDF failed', e); }
    setDownloading(false);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const canvas = printRef.current.querySelector('canvas') as HTMLCanvasElement;
    const qrImg = canvas ? canvas.toDataURL('image/png') : '';
    const html = printRef.current.innerHTML.replace(/<canvas[^>]*><\/canvas>/i, `<img src="${qrImg}" style="width:160px;height:160px;" />`);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Operational Pass</title><style>
      body{margin:0;display:flex;justify-content:center;padding:1cm;font-family:Inter,sans-serif;}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @page{margin:0;}
    </style></head><body>${html}<script>window.onload=()=>{setTimeout(()=>{window.print();window.close();},300);}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <main className="px-4 py-8 max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-8">
         <div>
           <h1 className="font-headline text-2xl font-bold">Tactical Portfolio</h1>
           <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-[0.2em] mt-1 opacity-60">Manage your active deployment contexts</p>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant/10">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentIndex + 1} / {tickets.length}</span>
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">DEPLOYMENTS</span>
         </div>
      </div>

      <div className="relative w-full flex flex-col items-center gap-8">
        <div className="w-full flex items-center justify-center gap-4">
          {tickets.length > 1 && (
             <button onClick={handlePrev} className="hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-surface-container border border-outline-variant/10 hover:bg-primary/20 hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
             </button>
          )}

          <div className="flex-1 flex flex-col items-center">
            <div ref={printRef}
              className="bg-white rounded-[2.5rem] border-2 border-black/5 shadow-[0_32px_128px_rgba(0,0,0,0.1)] p-8 flex flex-col items-center relative overflow-hidden"
              style={{ fontFamily: 'Inter, sans-serif', width: '340px', minHeight: '520px' }}
            >
              {isExpired && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="bg-error text-on-error px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-2xl rotate-[-5deg]">
                       DEPLOYMENT EXPIRED
                    </div>
                </div>
              )}

              <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 p-4">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="text-[10px] font-mono -rotate-45 text-black">SENTINEL-SECURE-ID</div>
                ))}
              </div>

              <div className="w-full flex justify-between items-start mb-8 z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isActiveContext ? 'bg-primary' : 'bg-black/20'}`} />
                    <p className="text-black text-[10px] font-black uppercase tracking-[0.4em]">OPERATIONAL PASS</p>
                  </div>
                  <h4 className="text-black font-black text-3xl leading-[0.85] tracking-tighter uppercase">{currentTicket.event?.title || 'Unknown Event'}</h4>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`w-12 h-12 border-2 rounded-2xl flex items-center justify-center bg-white shadow-sm ${isActiveContext ? 'border-primary/20 bg-primary/5' : 'border-black/10'}`}>
                    <span className={`material-symbols-outlined text-3xl ${isActiveContext ? 'text-primary' : 'text-black'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isActiveContext ? 'verified' : 'shield_with_house'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative mb-8 z-10">
                 <div className={`absolute inset-0 blur-3xl rounded-full transition-colors ${isActiveContext ? 'bg-primary/20' : 'bg-black/5'}`} />
                 <div className={`relative bg-white p-5 border-[3px] rounded-[2rem] shadow-[12px_12px_0px_rgba(0,0,0,0.03)] group transition-all ${isActiveContext ? 'border-primary shadow-[12px_12px_0px_rgba(var(--color-primary-rgb),0.05)]' : 'border-black'}`}>
                   <QRCodeCanvas value={currentTicket.id} size={180} level="H" fgColor="#000000" bgColor="#ffffff" />
                 </div>
              </div>

              <div className="w-full space-y-6 z-10 flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-end border-b-2 border-black/5 pb-4">
                  <div>
                    <p className="text-[9px] uppercase font-black text-black/40 tracking-[0.2em] mb-1.5">Authenticated Operative</p>
                    <p className="text-xl font-black text-black leading-none uppercase">{currentTicket.guestName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black text-black/40 tracking-[0.2em] mb-1.5">Verification</p>
                    <p className="text-xs font-mono font-bold text-black opacity-60">ID: {currentTicket.guestIdNumber?.slice(0, 4)}***</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col justify-center">
                    <p className="text-[8px] uppercase font-black text-primary tracking-widest mb-1">Target Zone</p>
                    <p className="text-lg font-black text-black uppercase leading-tight">{currentTicket.section}</p>
                  </div>
                  <div className="p-4 bg-black border border-black rounded-2xl flex flex-col justify-center">
                    <p className="text-[8px] uppercase font-black text-white/50 tracking-widest mb-1">Entry Gate</p>
                    <p className="text-sm font-black text-white uppercase leading-tight">{currentTicket.gate}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black/5 p-3 rounded-xl border border-dashed border-black/10">
                  <p className="text-[8px] font-mono text-black/40 font-bold uppercase tracking-wider">Pass UID: {currentTicket.id.slice(0, 16)}</p>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActiveContext ? 'bg-primary animate-pulse' : 'bg-black/20'}`} />
                </div>
              </div>
            </div>
          </div>

          {tickets.length > 1 && (
             <button onClick={handlePrev} className="hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-surface-container border border-outline-variant/10 hover:bg-primary/20 hover:text-primary transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
             </button>
          )}
        </div>

        <div className="w-full max-w-[340px] flex flex-col gap-3">
            {isActiveContext ? (
               <button 
                 onClick={handleDeactivate}
                 className="w-full py-4 bg-error/10 text-error border border-error/20 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-error/20 transition-all flex items-center justify-center gap-2"
               >
                 <span className="material-symbols-outlined text-sm">cancel</span>
                 Clear Active Context
               </button>
            ) : (
               <button 
                 onClick={handleActivate}
                 disabled={!canActivate}
                 className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl transition-all flex items-center justify-center gap-2 
                   ${canActivate 
                     ? 'bg-primary text-on-primary hover:brightness-110 active:scale-95' 
                     : 'bg-surface-container-highest/20 text-on-surface-variant/40 border border-outline-variant/10 opacity-50 cursor-not-allowed'}`}
               >
                 {isExpired ? (
                   <><span className="material-symbols-outlined text-sm">lock_clock</span>Context Expired</>
                 ) : !isEventActiveByAdmin ? (
                   <><span className="material-symbols-outlined text-sm">alarm</span>Context Offline (Scheduled)</>
                 ) : (
                   <><span className="material-symbols-outlined text-sm">verified_user</span>Activate for Tactical OS</>
                 )}
               </button>
            )}

            {!canActivate && !isExpired && (
              <p className="text-center text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest bg-surface-container/30 py-2 rounded-lg border border-outline-variant/5">
                Waiting for Command Center Activation
              </p>
            )}
        </div>
      </div>

      <div className="w-full max-w-[340px] mt-12 space-y-4">
          {tickets.length > 1 && (
            <div className="flex items-center justify-between gap-4 md:hidden">
               <button onClick={handlePrev} className="flex-1 py-3 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant/10">
                 <span className="material-symbols-outlined">navigate_before</span>
               </button>
               <button onClick={handleNext} className="flex-1 py-3 bg-surface-container rounded-xl flex items-center justify-center border border-outline-variant/10">
                 <span className="material-symbols-outlined">navigate_next</span>
               </button>
            </div>
          )}

          <div className="relative">
             <button
               onClick={() => setDownloadMenu(o => !o)}
               disabled={downloading}
               className="w-full flex items-center justify-center gap-3 bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-on-surface font-bold text-xs uppercase tracking-widest py-5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-60 border border-outline-variant/10"
             >
               {downloading ? <span className="animate-spin material-symbols-outlined text-sm">sync</span> : <span className="material-symbols-outlined text-sm">download</span>}
               {downloading ? 'Preparing Pass...' : 'Download / Print Pass'}
               {!downloading && <span className="material-symbols-outlined text-sm opacity-40">expand_more</span>}
             </button>

             {downloadMenu && (
               <div className="absolute bottom-full mb-3 left-0 right-0 bg-[#171f33] border border-outline-variant/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-2">
                 <button onClick={downloadPDF} className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-white/5 transition-colors border-b border-outline-variant/5">
                   <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                   <div>
                     <p className="text-sm font-bold text-on-surface">PDF Document</p>
                     <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Tactical High-Res Print</p>
                   </div>
                 </button>
                 <button onClick={downloadPNG} className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-white/5 transition-colors border-b border-outline-variant/5">
                   <span className="material-symbols-outlined text-primary">image</span>
                   <div>
                     <p className="text-sm font-bold text-on-surface">PNG Image</p>
                     <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Save to Secure Storage</p>
                   </div>
                 </button>
                 <button onClick={handlePrint} className="flex items-center gap-4 px-6 py-4 w-full text-left hover:bg-white/5 transition-colors">
                   <span className="material-symbols-outlined text-secondary">print</span>
                   <div>
                     <p className="text-sm font-bold text-on-surface">Direct Print</p>
                     <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Hardcopy Deployment</p>
                   </div>
                 </button>
               </div>
             )}
          </div>
       </div>
    </main>
  );
}
