"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function TopNavBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [open, setOpen] = useState<'notifications' | 'settings' | 'help' | 'profile' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useClickOutside(panelRef, () => setOpen(null));

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  const toggle = (key: typeof open) => setOpen(prev => prev === key ? null : key);

  const navigate = (path: string) => {
    setOpen(null);
    router.push(path);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Derive display name and initials from Firebase user
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin User';
  const email = user?.email || 'admin@sentinellens.io';
  const photoURL = user?.photoURL;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-[#0b1326]/90 backdrop-blur-md flex justify-between items-center px-6 h-16 shrink-0 border-b border-outline-variant/20">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="text-[#bcc7de] p-1.5 hover:bg-[#171f33] rounded-lg transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h2 className="font-headline text-xl font-bold text-[#bcc7de] tracking-tighter">Sentinel Lens Admin</h2>
        </Link>
      </div>

      <div className="flex items-center gap-1 relative" ref={panelRef}>

        {/* Notifications */}
        <button
          onClick={() => toggle('notifications')}
          className={`relative text-[#bcc7de] p-2 rounded-full transition-colors ${open === 'notifications' ? 'bg-[#171f33]' : 'hover:bg-[#171f33]'}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-[#0b1326]"></span>
        </button>

        {/* Settings */}
        <button
          onClick={() => toggle('settings')}
          className={`text-[#bcc7de] p-2 rounded-full transition-colors ${open === 'settings' ? 'bg-[#171f33]' : 'hover:bg-[#171f33]'}`}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>

        {/* Help */}
        <button
          onClick={() => toggle('help')}
          className={`text-[#bcc7de] p-2 rounded-full transition-colors ${open === 'help' ? 'bg-[#171f33]' : 'hover:bg-[#171f33]'}`}
        >
          <span className="material-symbols-outlined">help</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => toggle('profile')}
          className={`ml-1 h-8 w-8 rounded-full border border-outline-variant/30 flex items-center justify-center transition-all overflow-hidden ${open === 'profile' ? 'ring-2 ring-primary/50' : 'hover:ring-2 hover:ring-primary/30'}`}
        >
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-container flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
          )}
        </button>

        {/* ── Dropdowns ── */}

        {/* Notifications panel */}
        {open === 'notifications' && (
          <div className="absolute top-12 right-0 w-[calc(100vw-2rem)] max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant/10">
              <span className="font-headline text-sm font-bold text-on-surface">Notifications</span>
              <button className="text-xs text-primary hover:text-primary-fixed">Mark all read</button>
            </div>
            <div className="flex flex-col divide-y divide-outline-variant/10 max-h-72 overflow-y-auto">
              {[
                { icon: 'warning', color: 'text-error', bg: 'bg-error/10', title: 'High crowd density', desc: 'North Concourse at 85% capacity', time: '2m ago' },
                { icon: 'confirmation_number', color: 'text-secondary', bg: 'bg-secondary/10', title: 'Ticket anomaly detected', desc: 'Duplicate scan at East Gate T2', time: '8m ago' },
                { icon: 'campaign', color: 'text-primary', bg: 'bg-primary/10', title: 'Broadcast sent', desc: 'Evacuation route update delivered', time: '22m ago' },
              ].map(({ icon, color, bg, title, desc, time }) => (
                <div key={title} className="flex gap-3 px-4 py-3 hover:bg-surface-container cursor-pointer transition-colors">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{title}</p>
                    <p className="text-xs text-on-surface-variant truncate">{desc}</p>
                  </div>
                  <span className="text-[10px] text-outline whitespace-nowrap pt-0.5">{time}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-outline-variant/10">
              <button className="w-full text-xs text-center text-primary hover:text-primary-fixed py-1">View all notifications</button>
            </div>
          </div>
        )}

        {/* Settings panel */}
        {open === 'settings' && (
          <div className="absolute top-12 right-0 w-64 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-outline-variant/10">
              <span className="font-headline text-sm font-bold text-on-surface">Settings</span>
            </div>
            <div className="flex flex-col py-1">
              {[
                { icon: 'tune', label: 'Preferences', path: '/admin/settings/preferences' },
                { icon: 'security', label: 'Security & Access', path: '/admin/settings/security' },
                { icon: 'notifications_active', label: 'Alert Thresholds', path: '/admin/settings/alerts' },
                { icon: 'integration_instructions', label: 'Integrations', path: '/admin/settings/integrations' },
              ].map(({ icon, label, path }) => (
                <button key={label} onClick={() => navigate(path)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help panel */}
        {open === 'help' && (
          <div className="absolute top-12 right-0 w-64 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-outline-variant/10">
              <span className="font-headline text-sm font-bold text-on-surface">Help & Support</span>
            </div>
            <div className="flex flex-col py-1">
              {[
                { icon: 'menu_book', label: 'Documentation', path: '/admin/help/docs' },
                { icon: 'live_help', label: 'Live Support Chat', path: '/admin/help/support' },
                { icon: 'bug_report', label: 'Report an Issue', path: '/admin/help/report' },
                { icon: 'info', label: 'About Sentinel Lens', path: '/admin/help/about' },
              ].map(({ icon, label, path }) => (
                <button key={label} onClick={() => navigate(path)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Profile panel */}
        {open === 'profile' && (
          <div className="absolute top-12 right-0 w-64 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-variant/10">
              <div className="w-10 h-10 rounded-full border border-outline-variant/30 overflow-hidden flex items-center justify-center bg-primary-container shrink-0">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                <p className="text-xs text-on-surface-variant truncate">{email}</p>
              </div>
            </div>
            <div className="flex flex-col py-1">
              {[
                { icon: 'manage_accounts', label: 'My Profile', path: '/admin/profile' },
                { icon: 'badge', label: 'Role & Permissions', path: '/admin/profile/permissions' },
                { icon: 'dark_mode', label: 'Appearance', path: '/admin/profile/appearance' },
              ].map(({ icon, label, path }) => (
                <button key={label} onClick={() => navigate(path)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left w-full">
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="border-t border-outline-variant/10 py-1">
              <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors w-full text-left">
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
