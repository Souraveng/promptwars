import React from 'react';

export default function GuestMedicalPage() {
  return (
    <main className="px-6 max-w-5xl mx-auto space-y-8 pt-8">
      {/* Hero Section / Status Telemetry */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-8">
          <h1 className="font-headline text-5xl font-bold tracking-tighter mb-2">Triage Protocol</h1>
          <p className="text-on-surface-variant font-label text-sm uppercase tracking-[0.2em]">System Status: Operational / Active Deployment</p>
        </div>
        
        <div className="md:col-span-4 bg-surface-container-low p-4 relative overflow-hidden flex justify-between items-center">
          <div className="absolute left-0 -top-[100px] w-full h-[100px] bg-gradient-to-b from-transparent via-[rgba(194,198,214,0.05)] to-transparent pointer-events-none animate-[scan_8s_linear_infinite]"></div>
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Vitals Proxy</p>
            <p className="font-headline text-2xl font-bold text-secondary">NOMINAL</p>
          </div>
          <div className="text-right">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Response Time</p>
            <p className="font-headline text-2xl font-bold text-primary">02:45 <span className="text-xs">MIN</span></p>
          </div>
        </div>
      </section>

      {/* Location Card */}
      <section className="bg-surface-container-low p-8 relative overflow-hidden rounded-lg group">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_15px_#4edea3]"></div>
            <span className="text-[10px] font-label uppercase tracking-widest text-secondary">Live GPS Lock</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant block mb-2">Designated Venue Sector</label>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface">Section 114, Row G</h2>
          </div>
          <div className="w-full md:w-48 h-24 bg-surface-container-highest rounded-sm relative overflow-hidden border border-outline-variant/10">
            <img className="w-full h-full object-cover mix-blend-luminosity opacity-40" alt="simplified dark tactical vector map of a stadium seating section with a single bright emerald location dot highlighting section 114" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHDos3GaIGbldnn7E0IPktLlBwmWNVIVAmYV-HhCQT6EhEh3jn0uX6EF58jzLzWofLv-MCmY1ymRKqpCJxh2KkUD0uTktbyvcfNoHFxH7cM0LchW132HHTLFfwhBa34G5AbDkvinS4K4bygPmxAThhqekuDXpK3gu8IW0LeLiYT8O5vuL_Jv55uxpstqo6DmCXYDQKsjMUSUMcnkncHUTVFAXFiZqZBbWg4hX8EkYprA62luXnt7K2EoOfcspegTfToeePTG5j5clX"/>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-3xl" data-icon="location_on" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </div>
          </div>
        </div>
      </section>

      {/* Option Grid (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Allergic Reaction (Hero Card) */}
        <div className="md:col-span-2 bg-[#222a3e]/60 backdrop-blur-xl p-6 min-h-[220px] relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:bg-surface-container-high transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start z-10">
            <span className="material-symbols-outlined text-primary text-4xl" data-icon="vaccines">vaccines</span>
            <span className="font-label text-[10px] text-on-surface-variant">PRIORITY_02</span>
          </div>
          <div className="z-10">
            <h3 className="font-headline text-2xl font-bold mb-1">Allergic Reaction</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-md">Anaphylaxis protocol activation. Monitor airway patency and administer epinephrine if autoinjector is available. Stand by for medic arrival.</p>
          </div>
        </div>

        {/* Severe Injury */}
        <div className="bg-[#222a3e]/60 backdrop-blur-xl p-6 min-h-[220px] flex flex-col justify-between border-l-2 border-tertiary/20 hover:border-tertiary transition-colors cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary text-4xl" data-icon="emergency_rebound">emergency</span>
            <span className="font-label text-[10px] text-tertiary">URGENT</span>
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold mb-1 uppercase tracking-tight">Severe Injury</h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">Trauma baseline. Apply direct pressure to wound site. Elevate limb if appropriate. Terminal link established to surgical team.</p>
          </div>
        </div>

        {/* Heart / Chest Pain */}
        <div className="bg-[#222a3e]/60 backdrop-blur-xl p-6 min-h-[220px] flex flex-col justify-between hover:bg-surface-container-high transition-all duration-300 cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary text-4xl" data-icon="monitor_heart" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_heart</span>
            <span className="font-label text-[10px] text-on-surface-variant">PRIORITY_01</span>
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold mb-1 uppercase tracking-tight">Chest Pain</h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">Cardiac distress detected. Position patient in comfortable seated stance. Do not allow physical exertion.</p>
          </div>
        </div>

        {/* General First Aid */}
        <div className="md:col-span-2 bg-[#222a3e]/60 backdrop-blur-xl p-6 min-h-[220px] relative overflow-hidden flex flex-col justify-between hover:bg-surface-container-high transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800')] opacity-5 mix-blend-overlay"></div>
          <div className="flex justify-between items-start z-10">
            <span className="material-symbols-outlined text-secondary text-4xl" data-icon="medical_services">medical_services</span>
            <span className="font-label text-[10px] text-on-surface-variant">STANDARD</span>
          </div>
          <div className="z-10">
            <h3 className="font-headline text-2xl font-bold mb-1">General First Aid</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-sm">Minor lacerations, heat exhaustion, or general discomfort. Follow guided basic assistance instructions while assistance is dispatched.</p>
          </div>
        </div>
      </section>

      {/* Large CTA */}
      <section className="pt-8 mb-8">
        <button className="w-full h-24 rounded-lg relative overflow-hidden group">
          {/* Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-tertiary-container to-tertiary transition-transform duration-500 group-hover:scale-105"></div>
          {/* Heavy Coral Ambient Glow */}
          <div className="absolute inset-0 shadow-[0_0_40px_rgba(244,63,94,0.4)] group-active:shadow-[0_0_60px_rgba(244,63,94,0.6)] transition-all"></div>
          
          <div className="relative flex items-center justify-center gap-4 z-10">
            <span className="material-symbols-outlined text-on-tertiary-container text-4xl" data-icon="notifications_active" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
            <span className="font-headline font-bold text-2xl uppercase tracking-[0.15em] text-on-tertiary-container">Request Immediate Help</span>
          </div>
          
          {/* Terminal scanning line for the button */}
          <div className="absolute bottom-0 left-0 h-[2px] bg-white/30 w-full animate-pulse"></div>
        </button>
        <p className="text-center mt-4 font-label text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">Emergency Dispatcher will be notified of your exact telemetry and location.</p>
      </section>
    </main>
  );
}
