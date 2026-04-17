import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col antialiased selection:bg-secondary/30 selection:text-secondary-fixed">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b-0 transition-colors duration-300">
        <div className="flex justify-between items-center px-8 py-6 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" data-icon="radar" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
            <span className="text-2xl font-headline font-bold tracking-tighter text-slate-100 uppercase">Aether Venue OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-label text-sm uppercase tracking-[0.05em]">
            <span className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">Experience</span>
            <span className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">Safety</span>
            <span className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">Analytics</span>
            <span className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">Support</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/guest/dashboard" className="font-label text-sm uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors">
              Guest Access
            </Link>
            <Link href="/login" className="bg-primary text-on-primary font-label text-sm uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-primary-fixed transition-all shadow-lg hover:shadow-primary/20">
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow relative overflow-hidden bg-[size:40px_40px] bg-[linear-gradient(to_right,rgba(69,70,77,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,70,77,0.1)_1px,transparent_1px)]">
        {/* Hero Background Image/Gradient */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-center justify-center">
          <img 
            alt="Abstract 3D stadium visualization" 
            className="w-full h-full object-cover mix-blend-overlay" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-ubPjEUCY1AsOnN8vqiU9EmnqCn4lFbjZf5MXGAH5S5-UiB2FgW1eqbYXVZvXRhO5gIHVo5_s5vgSOK17Z9yWaZrUAfI1oePeYUX5rLIX5cBjA3OSCDrw97zfzdd38_nQ1eEZFGtmcJaHT_9OGGva7UYjLc3KRPb4KI8hym6GQfyytesc16xsrXqlWrs54k26S2xE4hH6J_BLdiFzR7xdIE2ou_A9hP7Exu8984LSDdjyUkkL15RYDJ9k4KzNXbfKnGl-DTWVcTxX"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 pt-48 pb-24 min-h-screen flex flex-col justify-center">
          {/* Hero Header */}
          <div className="max-w-4xl mb-16 text-left">
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6 bg-gradient-to-r from-primary to-inverse-primary bg-clip-text text-transparent">
              Intelligence Layer<br/>For Modern Venues
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl font-light leading-relaxed">
              Transform your physical space into a responsive, data-driven ecosystem. Monitor density, guide guests, and ensure safety in real-time.
            </p>
          </div>

          {/* Bento Layout for Portals */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
            {/* Guest Portal Card */}
            <Link href="/guest/dashboard" className="md:col-span-5 bg-[#2d3449]/60 backdrop-blur-[12px] border-t border-l border-[#45464d]/15 rounded-[2rem] p-10 flex flex-col justify-between group hover:bg-surface-variant/80 transition-all duration-300 shadow-[0_16px_32px_rgba(6,14,32,0.4)] cursor-pointer relative overflow-hidden min-h-[280px]">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all"></div>
              <div className="mb-8 flex items-center justify-between z-10">
                <span className="material-symbols-outlined text-4xl text-primary" data-icon="qr_code_scanner" style={{ fontVariationSettings: "'FILL' 0" }}>qr_code_scanner</span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </div>
              <div className="z-10">
                <h2 className="font-headline text-3xl font-bold mb-2 text-on-surface">Guest Portal</h2>
                <p className="text-on-surface-variant text-sm">Wayfinding, digital ticketing, and personalized event feeds.</p>
              </div>
            </Link>

            {/* Admin Terminal Card */}
            <Link href="/login" className="md:col-span-7 bg-[#2d3449]/60 backdrop-blur-[12px] border-t border-l border-[#45464d]/15 rounded-[2rem] p-10 flex flex-col justify-between group hover:bg-surface-variant/80 transition-all duration-300 shadow-[0_16px_32px_rgba(6,14,32,0.4)] cursor-pointer relative overflow-hidden min-h-[280px]">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
              <div className="mb-8 flex items-center justify-between z-10">
                <span className="material-symbols-outlined text-4xl text-secondary" data-icon="dashboard" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                <div className="flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="font-label text-xs uppercase tracking-widest text-secondary">System Online</span>
                  </div>
                </div>
              </div>
              <div className="z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="font-headline text-3xl font-bold mb-2 text-on-surface">Admin Terminal</h2>
                  <p className="text-on-surface-variant text-sm max-w-sm">Global oversight. Heatmaps, threat detection, and crowd flow analytics.</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </div>
            </Link>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 hover:bg-surface-container transition-colors flex items-start gap-4">
              <span className="material-symbols-outlined text-primary mt-1" data-icon="monitoring">monitoring</span>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">Live Monitoring</h3>
                <p className="text-on-surface-variant text-sm">Real-time density and flow tracking.</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 hover:bg-surface-container transition-colors flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary mt-1" data-icon="explore">explore</span>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">Smart Navigation</h3>
                <p className="text-on-surface-variant text-sm">Context-aware indoor wayfinding.</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 hover:bg-surface-container transition-colors flex items-start gap-4">
              <span className="material-symbols-outlined text-error mt-1" data-icon="emergency">emergency</span>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">Instant SOS</h3>
                <p className="text-on-surface-variant text-sm">Automated security dispatch protocols.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-slate-950 border-t border-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-screen-2xl mx-auto">
          <p className="font-body text-xs uppercase tracking-widest text-slate-400 mb-6 md:mb-0">
            © 2024 Sentinel Lens Intelligence. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-8 font-body text-xs uppercase tracking-widest">
            <span className="text-slate-500 hover:text-emerald-300 transition-colors ease-in-out duration-200 cursor-pointer">Privacy Policy</span>
            <span className="text-slate-500 hover:text-emerald-300 transition-colors ease-in-out duration-200 cursor-pointer">Terms of Service</span>
            <span className="text-slate-500 hover:text-emerald-300 transition-colors ease-in-out duration-200 cursor-pointer">Venue API</span>
            <span className="text-slate-500 hover:text-emerald-300 transition-colors ease-in-out duration-200 cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
