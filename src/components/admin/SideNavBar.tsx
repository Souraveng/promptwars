"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin/events',        icon: 'calendar_today',      label: 'Events'         },
  { href: '/admin/venue-builder', icon: 'architecture',        label: 'Layout Builder' },
  { href: '/admin/tickets',       icon: 'confirmation_number', label: 'Tickets'        },
  { href: '/admin/monitor',       icon: 'sensors',             label: 'Monitoring'     },
  { href: '/admin/alerts',        icon: 'emergency_home',      label: 'Alerts'         },
];

const BOTTOM_LINKS: { href: string; icon: string; label: string }[] = [];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SideNavBar({ open, onClose }: Props) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]);

  // Lock scroll when open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (path: string) =>
    pathname === path || (path === '/admin/events' && pathname === '/admin');

  const linkClass = (path: string) =>
    `flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-150 font-body text-sm font-medium whitespace-nowrap
    ${isActive(path)
      ? 'bg-[#171f33] text-[#4edea3] border-r-4 border-[#4edea3] font-semibold'
      : 'text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de]'}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer — slides in from left on both mobile and desktop */}
      <nav
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-[#0b1326] border-r border-outline-variant/20
          flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4edea3] text-2xl">hub</span>
            <div>
              <p className="font-headline font-bold text-[#bcc7de] text-sm tracking-tighter leading-tight">The Sentinel Lens</p>
              <p className="text-[0.6rem] text-[#bcc7de]/60 uppercase tracking-widest">Venue Operations</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#bcc7de]/60 hover:text-[#bcc7de] hover:bg-[#171f33] transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex flex-col gap-1 px-2 pt-3 overflow-y-auto">
          {NAV_LINKS.map(({ href, icon, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <span className="material-symbols-outlined shrink-0">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Bottom links */}
        <div className="flex flex-col gap-1 px-2 pt-3 pb-4 border-t border-outline-variant/20 shrink-0">
          {BOTTOM_LINKS.map(({ href, icon, label }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-150 font-body text-sm font-medium">
              <span className="material-symbols-outlined text-sm shrink-0">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
