import React from 'react';

export default function LiveMonitoringPage() {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 h-full overflow-auto">
      {/* Left Panel */}
      <section className="col-span-12 xl:col-span-8 relative rounded-2xl overflow-hidden bg-surface-container-lowest flex flex-col min-h-[300px] sm:min-h-[400px]">
        {/* Underlay Map Image */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Venue Map Blueprint" 
            className="w-full h-full object-cover opacity-30 mix-blend-screen" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa_WYQ0JovXxfYJGAM8hfePoEXYqQ0bmlprz3eNJlElF_-HEjgsmIDNv_JL67vJLRcL9lZ-YHJIcbYUajA4mgK9ubIsaNJrND2wUtdw-edYoLc4Q7W-53hV9NWRVDhnkOjwIxVHf_MxYtGgQrdQiSbnpk_I-3Mr9gBQuvzWYFI4rxWqAoFMT47AzltsIyVDGVvZCYJ_7ZeQ-jjUxqWZKFHSpRfUyewl0mxAArygK_XtE6LMcMz1W3DUE7i_566-ZiXxpyATXQOnC_D"
          />
        </div>
        
        {/* Density Heatmap Overlay (Abstracted via gradients) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tertiary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[80px]"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-on-tertiary-container/15 rounded-full blur-[90px] transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Floating Glass Metadata (Top Left) */}
        <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-4">
          <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 px-5 py-3 rounded-xl flex flex-col">
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">Live Occupancy</span>
            <div className="font-headline text-3xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-fixed-dim">
                14,208
            </div>
          </div>
          <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 px-5 py-3 rounded-xl flex flex-col justify-center">
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">Capacity</span>
            <div className="font-headline text-xl font-medium text-surface-tint">
                71%
            </div>
          </div>
        </div>

        {/* Zone Density Indicators (Floating Bottom/Right) */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col sm:flex-row gap-4 hidden md:flex">
          {/* Zone A */}
          <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 w-40 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-headline text-sm font-semibold text-primary">North Concourse</span>
              {/* Status Chip (Warning) */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-on-tertiary-container/10">
                <div className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container shadow-[0_0_8px_#ee3a5a]"></div>
                <span className="font-label text-[0.6rem] text-on-tertiary-container uppercase font-bold tracking-wider">85%</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-on-tertiary-container w-[85%] shadow-[0_0_8px_#ee3a5a]"></div>
            </div>
          </div>
          
          {/* Zone B */}
          <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 w-40 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-headline text-sm font-semibold text-primary">East Gate</span>
              {/* Status Chip (Valid) */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]"></div>
                <span className="font-label text-[0.6rem] text-secondary uppercase font-bold tracking-wider">42%</span>
              </div>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-[42%] shadow-[0_0_8px_#4edea3]"></div>
            </div>
          </div>
        </div>

        {/* Live Radar Sweep Animation (Abstracted with static CSS element to imply scanning) */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden animate-pulse">
            <div className="w-[200%] h-1 bg-primary/20 transform rotate-45 translate-y-96 shadow-[0_0_20px_rgba(188,199,222,0.3)] opacity-50"></div>
        </div>
      </section>

      {/* Right Panel: Data Stream & Logs */}
      <section className="col-span-12 xl:col-span-4 bg-surface-container-low rounded-2xl flex flex-col min-h-[300px]">
        <header className="flex justify-between items-end mb-4 p-6 pb-2 border-b border-outline-variant/10">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-xl font-semibold text-primary">Active Stream</h2>
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
                Live Entry/Exit Feed
            </span>
          </div>
          <button className="text-primary hover:text-white transition-colors bg-surface-container p-1 rounded-full flex items-center border border-outline-variant/10">
             <span className="material-symbols-outlined text-xl">filter_list</span>
          </button>
        </header>

        {/* Scrollable Log List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 scrollbar-hide">
             {/* Entry Valid */}
             <div className="group flex items-start gap-4 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors duration-200 border border-transparent border-t-outline-variant/10 border-l-outline-variant/10">
                 <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                 </div>
                 <div className="flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-body text-sm font-medium text-on-surface">Ticket #A-9482</span>
                         <span className="font-headline text-xs text-on-surface-variant">10:42:05</span>
                     </div>
                     <span className="font-body text-xs text-on-surface-variant line-clamp-1">South Gate Turnstile 4</span>
                 </div>
             </div>

             {/* Entry Valid */}
             <div className="group flex items-start gap-4 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors duration-200 border border-transparent border-t-outline-variant/10 border-l-outline-variant/10">
                 <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                 </div>
                 <div className="flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-body text-sm font-medium text-on-surface">Ticket #B-1102</span>
                         <span className="font-headline text-xs text-on-surface-variant">10:42:01</span>
                     </div>
                     <span className="font-body text-xs text-on-surface-variant line-clamp-1">North Concourse Gate 1</span>
                 </div>
             </div>

             {/* Alert / Invalid */}
             <div className="group flex items-start gap-4 p-3 rounded-xl bg-error-container/20 border-l-2 border-l-error hover:bg-error-container/30 transition-colors duration-200">
                 <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-error text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                 </div>
                 <div className="flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-body text-sm font-medium text-error">Scan Failed</span>
                         <span className="font-headline text-xs text-error">10:41:55</span>
                     </div>
                     <span className="font-body text-xs text-error/80 line-clamp-1">East Gate Turnstile 2 - Duplicate Entry</span>
                 </div>
             </div>

             {/* Exit */}
             <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors duration-200">
                 <div className="w-8 h-8 rounded-full bg-outline-variant/20 flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-on-surface-variant text-sm">logout</span>
                 </div>
                 <div className="flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-body text-sm font-medium text-on-surface-variant">Exit Logged</span>
                         <span className="font-headline text-xs text-on-surface-variant">10:41:30</span>
                     </div>
                     <span className="font-body text-xs text-outline line-clamp-1">VIP Lounge Exit Corridor</span>
                 </div>
             </div>

             {/* Entry Valid */}
             <div className="group flex items-start gap-4 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors duration-200 border border-transparent border-t-outline-variant/10 border-l-outline-variant/10">
                 <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
                 </div>
                 <div className="flex flex-col flex-1">
                     <div className="flex justify-between items-center mb-1">
                         <span className="font-body text-sm font-medium text-on-surface">Ticket #A-9481</span>
                         <span className="font-headline text-xs text-on-surface-variant">10:41:15</span>
                     </div>
                     <span className="font-body text-xs text-on-surface-variant line-clamp-1">South Gate Turnstile 4</span>
                 </div>
             </div>
        </div>
      </section>
    </div>
  );
}
