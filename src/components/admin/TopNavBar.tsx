import React from 'react';

export default function TopNavBar() {
  return (
    <header className="fixed top-0 w-full z-30 bg-[#0b1326]/80 backdrop-blur-md flex justify-between items-center px-6 h-16 md:pl-72 transition-all border-b border-outline-variant/20">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[#bcc7de]">
          <span className="material-symbols-outlined mb-1">menu</span>
        </button>
        <h2 className="font-headline text-xl font-bold text-[#bcc7de] tracking-tighter hidden md:block">Sentinel Lens Admin</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#bcc7de] hover:bg-[#171f33] transition-colors duration-200 p-2 rounded-full active:scale-95">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <button className="text-[#bcc7de] hover:bg-[#171f33] transition-colors duration-200 p-2 rounded-full active:scale-95">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
        </button>
        <button className="text-[#bcc7de] hover:bg-[#171f33] transition-colors duration-200 p-2 rounded-full active:scale-95">
          <span className="material-symbols-outlined" data-icon="help">help</span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 ml-2">
          {/* Default avatar placeholder since we don't have the google hosted image guaranteed */}
          <div className="w-full h-full bg-primary-container flex items-center justify-center">
             <span className="material-symbols-outlined text-sm text-primary">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
