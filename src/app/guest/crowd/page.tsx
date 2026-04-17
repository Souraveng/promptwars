import React from 'react';

export default function GuestCrowdPage() {
  return (
    <main className="px-4 md:px-12 max-w-7xl mx-auto space-y-8 pt-8">
      {/* Hero Telemetry Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Occupancy Readout */}
        <div className="md:col-span-4 bg-surface-container-low p-8 relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div className="absolute left-0 w-full h-[1px] bg-[rgba(194,198,214,0.05)] top-0 pointer-events-none animate-[scan_3s_linear_infinite]"></div>
          <div>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 block mb-2">System Status: Tactical Overlay</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]"></div>
              <span className="font-label text-[10px] uppercase font-bold tracking-tighter text-secondary">Live Telemetry Active</span>
            </div>
          </div>
          <div className="mt-auto">
            <h1 className="font-headline text-7xl font-bold tracking-tighter text-on-surface">84<span className="text-3xl text-surface-tint opacity-50">%</span></h1>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Total Occupancy</p>
            <div className="mt-4 flex gap-1">
              <div className="h-1 flex-1 bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.3)]"></div>
              <div className="h-1 flex-1 bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.3)]"></div>
              <div className="h-1 flex-1 bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.3)]"></div>
              <div className="h-1 flex-1 bg-tertiary-container/30"></div>
              <div className="h-1 flex-1 bg-tertiary-container/10"></div>
            </div>
          </div>
        </div>

        {/* Main Heatmap Container */}
        <div className="md:col-span-8 bg-[#222a3e]/60 backdrop-blur-xl p-6 relative overflow-hidden flex flex-col min-h-[320px]">
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="space-y-1">
              <h2 className="font-headline text-lg uppercase tracking-widest text-on-surface">Heatmap_01</h2>
              <div className="flex items-center gap-4 text-[10px] font-mono text-on-surface-variant/40">
                <span>LAT: 34.0522° N</span>
                <span>LNG: 118.2437° W</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-surface-container-highest p-2 rounded hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-sm" data-icon="zoom_in">zoom_in</span>
              </button>
              <button className="bg-surface-container-highest p-2 rounded hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-sm" data-icon="layers">layers</span>
              </button>
            </div>
          </div>

          {/* Abstract Heatmap UI */}
          <div className="flex-grow relative bg-surface-container-lowest overflow-hidden rounded-lg">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#dbe2fd 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
            {/* Glow Nodes */}
            <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-secondary blur-[40px] opacity-50"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-tertiary blur-[40px] opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary blur-[40px] opacity-50"></div>
            
            {/* Venue Outline Map (Abstract) */}
            <div className="absolute inset-8 border border-on-surface-variant/10 rounded-3xl flex items-center justify-center">
              <img alt="Venue Schematic" className="w-full h-full object-cover opacity-20 mix-blend-screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgvFRXtGer0N6zRuZjJqdBPGfj0_85vTWIcnFxXt2r4ZlIOEXBRPHK0eE8-hsDmlUKmFrIn8jek7vd-MQ-3nWn9Yc1JBHUMe8mb5UFEdeF8tj8zDWRCxl0_ukrFz4fiFd8BVLjet0boYFsFsyfJQIbvrIJJXbmu1Q-yGw6eeZu7oldbOhzjCimOGYuiAHgBwulvAWpkjaXFmeSsFoHZQ1C5EBb1zqZn6Vu6cyvpCowB1Y5YszTNmMrA7WyNNWEt-4_mbgJsXv8PBHD"/>
            </div>
            
            {/* Scan Line Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[50%] w-full animate-pulse pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Zone Telemetry List */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-outline-variant/20 pb-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-on-surface">Zone Analytics</h3>
            <p className="font-label text-xs text-on-surface-variant tracking-wider uppercase">Terminal Log: Real-Time Flow Analysis</p>
          </div>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-tighter">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary"></span>
              <span className="text-secondary">Nominal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-tertiary"></span>
              <span className="text-tertiary">Critical</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Zone Card 1: Critical */}
          <div className="bg-surface-container p-5 relative group transition-all hover:bg-surface-container-high">
            <div className="absolute right-0 top-0 w-[2px] h-full bg-tertiary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label text-[10px] text-tertiary uppercase font-black tracking-widest block mb-1">Density Peak</span>
                <h4 className="font-headline text-lg font-bold">Main Concourse</h4>
              </div>
              <span className="material-symbols-outlined text-tertiary text-2xl" data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-on-surface-variant/50">FLOW_RATE: HIGH</p>
                <p className="text-[10px] font-mono text-on-surface-variant/50">WAIT_TIME: 14M</p>
              </div>
              <div className="text-right">
                <span className="font-headline text-3xl font-bold text-tertiary">92%</span>
              </div>
            </div>
          </div>

          {/* Zone Card 2: Nominal */}
          <div className="bg-surface-container p-5 relative group transition-all hover:bg-surface-container-high">
            <div className="absolute right-0 top-0 w-[2px] h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label text-[10px] text-secondary uppercase font-black tracking-widest block mb-1">Operational</span>
                <h4 className="font-headline text-lg font-bold">Section 112-115</h4>
              </div>
              <span className="material-symbols-outlined text-secondary text-2xl" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-on-surface-variant/50">FLOW_RATE: STEADY</p>
                <p className="text-[10px] font-mono text-on-surface-variant/50">WAIT_TIME: 2M</p>
              </div>
              <div className="text-right">
                <span className="font-headline text-3xl font-bold text-secondary">41%</span>
              </div>
            </div>
          </div>

          {/* Zone Card 3: Warning */}
          <div className="bg-surface-container p-5 relative group transition-all hover:bg-surface-container-high">
            <div className="absolute right-0 top-0 w-[2px] h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label text-[10px] text-primary uppercase font-black tracking-widest block mb-1">Elevating</span>
                <h4 className="font-headline text-lg font-bold">VIP Lounge South</h4>
              </div>
              <span className="material-symbols-outlined text-primary text-2xl" data-icon="trending_up">trending_up</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-on-surface-variant/50">FLOW_RATE: RISING</p>
                <p className="text-[10px] font-mono text-on-surface-variant/50">WAIT_TIME: 5M</p>
              </div>
              <div className="text-right">
                <span className="font-headline text-3xl font-bold text-primary">68%</span>
              </div>
            </div>
          </div>

          {/* Zone Card 4: Nominal */}
          <div className="bg-surface-container p-5 relative group transition-all hover:bg-surface-container-high">
            <div className="absolute right-0 top-0 w-[2px] h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label text-[10px] text-secondary uppercase font-black tracking-widest block mb-1">Operational</span>
                <h4 className="font-headline text-lg font-bold">North Gate Entry</h4>
              </div>
              <span className="material-symbols-outlined text-secondary text-2xl" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-on-surface-variant/50">FLOW_RATE: LOW</p>
                <p className="text-[10px] font-mono text-on-surface-variant/50">WAIT_TIME: &lt;1M</p>
              </div>
              <div className="text-right">
                <span className="font-headline text-3xl font-bold text-secondary">24%</span>
              </div>
            </div>
          </div>

          {/* Zone Card 5: Critical */}
          <div className="bg-surface-container p-5 relative group transition-all hover:bg-surface-container-high">
            <div className="absolute right-0 top-0 w-[2px] h-full bg-tertiary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label text-[10px] text-tertiary uppercase font-black tracking-widest block mb-1">Density Peak</span>
                <h4 className="font-headline text-lg font-bold">Food Court Alpha</h4>
              </div>
              <span className="material-symbols-outlined text-tertiary text-2xl" data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-on-surface-variant/50">FLOW_RATE: MAX</p>
                <p className="text-[10px] font-mono text-on-surface-variant/50">WAIT_TIME: 18M</p>
              </div>
              <div className="text-right">
                <span className="font-headline text-3xl font-bold text-tertiary">88%</span>
              </div>
            </div>
          </div>

          {/* Zone Card 6: Nominal */}
          <div className="bg-surface-container p-5 relative group transition-all hover:bg-surface-container-high">
            <div className="absolute right-0 top-0 w-[2px] h-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="font-label text-[10px] text-secondary uppercase font-black tracking-widest block mb-1">Operational</span>
                <h4 className="font-headline text-lg font-bold">West Bleachers</h4>
              </div>
              <span className="material-symbols-outlined text-secondary text-2xl" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-on-surface-variant/50">FLOW_RATE: BALANCED</p>
                <p className="text-[10px] font-mono text-on-surface-variant/50">WAIT_TIME: 3M</p>
              </div>
              <div className="text-right">
                <span className="font-headline text-3xl font-bold text-secondary">55%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Intelligence Bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-high/40 p-6 rounded-lg backdrop-blur-md">
          <h3 className="font-headline text-sm uppercase tracking-widest mb-6">Predictive Analytics</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" data-icon="timer">timer</span>
              </div>
              <div className="flex-grow">
                <p className="text-xs text-on-surface-variant mb-1">Estimated Peak Flow</p>
                <p className="font-headline font-bold text-lg">13:15 UTC <span className="text-xs font-normal text-on-surface-variant/60 tracking-widest">(+27m)</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary" data-icon="trending_down">trending_down</span>
              </div>
              <div className="flex-grow">
                <p className="text-xs text-on-surface-variant mb-1">Cool-off Vector</p>
                <p className="font-headline font-bold text-lg">East Corridors <span className="text-xs font-normal text-secondary tracking-widest">CLEARING</span></p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-high/40 p-6 rounded-lg backdrop-blur-md border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-sm uppercase tracking-widest">Active Alerts</h3>
            <span className="px-2 py-0.5 bg-tertiary text-on-tertiary text-[10px] font-black rounded-sm">2 LIVE</span>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-surface-container-lowest border-l-2 border-tertiary flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-tighter text-on-surface">Bottleneck: Gate 4 Over-capacity</p>
              <span className="text-[10px] font-mono text-tertiary">02:11 AGO</span>
            </div>
            <div className="p-3 bg-surface-container-lowest border-l-2 border-tertiary/40 flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-tighter text-on-surface/60">Crowd Surge: Concourse B</p>
              <span className="text-[10px] font-mono text-on-surface-variant/40">04:45 AGO</span>
            </div>
          </div>
          <button className="w-full mt-6 py-3 bg-surface-container-highest font-headline text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary hover:text-on-primary transition-all duration-300">
            Dispatch Security Team
          </button>
        </div>
      </section>
    </main>
  );
}
