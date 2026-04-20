'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuest } from '../GuestContext';

export default function GuestMapPage() {
  const router = useRouter();
  const { activeTicket } = useGuest();

  // Authorization Guard
  useEffect(() => {
    const now = new Date();
    const isExpired = activeTicket?.event?.expiryDate && new Date(activeTicket.event.expiryDate) < now;
    const isEventActive = activeTicket?.event?.isActive;
    const isValid = activeTicket && isEventActive && !isExpired;

    if (!isValid) {
      router.replace('/guest/dashboard?locked=true');
    }
  }, [activeTicket, router]);

  return (
    <main className="relative h-[calc(100vh-8rem)] w-full overflow-hidden bg-background">
      {/* Interactive Vector Map Base */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(173, 198, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      ></div>
      
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        {/* Simulated Vector Map Elements */}
        <div className="relative w-full h-full max-w-4xl max-h-[618px]">
          {/* Static Map Background Mock */}
          <img 
            className="w-full h-full object-contain opacity-30 grayscale invert brightness-50 mix-blend-screen" 
            alt="Dark minimalist architectural blueprint of a stadium arena with electric blue vector outlines and neon highlight areas" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEs4REBjZVkwyuVAkR1XJqUcdDDqquw7dWD4WsoXIHgTH51yZZYBsfhTFQNiqFk_IJndZtKiyLFYGLLX6kxHP4jm9QeCc92BdKrxaYspWuNmMK27NAArJOZOLqbG4rRHSa2yu1JRTByA3i-kOehuUAou3IF56zIVvUvoTDhAZ2MoIF7vbjSi7pQAL7KAvpBRzLMotfq0AQ3WX3z9A0NcNKmRJT4yHeO83Ot5oAsR52Z1wDi-Qe9MYoQcZ9l2E089N6Vl9owu_BO3Ff"
          />
          {/* Tactical Overlays */}
          <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
            {/* Electric Blue Route Line */}
            <path className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" d="M100 500 L250 480 L320 350 L450 320 L580 200" stroke="#3B82F6" strokeDasharray="8 4" strokeLinecap="round" strokeWidth="3"></path>
            {/* Destination Target */}
            <circle cx="580" cy="200" fill="rgba(59, 130, 246, 0.2)" r="12" stroke="#3B82F6" strokeWidth="1"></circle>
            <circle cx="580" cy="200" fill="#3B82F6" r="4"></circle>
            {/* You Are Here (Emerald Glow Pulse) */}
            <circle cx="100" cy="500" fill="rgba(16, 185, 129, 0.15)" r="20">
              <animate attributeName="r" dur="3s" repeatCount="indefinite" values="15;25;15"></animate>
            </circle>
            <circle className="drop-shadow-[0_0_10px_rgba(16,185,129,1)]" cx="100" cy="500" fill="#10B981" r="6"></circle>
          </svg>
        </div>
      </div>

      {/* Floating UI: Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-10">
        <div className="bg-[#222a3e]/60 backdrop-blur-xl rounded-xl flex items-center px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.4)] border-l border-primary/20">
          <span className="material-symbols-outlined text-surface-tint mr-3" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm font-label uppercase tracking-widest text-on-surface placeholder-on-surface-variant/40 w-full" placeholder="LOCATE SECTION, SEAT, OR AMENITY" type="text"/>
          <span className="material-symbols-outlined text-on-surface-variant/40" data-icon="mic">mic</span>
        </div>
      </div>

      {/* Floating UI: Floor Selection */}
      <div className="absolute top-24 right-6 flex flex-col gap-2 z-10">
        <button className="w-12 h-12 bg-[#222a3e]/60 backdrop-blur-xl rounded-lg flex items-center justify-center font-headline text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">L3</button>
        <button className="w-12 h-12 bg-[#222a3e]/60 backdrop-blur-xl rounded-lg flex items-center justify-center font-headline text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">L2</button>
        <button className="w-12 h-12 bg-primary-container/30 border-l-2 border-primary rounded-lg flex items-center justify-center font-headline text-sm font-bold text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]">L1</button>
      </div>

      {/* Floating UI: Tactical Controls */}
      <div className="absolute top-24 left-6 flex flex-col gap-4 z-10">
        <button className="w-10 h-10 bg-[#222a3e]/60 backdrop-blur-xl rounded-full flex items-center justify-center text-on-surface-variant" title="Recenter">
          <span className="material-symbols-outlined text-sm" data-icon="my_location">my_location</span>
        </button>
        <button className="w-10 h-10 bg-[#222a3e]/60 backdrop-blur-xl rounded-full flex items-center justify-center text-on-surface-variant" title="Layer View">
          <span className="material-symbols-outlined text-sm" data-icon="layers">layers</span>
        </button>
      </div>

      {/* Info Overlay: Route Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-lg z-20">
        <div className="bg-[#222a3e]/60 backdrop-blur-xl rounded-xl overflow-hidden relative border-t border-primary/10 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
          {/* Scanning line effect */}
          <div className="absolute left-0 -top-[100px] w-full h-[100px] bg-gradient-to-b from-transparent via-[rgba(194,198,214,0.05)] to-transparent pointer-events-none animate-[scan_3s_linear_infinite]"></div>
          
          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-label font-bold text-secondary uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]" data-icon="check_circle" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Optimized Route Found
                </div>
                <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">Route to Seat 45F</h2>
                <p className="text-xs text-on-surface-variant/70 font-label flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-[14px]" data-icon="walking">directions_walk</span>
                  220m • Est. 3 mins • Level 1
                </p>
              </div>
              <div className="bg-surface-container-highest px-3 py-1 rounded text-primary font-headline text-xs font-bold border border-primary/20">
                VIP WING
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest p-3 rounded-lg border-l border-primary/30">
                <div className="text-[9px] text-on-surface-variant/50 font-label uppercase mb-1">Queue Level</div>
                <div className="text-sm font-headline font-bold text-secondary">LOW</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border-l border-primary/30">
                <div className="text-[9px] text-on-surface-variant/50 font-label uppercase mb-1">Gate Entry</div>
                <div className="text-sm font-headline font-bold text-on-surface">NORTH-4</div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg border-l border-primary/30">
                <div className="text-[9px] text-on-surface-variant/50 font-label uppercase mb-1">Elevator</div>
                <div className="text-sm font-headline font-bold text-on-surface">E-12</div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-primary to-primary-container py-4 rounded-lg font-headline font-bold text-on-primary-container uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all">
              <span className="material-symbols-outlined" data-icon="navigation">navigation</span>
              Start Nav
            </button>
          </div>
        </div>
      </div>
      
      {/* Contextual Telemetry (Decorative Side Elements) */}
      <div className="hidden md:flex fixed right-6 top-64 flex-col gap-6 w-48 z-40">
        <div className="bg-surface-container-high/40 backdrop-blur-md p-3 rounded-lg border-l border-primary/20">
          <div className="text-[10px] text-primary font-headline font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
            System Live
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-on-surface-variant/60">LATENCY</span>
              <span className="text-on-surface font-mono">14ms</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-2/3"></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high/40 backdrop-blur-md p-3 rounded-lg border-l border-primary/20">
          <div className="text-[10px] text-on-surface-variant/60 font-headline font-bold uppercase tracking-widest mb-1">ENV_DATA</div>
          <div className="text-xl font-headline font-bold text-on-surface">24°C / 42%</div>
          <div className="text-[9px] text-on-surface-variant/40 mt-1">OPTIMIZED HVAC ACTVE</div>
        </div>
      </div>
    </main>
  );
}
