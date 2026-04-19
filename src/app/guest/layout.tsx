"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import TopAppBar from '@/components/shared/TopAppBar';
import BottomNavBar from '@/components/shared/BottomNavBar';
import DesktopSideNav from '@/components/shared/DesktopSideNav';
import { GuestProvider } from './GuestContext';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestProvider>
      <GuestLayoutContent>{children}</GuestLayoutContent>
    </GuestProvider>
  );
}

function GuestLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/guest/scan' || pathname === '/guest/login') {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check for scan/login to allow access to those pages without auth
      if (!user && pathname !== '/guest/scan' && pathname !== '/guest/login') {
        router.push('/guest/login'); // Redirect to login
      } else {
        setLoading(false);
      }
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

  if (isTactical) {
    return <div className="min-h-screen">{children}</div>;
  }

  const isGateway = pathname === '/guest/scan' || pathname === '/guest/login';

  return (
    <GuestProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden relative font-body text-on-background">
        {/* Only show DesktopSideNav if not in Scan/Login */}
        {!isGateway && <DesktopSideNav />}

        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Only show TopAppBar if not in Scan/Login */}
          {!isGateway && <TopAppBar />}
          
          <main className={`flex-1 overflow-y-auto overflow-x-hidden relative ${!isGateway ? 'pb-24' : ''} md:pb-0`}>
            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : children}
          </main>

          {/* Only show BottomNavBar if not in Scan/Login */}
          {!isGateway && <BottomNavBar />}
        </div>
      </div>
    </GuestProvider>
  );
}
