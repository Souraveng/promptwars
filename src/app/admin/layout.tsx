"use client";
import React, { useState } from 'react';
import SideNavBar from '@/components/admin/SideNavBar';
import TopNavBar from '@/components/admin/TopNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background text-on-background flex flex-col overflow-hidden selection:bg-primary-container selection:text-primary">
      <SideNavBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <TopNavBar onMenuClick={() => setSidebarOpen(o => !o)} />

      <main className="flex-1 overflow-y-auto min-h-0 w-full">
        {children}
      </main>
    </div>
  );
}
