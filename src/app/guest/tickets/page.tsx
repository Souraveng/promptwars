'use client';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { mockData } from '@/lib/mock-data';
import { QRCodeCanvas } from 'qrcode.react';

interface TicketData {
  gate: string;
  section: string;
  row: string;
  seat: string;
  ticketId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  guestName: string;
  guestAge: string;
  guestIdLast4: string;
  guestMobile: string;
  guestEmail: string;
  uid: string;
}

export default function GuestTicketPage() {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadMenu, setDownloadMenu] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        let stored: Partial<TicketData> = {};
        try {
          const raw = localStorage.getItem('ticket_data');
          if (raw) stored = JSON.parse(raw);
        } catch {}

        let claims: Record<string, unknown> = {};
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          claims = idTokenResult.claims as Record<string, unknown>;
        } catch {}

        setTicket({
          gate:         (stored.gate        || claims.gate        as string) || mockData.currentEvent.location.gate,
          section:      (stored.section     || claims.section     as string) || mockData.currentEvent.location.section,
          row:          (stored.row         || claims.row         as string) || mockData.currentEvent.location.row,
          seat:         (stored.seat        || claims.seat        as string) || mockData.currentEvent.location.seat,
          ticketId:     user.uid.slice(0, 12).toUpperCase(),
          uid:          user.uid,
          eventName:    (stored.eventName   || claims.eventName   as string) || mockData.currentEvent.name,
          eventDate:    mockData.currentEvent.date,
          eventTime:    mockData.currentEvent.time,
          guestName:    (stored.guestName   || claims.guestName   as string) || '',
          guestAge:     (stored.guestAge    || String(claims.guestAge ?? '')) || '',
          guestIdLast4: (stored.guestIdLast4|| claims.guestIdLast4 as string) || '',
          guestMobile:  (stored.guestMobile || claims.guestMobile  as string) || '',
          guestEmail:   (stored.guestEmail  || claims.guestEmail   as string) || '',
        });
      }
    });
    return unsub;
  }, []);

  const downloadPNG = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    setDownloadMenu(false);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: '#ffffff', scale: 3, useCORS: true,
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `ticket-${ticket?.ticketId ?? 'guest'}.png`;
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
      const canvas = await html2canvas(printRef.current, {
        backgroundColor: '#ffffff', scale: 3, useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 3, canvas.height / 3] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`ticket-${ticket?.ticketId ?? 'guest'}.pdf`);
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
    w.document.write(`<html><head><title>Ticket</title><style>
      body{margin:0;display:flex;justify-content:center;padding:1cm;font-family:Inter,sans-serif;}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      @page{margin:0;}
    </style></head><body>${html}<script>window.onload=()=>{setTimeout(()=>{window.print();window.close();},300);}<\/script></body></html>`);
    w.document.close();
  };

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Loading Ticket...</p>
      </div>
    );
  }

  return (
    <main className="px-4 py-6 max-w-md mx-auto">

      {/* ── White ticket card — same design as admin print ticket ── */}
      <div ref={printRef}
        className="bg-white rounded-[2rem] border-2 border-black/5 shadow-2xl p-8 flex flex-col items-center relative overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif', minHeight: '11cm', width: '8.5cm', margin: '0 auto' }}
      >
        {/* Security micro-pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 p-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="text-[10px] font-mono -rotate-45 text-black">SENTINEL-SECURE</div>
          ))}
        </div>

        {/* Header */}
        <div className="w-full flex justify-between items-start mb-6 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-black" />
              <p className="text-black text-[9px] font-bold uppercase tracking-[0.3em]">Operational Pass</p>
            </div>
            <h4 className="text-black font-black text-2xl leading-[0.9] tracking-tighter max-w-[180px]">{ticket.eventName}</h4>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-10 h-10 border-2 border-black/10 rounded-lg flex items-center justify-center bg-white">
              <span className="material-symbols-outlined text-black text-2xl">lens_blur</span>
            </div>
            <p className="text-[7px] text-black font-mono mt-1 opacity-40 uppercase">Auth: V3-909</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 border-[3px] border-black rounded-[1.5rem] mb-6 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] z-10">
          <QRCodeCanvas value={ticket.uid} size={160} level="H" fgColor="#000000" bgColor="#ffffff" />
        </div>

        {/* Guest info */}
        <div className="w-full space-y-5 z-10">
          <div className="flex justify-between items-end border-b border-black/10 pb-3">
            <div>
              <p className="text-[8px] uppercase font-bold text-black/40 tracking-widest mb-1">Authenticated Guest</p>
              <p className="text-lg font-black text-black leading-none">{ticket.guestName || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase font-bold text-black/40 tracking-widest mb-1">Age Check</p>
              <p className="text-sm font-bold text-black">{ticket.guestAge || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-black/5 rounded-xl border border-black/5 flex flex-col justify-center">
              <p className="text-[7px] uppercase font-bold text-black/40 tracking-widest mb-1">Tactical Zone</p>
              <p className="text-xs font-black text-black uppercase leading-tight">{ticket.section}</p>
            </div>
            <div className="p-3 bg-black border border-black rounded-xl flex flex-col justify-center">
              <p className="text-[7px] uppercase font-bold text-white/50 tracking-widest mb-1">Entry Gate</p>
              <p className="text-xs font-black text-white uppercase leading-tight">{ticket.gate}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-black/5 p-2 rounded-lg border border-dashed border-black/20">
            <p className="text-[7px] font-mono text-black/60 font-bold uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap mr-2">
              Pass ID: {ticket.ticketId}
            </p>
            <p className="text-[7px] font-mono text-black/60 whitespace-nowrap">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-black/5 w-full text-center z-10">
          <p className="text-[6px] text-black/40 font-bold uppercase tracking-[0.4em]">Proprietary Cryptographic Signature Encoded</p>
        </div>
      </div>

      {/* Download button */}
      <div className="relative mt-4 max-w-[8.5cm] mx-auto">
        <button
          onClick={() => setDownloadMenu(o => !o)}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary-container font-label text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(78,222,163,0.25)]"
        >
          {downloading
            ? <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            : <span className="material-symbols-outlined text-sm">download</span>}
          {downloading ? 'Preparing...' : 'Download Ticket'}
          {!downloading && <span className="material-symbols-outlined text-sm">expand_more</span>}
        </button>

        {downloadMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-2xl z-50">
            <button onClick={downloadPDF} className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-error text-lg">picture_as_pdf</span>
              <div>
                <p className="text-sm font-bold text-on-surface">PDF Document</p>
                <p className="text-xs text-on-surface-variant">Print-ready ticket</p>
              </div>
            </button>
            <div className="border-t border-outline-variant/10" />
            <button onClick={downloadPNG} className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary text-lg">image</span>
              <div>
                <p className="text-sm font-bold text-on-surface">PNG Image</p>
                <p className="text-xs text-on-surface-variant">Save to photos</p>
              </div>
            </button>
            <div className="border-t border-outline-variant/10" />
            <button onClick={handlePrint} className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-secondary text-lg">print</span>
              <div>
                <p className="text-sm font-bold text-on-surface">Print</p>
                <p className="text-xs text-on-surface-variant">Physical copy</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
