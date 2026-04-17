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
      setError("Could not find a valid QR ticket in that image.");
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
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      
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
            className="text-on-surface-variant/50 hover:text-primary transition-all text-[10px] font-bold uppercase tracking-[0.1em]"
          >
            ← Return to Command Landing
          </button>
        </div>
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
