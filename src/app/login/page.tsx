"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/admin/monitor');
    } catch (err: any) {
      console.error(err);
      setError('Google Sign-In failed: ' + err.message);
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/monitor');
    } catch (err: any) {
      console.error(err);
      setError('Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col justify-center items-center relative overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Asymmetric Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-surface-container-highest/30 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] rounded-full bg-secondary-container/10 blur-[100px] pointer-events-none"></div>
      
      {/* Main Canvas */}
      <main className="w-full max-w-[420px] px-6 z-10 flex flex-col items-center">
        {/* Branding Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-fixed-dim flex items-center justify-center mb-6 shadow-[0_16px_32px_rgba(6,14,32,0.6)]">
            <span className="material-symbols-outlined text-on-primary text-4xl" data-icon="lens_blur" style={{ fontVariationSettings: "'FILL' 1" }}>lens_blur</span>
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-primary mb-2">Aether Venue OS</h1>
          <p className="font-body text-sm font-medium tracking-[0.05em] uppercase text-on-surface-variant/80">System Initialization</p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="w-full bg-surface-variant/60 backdrop-blur-xl rounded-[2rem] border-t border-l border-outline-variant/15 p-8 shadow-[0_16px_32px_rgba(6,14,32,0.4)] flex flex-col gap-6">
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-3 rounded text-red-200 text-xs text-center font-bold font-['Inter']">
              {error}
            </div>
          )}

          {/* Prominent Google Sign-In */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary hover:bg-primary-fixed-dim disabled:opacity-50 transition-colors duration-200 py-3.5 px-4 rounded-xl font-body font-semibold text-sm"
          >
            <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#263143"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#263143"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#263143"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#263143"></path>
            </svg>
            Sign in with Google
          </button>
          
          {/* Tonal Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/20"></div>
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant/60">Or</span>
            <div className="flex-1 h-px bg-outline-variant/20"></div>
          </div>
          
          {/* Standard Credentials Entry */}
          <form className="flex flex-col gap-4" onSubmit={handleEmailSignIn}>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="admin-email">Admin Credentials</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]" data-icon="badge">badge</span>
                <input 
                  id="admin-email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:bg-surface-container-low transition-all duration-200" 
                  placeholder="Sentinel Email" 
                />
              </div>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]" data-icon="key">key</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 focus:bg-surface-container-low transition-all duration-200" 
                placeholder="Access Token" 
              />
            </div>
            
            <button disabled={loading} type="submit" className="w-full mt-2 bg-surface-container-high text-primary hover:bg-surface-container-highest disabled:opacity-50 transition-colors duration-200 py-3 rounded-xl font-body font-medium text-sm flex justify-center items-center gap-2 border border-outline-variant/20">
              {loading ? 'Authenticating...' : 'Authenticate'}
              <span className="material-symbols-outlined text-[1rem]" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </form>
        </div>
      </main>
      
      {/* Contextual Disclaimer */}
      <div className="absolute bottom-6 w-full text-center">
        <span className="font-label text-xs text-on-surface-variant/60 hover:text-primary transition-colors duration-200 underline underline-offset-4 decoration-outline-variant/30 hover:decoration-primary/50 cursor-pointer">
          Privacy Protocol
        </span>
      </div>
    </div>
  );
}
