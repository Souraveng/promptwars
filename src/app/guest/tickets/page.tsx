import React from 'react';

export default function GuestTicketPage() {
  return (
    <main className="px-6 max-w-lg mx-auto space-y-8">
      {/* Event Identity */}
      <section className="space-y-2 pt-8">
        <div className="flex justify-between items-start">
          <h1 className="font-headline font-bold text-3xl tracking-tight leading-tight max-w-[280px]">
            Neon Horizon Tour 2024
          </h1>
          <div className="bg-secondary-container/20 px-3 py-1 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(78,222,163,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-secondary">VALID</span>
          </div>
        </div>
        <p className="font-label text-on-surface-variant/70 text-xs tracking-widest uppercase">Cyber-Acoustic Pavilion / Aug 14</p>
      </section>

      {/* QR Glassmorphic Container */}
      <section className="relative group">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="bg-surface-container-high/60 backdrop-blur-xl p-8 rounded-xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] ring-1 ring-on-surface/5">
          {/* Scanning Line */}
          <div className="absolute left-0 top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent animate-[scan_3s_linear_infinite] z-10"></div>
          
          <div className="aspect-square bg-white p-4 rounded-lg relative z-0 flex items-center justify-center">
            {/* QR Code Placeholder */}
            <img 
              alt="Entry Token" 
              className="w-full h-full object-contain mix-blend-multiply opacity-90" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8cqfBbwUtxU4DghDKXs11EPqh3UAF9ilbQaZdjjH-gm4LD-WnuG9Jubbwlf-Xe4utOrdVzRpilUZP2xFjd09MFkmVNt7C02X7q0TfJL_AX3UdmooiXb-wVd_fmR6dDXPJ6AAdxGUYPwA21lu1wPNFc7ToCnuKy2v6ky4hy8A4TYonb2tj5y9yGvHnZXjWeaMNRVDXEO4yzwc0JGxmImGgb5oPGSgn6WiS56_8pYX4Gv0U_OTkvTrdYFA1Z1UUjD0EPYzGyWogOiXw"
            />
          </div>
          
          <div className="mt-6 flex justify-between items-center px-2">
            <div className="space-y-1">
              <p className="font-label text-[10px] uppercase text-on-surface-variant tracking-tighter">Token ID</p>
              <p className="font-headline text-sm font-medium tracking-widest">NH-7729-001X</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-label text-[10px] uppercase text-on-surface-variant tracking-tighter">Encrypted</p>
              <span className="material-symbols-outlined text-secondary text-lg" data-icon="lock" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal-Style Data Grid */}
      <section className="grid grid-cols-3 gap-0.5 bg-outline-variant/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="bg-surface-container-low p-4 flex flex-col gap-1">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Gate</span>
          <span className="font-headline text-xl font-bold text-primary">NORTH</span>
        </div>
        <div className="bg-surface-container-low p-4 flex flex-col gap-1 border-x border-outline-variant/10">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Section</span>
          <span className="font-headline text-xl font-bold text-primary">112</span>
        </div>
        <div className="bg-surface-container-low p-4 flex flex-col gap-1">
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Seat</span>
          <span className="font-headline text-xl font-bold text-primary">45F</span>
        </div>
      </section>

      {/* Wallet Actions */}
      <section className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 bg-surface-container-high/40 hover:bg-surface-container-high/60 backdrop-blur-md py-4 rounded-xl border border-on-surface/5 transition-all duration-300 active:scale-95 group">
          <span className="material-symbols-outlined text-primary group-hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.6)]" data-icon="account_balance_wallet">account_balance_wallet</span>
          <span className="font-headline text-xs font-bold uppercase tracking-widest">Apple Wallet</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-surface-container-high/40 hover:bg-surface-container-high/60 backdrop-blur-md py-4 rounded-xl border border-on-surface/5 transition-all duration-300 active:scale-95 group">
          <span className="material-symbols-outlined text-primary group-hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.6)]" data-icon="google_wallet">wallet</span>
          <span className="font-headline text-xs font-bold uppercase tracking-widest">Google Pay</span>
        </button>
      </section>

      {/* Additional Telemetry */}
      <div className="bg-surface-container-lowest p-5 rounded-xl space-y-4 shadow-inner">
        <div className="flex justify-between items-center border-b border-on-surface/5 pb-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant" data-icon="schedule">schedule</span>
            <div>
              <p className="font-label text-[10px] uppercase text-on-surface-variant">Doors Open</p>
              <p className="font-headline text-sm">18:30 LOCAL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-label text-[10px] uppercase text-on-surface-variant">Expected Traffic</p>
            <p className="font-headline text-sm text-secondary">MODERATE</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant shrink-0" data-icon="info">info</span>
          <p className="text-[11px] leading-relaxed text-on-surface-variant/80 italic">
            Security check required at North Perimeter. Prohibited items include glass, large bags, and professional recording equipment.
          </p>
        </div>
      </div>
    </main>
  );
}
