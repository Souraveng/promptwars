'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestSOSPage() {
  const router = useRouter();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds

  const startHolding = () => {
    if (isTriggered) return;
    setIsHolding(true);
    setProgress(0);
    
    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        handleTrigger();
      }
    }, 50);
  };

  const stopHolding = () => {
    setIsHolding(false);
    if (!isTriggered) {
      setProgress(0);
    }
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const handleTrigger = () => {
    setIsTriggered(true);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    // Vibrate device if supported
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-tertiary selection:text-on-tertiary min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Top Navigation Anchor - Sentinel Lens Tactical Branding */}
      <header className="fixed top-0 w-full z-50 bg-[#0B1326]/60 backdrop-blur-md flex justify-between items-center h-16 px-6 shadow-[0_1px_0_0_rgba(219,226,253,0.05)]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#3B82F6]" data-icon="radar">radar</span>
          <span className="text-sm font-bold tracking-[0.2em] text-[#DBE2FD] font-headline uppercase">Sentinel Lens</span>
        </div>
        <div className="font-headline uppercase tracking-widest text-xs text-[#DBE2FD]/60">
          {new Date().getUTCHours()}:{new Date().getUTCMinutes().toString().padStart(2, '0')} UTC
        </div>
      </header>

      {/* Main Tactical Canvas */}
      <main className="flex-1 flex flex-col pt-20 pb-24 px-6 relative overflow-y-auto scroll-smooth">
        {/* Background Ambient Element */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary rounded-full blur-[120px]"></div>
        </div>
        
        {/* Telemetry Header */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col">
            <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">System Status</span>
            <span className="font-headline text-lg font-bold text-tertiary tracking-tight">
              {isTriggered ? "SIGNAL SENT" : "CRITICAL ALERT"}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">Nearest Exit</span>
            <span className="font-headline text-lg font-bold text-tertiary tracking-tight">GATE 3</span>
          </div>
        </div>

        {/* Central SOS Trigger */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative group">
            {/* Outer Rings */}
            <div className={`absolute inset-0 -m-8 border border-tertiary/20 rounded-full ${isHolding || isTriggered ? 'animate-ping' : 'animate-pulse'}`}></div>
            <div className={`absolute inset-0 -m-4 border border-tertiary/40 rounded-full ${isHolding ? 'scale-110' : ''} transition-transform duration-500`}></div>
            
            {/* Hold progress ring overlay (Visual hack using transparent border/conic gradient if needed, but keeping it simple with CSS) */}
            <svg className="absolute inset-0 -m-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="100 100"
                strokeDashoffset={100 - progress}
                className="text-tertiary transition-all duration-75 ease-linear"
                style={{ strokeDasharray: '283', strokeDashoffset: 283 - (283 * progress) / 100 }}
              />
            </svg>

            {/* Main Glass Trigger */}
            <div 
              onMouseDown={startHolding}
              onMouseUp={stopHolding}
              onMouseLeave={stopHolding}
              onTouchStart={startHolding}
              onTouchEnd={stopHolding}
              onClick={handleTrigger}
              className={`relative w-64 h-64 rounded-full glass-card flex items-center justify-center sos-glow overflow-hidden cursor-pointer select-none transition-all duration-300 ${isHolding ? 'scale-95' : 'active:scale-95'} ${isTriggered ? 'bg-tertiary text-on-tertiary shadow-[0_0_80px_rgba(244,63,94,0.6)]' : ''}`}
            >
              <div className="scanning-line"></div>
              <div className="flex flex-col items-center gap-1 z-10">
                <span className={`font-headline text-6xl font-extrabold tracking-tighter transition-colors ${isTriggered ? 'text-on-tertiary' : 'text-tertiary'}`}>SOS</span>
                <span className={`font-label text-[10px] uppercase tracking-widest transition-opacity ${isTriggered ? 'opacity-100 font-bold' : 'text-tertiary/80'}`}>
                  {isTriggered ? "DISPATCHED" : isHolding ? "SIGNALING..." : "Tap or Hold"}
                </span>
              </div>
            </div>
          </div>

          {/* Coordinate Telemetry */}
          <div className={`mt-12 text-center transition-all duration-700 ${isTriggered ? 'scale-110' : ''}`}>
            <div className={`font-headline text-2xl font-medium tracking-widest transition-colors ${isTriggered ? 'text-tertiary' : 'text-on-surface'}`}>
              40.7128° N | 74.0060° W
            </div>
            <div className="mt-2 font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
              Tracking Terminal ID: SENT-99-AX
            </div>
          </div>
        </div>

        {/* Quick Assistance Grid */}
        <div className={`mt-auto grid grid-cols-4 gap-3 transition-opacity duration-500 ${isTriggered ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => router.push('/guest/medical')}
            className="glass-card aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group"
          >
            <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="medical_services">medical_services</span>
            <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Medical</span>
          </button>
          <button 
            onClick={() => router.push('/guest/security')}
            className="glass-card aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group"
          >
            <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="policy">policy</span>
            <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Security</span>
          </button>
          <button 
            onClick={() => router.push('/guest/spill')}
            className="glass-card aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group"
          >
            <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="cleaning_services">cleaning_services</span>
            <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Spill</span>
          </button>
          <button 
            onClick={() => router.push('/guest/staff')}
            className="glass-card aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group"
          >
            <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="support_agent">support_agent</span>
            <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Staff</span>
          </button>
        </div>
      </main>

      {/* Bottom Tactical Navigation */}
      <div className="fixed bottom-0 w-full z-50 pb-safe bg-[#0B1326]/80 backdrop-blur-lg flex justify-around items-center h-20 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => router.push('/guest/dashboard')}
          className="flex flex-col items-center justify-center text-[#DBE2FD]/40 active:scale-90 transition-all duration-300"
        >
          <span className="material-symbols-outlined mb-1" data-icon="close">close</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-tighter">
            {isTriggered ? "End Signal" : "Cancel Signal"}
          </span>
        </button>
        <button 
          onClick={() => router.push('/guest/alerts')}
          className="flex flex-col items-center justify-center text-[#3B82F6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] active:scale-90 transition-all duration-300"
        >
          <span className="material-symbols-outlined mb-1" data-icon="notifications">notifications</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>
      </div>

      {/* Background texture and overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.03]" data-alt="fine digital noise and grid overlay for a high-tech tactical operating system interface"></div>
    </div>
  );
}
