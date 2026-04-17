import React from 'react';

export default function TopAppBar() {
  return (
    <header className="bg-background flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-sm" data-icon="person">person</span>
        </div>
      </div>
      <div className="text-center">
        <h1 className="font-headline font-bold tracking-tight text-primary text-lg">AETHER VENUE OS</h1>
      </div>
      <div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors scale-95 duration-200">
          <span className="material-symbols-outlined text-primary" data-icon="settings">settings</span>
        </button>
      </div>
    </header>
  );
}
