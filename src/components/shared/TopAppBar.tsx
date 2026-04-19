'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { useGuest } from '@/app/guest/GuestContext';
import ProfileEditorModal from './ProfileEditorModal';

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
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut(auth);
    router.push('/guest/scan');
  };

  return (
    <>
    <header className="h-16 w-full sticky top-0 z-[50] border-b border-outline-variant/10 shrink-0"
      style={{ background: 'rgba(6,13,32,0.9)', backdropFilter: 'blur(16px)' }}>
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Left — Profile Access */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={ref}>
            <button 
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-xl bg-surface-container-highest/20 border border-outline-variant/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            </button>

            {open && (
              <div className="absolute left-0 top-12 w-64 rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 bg-[#171f33] z-[100] animate-in slide-in-from-top-2">
                <div className="p-4 bg-primary/5 border-b border-outline-variant/10 relative">
                   {(!profile) && (
                     <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_10px_#ff5252]" title="Incomplete Profile" />
                   )}
                   <p className="text-[9px] uppercase tracking-widest font-black text-primary mb-1 flex items-center gap-2">
                      Authenticated Operative
                   </p>
                   <p className="font-headline font-bold text-sm text-on-surface truncate">{profile?.name || user?.displayName || 'Unknown User'}</p>
                   <p className="text-[10px] text-on-surface-variant opacity-60 font-mono truncate">{profile?.email || user?.email || 'No email'}</p>
                </div>
                <div className="p-2 space-y-1">
                   <button 
                     onClick={() => { setShowProfileEditor(true); setOpen(false); }}
                     className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-white/5 transition-colors text-[12px] font-medium"
                   >
                      <span className="material-symbols-outlined text-sm">badge</span>
                      View Credentials
                   </button>
                   <button 
                     onClick={handleSignOut}
                     className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg hover:bg-error/10 text-error transition-colors text-[12px] font-medium"
                   >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Terminate Session
                   </button>
                </div>
              </div>
            )}
          </div>
          
          <h1 className="hidden md:block font-headline font-black tracking-tighter text-lg bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            AETHER OS
          </h1>
        </div>

        {/* Center/Right — Deployment Context Switcher */}
        <div className="flex items-center gap-2">
          {tickets.length > 0 && (
            <div className="relative" ref={deployRef}>
              <button 
                onClick={() => setShowDeploymentList(!showDeploymentList)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/10 hover:border-primary/40 transition-all active:scale-95"
              >
                <div className="flex flex-col items-start">
                   <p className="text-[8px] font-black uppercase tracking-widest text-primary opacity-80 leading-none mb-0.5">Active Context</p>
                   <p className="text-[10px] font-bold text-on-surface max-w-[100px] md:max-w-[200px] truncate">{activeTicket?.event?.title || 'No Selection'}</p>
                </div>
                <span className="material-symbols-outlined text-sm text-on-surface-variant transition-transform" style={{ transform: showDeploymentList ? 'rotate(180deg)' : 'none' }}>expand_more</span>
              </button>

              {showDeploymentList && (
                <div className="absolute right-0 top-12 w-[280px] md:w-[320px] rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 bg-[#171f33] z-[100] animate-in slide-in-from-top-2">
                   <div className="p-3 border-b border-outline-variant/10 text-[9px] uppercase font-black tracking-widest text-on-surface-variant opacity-60">Verified Deployments</div>
                   <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
                      {tickets.map((t) => (
                        <button 
                          key={t.id}
                          onClick={() => { setActiveTicket(t); setShowDeploymentList(false); }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${activeTicket?.id === t.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-white/5 border-transparent'}`}
                        >
                           <img src={t.event.bannerUrl} className="w-10 h-10 rounded-lg object-cover grayscale opacity-40" alt="" />
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
          )}

          <div className="md:hidden w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/10 text-primary animate-pulse">
             <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
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
