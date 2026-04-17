"use client";
import React, { useState } from 'react';

export default function VenueBuilderPage() {
  const [layersOpen, setLayersOpen] = useState(false);

  return (
    <div className="flex h-full bg-surface-container-lowest overflow-hidden">
      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative bg-surface-container-lowest">
        {/* Builder Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-container/30 backdrop-blur-md border-b border-outline-variant/10 flex-wrap gap-2">
          <div className="flex items-center gap-1 flex-wrap">
             <div className="flex bg-surface-container-low p-1 rounded-xl">
                 <button className="p-1.5 text-primary hover:bg-surface-container rounded-lg flex items-center gap-1.5 px-2 transition-all">
                     <span className="material-symbols-outlined text-sm">upload_file</span>
                     <span className="text-xs font-medium">Import Map</span>
                 </button>
             </div>
             <div className="h-6 w-px bg-outline-variant/20 mx-1"></div>
             <div className="flex gap-1 flex-wrap">
                 <button className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                     <span className="material-symbols-outlined text-sm">polyline</span>
                     <span className="text-xs font-medium">Add Zone</span>
                 </button>
                 <button className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                     <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gate</span>
                     <span className="text-xs font-medium">Add Gate</span>
                 </button>
                 <button className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                     <span className="material-symbols-outlined text-sm">storefront</span>
                     <span className="text-xs font-medium">Add Stall</span>
                 </button>
                 <button className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                     <span className="material-symbols-outlined text-sm">wc</span>
                     <span className="text-xs font-medium">Add Washroom</span>
                 </button>
             </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
             <button className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-all">
                 Save Changes
             </button>
             <button className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-secondary text-on-secondary-container rounded-lg hover:brightness-110 shadow-[0_0_20px_rgba(78,222,163,0.2)] transition-all">
                 Publish to Guest PWA
             </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(rgba(188,199,222,0.05)_1px,transparent_1px)] bg-[size:32px_32px]">
          {/* Map Background */}
          <div className="relative w-[800px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10">
              <img
                className="w-full h-full object-cover opacity-40 mix-blend-screen grayscale"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhmrsrH6KDg6rtnaFUY3beL1F8HN4FGonEoX7hAE-YFg82LrRwSGp8Nzh8SjpGAh3B0fArDNOh6-Ea5qpiToQ1FEn_W8U5Zk9iRpi6qc3BJy9aoR1ZDnNTB64VGeo1_e67Nu2lRW5q77lzIeTlxPrq4LezeWjIlwzatHixzF7L4XVOUUu0DNKRn0hISA33oxDDbhJrAkJTKwZ4R95P8ymuBjl_wsklWRCDN_e8mIsub_qnXdDWIiJwYVs_MNqcBSztkzlTXloNph2v"
                alt="architectural blueprint floor plan"
              />
              <div className="absolute top-[20%] left-[30%] group cursor-move">
                  <div className="w-40 h-24 border-2 border-secondary/50 bg-secondary/10 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:border-secondary transition-all">
                      <span className="text-[10px] font-headline uppercase font-bold text-secondary tracking-widest">Main Stage</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-secondary text-on-secondary-container rounded-full flex items-center justify-center text-[10px]">
                      <span className="material-symbols-outlined text-sm">drag_indicator</span>
                  </div>
              </div>
              <div className="absolute top-[50%] left-[60%] group cursor-move">
                  <div className="p-3 bg-surface-bright/80 backdrop-blur-md rounded-full border border-outline-variant/20 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-secondary">wc</span>
                  </div>
              </div>
              <div className="absolute bottom-[10%] left-[10%] group cursor-move">
                  <div className="w-32 h-20 border-2 border-primary/30 bg-primary/5 rounded-xl flex items-center justify-center group-hover:border-primary transition-all">
                      <span className="text-[10px] font-headline uppercase font-bold text-primary/60 tracking-widest">VIP Section A</span>
                  </div>
              </div>
          </div>

          {/* Layers Panel — collapsible, bottom-left */}
          <div className="hidden md:flex absolute left-6 bottom-6 flex-col gap-2 z-10 w-56">
            {/* Toggle button — always visible */}
            <button
              onClick={() => setLayersOpen(o => !o)}
              className="self-start flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-variant/70 backdrop-blur-xl border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">layers</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Layers</span>
              <span className="material-symbols-outlined text-sm transition-transform duration-300" style={{ transform: layersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_less
              </span>
            </button>

            {/* Collapsible content */}
            <div
              className="flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: layersOpen ? '400px' : '0px', opacity: layersOpen ? 1 : 0 }}
            >
              <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 p-4 rounded-2xl shadow-2xl">
                <div className="space-y-2">
                  {[
                    { label: 'Zones & Areas', visible: true },
                    { label: 'Entry Gates', visible: true },
                    { label: 'Restrooms', visible: false },
                    { label: 'Vendor Stalls', visible: true },
                  ].map(({ label, visible }) => (
                    <div key={label} className={`flex items-center justify-between p-2 hover:bg-surface-container rounded-lg transition-colors cursor-pointer ${!visible ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-sm ${visible ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {visible ? 'visibility' : 'visibility_off'}
                        </span>
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${visible ? 'bg-secondary shadow-[0_0_8px_#4edea3]' : 'bg-outline-variant'}`}></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 p-3 rounded-2xl shadow-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Active Selection</span>
                  <span className="text-xs font-bold text-primary">Main Stage Zone</span>
                </div>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-2">
              <button className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">add</span>
              </button>
              <button className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">remove</span>
              </button>
              <button className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">center_focus_strong</span>
              </button>
          </div>
        </div>
      </main>

      {/* Right Inspector Sidebar */}
      <aside className="hidden xl:flex w-80 bg-surface-variant/30 backdrop-blur-xl z-40 flex-col border-l border-outline-variant/20 shadow-[-32px_0_64px_rgba(11,19,38,0.2)]">
          <div className="p-6 border-b border-outline-variant/10">
              <h2 className="font-headline text-lg font-bold text-primary">Property Inspector</h2>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Editing Element: <span className="text-secondary">#MAIN-STAGE-01</span></p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              <div className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Element Label</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all outline-none" type="text" defaultValue="Main Stage" />
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Target Capacity</label>
                  <div className="flex items-center gap-4">
                      <input className="flex-1 accent-secondary cursor-pointer" type="range" defaultValue={70} />
                      <span className="text-sm font-headline font-bold text-secondary">15,000</span>
                  </div>
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Access Status</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-3 bg-secondary/10 border border-secondary/50 text-secondary rounded-xl text-xs font-bold transition-all">Public</button>
                      <button className="px-4 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface-variant rounded-xl text-xs font-bold transition-all hover:bg-surface-container-high hover:text-on-surface">Restricted</button>
                  </div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Zone Metrics</span>
                      <span className="material-symbols-outlined text-secondary text-sm">analytics</span>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                          <span className="text-[10px] text-on-surface-variant">Flow Density</span>
                          <span className="text-xs font-bold text-secondary">Optimal</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="w-[65%] h-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.4)]"></div>
                      </div>
                      <div className="flex justify-between items-end">
                          <span className="text-[10px] text-on-surface-variant">PWA Sync</span>
                          <span className="text-xs font-bold text-primary">Active</span>
                      </div>
                  </div>
              </div>
              <div className="space-y-3 pb-8">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Action History</label>
                  <div className="space-y-3">
                      <div className="flex gap-3 items-start opacity-70">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1"></div>
                          <div className="flex flex-col">
                              <span className="text-[11px] font-medium">Relocated &apos;Main Stage&apos;</span>
                              <span className="text-[9px] text-outline uppercase">2 mins ago</span>
                          </div>
                      </div>
                      <div className="flex gap-3 items-start opacity-50">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                          <div className="flex flex-col">
                              <span className="text-[11px] font-medium">Updated Capacity: 15k</span>
                              <span className="text-[9px] text-outline uppercase">10 mins ago</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div className="p-6 border-t border-outline-variant/10 bg-surface-variant/60 backdrop-blur-xl">
              <button className="w-full py-4 bg-error-container/20 text-error hover:bg-error-container/40 border border-error/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,180,171,0.1)]">
                  Delete Selection
              </button>
          </div>
      </aside>
    </div>
  );
}
