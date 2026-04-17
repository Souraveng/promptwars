"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import TopAppBar from '@/components/shared/TopAppBar';
import BottomNavBar from '@/components/shared/BottomNavBar';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We don't want to redirect if they are already on the scan page
    if (pathname === '/guest/scan' || pathname === '/guest/login') {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/guest/scan');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading && pathname !== '/guest/scan' && pathname !== '/guest/login') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-label text-sm uppercase tracking-widest text-on-surface-variant">Securing Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-24 selection:bg-primary-container selection:text-primary">
      <TopAppBar />
      {children}
      <BottomNavBar />
    </div>
  );
}
