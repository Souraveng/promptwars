"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export default function GuestLoginGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Initializing Secure Handshake...');
  const [error, setError] = useState('');

  useEffect(() => {
    const authenticateGuest = async () => {
      setStatus("Verifying Cryptographic Ticket...");
      try {
        let token: string | null = null;
        let ticketData: Record<string, string> = {};

        const tid = searchParams.get('tid');

        if (tid) {
          // ── New short-URL flow: QR only contains ticketId ──
          setStatus("Fetching ticket data...");
          try {
            const res = await fetch(`/api/admin/ticket-store?ticketId=${tid}`);
            if (res.ok) {
              const stored = await res.json();
              token = stored.token as string;
              ticketData = stored;
            } else {
              setError("Ticket not found or expired. Please request a new ticket from the admin.");
              return;
            }
          } catch {
            setError("Could not reach ticket server. Check your connection.");
            return;
          }
        } else {
          // ── Legacy long-URL flow ──
          token = searchParams.get('token');
          ticketData = {
            eventName:    searchParams.get('eventName')    || '',
            gate:         searchParams.get('gate')         || '',
            section:      searchParams.get('section')      || '',
            row:          searchParams.get('row')          || '',
            seat:         searchParams.get('seat')         || '',
            guestName:    searchParams.get('guestName')    || '',
            guestAge:     searchParams.get('guestAge')     || '',
            guestIdLast4: searchParams.get('guestIdLast4') || '',
            guestMobile:  searchParams.get('guestMobile')  || '',
            guestEmail:   searchParams.get('guestEmail')   || '',
            eventId:      searchParams.get('eventId')      || '',
          };
        }

        if (!token) {
          setError("Invalid or missing Ticket Token.");
          setStatus("Authentication Failed");
          return;
        }

        if (token.startsWith('fallback-')) {
          setStatus("Local Simulation Active. Establishing Anonymous Identity...");
          try {
            await signInAnonymously(auth);
            localStorage.setItem('ticket_data', JSON.stringify(ticketData));
          } catch (authError: any) {
            if (authError.code === 'auth/admin-restricted-operation') {
              setError("Anonymous Auth is DISABLED in your Firebase Console. Enable it under Build > Authentication > Sign-in method.");
            } else {
              setError(`Protocol Error: ${authError.code || authError.message}`);
            }
            return;
          }
        } else {
          try {
            await signInWithCustomToken(auth, token);
            localStorage.setItem('ticket_data', JSON.stringify(ticketData));
          } catch (tokenError: any) {
            setError(`Security Error: ${tokenError.message}`);
            return;
          }
        }

        setStatus("Access Granted. Redirecting to Tactical OS...");
        setTimeout(() => router.push('/guest/dashboard'), 1200);

      } catch (err: any) {
        setError(err.message || "Cryptographic verification failed.");
        setStatus("Access Denied");
      }
    };

    authenticateGuest();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#060D20] text-[#DBE2FD] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Space_Grotesk']">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4D8EFF] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 glass-card p-12 rounded-2xl flex flex-col items-center text-center max-w-sm w-full border border-[#DBE2FD]/10">
        <div className="mb-8">
          <span
            className={`material-symbols-outlined text-6xl ${error ? 'text-red-500' : 'text-[#4EDEA3] animate-pulse'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {error ? 'gpp_bad' : 'enhanced_encryption'}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2">Sector Access</h1>

        <p className="font-['Inter'] text-sm tracking-widest uppercase text-[#DBE2FD]/60 mb-8 min-h-[40px]">
          {status}
        </p>

        {error && (
          <div className="w-full bg-red-900/30 border border-red-500/50 p-4 rounded text-red-200 text-xs font-['Inter'] mb-6">
            {error}
          </div>
        )}

        {error && (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push('/guest/dashboard')}
              className="w-full py-3 bg-[#4EDEA3]/20 hover:bg-[#4EDEA3]/30 border border-[#4EDEA3]/40 rounded transition-all font-bold tracking-widest text-[10px] uppercase text-[#4EDEA3]"
            >
              Force Entry (Development Bypass)
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-[#DBE2FD]/10 hover:bg-[#DBE2FD]/20 border border-[#DBE2FD]/20 rounded transition-all font-bold tracking-widest text-[10px] uppercase"
            >
              Return to Surface
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
