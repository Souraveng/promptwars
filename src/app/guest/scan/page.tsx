"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QRScannerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop scanning on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
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
      if (!scannerRef.current) {
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
      setError("QR code not detected. Please upload a clear image of your tactical pass.");
    } finally {
      setInitializing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startScanner = async () => {
    setInitializing(true);
    setError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      const qrCodeSuccessCallback = (decodedText: string) => {
        if (decodedText.length > 5) {
          scannerRef.current.stop().then(() => {
             if (decodedText.startsWith('http') || decodedText.includes('token=')) {
                router.push(decodedText);
             } else {
                router.push(`/guest/login?token=${decodedText}`);
             }
          });
        }
      };
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await scannerRef.current.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);
      setScanning(true);
      setInitializing(false);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Tactical Sensor Access Denied. Verify camera permissions.");
      setInitializing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (e) { console.error("Failed to stop", e); }
    }
  };

  return (
    <div className="bg-[#060d20] text-on-background font-body min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back button */}
      <button 
        onClick={() => router.push('/')} 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/5">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </div>
        Return to Portal
      </button>

      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 flex flex-col items-center translate-y-[-2rem]">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-surface-container-highest/20 flex items-center justify-center mb-6 mx-auto border border-outline-variant/10 shadow-2xl backdrop-blur-md">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
          </div>
          <h1 className="font-headline text-3xl font-black tracking-tighter text-on-surface uppercase italic">Tactical Gateway</h1>
          <p className="font-body text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-3 opacity-60">Verified Operative Entrance</p>
        </div>

        {/* The Viewport */}
        <div className="w-full relative rounded-[3rem] overflow-hidden border-2 border-outline-variant/10 shadow-[0_32px_128px_rgba(0,0,0,0.5)] bg-surface-container-low aspect-square flex items-center justify-center">
          <div id="reader" className="w-full h-full absolute inset-0"></div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

          {!scanning && !initializing && (
            <div className="z-20 text-center px-10">
               <div className="flex flex-col gap-4">
                 <button onClick={startScanner} className="group bg-primary text-on-primary px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(var(--color-primary-rgb),0.3)]">
                   <span className="material-symbols-outlined text-base">sensors</span>
                   Initialize Scanner
                 </button>

                 <button onClick={() => fileInputRef.current?.click()} className="bg-surface-container-highest/40 text-on-surface px-8 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3 border border-outline-variant/10">
                   <span className="material-symbols-outlined text-base">cloud_upload</span>
                   Upload Digital Pass
                 </button>
               </div>
               
               <p className="mt-8 text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Handshake</p>
            </div>
          )}

          {initializing && (
            <div className="z-20 flex flex-col items-center gap-5">
               <div className="w-12 h-12 border-[5px] border-primary border-t-transparent rounded-full animate-spin"></div>
               <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary animate-pulse">Establishing Uplink...</span>
            </div>
          )}

          {scanning && (
            <>
              <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl pointer-events-none z-30 opacity-60"></div>
              <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl pointer-events-none z-30 opacity-60"></div>
              <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl pointer-events-none z-30 opacity-60"></div>
              <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl pointer-events-none z-30 opacity-60"></div>
              <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-primary/60 shadow-[0_0_20px_var(--color-primary)] animate-scan z-30"></div>
              <button onClick={stopScanner} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 bg-error/10 hover:bg-error/20 text-error-fixed px-6 py-2.5 rounded-full border border-error/20 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl">Abort Operations</button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-8 p-5 bg-error/5 border border-error/10 rounded-[2rem] flex items-center gap-4 w-full animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <p className="text-error text-[11px] font-bold uppercase tracking-wide">{error}</p>
          </div>
        )}

        {/* Unified Action Box (Handshake + Marketplace) */}
        <div className="mt-12 w-full max-w-sm bg-surface-container-low/60 backdrop-blur-3xl rounded-[2.5rem] border border-outline-variant/10 p-8 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle scanning glow inside box */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse"></div>
          
          <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-white/5 border border-white/5">
            <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-primary/20'}`}></div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant">
              {scanning ? 'Handshake Active' : 'Waiting for Handshake'}
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-on-surface-variant/40 text-[9px] font-black uppercase tracking-[0.4em] font-mono">No Tactical Pass Found?</p>
            <button 
              onClick={() => router.push('/guest/login')}
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-primary/20 hover:border-primary/40 active:scale-95 group/btn"
            >
              <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform">login</span>
              Sign In to Marketplace
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan { 0% { top: 15%; } 100% { top: 85%; } }
        .animate-scan { animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate; }
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
      `}</style>
    </div>
  );
}
