'use client';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { mockData } from '@/lib/mock-data';

interface TicketData {
  gate: string;
  section: string;
  row: string;
  seat: string;
  ticketId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
}

export default function GuestTicketPage() {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [downloadMenu, setDownloadMenu] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Get custom claims from the ID token
        const idTokenResult = await user.getIdTokenResult();
        const claims = idTokenResult.claims;

        const data: TicketData = {
          gate:      (claims.gate      as string) || mockData.currentEvent.location.gate,
          section:   (claims.section   as string) || mockData.currentEvent.location.section,
          row:       (claims.row       as string) || mockData.currentEvent.location.row,
          seat:      (claims.seat      as string) || mockData.currentEvent.location.seat,
          ticketId:  user.uid.slice(0, 12).toUpperCase(),
          eventName: mockData.currentEvent.name,
          eventDate: mockData.currentEvent.date,
          eventTime: mockData.currentEvent.time,
        };
        setTicket(data);

        // Generate QR code from ticket ID
        try {
          const QRCode = (await import('qrcode')).default;
          const url = await QRCode.toDataURL(user.uid, {
            width: 256, margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrDataUrl(url);
        } catch (e) {
          console.error('QR gen failed', e);
        }
      }
    });
    return unsub;
  }, []);

  const downloadPDF = async () => {
    if (!ticket) return;
    setDownloading(true);
    setDownloadMenu(false);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [90, 160] });

      // Background
      doc.setFillColor(11, 19, 38);
      doc.rect(0, 0, 90, 160, 'F');

      // Header bar
      doc.setFillColor(23, 31, 51);
      doc.rect(0, 0, 90, 28, 'F');

      // Title
      doc.setTextColor(188, 199, 222);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('AETHER VENUE OS', 45, 8, { align: 'center' });
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(ticket.eventName, 45, 18, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(188, 199, 222);
      doc.text(`${ticket.eventDate}  •  ${ticket.eventTime}`, 45, 25, { align: 'center' });

      // QR Code
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 20, 33, 50, 50);
      }

      // Ticket ID
      doc.setFontSize(7);
      doc.setTextColor(78, 222, 163);
      doc.text('TICKET ID', 45, 88, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont('courier', 'bold');
      doc.text(ticket.ticketId, 45, 94, { align: 'center' });

      // Divider
      doc.setDrawColor(69, 70, 77);
      doc.line(8, 99, 82, 99);

      // Seat info grid
      const fields = [
        { label: 'GATE',    value: ticket.gate    },
        { label: 'SECTION', value: ticket.section },
        { label: 'ROW',     value: ticket.row     },
        { label: 'SEAT',    value: ticket.seat    },
      ];
      fields.forEach((f, i) => {
        const x = i < 2 ? 22 : 68;
        const y = i % 2 === 0 ? 112 : 130;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(144, 144, 151);
        doc.text(f.label, x, y - 4, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(188, 199, 222);
        doc.text(f.value, x, y + 4, { align: 'center' });
      });

      // Footer
      doc.setFillColor(23, 31, 51);
      doc.rect(0, 148, 90, 12, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(144, 144, 151);
      doc.text('VALID FOR ONE ENTRY  •  NON-TRANSFERABLE', 45, 155, { align: 'center' });

      doc.save(`ticket-${ticket.ticketId}.pdf`);
    } catch (e) {
      console.error('PDF failed', e);
    }
    setDownloading(false);
  };

  const downloadPNG = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    setDownloadMenu(false);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0b1326', scale: 3, useCORS: true,
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `ticket-${ticket?.ticketId ?? 'guest'}.png`;
      a.click();
    } catch (e) {
      console.error('PNG failed', e);
    }
    setDownloading(false);
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

      {/* Ticket card — captured for PNG export */}
      <div ref={ticketRef} className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/15 shadow-[0_16px_48px_rgba(6,14,32,0.6)]">

        {/* Header */}
        <div className="bg-surface-container px-6 py-5 border-b border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">Aether Venue OS</p>
              <h1 className="font-headline font-bold text-xl text-on-surface leading-tight">{ticket.eventName}</h1>
              <p className="font-label text-xs text-on-surface-variant mt-1">{ticket.eventDate} • {ticket.eventTime}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">VALID</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            {qrDataUrl
              ? <img src={qrDataUrl} alt="Ticket QR" className="w-48 h-48" />
              : <div className="w-48 h-48 bg-gray-100 animate-pulse rounded" />
            }
          </div>
          <div className="text-center">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Ticket ID</p>
            <p className="font-headline text-sm font-bold tracking-widest text-primary mt-0.5">{ticket.ticketId}</p>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="mx-6 border-t border-dashed border-outline-variant/30" />

        {/* Seat grid */}
        <div className="grid grid-cols-4 gap-px bg-outline-variant/10 mx-6 my-5 rounded-xl overflow-hidden">
          {[
            { label: 'Gate',    value: ticket.gate    },
            { label: 'Section', value: ticket.section },
            { label: 'Row',     value: ticket.row     },
            { label: 'Seat',    value: ticket.seat    },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-container-lowest px-2 py-3 flex flex-col items-center gap-1">
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">{label}</span>
              <span className="font-headline font-bold text-lg text-primary">{value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-surface-container px-6 py-3 border-t border-outline-variant/10">
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant text-center">
            Valid for one entry • Non-transferable
          </p>
        </div>
      </div>

      {/* Download button */}
      <div className="relative mt-4">
        <button
          onClick={() => setDownloadMenu(o => !o)}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary-container font-label text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(78,222,163,0.25)]"
        >
          {downloading
            ? <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            : <span className="material-symbols-outlined text-sm">download</span>
          }
          {downloading ? 'Preparing...' : 'Download Ticket'}
          {!downloading && <span className="material-symbols-outlined text-sm">expand_more</span>}
        </button>

        {downloadMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-2xl z-50">
            <button onClick={downloadPDF}
              className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-error text-lg">picture_as_pdf</span>
              <div>
                <p className="text-sm font-bold text-on-surface">PDF Document</p>
                <p className="text-xs text-on-surface-variant">Print-ready ticket</p>
              </div>
            </button>
            <div className="border-t border-outline-variant/10" />
            <button onClick={downloadPNG}
              className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary text-lg">image</span>
              <div>
                <p className="text-sm font-bold text-on-surface">PNG Image</p>
                <p className="text-xs text-on-surface-variant">Save to photos</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 bg-surface-container-lowest rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-on-surface-variant text-sm shrink-0 mt-0.5">info</span>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Security check required at Gate {ticket.gate}. Prohibited items include glass, large bags, and professional recording equipment.
        </p>
      </div>
    </main>
  );
}
