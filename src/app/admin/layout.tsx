import React from 'react';
import SideNavBar from '@/components/admin/SideNavBar';
import TopNavBar from '@/components/admin/TopNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-background flex overflow-hidden selection:bg-primary-container selection:text-primary">
      <SideNavBar />
      <TopNavBar />
      <div className="flex-1 pt-24 pb-8 px-6 md:pl-72 overflow-y-auto w-full h-screen">
        {children}
      </div>
    </div>
  );
}
