'use client';

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useGuest } from '@/app/guest/GuestContext';
import Image from 'next/image';
import ProfileEditorModal from './ProfileEditorModal';

/**
 * Deployment Switcher UI Component
 * Separated for performance isolation and clean code structure.
 */
const DeploymentSwitcher = memo(({ tickets, activeTicket, onSelect, isOpen, onToggle }: {
  tickets: any[],
  activeTicket: any,
  onSelect: (ticket: any) => void,
  isOpen: boolean,
  onToggle: (state: boolean) => void
}) => {
  if (tickets.length === 0) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => onToggle(!isOpen)}
        aria-label="Select Active Deployment Context"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-full border border-outline-variant/10 hover:border-primary/40 transition-all active:scale-95"
      >
        <div className="flex flex-col items-start">
           <p className="text-[8px] font-black uppercase tracking-widest text-primary opacity-80 leading-none mb-0.5" aria-hidden="true">Active Context</p>
           <p className="text-[10px] font-bold text-on-surface max-w-[80px] md:max-w-[180px] truncate">
             {activeTicket?.event?.title || 'No Selection'}
           </p>
        </div>
        <span className="material-symbols-outlined text-sm text-on-surface-variant transition-transform" aria-hidden="true" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[280px] md:w-[320px] rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 bg-[#171f33] z-[100] animate-in slide-in-from-top-2" role="menu">
           <div className="p-3 border-b border-outline-variant/10 text-[9px] uppercase font-black tracking-widest text-on-surface-variant opacity-60">Verified Deployments</div>
           <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
              {tickets.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => onSelect(t)}
                  role="menuitem"
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${activeTicket?.id === t.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-white/5 border-transparent'}`}
                >
                   <div className="relative w-10 h-10 shrink-0">
                     <Image 
                       src={t.event.bannerUrl || '/fallback-banner.png'} 
                       fill 
                       sizes="40px"
                       className="rounded-lg object-cover grayscale opacity-40" 
                       alt="" 
                     />
                   </div>
                   <div className="text-left overflow-hidden">
                      <p className={`text-[11px] font-bold truncate ${activeTicket?.id === t.id ? 'text-primary' : 'text-on-surface'}`}>{t.event.title}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">{t.section} • {t.row}{t.seat}</p>
                   </div>
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
});

DeploymentSwitcher.displayName = 'DeploymentSwitcher';

/**
 * Top Navigation Bar
 * Optimized for core Tactical OS aesthetics and accessibility.
 */
export default function TopAppBar() {
  const router = useRouter();
  const { profile, user, activeTicket, tickets, setActiveTicket } = useGuest();
  
  const [open, setOpen] = useState(false);
  const [showDeploymentList, setShowDeploymentList] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  
  const ref = useRef<HTMLDivElement>(null);
  const deployRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (deployRef.current && !deployRef.current.contains(e.target as Node)) setShowDeploymentList(false);
    };
    
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowDeploymentList(false);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setOpen(false);
    await signOut(auth);
    router.push('/guest/scan');
  }, [router]);

  const handleTicketSelect = useCallback((t: any) => {
    setActiveTicket(t);
    setShowDeploymentList(false);
  }, [setActiveTicket]);

  return (
    <>
    <header 
      className="h-16 w-full sticky top-0 z-[50] border-b border-outline-variant/10 shrink-0"
      role="banner"
      style={{ background: 'rgba(6,13,32,0.9)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <h1 className="font-headline font-black tracking-tighter text-lg bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
          AETHER OS
        </h1>

        <div className="flex items-center gap-2">
          <div ref={deployRef}>
            <DeploymentSwitcher 
              tickets={tickets}
              activeTicket={activeTicket}
              onSelect={handleTicketSelect}
              isOpen={showDeploymentList}
              onToggle={setShowDeploymentList}
            />
          </div>

          <div className="relative" ref={ref}>
            <button 
              onClick={() => setOpen(!open)}
              aria-label="User Profile and Account Menu"
              aria-expanded={open}
              aria-haspopup="true"
              className="w-10 h-10 rounded-xl bg-surface-container-highest/20 border border-outline-variant/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 bg-[#171f33] z-[100] animate-in slide-in-from-top-2" role="menu">
                <div className="p-4 bg-primary/5 border-b border-outline-variant/10 relative">
                   {(!profile) && (
                     <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_10px_#ff5252]" aria-label="Incomplete Profile Indicator" />
                   )}
                   <p className="text-[9px] uppercase tracking-widest font-black text-primary mb-1">Authenticated Operative</p>
                   <p className="font-headline font-bold text-sm text-on-surface truncate">{profile?.name || user?.displayName || 'Unknown User'}</p>
                   <p className="text-[10px] text-on-surface-variant opacity-60 font-mono truncate">{profile?.email || user?.email || 'No email'}</p>
                </div>
                <div className="p-2 space-y-1">
                   <button 
                     onClick={() => { setShowProfileEditor(true); setOpen(false); }}
                     role="menuitem"
                     className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-white/5 transition-colors text-[12px] font-medium"
                   >
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">badge</span>
                      View Credentials
                   </button>
                   <button 
                     onClick={handleSignOut}
                     role="menuitem"
                     className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-error/10 text-error transition-colors text-[12px] font-medium"
                   >
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">logout</span>
                      Sign Out
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    <ProfileEditorModal 
      isOpen={showProfileEditor}
      onClose={() => setShowProfileEditor(false)}
    />
    </>
  );
}
