"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin/events',        icon: 'calendar_today',    label: 'Events'         },
  { href: '/admin/venue-builder', icon: 'architecture',      label: 'Layout Builder' },
  { href: '/admin/tickets',       icon: 'confirmation_number', label: 'Tickets'      },
  { href: '/admin/monitor',       icon: 'sensors',           label: 'Monitoring'     },
  { href: '/admin/alerts',        icon: 'emergency_home',    label: 'Alerts'         },
];

const BOTTOM_LINKS = [
  { href: '#', icon: 'history_edu', label: 'Logs'          },
  { href: '#', icon: 'dns',         label: 'System Status' },
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function SideNavBar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { onClose(); }, [pathname]);

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) =>
    pathname === path || (path === '/admin/events' && pathname === '/admin');

  const linkClass = (path: string) =>
    `flex items-center gap-3 py-3 px-2 rounded-lg transition-all duration-200 font-body text-sm font-medium whitespace-nowrap
    ${isActive(path)
      ? 'bg-[#171f33] text-[#4edea3] border-r-4 border-[#4edea3] font-semibold'
      : 'text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de]'}`;

  const navContent = (expanded: boolean) => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 shrink-0 border-b border-outline-variant/20">
        <span className="material-symbols-outlined text-[#4edea3] shrink-0 text-2xl">hub</span>
        {expanded && (
          <div className="ml-3 whitespace-nowrap">
            <p className="font-headline font-bold text-[#bcc7de] text-base tracking-tighter leading-tight">The Sentinel Lens</p>
            <p className="text-[0.6rem] text-[#bcc7de]/60 uppercase tracking-widest">Venue Operations</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-1 px-2 pt-2 overflow-hidden">
        {NAV_LINKS.map(({ href, icon, label }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <span className="material-symbols-outlined shrink-0">{icon}</span>
            {expanded && <span>{label}</span>}
          </Link>
        ))}
      </div>

      {/* Bottom links */}
      <div className="mt-auto flex flex-col gap-1 px-2 pt-4 pb-4 border-t border-outline-variant/20 shrink-0">
        {BOTTOM_LINKS.map(({ href, icon, label }) => (
          <Link key={label} href={href}
            className="flex items-center gap-3 py-2.5 px-2 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-200 font-body text-sm font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-sm shrink-0">{icon}</span>
            {expanded && <span>{label}</span>}
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop: hover-to-expand sidebar ── */}
      <nav className="
        group/nav h-screen shrink-0 z-40
        bg-[#0b1326] border-r border-outline-variant/20
        flex-col w-16 hover:w-64
        transition-[width] duration-300 ease-in-out
        overflow-hidden sticky top-0
        hidden md:flex
      ">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-outline-variant/20">
          <span className="material-symbols-outlined text-[#4edea3] shrink-0 text-2xl">hub</span>
          <div className="ml-3 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            <p className="font-headline font-bold text-[#bcc7de] text-base tracking-tighter leading-tight">The Sentinel Lens</p>
            <p className="text-[0.6rem] text-[#bcc7de]/60 uppercase tracking-widest">Venue Operations</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-2 pt-2 overflow-hidden">
          {NAV_LINKS.map(({ href, icon, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <span className="material-symbols-outlined shrink-0">{icon}</span>
              <span className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">{label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1 px-2 pt-4 pb-4 border-t border-outline-variant/20 shrink-0">
          {BOTTOM_LINKS.map(({ href, icon, label }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-200 font-body text-sm font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-sm shrink-0">{icon}</span>
              <span className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Mobile: slide-in drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <nav
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-[#0b1326] border-r border-outline-variant/20 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close button */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4edea3] text-2xl">hub</span>
            <div>
              <p className="font-headline font-bold text-[#bcc7de] text-base tracking-tighter leading-tight">The Sentinel Lens</p>
              <p className="text-[0.6rem] text-[#bcc7de]/60 uppercase tracking-widest">Venue Operations</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#bcc7de]/60 hover:text-[#bcc7de] p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-3 pt-3 overflow-y-auto">
          {NAV_LINKS.map(({ href, icon, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <span className="material-symbols-outlined shrink-0">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-1 px-3 pt-4 pb-6 border-t border-outline-variant/20">
          {BOTTOM_LINKS.map(({ href, icon, label }) => (
            <Link key={label} href={href}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg text-[#bcc7de]/60 hover:bg-[#171f33] hover:text-[#bcc7de] transition-all duration-200 font-body text-sm font-medium">
              <span className="material-symbols-outlined text-sm shrink-0">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
