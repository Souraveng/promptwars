import React from 'react';
import SideNavBar from '@/components/admin/SideNavBar';
import TopNavBar from '@/components/admin/TopNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background text-on-background flex overflow-hidden selection:bg-primary-container selection:text-primary">
      {/* Sidebar — real flex child, not fixed, so it pushes content */}
      <SideNavBar />

      {/* Right side: header + scrollable content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
