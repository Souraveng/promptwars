import React from 'react';

export default function GuestSOSPage() {
  return (
    <main className="flex-1 flex flex-col px-6 relative overflow-hidden min-h-[calc(100vh-10rem)]">
      {/* Background Ambient Element */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary rounded-full blur-[120px]"></div>
      </div>
      
      {/* Telemetry Header */}
      <div className="grid grid-cols-2 gap-4 mb-8 pt-8">
        <div className="flex flex-col">
          <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">System Status</span>
          <span className="font-headline text-lg font-bold text-tertiary tracking-tight">CRITICAL ALERT</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant">Nearest Exit</span>
          <span className="font-headline text-lg font-bold text-tertiary tracking-tight">GATE 3</span>
        </div>
      </div>

      {/* Central SOS Trigger */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-12">
        <div className="relative group">
          {/* Outer Ring */}
          <div className="absolute inset-0 -m-8 border border-tertiary/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 -m-4 border border-tertiary/40 rounded-full"></div>
          
          {/* Main Glass Trigger */}
          <div className="relative w-64 h-64 rounded-full bg-[#222a3e]/60 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.3)] overflow-hidden cursor-pointer active:scale-95 transition-all duration-300">
            {/* Scanning Line */}
            <div className="absolute left-0 w-full h-[2px] bg-[rgba(244,63,94,0.5)] shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-[scan_4s_linear_infinite]"></div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="font-headline text-6xl font-extrabold text-tertiary tracking-tighter">SOS</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-tertiary/80">Hold to Signal</span>
            </div>
          </div>
        </div>

        {/* Coordinate Telemetry */}
        <div className="mt-12 text-center">
          <div className="font-headline text-2xl font-medium text-on-surface tracking-widest">
            40.7128° N | 74.0060° W
          </div>
          <div className="mt-2 font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
            Tracking Terminal ID: SENT-99-AX
          </div>
        </div>
      </div>

      {/* Quick Assistance Grid */}
      <div className="mt-auto grid grid-cols-4 gap-3">
        <button className="bg-[#222a3e]/60 backdrop-blur-xl aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group">
          <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="medical_services">medical_services</span>
          <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Medical</span>
        </button>
        <button className="bg-[#222a3e]/60 backdrop-blur-xl aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group">
          <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="policy">policy</span>
          <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Security</span>
        </button>
        <button className="bg-[#222a3e]/60 backdrop-blur-xl aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group">
          <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="cleaning_services">cleaning_services</span>
          <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Spill</span>
        </button>
        <button className="bg-[#222a3e]/60 backdrop-blur-xl aspect-square rounded-xl flex flex-col items-center justify-center border border-tertiary/5 hover:border-tertiary/40 transition-all group">
          <span className="material-symbols-outlined text-tertiary mb-2 text-2xl" data-icon="support_agent">support_agent</span>
          <span className="font-label text-[9px] uppercase font-bold tracking-tighter text-on-surface-variant group-hover:text-tertiary transition-colors">Staff</span>
        </button>
      </div>

      {/* Background texture and overlay */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.03]"></div>
    </main>
  );
}
