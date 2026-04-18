"use client";
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin User';
  const email = user?.email || 'admin@sentinellens.io';
  const photoURL = user?.photoURL;
  const firstName = displayName.split(' ')[0] || displayName;
  const lastName = displayName.split(' ').slice(1).join(' ') || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <header>
        <h1 className="font-headline text-3xl font-bold text-primary">My Profile</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your account details and preferences.</p>
      </header>

      {/* Avatar + name */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-container border-2 border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-headline text-2xl font-bold text-primary">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-headline text-xl font-bold text-on-surface truncate">{displayName}</p>
          <p className="text-sm text-on-surface-variant truncate">{email}</p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Admin'}
          </span>
        </div>
        <button className="px-4 py-2 text-xs font-bold border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors shrink-0">
          Change Photo
        </button>
      </div>

      {/* Details form */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-5">
        <h2 className="font-headline text-base font-bold text-on-surface">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">First Name</label>
            <input defaultValue={firstName} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">Last Name</label>
            <input defaultValue={lastName} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">Email</label>
            <input defaultValue={email} readOnly className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant focus:outline-none transition-colors cursor-not-allowed opacity-70" />
          </div>
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">User ID</label>
            <input defaultValue={user?.uid || '—'} readOnly className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant focus:outline-none transition-colors cursor-not-allowed opacity-70 font-mono text-xs" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-secondary text-on-secondary-container' : 'bg-primary text-on-primary hover:bg-primary-fixed'}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Password — only show for email/password accounts */}
      {user?.providerData?.[0]?.providerId !== 'google.com' && (
        <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 flex flex-col gap-4">
          <h2 className="font-headline text-base font-bold text-on-surface">Change Password</h2>
          {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
            <div key={label}>
              <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">{label}</label>
              <input type="password" placeholder="••••••••" className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
          ))}
          <div className="flex justify-end">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-fixed transition-colors">Update Password</button>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-error-container/10 rounded-2xl p-6 border border-error/10 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-error">Delete Account</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Permanently remove your account and all data.</p>
        </div>
        <button className="px-4 py-2 text-xs font-bold border border-error/30 text-error rounded-xl hover:bg-error/10 transition-colors">Delete</button>
      </div>
    </div>
  );
}
