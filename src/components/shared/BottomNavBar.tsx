'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavBar() {
  const pathname = usePathname();

  const links = [
    { href: '/guest/dashboard', icon: 'home',                label: 'Home'    },
    { href: '/guest/tickets',   icon: 'confirmation_number', label: 'Ticket'  },
    { href: '/guest/map',       icon: 'map',                 label: 'Map'     },
    { href: '/guest/crowd',     icon: 'groups',              label: 'Crowd'   },
    { href: '/guest/medical',   icon: 'medical_services',    label: 'Medical' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pt-3 pb-safe-bottom bg-background/60 backdrop-blur-xl z-50 border-t border-outline-variant/20 shadow-[0_-16px_32px_rgba(11,19,38,0.4)] h-[84px] pb-6">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 h-full w-full ${
              isActive 
                ? "text-secondary relative after:content-[''] after:absolute after:bottom-0 after:w-1 after:h-1 after:bg-secondary after:rounded-full after:shadow-[0_0_8px_var(--color-secondary)]" 
                : "text-primary/40 hover:text-primary"
            }`}
          >
            <span 
              className="material-symbols-outlined mb-1" 
              data-icon={link.icon} 
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {link.icon}
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.05em] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
