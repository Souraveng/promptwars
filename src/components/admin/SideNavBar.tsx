"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideNavBar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || (path === '/admin/events' && pathname === '/admin');

  return (
    <nav
      className="
        group/nav
        h-screen shrink-0 z-40
        bg-[#0b1326] border-r border-outline-variant/20
        flex flex-col
        w-16 hover:w-64
        transition-[width] duration-300 ease-in-out
        overflow-hidden
        hidden md:flex
        sticky top-0
      "
    >
      {/* Logo — same height as TopNavBar (h-16) */}
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-outline-variant/20">
        <span className="material-symbols-outlined text-[#4edea3] shrink-0 text-2xl">hub</span>
        <div className="ml-3 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          <p className="font-headline font-bold text-[#bcc7de] text-base tracking-tighter leading-tight">The Sentinel Lens</p>
          <p className="text-[0.6rem] text-[#bcc7de]/60 uppercase tracking-widest">Venue Operations</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-1 px-2 overflow-hidden">
        {[
          { href: '/admin/events', icon: 'calendar_today', label: 'Events' },
          { href: '/admin/venue-builder', icon: 'architecture', label: 'Layout Builder' },
          { href: '/admin/tickets', icon: 'confirmation_number', label: 'Tickets' },
          { href: '/admin/monitor', icon: 'sensors', label: 'Monitoring' },
          { href: '/admin/alerts', icon: 'emergency_home', label: 'Alerts' },
        ].map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`
              flex items-center gap-3 py-3 px-2 rounded-lg
              transition-all duration-200 font-body text-sm font-medium
              whitespace-nowrap
              ${isActive(href)
                ? 'bg-[#171f33] text-[#4edea3] border-r-4 border-[#4edea3] font-semibold'
                : 'text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de]'
              }
            `}
          >
            <span className="material-symbols-outlined shrink-0">{icon}</span>
            <span className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">{label}</span>
          </Link>
        ))}
      </div>

      {/* Bottom links */}
      <div className="mt-auto flex flex-col gap-1 px-2 pt-4 pb-4 border-t border-outline-variant/20 shrink-0">
        {[
          { href: '#', icon: 'history_edu', label: 'Logs' },
          { href: '#', icon: 'dns', label: 'System Status' },
        ].map(({ href, icon, label }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 py-2.5 px-2 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-200 font-body text-sm font-medium whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm shrink-0">{icon}</span>
            <span className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
