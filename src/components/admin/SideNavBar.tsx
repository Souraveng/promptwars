"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideNavBar() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (path === '/admin/events' && pathname === '/admin');
    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out font-body text-sm font-medium";
    
    if (isActive) {
      return `${baseClasses} bg-[#171f33] text-[#4edea3] border-r-4 border-[#4edea3] font-semibold`;
    }
    return `${baseClasses} text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de]`;
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 z-40 bg-[#0b1326] flex flex-col py-20 px-4 transition-all duration-300 ease-in-out hidden md:flex border-r border-outline-variant/20">
      <div className="mb-10 px-4">
        <h1 className="font-headline font-bold text-[#bcc7de] text-2xl tracking-tighter">The Sentinel Lens</h1>
        <p className="text-xs text-[#bcc7de]/60 mt-1 uppercase tracking-widest">Venue Operations</p>
      </div>
      
      <button className="bg-primary text-on-primary rounded-xl py-3 px-4 mb-8 flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors font-medium text-sm">
        <span className="material-symbols-outlined text-lg" data-icon="add" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        New Event
      </button>

      <div className="flex-1 flex flex-col gap-2">
        <Link href="/admin/events" className={getLinkClasses('/admin/events')}>
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          <span>Events</span>
        </Link>
        <Link href="/admin/venue-builder" className={getLinkClasses('/admin/venue-builder')}>
          <span className="material-symbols-outlined" data-icon="architecture">architecture</span>
          <span>Layout Builder</span>
        </Link>
        <Link href="/admin/tickets" className={getLinkClasses('/admin/tickets')}>
          <span className="material-symbols-outlined" data-icon="confirmation_number">confirmation_number</span>
          <span>Tickets</span>
        </Link>
        <Link href="/admin/monitor" className={getLinkClasses('/admin/monitor')}>
          <span className="material-symbols-outlined" data-icon="sensors">sensors</span>
          <span>Monitoring</span>
        </Link>
        <Link href="/admin/alerts" className={getLinkClasses('/admin/alerts')}>
          <span className="material-symbols-outlined" data-icon="emergency_home">emergency_home</span>
          <span>Alerts</span>
        </Link>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant/20">
        <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-300 ease-in-out font-body text-sm font-medium">
          <span className="material-symbols-outlined text-sm" data-icon="history_edu">history_edu</span>
          <span>Logs</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-300 ease-in-out font-body text-sm font-medium">
          <span className="material-symbols-outlined text-sm" data-icon="dns">dns</span>
          <span>System Status</span>
        </Link>
      </div>
    </nav>
  );
}
