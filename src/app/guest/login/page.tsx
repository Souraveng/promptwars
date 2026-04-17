"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export default function GuestLoginGateway() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('Initializing Secure Handshake...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing Ticket Token.");
      setStatus("Authentication Failed");
      return;
    }

    const authenticateGuest = async () => {
      setStatus("Verifying Cryptographic Ticket...");
      try {
        if (token.startsWith('fallback-')) {
          setStatus("Local Simulation Active. Establishing Anonymous Identity...");
          try {
            await signInAnonymously(auth);
          } catch (authError: any) {
            console.error("Firebase Simulation Auth Error:", authError);
            if (authError.code === 'auth/admin-restricted-operation') {
              setError("Anonymous Auth is DISABLED in your Firebase Console. Enable it in the Console (Build > Authentication > Sign-in method).");
            } else if (authError.message?.includes('Origin not allowed')) {
              setError("DOMAIN UNAUTHORIZED: Add 'localhost' to Authorized Domains in your Firebase Console.");
            } else {
              setError(`Protocol Error: ${authError.code || authError.message}`);
            }
            return; // Stop auto-redirect if auth fails
          }
        } else {
          try {
            await signInWithCustomToken(auth, token);
          } catch (tokenError: any) {
            console.error("Custom Token Auth Error:", tokenError);
            setError(`Security Error: ${tokenError.message}`);
            return;
          }
        }
        
        setStatus("Access Granted. Redirecting to Tactical OS...");
        
        // Brief delay for dramatic effect / letting the token settle
        setTimeout(() => {
          router.push('/guest/dashboard');
        }, 1200);

      } catch (err: any) {
        console.error("Uncaught Auth Error:", err);
        setError(err.message || "Cryptographic verification failed.");
        setStatus("Access Denied");
      }
    };

    authenticateGuest();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#060D20] text-[#DBE2FD] flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Space_Grotesk']">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4D8EFF] rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 glass-card p-12 rounded-2xl flex flex-col items-center text-center max-w-sm w-full border border-[#DBE2FD]/10">
        
        {/* Status Icon */}
        <div className="mb-8">
          <span className={`material-symbols-outlined text-6xl ${error ? 'text-red-500' : 'text-[#4EDEA3] animate-pulse'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {error ? 'gpp_bad' : 'enhanced_encryption'}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2">
          Sector Access
        </h1>
        
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
