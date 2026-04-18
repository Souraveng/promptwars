'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { mockData } from '@/lib/mock-data';

export default function GuestDashboardPage() {
  const { user, currentEvent, crowd } = mockData;
  const router = useRouter();

  const quickActions = [
    { icon: 'confirmation_number', label: 'Ticket',   href: '/guest/tickets'  },
    { icon: 'map',                 label: 'Map',      href: '/guest/map'      },
    { icon: 'groups',              label: 'Crowd',    href: '/guest/crowd'    },
    { icon: 'notifications',       label: 'Alerts',   href: '/guest/alerts'   },
    { icon: 'medical_services',    label: 'Medical',  href: '/guest/medical'  },
    { icon: 'radar',               label: 'Radar',    href: '/guest/crowd'    },
  ];

  return (
    <main className="px-4 py-6 max-w-7xl mx-auto">

      {/* ── Header row ── */}
      <section className="flex justify-between items-center mb-6">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.05em] text-primary mb-1">Welcome Back</p>
          <h2 className="font-headline text-2xl md:text-3xl font-bold">{user.firstName} {user.lastName}</h2>
        </div>
        <button
          onClick={() => router.push('/guest/sos')}
          className="bg-error-container text-on-error-container px-4 py-2 rounded-full font-label text-[10px] uppercase tracking-[0.05em] font-bold flex items-center gap-2 border border-error/20 hover:bg-error/80 transition-colors"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          SOS
        </button>
      </section>

      {/* ── Desktop: two-column, Mobile: single column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column — event card + crowd */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Event Card */}
          <section className="relative bg-surface-container-low rounded-2xl p-6 overflow-hidden border border-outline-variant/15 shadow-[0_16px_32px_rgba(6,14,32,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-transparent pointer-events-none rounded-2xl" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-label text-[10px] uppercase tracking-[0.05em] mb-4 border border-secondary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Live Now
              </span>
              <h3 className="font-headline text-2xl md:text-3xl font-bold text-on-surface leading-tight mb-2">{currentEvent.name}</h3>
              <p className="text-on-surface-variant text-sm flex items-center gap-2 font-body mb-6">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                {currentEvent.date} • {currentEvent.time}
              </p>

              <div className="grid grid-cols-4 gap-3 bg-surface-container rounded-xl p-4 border border-outline-variant/10">
                {[
                  { label: 'Gate', value: currentEvent.location.gate },
                  { label: 'Sec',  value: currentEvent.location.section },
                  { label: 'Row',  value: currentEvent.location.row },
                  { label: 'Seat', value: currentEvent.location.seat },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant mb-1">{label}</p>
                    <p className="font-headline font-bold text-xl text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Crowd Status */}
          <section className="bg-surface-container-low rounded-2xl p-6 relative overflow-hidden border border-outline-variant/15">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-error/15 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sensors</span>
                {crowd.location}
              </h4>
              <button onClick={() => router.push('/guest/crowd')}
                className="text-[10px] text-primary uppercase tracking-wider font-bold hover:text-primary-fixed transition-colors">
                View Details →
              </button>
            </div>
            <div className="flex items-end gap-4 mb-3">
              <span className="font-headline text-5xl font-bold text-error">{crowd.density}<span className="text-2xl">%</span></span>
              <span className="font-label text-sm text-error font-medium mb-1">{crowd.status}</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-error h-full rounded-full transition-all duration-500" style={{ width: `${crowd.density}%` }} />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">Consider using an alternate entrance to avoid congestion.</p>
          </section>
        </div>

        {/* Right column — quick actions */}
        <div className="flex flex-col gap-4">
          <h3 className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            {quickActions.map(({ icon, label, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="bg-surface-container-low hover:bg-surface-container active:scale-95 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-3 border border-outline-variant/15 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-label text-[10px] uppercase tracking-[0.05em] text-on-surface-variant group-hover:text-primary transition-colors">{label}</span>
              </button>
            ))}
          </div>

          {/* SOS card on desktop */}
          <button
            onClick={() => router.push('/guest/sos')}
            className="hidden lg:flex w-full bg-error-container/20 hover:bg-error-container/40 border border-error/20 rounded-2xl p-5 items-center gap-4 transition-all group"
          >
            <span className="material-symbols-outlined text-error text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            <div className="text-left">
              <p className="font-headline text-sm font-bold text-error">Emergency SOS</p>
              <p className="text-xs text-on-surface-variant">Tap to alert venue security</p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
