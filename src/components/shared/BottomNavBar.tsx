'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGuest } from '@/app/guest/GuestContext';

export default function BottomNavBar() {
  const pathname = usePathname();
  const { activeTicket } = useGuest();

  const links = [
    { href: '/guest/dashboard', icon: 'home',                label: 'Home'    },
    { href: '/guest/tickets',   icon: 'confirmation_number', label: 'Ticket'  },
    { href: '/guest/map',       icon: 'map',                 label: 'Map',      guarded: true },
    { href: '/guest/crowd',     icon: 'groups',              label: 'Crowd',    guarded: true },
    { href: '/guest/sos',       icon: 'emergency',           label: 'SOS',      guarded: true },
    { href: '/guest/alerts',    icon: 'notifications',       label: 'Alerts',   guarded: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-safe-bottom bg-background/60 backdrop-blur-xl z-50 border-t border-outline-variant/20 shadow-[0_-16px_32px_rgba(11,19,38,0.4)] h-[84px] pb-6" role="navigation" aria-label="Mobile Bottom Navigation">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const isLocked = link.guarded && !activeTicket;
        const iconColor = isLocked ? 'text-on-surface/20' : (isActive ? 'text-secondary' : 'text-primary/40');
        
        const content = (
          <div className={`flex flex-col items-center justify-center transition-all ${!isLocked && 'active:scale-90'} duration-150 h-full w-full ${iconColor} ${isActive && !isLocked && "relative after:content-[''] after:absolute after:bottom-0 after:w-1 after:h-1 after:bg-secondary after:rounded-full after:shadow-[0_0_8px_var(--color-secondary)]"}`}>
            <span className="material-symbols-outlined mb-1" aria-hidden="true" style={isActive && !isLocked ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {isLocked ? 'lock_person' : link.icon}
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.05em] font-medium">{link.label}</span>
          </div>
        );

        if (isLocked) {
          return <div key={link.href} className="flex-1 h-full cursor-not-allowed grayscale opacity-50" aria-disabled="true" aria-label={`${link.label} (Locked - Deployment Required)`}>{content}</div>;
        }

        return (
          <Link key={link.href} href={link.href} className="flex-1 h-full" aria-label={link.label} aria-current={isActive ? 'page' : undefined}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
