'use client';
import React from 'react';
import { mockData } from '@/lib/mock-data';

export default function GuestDashboardPage() {
  const { user, currentEvent, crowd } = mockData;

  return (
    <main className="px-4 py-6 max-w-md mx-auto space-y-6">
      {/* Welcome & SOS */}
      <section className="flex justify-between items-end">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.05em] text-primary mb-1">Welcome Back</p>
          <h2 className="font-headline text-3xl font-bold">{user.firstName} {user.lastName}</h2>
        </div>
        <button className="bg-error-container text-on-error-container px-4 py-2 rounded-full font-label text-[10px] uppercase tracking-[0.05em] font-bold flex items-center gap-2 border border-error/20 hover:bg-error/80 transition-colors">
          <span className="material-symbols-outlined text-sm" data-icon="emergency" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          SOS
        </button>
      </section>

      {/* Event Card (Bento/Glass) */}
      <section className="relative bg-surface-container-low rounded-xl p-6 overflow-hidden backdrop-blur-xl border-t border-l border-outline-variant/15 shadow-[0_16px_32px_rgba(6,14,32,0.4)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-secondary/10 text-secondary font-label text-[10px] uppercase tracking-[0.05em] mb-3">
                <span className="w-1 h-1 rounded-full bg-secondary"></span>
                Live Now
              </span>
              <h3 className="font-headline text-2xl font-bold text-on-surface leading-tight mb-1">{currentEvent.name}</h3>
              <p className="text-on-surface-variant text-sm flex items-center gap-2 font-body">
                <span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span> 
                {currentEvent.date} • {currentEvent.time}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4 bg-surface-container rounded-lg p-3 border border-outline-variant/10">
            <div className="text-center">
              <p className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant mb-1">Gate</p>
              <p className="font-headline font-bold text-lg text-primary">{currentEvent.location.gate}</p>
            </div>
            <div className="text-center">
              <p className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant mb-1">Sec</p>
              <p className="font-headline font-bold text-lg text-primary">{currentEvent.location.section}</p>
            </div>
            <div className="text-center">
              <p className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant mb-1">Row</p>
              <p className="font-headline font-bold text-lg text-primary">{currentEvent.location.row}</p>
            </div>
            <div className="text-center">
              <p className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant mb-1">Seat</p>
              <p className="font-headline font-bold text-lg text-primary">{currentEvent.location.seat}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Crowd Status & Quick Actions Bento Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Crowd Status Card */}
        <div className="col-span-2 md:col-span-1 bg-surface-container-low rounded-xl p-5 relative overflow-hidden border-t border-l border-outline-variant/15">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-error/20 rounded-full blur-[40px]"></div>
          <h4 className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" data-icon="sensors">sensors</span> {crowd.location}
          </h4>
          
          <div className="flex items-end gap-3 mb-2">
            <span className="font-headline text-4xl font-bold text-error">{crowd.density}<span className="text-xl">%</span></span>
            <span className="font-label text-xs text-error font-medium mb-1">{crowd.status}</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: `${crowd.density}%` }}></div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-3">
          <button className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-t border-l border-outline-variant/15 group">
            <span className="material-symbols-outlined text-primary group-hover:text-inverse-surface transition-colors" data-icon="confirmation_number">confirmation_number</span>
            <span className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant group-hover:text-primary transition-colors">Ticket</span>
          </button>
          <button className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-t border-l border-outline-variant/15 group">
            <span className="material-symbols-outlined text-primary group-hover:text-inverse-surface transition-colors" data-icon="map">map</span>
            <span className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant group-hover:text-primary transition-colors">Map</span>
          </button>
          <button className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-t border-l border-outline-variant/15 group">
            <span className="material-symbols-outlined text-primary group-hover:text-inverse-surface transition-colors" data-icon="radar">radar</span>
            <span className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant group-hover:text-primary transition-colors">Radar</span>
          </button>
          <button className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-t border-l border-outline-variant/15 group">
            <span className="material-symbols-outlined text-primary group-hover:text-inverse-surface transition-colors" data-icon="refresh">refresh</span>
            <span className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant group-hover:text-primary transition-colors">Refresh</span>
          </button>
        </div>
      </section>
    </main>
  );
}
