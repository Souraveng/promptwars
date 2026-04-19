"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

/* ── Book Ticket Modal ── */
function BookTicketModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (url: string) => void }) {
  const [step, setStep] = useState<'auth' | 'form' | 'loading' | 'done'>('auth');
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [form, setForm] = useState({
    guestName: '', guestAge: '', guestIdNumber: '',
    guestMobile: '', section: 'General Admission', gate: 'Main Gate',
    eventId: '', eventName: '',
  });

  // Fetch events from Firebase Data Connect
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { dataconnect } = await import('@/lib/firebase-client');
        const { queryRef, executeQuery } = await import('firebase/data-connect');
        const qRef = queryRef<any, {}>(dataconnect, 'ListEvents', {});
        const result = await executeQuery(qRef);
        if (result.data?.events?.length) {
          setEvents(result.data.events);
          setForm(f => ({ ...f, eventId: result.data.events[0].id, eventName: result.data.events[0].title }));
        }
      } catch {
        // fallback to mock
        setEvents([{ id: 'e_123', title: 'Neon Lights Festival' }]);
        setForm(f => ({ ...f, eventId: 'e_123', eventName: 'Neon Lights Festival' }));
      }
    };
    fetchEvents();
  }, []);

  const handleGoogleAuth = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      setGoogleUser({ name: u.displayName || '', email: u.email || '' });
      setForm(f => ({ ...f, guestName: u.displayName || '', guestMobile: u.phoneNumber || '' }));
      setStep('form');
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    try {
      const res = await fetch('/api/guest/book-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          guestEmail: googleUser?.email || '',
          eventName: form.eventName,
          eventId: form.eventId,
          row: 'GA',
          seat: '-',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('done');
      setTimeout(() => onSuccess(data.loginUrl), 1500);
    } catch (e: any) {
      setError(e.message || 'Booking failed');
      setStep('form');
    }
  };

  const inputCls = "w-full bg-[#0d1628] border border-[#2d3449] rounded-xl px-4 py-3 text-sm text-[#dae2fd] focus:outline-none focus:border-[#4edea3] transition-colors placeholder:text-[#909097]";
  const labelCls = "block text-[10px] uppercase tracking-widest font-bold text-[#909097] mb-1.5";

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0b1326] border border-[#2d3449] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d3449]">
          <div>
            <h2 className="font-headline font-bold text-[#dae2fd] text-lg">Book a Ticket</h2>
            <p className="text-[10px] text-[#909097] uppercase tracking-widest mt-0.5">Self-service registration</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#171f33] flex items-center justify-center text-[#909097] hover:text-[#dae2fd] transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-6">
          {/* Step: Auth */}
          {step === 'auth' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#909097] text-center">Sign in with Google to pre-fill your details and book your ticket instantly.</p>
              {error && <p className="text-xs text-red-400 text-center">{error}</p>}
              <button onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 bg-[#bcc7de] text-[#111c2d] py-3.5 rounded-xl font-bold text-sm hover:bg-[#d8e3fb] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#263143"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#263143"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#263143"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#263143"/>
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#2d3449]" />
                <span className="text-[10px] text-[#909097] uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-[#2d3449]" />
              </div>
              <button onClick={() => setStep('form')}
                className="w-full py-3 rounded-xl border border-[#2d3449] text-[#909097] text-sm hover:bg-[#171f33] hover:text-[#dae2fd] transition-colors">
                Continue without Google
              </button>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {googleUser && (
                <div className="flex items-center gap-3 bg-[#4edea3]/10 border border-[#4edea3]/20 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-[#4edea3] text-sm">verified_user</span>
                  <div>
                    <p className="text-xs font-bold text-[#4edea3]">{googleUser.name}</p>
                    <p className="text-[10px] text-[#909097]">{googleUser.email}</p>
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Event</label>
                <select
                  value={form.eventId}
                  onChange={e => {
                    const ev = events.find(ev => ev.id === e.target.value);
                    setForm(f => ({ ...f, eventId: e.target.value, eventName: ev?.title || '' }));
                  }}
                  className={inputCls}
                >
                  {events.length === 0
                    ? <option value="">Loading events...</option>
                    : events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)
                  }
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name</label>
                  <input required value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                    className={inputCls} placeholder="Guest Name" />
                </div>
                <div>
                  <label className={labelCls}>Age</label>
                  <input required type="number" min="1" max="120" value={form.guestAge} onChange={e => setForm(f => ({ ...f, guestAge: e.target.value }))}
                    className={inputCls} placeholder="25" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Section / Zone</label>
                <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className={inputCls}>
                  <option>General Admission</option>
                  <option>VIP Deck</option>
                  <option>North Stand</option>
                  <option>South Stand</option>
                  <option>East Wing</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>ID Card Number (for verification)</label>
                <input required value={form.guestIdNumber} onChange={e => setForm(f => ({ ...f, guestIdNumber: e.target.value }))}
                  className={inputCls} placeholder="NAT-XXXXXXXX" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Mobile</label>
                  <input type="tel" value={form.guestMobile} onChange={e => setForm(f => ({ ...f, guestMobile: e.target.value }))}
                    className={inputCls} placeholder="+1..." />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input value={googleUser?.email || ''} readOnly className={`${inputCls} opacity-60`} placeholder="auto-filled" />
                </div>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep('auth')}
                  className="flex-1 py-3 rounded-xl border border-[#2d3449] text-[#909097] text-sm hover:bg-[#171f33] transition-colors">
                  Back
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#4edea3] text-[#003824] font-bold text-sm hover:brightness-110 transition-all">
                  Generate Ticket
                </button>
              </div>
            </form>
          )}

          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#909097] uppercase tracking-widest">Minting your ticket...</p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="material-symbols-outlined text-5xl text-[#4edea3]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="font-headline font-bold text-[#dae2fd] text-lg">Ticket Booked!</p>
              <p className="text-sm text-[#909097]">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QRScannerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop scanning on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        // Only attempt to stop if we were actually scanning
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e: any) => console.log("Stop on unmount", e));
        }
      }
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setInitializing(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // We need an instance to scan files, even if camera isn't running
      if (!scannerRef.current) {
        // We use a hidden temp element if the main reader isn't ready
        scannerRef.current = new Html5Qrcode("reader");
      }

      const decodedText = await scannerRef.current.scanFile(file, true);
      
      if (decodedText) {
        if (decodedText.startsWith('http') || decodedText.includes('token=')) {
          router.push(decodedText);
        } else {
          router.push(`/guest/login?token=${decodedText}`);
        }
      }
    } catch (err) {
      console.error("File scan error:", err);
      setError("QR code not detected. Make sure the image shows only the QR code clearly on a white background. Use the 'Save QR' button in admin to get a clean scannable image.");
    } finally {
      setInitializing(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startScanner = async () => {
    setInitializing(true);
    setError(null);
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Initialize if not already done
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        if (decodedText.length > 5) {
          scannerRef.current.stop().then(() => {
             // Handle redirect
             if (decodedText.startsWith('http') || decodedText.includes('token=')) {
                router.push(decodedText);
             } else {
                router.push(`/guest/login?token=${decodedText}`);
             }
          });
        }
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      // Start the camera - we use 'environment' to prefer the back camera on mobile
      await scannerRef.current.start(
        { facingMode: "environment" }, 
        config, 
        qrCodeSuccessCallback
      );
      
      setScanning(true);
      setInitializing(false);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Camera Access Denied or Module Error. Please check permissions.");
      setInitializing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (e) {
        console.error("Failed to stop", e);
      }
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back button */}
      <button onClick={() => router.push('/')} className="absolute top-5 left-5 z-20 flex items-center gap-1 text-on-surface-variant/60 hover:text-primary transition-colors text-sm font-medium">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back
      </button>
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>

      {showBooking && (
        <BookTicketModal
          onClose={() => setShowBooking(false)}
          onSuccess={(url) => { setShowBooking(false); router.push(url); }}
        />
      )}
      
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-4 mx-auto border border-outline-variant/30 shadow-lg">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>qr_code_scanner</span>
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface uppercase italic">Tactical Access</h1>
          <p className="font-body text-[10px] text-on-surface-variant uppercase tracking-[0.3em] mt-1 font-bold">Encrypted Handshake Required</p>
        </div>

        {/* The Viewport */}
        <div className="w-full relative rounded-[2rem] overflow-hidden border border-outline-variant/20 shadow-2xl bg-surface-container-low aspect-square flex items-center justify-center">
          
          {/* Hardware target div - NO REACT CHILDREN ALLOWED INSIDE HERE */}
          <div id="reader" className="w-full h-full absolute inset-0"></div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Custom Overlay (Managed by React) */}
          {!scanning && !initializing && (
            <div className="z-20 text-center px-6">
               <p className="text-on-surface-variant text-xs mb-6 font-medium">Camera sensor offline. Initialize to continue.</p>
               
               <div className="flex flex-col gap-3">
                 <button 
                   onClick={startScanner}
                   className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg"
                 >
                   <span className="material-symbols-outlined text-sm">camera_alt</span>
                   Commence Hardware Scan
                 </button>

                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-surface-container-highest text-on-surface px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 border border-outline-variant/30"
                 >
                   <span className="material-symbols-outlined text-sm">upload_file</span>
                   Browse Ticket Image
                 </button>

                 <div className="flex items-center gap-3 w-full">
                   <div className="flex-1 h-px bg-outline-variant/20" />
                   <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">or</span>
                   <div className="flex-1 h-px bg-outline-variant/20" />
                 </div>

                 <button
                   onClick={() => setShowBooking(true)}
                   className="w-full bg-secondary/10 border border-secondary/30 text-secondary px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary/20 transition-colors flex items-center justify-center gap-2"
                 >
                   <span className="material-symbols-outlined text-sm">confirmation_number</span>
                   Book a Ticket
                 </button>
               </div>
            </div>
          )}

          {initializing && (
            <div className="z-20 flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Waking Sensors...</span>
            </div>
          )}

          {scanning && (
            <>
              {/* Corner markers */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl pointer-events-none z-30 opacity-80"></div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl pointer-events-none z-30 opacity-80"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl pointer-events-none z-30 opacity-80"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl pointer-events-none z-30 opacity-80"></div>
              
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] animate-scan z-30"></div>
              
              <button 
                onClick={stopScanner}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-error/20 hover:bg-error/30 text-error-fixed px-4 py-2 rounded-full border border-error/50 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
              >
                Safety Override
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-error-container/20 border border-error/20 rounded-2xl flex items-center gap-3 w-full">
            <span className="material-symbols-outlined text-error" data-icon="error_outline">error_outline</span>
            <p className="text-error text-xs font-semibold">{error}</p>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-surface-variant/40 border border-outline-variant/10">
            <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-on-surface-variant/30'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              {scanning ? 'Handshake Active' : 'Waiting for Authorization'}
            </span>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            className="text-on-surface-variant/50 hover:text-primary transition-all text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Return to Landing Page
          </button>        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite alternate;
        }
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 2rem !important;
        }
      `}</style>
    </div>
  );
}
