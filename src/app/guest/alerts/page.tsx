import React from 'react';

export default function GuestAlertsPage() {
  return (
    <main className="px-6 max-w-5xl mx-auto space-y-8 pt-8 min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section>
        <h1 className="font-headline text-4xl font-bold tracking-tighter mb-2">System Broadcast</h1>
        <p className="text-on-surface-variant font-label text-sm uppercase tracking-[0.2em]">Live Alerts & Notifications</p>
      </section>

      {/* Connection Status */}
      <div className="bg-[#222a3e]/60 backdrop-blur-xl p-4 rounded-lg flex items-center justify-between border-l-2 border-secondary shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_var(--color-secondary)]"></span>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface">Secure Feed Active</span>
        </div>
        <span className="font-mono text-[10px] text-on-surface-variant">V-1.4.0</span>
      </div>

      {/* Alerts Feed */}
      <section className="space-y-4">
        {/* Critical Alert */}
        <div className="bg-[#222a3e]/60 backdrop-blur-xl p-5 rounded-lg border-l-[3px] border-tertiary shadow-[0_0_20px_rgba(244,63,94,0.1)] relative overflow-hidden group hover:bg-surface-container-high transition-colors">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-3 z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-lg" data-icon="warning">warning</span>
              <span className="font-label text-[10px] uppercase font-bold tracking-widest text-tertiary">Priority Override</span>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant">12:44 UTC</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2 z-10 relative">Gate 4 Bottleneck Alert</h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed z-10 relative">
            Security teams have been dispatched to Gate 4. Please divert to Gate 2 or 3 to avoid significant delays. Estimated clearance in 25 minutes.
          </p>
        </div>

        {/* Standard Info */}
        <div className="bg-[#222a3e]/60 backdrop-blur-xl p-5 rounded-lg border-l-[3px] border-primary shadow-sm hover:bg-surface-container-high transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg" data-icon="info">info</span>
              <span className="font-label text-[10px] uppercase font-bold tracking-widest text-primary">System Notice</span>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant">11:15 UTC</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Merchandise Stand Restock</h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Exclusive "Neon Horizon" event apparel has been restocked at the North Concourse pavilion. Availability is limited.
          </p>
        </div>

        {/* General Update */}
        <div className="bg-[#222a3e]/60 backdrop-blur-xl p-5 rounded-lg border-l-[3px] border-outline-variant/30 hover:bg-surface-container-high transition-colors opacity-80">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="campaign">campaign</span>
              <span className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">General</span>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant">09:00 UTC</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2">Welcome to Sentinel OS</h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            All systems are nominal. Have a safe and exciting experience. If you require assistance, use the Medical or SOS functions via the navigation array.
          </p>
        </div>
      </section>
    </main>
  );
}
