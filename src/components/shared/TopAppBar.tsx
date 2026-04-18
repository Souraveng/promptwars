'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export default function TopAppBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="h-16 w-full sticky top-0 z-50 border-b border-outline-variant/10 shrink-0"
      style={{ background: 'rgba(11,19,38,0.9)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Left — title */}
        <h1 className="font-headline font-bold tracking-tight text-base md:text-lg"
          style={{ color: '#bcc7de' }}>
          AETHER VENUE OS
        </h1>

        {/* Right — profile button */}
        <div className="relative flex-shrink-0" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#222a3d',
              border: '2px solid #4edea3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="#4edea3"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#4edea3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-44 rounded-xl shadow-2xl overflow-hidden z-[100]"
              style={{ background: '#171f33', border: '1px solid rgba(69,70,77,0.4)' }}>
              <button
                onClick={() => { setOpen(false); router.push('/'); }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-white/5"
                style={{ color: '#bcc7de', fontSize: '13px' }}
              >
                <span className="material-symbols-outlined text-sm">home</span>
                Landing Page
              </button>
              <div style={{ borderTop: '1px solid rgba(69,70,77,0.3)' }} />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-red-500/10"
                style={{ color: '#ffb4ab', fontSize: '13px' }}
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
