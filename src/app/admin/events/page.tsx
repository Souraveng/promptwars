import React from 'react';

export default function EventManagementPage() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full relative">
      {/* Left Column: Event List */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-3xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-fixed-dim">Events Schedule</h2>
            <p className="text-sm text-on-surface-variant mt-1">Manage upcoming and past venue operations.</p>
          </div>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
            <input 
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" 
              placeholder="Search events..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-bright transition-colors border border-outline-variant/10">All</button>
            <button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent">Upcoming</button>
            <button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors border border-transparent">Past</button>
          </div>
        </div>

        {/* Event Cards */}
        <div className="flex flex-col gap-4">
          
          {/* Live Event Card */}
          <div className="bg-surface-container p-5 rounded-xl border-l-4 border-l-secondary relative overflow-hidden group hover:bg-surface-container-high transition-colors cursor-pointer shadow-lg shadow-background/50">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-primary hover:text-primary-fixed bg-surface p-2 rounded-lg" title="Edit Event">
                  <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
               </button>
            </div>
            <div className="flex justify-between items-start mb-3">
               <div className="flex gap-3 items-center">
                  <div className="bg-secondary/10 text-secondary px-2 py-1 rounded-md text-[0.6875rem] font-bold tracking-widest uppercase flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                     Live
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">Today, 18:00 - 23:00</span>
               </div>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Global Tech Summit 2024</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
               <span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span> Main Arena & Hall B
            </p>
            <div className="flex gap-6 border-t border-outline-variant/20 pt-4 mt-2">
               <div>
                  <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Est. Attendance</p>
                  <p className="text-lg font-headline font-semibold text-on-surface">12,500</p>
               </div>
               <div>
                  <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Security Level</p>
                  <p className="text-lg font-headline font-semibold text-error">High</p>
               </div>
            </div>
          </div>

          {/* Upcoming Event Card */}
          <div className="bg-surface-container p-5 rounded-xl relative group hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent border-t-outline-variant/10 border-l-outline-variant/10">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-primary hover:text-primary-fixed bg-surface p-2 rounded-lg" title="Edit Event">
                  <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
               </button>
            </div>
            <div className="flex justify-between items-start mb-3">
               <div className="flex gap-3 items-center">
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[0.6875rem] font-bold tracking-widest uppercase flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                     Draft
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">Oct 15, 09:00 - 17:00</span>
               </div>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">AI Innovations Expo</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
               <span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span> Exhibition Halls A-C
            </p>
            <div className="flex gap-6 border-t border-outline-variant/20 pt-4 mt-2">
               <div>
                  <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Est. Attendance</p>
                  <p className="text-lg font-headline font-semibold text-on-surface">8,000</p>
               </div>
               <div>
                  <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Security Level</p>
                  <p className="text-lg font-headline font-semibold text-on-surface">Standard</p>
               </div>
            </div>
          </div>

          {/* Past Event Card */}
          <div className="bg-surface-container p-5 rounded-xl relative group hover:bg-surface-container-high transition-colors cursor-pointer opacity-60 hover:opacity-100 border border-transparent">
            <div className="flex justify-between items-start mb-3">
               <div className="flex gap-3 items-center">
                  <div className="bg-outline-variant/20 text-outline px-2 py-1 rounded-md text-[0.6875rem] font-bold tracking-widest uppercase flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
                     Completed
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">Sep 28, 20:00 - 23:30</span>
               </div>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Symphony Orchestra Night</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
               <span className="material-symbols-outlined text-xs" data-icon="location_on">location_on</span> Grand Concert Hall
            </p>
            <div className="flex gap-6 border-t border-outline-variant/20 pt-4 mt-2">
               <div>
                  <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Total Attendance</p>
                  <p className="text-lg font-headline font-semibold text-on-surface">4,210</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Editor Panel (Glassmorphism) */}
      <aside className="w-full xl:w-[400px] flex-shrink-0">
        <div className="bg-surface-variant/40 backdrop-blur-xl rounded-2xl h-fit max-h-[85vh] flex flex-col p-6 sticky top-0 overflow-y-auto border-t border-l border-outline-variant/20 shadow-[0_16px_32px_rgba(6,14,32,0.4)] pb-8 scrollbar-hide">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-headline font-bold text-on-surface">Event Details</h3>
            <button className="text-outline hover:text-on-surface transition-colors bg-surface-container hover:bg-surface-bright rounded-full p-1 border border-outline-variant/20">
               <span className="material-symbols-outlined text-sm block" data-icon="close">close</span>
            </button>
          </div>
          
          <form className="flex flex-col gap-5">
            {/* Title Input */}
            <div>
               <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Event Name</label>
               <input 
                 className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-medium" 
                 type="text" 
                 defaultValue="Global Tech Summit 2024"
               />
            </div>
            
            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Date</label>
                  <div className="relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-sm" data-icon="calendar_month">calendar_month</span>
                     <input 
                       className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" 
                       type="text" 
                       defaultValue="Oct 12, 2024"
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Time</label>
                  <div className="relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-sm" data-icon="schedule">schedule</span>
                     <input 
                       className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" 
                       type="text" 
                       defaultValue="18:00 - 23:00"
                     />
                  </div>
               </div>
            </div>

            {/* Venue Area */}
            <div>
               <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Venue Areas</label>
               <select className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors appearance-none font-medium">
                  <option>Main Arena & Hall B</option>
                  <option>Exhibition Halls A-C</option>
                  <option>Grand Concert Hall</option>
               </select>
            </div>

            {/* Map Upload Area */}
            <div>
               <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Venue Map Overlay</label>
               <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-3xl text-outline mb-2 group-hover:text-primary transition-colors" data-icon="upload_file">upload_file</span>
                  <p className="text-sm font-medium text-on-surface mb-1">Upload SVG/PNG Map</p>
                  <p className="text-xs text-on-surface-variant text-center">Drag and drop or click to browse</p>
               </div>
            </div>

            {/* Description */}
            <div>
               <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Description Notes</label>
               <textarea 
                 className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed" 
                 rows={3}
                 defaultValue="Keynote speakers arriving at 17:30. VIP entrance routing required via East Gate."
               />
            </div>

            <div className="mt-4 pt-4 flex gap-3 border-t border-outline-variant/20">
               <button className="flex-1 bg-surface-container-highest border border-outline-variant/30 text-on-surface py-2.5 rounded-xl text-sm font-medium hover:bg-surface-bright transition-colors" type="button">Cancel</button>
               <button className="flex-1 bg-gradient-to-br from-primary to-primary-container text-on-primary py-2.5 rounded-xl text-sm font-semibold hover:contrast-125 transition-all shadow-[0_0_20px_rgba(188,199,222,0.2)]" type="button">Save Changes</button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
