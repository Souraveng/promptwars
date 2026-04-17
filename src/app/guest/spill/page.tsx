'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function GuestSpillPage() {
  const router = useRouter();
  const [isTriggered, setIsTriggered] = React.useState(false);

  const handleTrigger = () => {
    setIsTriggered(true);
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([200, 100, 200]);
    }
  };

  const categories = [
    {
      id: 'liquid',
      title: 'Liquid Spill',
      desc: 'Significant liquid accumulation. Slippery surface detected. Hazard markers required.',
      icon: 'water_drop',
      priority: 'URGENT',
      color: 'primary',
      colSpan: 'md:col-span-2'
    },
    {
      id: 'biological',
      title: 'Bio Hazard',
      desc: 'Biological waste detected. Specialized sanitation protocol activation required.',
      icon: 'biohazard',
      priority: 'CRITICAL',
      color: 'tertiary',
      colSpan: 'md:col-span-1'
    },
    {
      id: 'glass',
      title: 'Broken Glass',
      desc: 'Sharp debris in public path. Cordon required for immediate sweep and collection.',
      icon: 'architecture',
      priority: 'URGENT',
      color: 'secondary',
      colSpan: 'md:col-span-1'
    },
    {
      id: 'trip',
      title: 'Trip Hazard',
      desc: 'Physical obstruction or uneven floor surface. Maintain visibility until marked.',
      icon: 'running_with_errors',
      priority: 'STANDARD',
      color: 'primary',
      colSpan: 'md:col-span-2'
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container min-h-screen w-full flex flex-col relative overflow-x-hidden">
      {/* Top Tactical Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0B1326]/60 backdrop-blur-md flex justify-between items-center h-16 px-6 shadow-[0_1px_0_0_rgba(219,226,253,0.05)]">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${isTriggered ? 'text-tertiary animate-pulse' : 'text-primary'}`} data-icon="cleaning_services">cleaning_services</span>
          <span className="text-sm font-bold tracking-[0.2em] text-[#DBE2FD] font-headline uppercase">
            {isTriggered ? 'Hazard Contained' : 'Maintenance Alert'}
          </span>
        </div>
        <div className="font-headline uppercase tracking-widest text-xs text-[#DBE2FD]/60">SENTINEL LENS</div>
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-24 px-6 relative overflow-y-auto scroll-smooth">
        {/* Telemetry Grid */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 rounded-xl border border-white/5">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">TEAM STATUS</p>
            <p className={`font-headline text-2xl font-bold ${isTriggered ? 'text-secondary animate-pulse' : 'text-secondary'}`}>
              {isTriggered ? 'DISPATCHED' : 'READY'}
            </p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/5 text-right">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">CLEANUP ETA</p>
            <p className="font-headline text-2xl font-bold text-primary">{isTriggered ? '03:20 MIN' : '05:15 MIN'}</p>
          </div>
        </section>

        {/* Location Lock */}
        <section className="glass-card p-6 rounded-2xl mb-6 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTriggered ? 'bg-secondary animate-ping shadow-[0_0_15px_#4edea3]' : 'bg-primary animate-pulse shadow-[0_0_10px_#3b82f6]'}`}></div>
              <span className={`text-[10px] font-label uppercase tracking-widest ${isTriggered ? 'text-secondary' : 'text-primary'}`}>
                {isTriggered ? 'Cordon Active' : 'Active Zone'}
              </span>
            </div>
          </div>
          <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant block mb-1">hazard sector</label>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Section 114, Row G</h2>
        </section>

        {/* Option Grid */}
        <section className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transition-opacity ${isTriggered ? 'opacity-50 pointer-events-none' : ''}`}>
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={handleTrigger}
              className={`${cat.colSpan} glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:bg-surface-container-high transition-all border border-white/5 active:scale-95`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="flex justify-between items-start z-10 mb-8">
                <span className={`material-symbols-outlined text-${cat.color} text-4xl`} data-icon={cat.icon}>{cat.icon}</span>
                <span className={`font-label text-[10px] px-2 py-1 rounded bg-${cat.color}/10 text-${cat.color}`}>{cat.priority}</span>
              </div>
              <div className="z-10">
                <h3 className="font-headline text-xl font-bold mb-1">{cat.title}</h3>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">{cat.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Immediate Assistance CTA */}
        <button 
          onClick={handleTrigger}
          className={`w-full h-20 rounded-2xl relative overflow-hidden group mb-4 transition-all ${isTriggered ? 'opacity-100 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : ''}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${isTriggered ? 'from-secondary to-[#059669]' : 'from-primary to-[#1d4ed8]'} transition-transform duration-500 group-hover:scale-105`}></div>
          <div className={`absolute inset-0 ${isTriggered ? '' : 'shadow-[0_0_40px_rgba(59,130,246,0.3)]'}`}></div>
          <div className="relative flex items-center justify-center gap-4 z-10">
            <span className="material-symbols-outlined text-white text-3xl" data-icon={isTriggered ? "task_alt" : "mop"} style={{ fontVariationSettings: "'FILL' 1" }}>{isTriggered ? "task_alt" : "mop"}</span>
            <span className="font-headline font-bold text-xl uppercase tracking-[0.15em] text-white">
              {isTriggered ? "Crew Dispatched" : "Alert Cleanup Crew"}
            </span>
          </div>
          <div className="scanning-line opacity-30"></div>
        </button>
      </main>

      {/* Bottom Tactical Nav */}
      <footer className="fixed bottom-0 w-full z-50 pb-safe bg-[#0B1326]/80 backdrop-blur-lg flex justify-around items-center h-20 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => router.push('/guest/sos')}
          className="flex flex-col items-center justify-center text-[#DBE2FD]/40 active:scale-90 transition-all duration-300"
        >
          <span className="material-symbols-outlined mb-1" data-icon="arrow_back">arrow_back</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-tighter">Back to SOS</span>
        </button>
        <button 
          onClick={() => router.push('/guest/alerts')}
          className="flex flex-col items-center justify-center text-primary active:scale-90 transition-all duration-300"
        >
          <span className="material-symbols-outlined mb-1" data-icon="notifications">notifications</span>
          <span className="font-body text-[10px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>
      </footer>
    </div>
  );
}
