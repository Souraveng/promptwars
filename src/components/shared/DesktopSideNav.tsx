'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useGuest } from '@/app/guest/GuestContext';

const links = [
  { href: '/guest/dashboard', icon: 'home',                label: 'Home'    },
  { href: '/guest/tickets',   icon: 'confirmation_number', label: 'Ticket'  },
  { href: '/guest/map',       icon: 'map',                 label: 'Map',      guarded: true },
  { href: '/guest/crowd',     icon: 'groups',              label: 'Crowd',    guarded: true },
  { href: '/guest/alerts',    icon: 'notifications',       label: 'Alerts'  },
  { href: '/guest/medical',   icon: 'medical_services',    label: 'Medical',  guarded: true },
];

export default function DesktopSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTicket } = useGuest();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <nav className="hidden md:flex flex-col w-20 lg:w-56 h-screen sticky top-0 bg-surface-container-lowest border-r border-outline-variant/20 shrink-0 transition-[width] duration-300 z-[60]">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-5 border-b border-outline-variant/20 shrink-0">
        <span className="material-symbols-outlined text-secondary text-2xl">hub</span>
        <span className="hidden lg:block ml-2 font-headline font-bold text-primary text-sm tracking-tighter">Aether Venue</span>
      </div>

      {/* Nav links */}
      <div className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-hidden">
        {links.map(({ href, icon, label, guarded }) => {
          const active = pathname.startsWith(href);
          const isLocked = guarded && !activeTicket;

          const content = (
            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group border
              ${isLocked 
                ? 'opacity-30 grayscale cursor-not-allowed border-transparent text-on-surface-variant/40' 
                : active
                  ? 'bg-secondary/10 text-secondary border-secondary/20 shadow-[0_0_15px_rgba(var(--color-secondary-rgb),0.05)]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-transparent'
              }`}
            >
              <span className="material-symbols-outlined shrink-0 text-xl"
                style={active && !isLocked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {isLocked ? 'lock_person' : icon}
              </span>
              <span className="hidden lg:block font-label text-xs uppercase tracking-wider font-medium">
                {label}
                {isLocked && <span className="ml-2 py-0.5 px-1 bg-surface-container rounded text-[8px] font-black opacity-60">Locked</span>}
              </span>
            </div>
          );

          if (isLocked) {
             return <div key={href} title="Active ticket required">{content}</div>;
          }

          return (
            <Link key={href} href={href}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* SOS + Sign out */}
      <div className="px-2 pb-6 flex flex-col gap-2 shrink-0">
        {!activeTicket ? (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl opacity-30 grayscale cursor-not-allowed border border-outline-variant/10 text-on-surface-variant/40" title="Active ticket required">
            <span className="material-symbols-outlined shrink-0 text-xl">lock</span>
            <span className="hidden lg:block font-label text-xs uppercase tracking-wider font-bold">SOS LOCKED</span>
          </div>
        ) : (
          <Link href="/guest/sos"
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-all">
            <span className="material-symbols-outlined shrink-0 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            <span className="hidden lg:block font-label text-xs uppercase tracking-wider font-bold">SOS</span>
          </Link>
        )}
        <button onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all w-full">
          <span className="material-symbols-outlined shrink-0 text-xl">logout</span>
          <span className="hidden lg:block font-label text-xs uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
