import React from 'react';

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-full bg-background relative max-w-7xl mx-auto z-10 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-headline text-4xl lg:text-5xl font-bold tracking-tight text-on-surface mb-2">Broadcast Center</h1>
          <p className="text-sm text-on-surface-variant font-body">Manage emergency communications and venue-wide PWA updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#4edea3]"></div>
            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary font-bold">PWA Network Online</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min pb-12">
        {/* Left Column: Composer & Templates */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Composer */}
          <div className="bg-surface-container-low rounded-2xl p-6 relative overflow-hidden border border-outline-variant/10 shadow-lg shadow-background/50">
            <div className="absolute top-0 left-0 w-1 h-full bg-error shadow-[0_0_12px_#ffb4ab]"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                New Broadcast
              </h2>
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Live Dispatch</span>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mb-2">Target Audience</label>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="bg-surface-container px-4 py-2 rounded-lg text-sm font-medium text-primary border border-outline-variant/20 hover:bg-surface-container-high transition-colors">All PWA Users</button>
                  <button type="button" className="bg-surface-container px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high transition-colors">Section A Only</button>
                  <button type="button" className="bg-surface-container px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high transition-colors">VIP Gates</button>
                  <button type="button" className="bg-surface-container px-3 py-2 rounded-lg text-sm text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container-high transition-colors flex items-center">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mb-2">Message Body</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-outline-variant/60 min-h-[120px] resize-none transition-colors" 
                  placeholder="Enter urgent update here..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4 border-t border-surface-container mt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input className="form-checkbox rounded bg-surface-container-lowest border-outline-variant/30 text-error focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer" type="checkbox" />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors select-none">Force Push Notification</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input defaultChecked className="form-checkbox rounded bg-surface-container-lowest border-outline-variant/30 text-error focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer" type="checkbox" />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors select-none">Trigger Digital Signage</span>
                  </label>
                </div>
                <button type="button" className="bg-error text-on-error w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-error/90 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,180,171,0.2)]">
                  <span className="material-symbols-outlined text-[18px]">send</span> 
                  Dispatch Now
                </button>
              </div>
            </form>
          </div>

          {/* Quick Templates */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
            <h3 className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mb-4">Response Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-surface-container p-4 rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors group border border-transparent hover:border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Gate Congestion</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">groups</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">"High traffic at North Gate. Please proceed to East Gate for faster entry."</p>
              </div>
              
              <div className="bg-surface-container p-4 rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors group border border-transparent hover:border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-on-tertiary-container group-hover:text-error transition-colors">Severe Weather</span>
                  <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">thunderstorm</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">"Lightning detected nearby. Seek shelter in designated concourse areas immediately."</p>
              </div>
              
              <div className="bg-surface-container p-4 rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors group border border-transparent hover:border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Event Delay</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">schedule</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">"Start time delayed by 15 minutes due to technical setup. Thank you for your patience."</p>
              </div>
              
              <div className="bg-surface-container p-4 rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors group border border-transparent hover:border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Lost Child Protocol</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">child_care</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">"Staff Alert: Code Yellow. Refer to internal comms for description."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Reach Metric */}
          <div className="bg-surface-variant/40 backdrop-blur-xl border-t border-l border-outline-variant/20 rounded-2xl p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none"></div>
            <h3 className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant mb-2">Active PWA Reach</h3>
            <div className="flex items-baseline gap-2 mb-4 relative z-10">
              <span className="font-headline text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-fixed-dim">24,592</span>
              <span className="text-sm text-secondary flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
              </span>
            </div>
            <div className="h-2 bg-surface-container-lowest rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-primary" style={{ width: '78%' }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-on-surface-variant relative z-10">
              <span>0</span>
              <span>Est. Capacity: 31,500</span>
            </div>
          </div>

          {/* Broadcast History */}
          <div className="bg-surface-container-low rounded-2xl p-6 flex-1 flex flex-col border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant">Dispatch Log</h3>
              <button className="text-xs text-primary hover:text-primary-fixed transition-colors font-medium">View All</button>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Log Item 1 */}
              <div className="group flex gap-4 p-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
                  <span className="material-symbols-outlined text-[16px] text-error drop-shadow-[0_0_4px_rgba(255,180,171,0.5)]">warning</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-on-surface truncate pr-2">Evacuation Route Update</span>
                    <span className="text-[0.65rem] text-on-surface-variant whitespace-nowrap font-label">14:22</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mb-2">West concourse cleared. Direct traffic to South exits.</p>
                  <div className="flex gap-3 text-[0.65rem] text-on-surface-variant font-label">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">done_all</span> 18.2k Delivered
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">visibility</span> 14.1k Read
                    </span>
                  </div>
                </div>
              </div>

              {/* Log Item 2 */}
              <div className="group flex gap-4 p-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-on-tertiary-container/10 flex items-center justify-center border border-on-tertiary-container/20">
                  <span className="material-symbols-outlined text-[16px] text-on-tertiary-container drop-shadow-[0_0_4px_rgba(238,58,90,0.5)]">info</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-on-surface truncate pr-2">Merch Stand Relocation</span>
                    <span className="text-[0.65rem] text-on-surface-variant whitespace-nowrap font-label">11:05</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mb-2">Main merch stand moved to Section 112.</p>
                  <div className="flex gap-3 text-[0.65rem] text-on-surface-variant font-label">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">done_all</span> 22.4k Delivered
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">visibility</span> 8.9k Read
                    </span>
                  </div>
                </div>
              </div>

              {/* Log Item 3 */}
              <div className="group flex gap-4 p-3 -mx-3 rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-primary">campaign</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-on-surface truncate pr-2">Welcome Message</span>
                    <span className="text-[0.65rem] text-on-surface-variant whitespace-nowrap font-label">09:00</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mb-2">Automated welcome push sent to early arrivals.</p>
                  <div className="flex gap-3 text-[0.65rem] text-on-surface-variant font-label">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">done_all</span> 4.1k Delivered
                    </span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
