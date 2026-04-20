'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, dataconnect } from '@/lib/firebase-client';
import { executeMutation, executeQuery } from 'firebase/data-connect';
import { GetTicketData, GetTicketVariables, ClaimTicketVariables, UpsertUserProfileVariables } from '@/types/dataconnect';
import { useGuest } from '../GuestContext';
import { useSearchParams } from 'next/navigation';

export default function GuestLoginPage() {
  const router = useRouter();
  const { user, profile, loading: contextLoading } = useGuest();
  const searchParams = useSearchParams();
  const tid = searchParams.get('tid') || searchParams.get('token'); // handle both param names
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyingTicket, setVerifyingTicket] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<any>(null);

  useEffect(() => {
    if (tid && tid.length > 10) { // Simple validation for UUID-like strings
      verifyTacticalPass(tid);
    }
  }, [tid]);

  const verifyTacticalPass = async (id: string) => {
    setVerifyingTicket(true);
    try {
      const qRef = await import('firebase/data-connect').then(m => m.queryRef<GetTicketData, GetTicketVariables>(dataconnect, 'GetTicket', { id }));
      const result = await executeQuery(qRef);
      const ticket = result.data?.ticket;
      
      if (ticket) {
        setScannedTicket(ticket);
        
        // If already logged in, link and sync profile immediately
        if (user && !contextLoading) {
          await linkAndSyncProfile(ticket, user.uid);
          router.push('/guest/dashboard');
          return;
        }

        // Preset form fields for new signups
        setFormData(prev => ({
          ...prev,
          name: ticket.guestName,
          email: ticket.guestEmail,
          age: String(ticket.guestAge),
          idCardNumber: ticket.guestIdNumber,
          phone: ticket.guestMobile
        }));
      } else {
        setError('Tactical Pass Verification Failed: Record not found in decentralized ledger.');
      }
    } catch (err) {
      console.error('Ticket verification error:', err);
    } finally {
      setVerifyingTicket(false);
    }
  };

  const linkAndSyncProfile = async (ticket: any, uid: string) => {
    try {
      // 1. Claim the ticket
      const claimRef = await import('firebase/data-connect').then(m => m.mutationRef<any, ClaimTicketVariables>(dataconnect, 'ClaimTicket', {
        id: ticket.id,
        userId: uid
      }));
      await executeMutation(claimRef);

      // 2. Sync Profile data from ticket
      const syncRef = await import('firebase/data-connect').then(m => m.mutationRef<any, UpsertUserProfileVariables>(dataconnect, 'UpsertUserProfile', {
        uid: uid,
        name: ticket.guestName,
        age: ticket.guestAge,
        idCardNumber: ticket.guestIdNumber,
        phone: ticket.guestMobile,
        email: ticket.guestEmail
      }));
      await executeMutation(syncRef);
      
      console.log('Tactical handshake complete: Ticket linked and profile synced.');
    } catch (err) {
      console.error('Handshake error:', err);
    }
  };
  
  // Registration Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    idCardNumber: '',
    phone: ''
  });

  // Redirect if authenticated
  useEffect(() => {
    if (!contextLoading && user) {
      // Check if we have a scanned ticket waiting to be claimed
      if (scannedTicket) {
        setVerifyingTicket(true);
        linkAndSyncProfile(scannedTicket, user.uid).finally(() => {
          setVerifyingTicket(false);
          router.push('/guest/dashboard');
        });
      } else {
        router.push('/guest/dashboard');
      }
    }
  }, [user, contextLoading, router, scannedTicket]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (!auth) throw new Error('Tactical Auth-Link is offline. System requires deployment configuration.');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Logic for profile check will happen in the context/useEffect
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth) throw new Error('Operation Failed: Local Auth node is offline.');
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        // Sign Up
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Save initial profile immediately
        const upsertRef = await import('firebase/data-connect').then(m => m.mutationRef(dataconnect, 'UpsertUserProfile', {
          uid: userCredential.user.uid,
          name: formData.name,
          age: parseInt(formData.age),
          idCardNumber: formData.idCardNumber,
          phone: formData.phone,
          email: formData.email
        }));
        await executeMutation(upsertRef);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#060d20] text-on-background font-body min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back button */}
      <button 
        onClick={() => router.push('/')} 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/5">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </div>
        Return to Portal
      </button>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-surface-container-low/60 backdrop-blur-3xl border border-outline-variant/10 p-8 rounded-3xl shadow-2xl">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_person
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              {mode === 'login' ? 'Tactical OS Login' : 'Create Operative Account'}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mt-2">
              Secure Multi-Factor Authentication
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/50 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-error text-lg">warning</span>
              <p className="text-xs text-error font-medium uppercase tracking-tight leading-tight">{error}</p>
            </div>
          )}

          {verifyingTicket && (
             <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
               <p className="text-[10px] uppercase tracking-widest font-black text-primary">Verifying Tactical Pass...</p>
             </div>
          )}

          {scannedTicket && (
            <div className="mb-8 p-6 bg-green-500/10 border-2 border-green-500/30 rounded-[2rem] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3">
                 <span className="material-symbols-outlined text-green-500 font-black animate-bounce">verified</span>
               </div>
               <div className="relative z-10">
                 <p className="text-[9px] uppercase tracking-[0.3em] font-black text-green-500 mb-2">Tactical Pass Verified</p>
                 <h3 className="font-headline text-lg font-black text-on-surface leading-tight mb-1">{scannedTicket.guestName}</h3>
                 <p className="text-[10px] font-bold text-on-surface-variant flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">event</span>
                   {scannedTicket.event?.title}
                 </p>
                 <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase opacity-40 font-black">Section</span>
                      <span className="text-xs font-black">{scannedTicket.section}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase opacity-40 font-black">Seat/Row</span>
                      <span className="text-xs font-black">{scannedTicket.row}{scannedTicket.seat}</span>
                    </div>
                 </div>
               </div>
            </div>
          )}

          <div className="space-y-6">
              {/* Login/Signup Tabs */}
              <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/10">
                <button onClick={() => setMode('login')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Login</button>
                <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'signup' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Sign Up</button>
              </div>

              {/* Social Login */}
              <button 
                onClick={handleGoogleAuth}
                className="w-full py-3 bg-white text-black font-bold text-[11px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 border border-outline-variant shadow-md hover:bg-neutral-100 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] bg-transparent px-4 text-on-surface-variant font-headline">Or use credentials</div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <InputField label="Email Address" type="email" icon="mail" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} required />
                <InputField label="Password" type="password" icon="lock" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} required />
                
                {mode === 'signup' && (
                  <>
                    <InputField label="Confirm Password" type="password" icon="lock_reset" value={formData.confirmPassword} onChange={(v: string) => setFormData({...formData, confirmPassword: v})} required />
                    <InputField label="Full Name" icon="person" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Age" type="number" icon="calendar_today" value={formData.age} onChange={(v: string) => setFormData({...formData, age: v})} required />
                      <InputField label="Phone" type="tel" icon="call" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} required />
                    </div>
                    <InputField label="ID Card Number" icon="fingerprint" value={formData.idCardNumber} onChange={(v: string) => setFormData({...formData, idCardNumber: v})} required placeholder="NAT-XXXXXXXX" />
                  </>
                )}

                <button disabled={loading} className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-widest text-[12px] shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4">
                  {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : mode === 'login' ? 'Initiate Link' : 'Register Identity'}
                </button>
              </form>
            </div>
          </div>
        
        <p className="text-center mt-8 text-[10px] uppercase font-bold tracking-widest opacity-40">
          Secure Tunnel Protocol &copy; 2026 Sentinel Dynamics
        </p>
        {/* Footer Actions */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em]">Have a physical pass?</p>
          <button 
            onClick={() => router.push('/guest/scan')}
            className="w-full bg-white/5 hover:bg-white/10 text-on-surface px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
            Scan Tactical Pass
          </button>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type?: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}

function InputField({ label, type = 'text', icon, value, onChange, required, placeholder }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">{icon}</span>
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full bg-surface-container/40 border border-outline-variant/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary/50 outline-none transition-all placeholder:text-on-surface-variant/30"
        />
      </div>
    </div>
  );
}
