"use client";
import React, { useState } from 'react';
import SideNavBar from '@/components/admin/SideNavBar';
import TopNavBar from '@/components/admin/TopNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-on-background flex overflow-hidden selection:bg-primary-container selection:text-primary">
      <SideNavBar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavBar onMenuClick={() => setMobileOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto min-h-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
