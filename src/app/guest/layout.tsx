import React from 'react';
import TopAppBar from '@/components/shared/TopAppBar';
import BottomNavBar from '@/components/shared/BottomNavBar';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-16 pb-24 selection:bg-primary-container selection:text-primary">
      <TopAppBar />
      {children}
      <BottomNavBar />
    </div>
  );
}
