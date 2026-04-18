"use client";
import React, { useState, useEffect, useRef } from 'react';

function MapUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-outline-variant/40 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group"
    >
      <input ref={inputRef} type="file" accept=".svg,.png,.jpg,.jpeg" className="hidden" onChange={handleChange} />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="map preview" className="w-full h-32 object-cover opacity-70" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-white font-medium">Click to replace</span>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-[80%]">{fileName}</div>
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center justify-center bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-3xl text-outline mb-2 group-hover:text-primary transition-colors">upload_file</span>
          <p className="text-sm font-medium text-on-surface mb-1">Upload SVG/PNG Map</p>
          <p className="text-xs text-on-surface-variant">Drag and drop or click to browse</p>
        </div>
      )}
    </div>
  );
}

function NewEventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-[0_32px_64px_rgba(6,14,32,0.6)] flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 sticky top-0 bg-surface-container-low z-10">
          <h3 className="text-xl font-headline font-bold text-on-surface">New Event</h3>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface transition-colors bg-surface-container hover:bg-surface-bright rounded-full p-1 border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form className="flex flex-col gap-5 p-6" onSubmit={e => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Event Name</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-medium"
              type="text"
              placeholder="e.g. Global Tech Summit 2025"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Date</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-sm">calendar_month</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  type="date"
                />
              </div>
            </div>
            <div>
              <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Time</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-sm">schedule</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  type="time"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Venue Areas</label>
            <select className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors appearance-none font-medium">
              <option value="">Select a venue area...</option>
              <option>Main Arena & Hall B</option>
              <option>Exhibition Halls A-C</option>
              <option>Grand Concert Hall</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Venue Map Overlay</label>
            <MapUpload />
          </div>

          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-primary mb-2 font-semibold">Description Notes</label>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
              rows={3}
              placeholder="Add any notes about this event..."
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-container-highest border border-outline-variant/30 text-on-surface py-2.5 rounded-xl text-sm font-medium hover:bg-surface-bright transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-br from-primary to-primary-container text-on-primary py-2.5 rounded-xl text-sm font-semibold hover:contrast-125 transition-all shadow-[0_0_20px_rgba(188,199,222,0.2)]"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventManagementPage() {
  const [showModal, setShowModal] = useState(false);

  // Listen for the custom event dispatched by the sidebar "New Event" button
  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('open-new-event', handler);
    return () => window.removeEventListener('open-new-event', handler);
  }, []);

  return (
    <>
      {showModal && <NewEventModal onClose={() => setShowModal(false)} />}

      <div className="flex flex-col gap-4 w-full p-4 sm:p-6">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-fixed-dim">Events Schedule</h2>
            <p className="text-sm text-on-surface-variant mt-1">Manage upcoming and past venue operations.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-fixed transition-colors shadow-[0_0_20px_rgba(188,199,222,0.15)]"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            New Event
          </button>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center bg-surface-container-low p-2 rounded-xl border border-outline-variant/10">
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Search events..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-bright transition-colors border border-outline-variant/10">All</button>
            <button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors">Upcoming</button>
            <button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high hover:text-on-surface transition-colors">Past</button>
          </div>
        </div>

        {/* Event Cards */}
        <div className="flex flex-col gap-4">
          {/* Live Event */}
          <div className="bg-surface-container p-5 rounded-xl border-l-4 border-l-secondary relative overflow-hidden group hover:bg-surface-container-high transition-colors cursor-pointer shadow-lg shadow-background/50">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-primary hover:text-primary-fixed bg-surface p-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="flex gap-3 items-center mb-3">
              <div className="bg-secondary/10 text-secondary px-2 py-1 rounded-md text-[0.6875rem] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                Live
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Today, 18:00 - 23:00</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Global Tech Summit 2024</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span> Main Arena & Hall B
            </p>
            <div className="flex gap-6 border-t border-outline-variant/20 pt-4">
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

          {/* Draft Event */}
          <div className="bg-surface-container p-5 rounded-xl relative group hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent border-t-outline-variant/10 border-l-outline-variant/10">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-primary hover:text-primary-fixed bg-surface p-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="flex gap-3 items-center mb-3">
              <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-[0.6875rem] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Draft
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Oct 15, 09:00 - 17:00</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">AI Innovations Expo</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span> Exhibition Halls A-C
            </p>
            <div className="flex gap-6 border-t border-outline-variant/20 pt-4">
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

          {/* Completed Event */}
          <div className="bg-surface-container p-5 rounded-xl relative group hover:bg-surface-container-high transition-colors cursor-pointer opacity-60 hover:opacity-100">
            <div className="flex gap-3 items-center mb-3">
              <div className="bg-outline-variant/20 text-outline px-2 py-1 rounded-md text-[0.6875rem] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
                Completed
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Sep 28, 20:00 - 23:30</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Symphony Orchestra Night</h3>
            <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span> Grand Concert Hall
            </p>
            <div className="flex gap-6 border-t border-outline-variant/20 pt-4">
              <div>
                <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1">Total Attendance</p>
                <p className="text-lg font-headline font-semibold text-on-surface">4,210</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
