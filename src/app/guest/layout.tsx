"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import TopAppBar from '@/components/shared/TopAppBar';
import BottomNavBar from '@/components/shared/BottomNavBar';
import DesktopSideNav from '@/components/shared/DesktopSideNav';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/guest/scan' || pathname === '/guest/login') {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/guest/scan');
      else setLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);

  if (loading && pathname !== '/guest/scan' && pathname !== '/guest/login') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 font-label text-sm uppercase tracking-widest text-on-surface-variant">Securing Session...</p>
      </div>
    );
  }

  const tacticalRoutes = ['/guest/sos', '/guest/scan'];
  const isTactical = tacticalRoutes.some(r => pathname.startsWith(r));
  const hideTopBar = isTactical;

  if (isTactical) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSideNav />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — hidden on medical (has its own header) */}
        {!hideTopBar && <TopAppBar />}
        <main className="flex-1 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>
        {/* Bottom nav — mobile only */}
        <BottomNavBar />
      </div>
    </div>
  );
}
