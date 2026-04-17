"use client";
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function TicketManagementPage() {
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');

  const handleGenerateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Defaulting some payload values for demonstration
    const payload = {
      gate: "North Node",
      section: "VIP Deck",
      row: "A",
      seat: "1"
    };

    try {
      const res = await fetch('/api/admin/generate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      
      // We construct the full URL that the QR will encode
      const fullUrl = `${window.location.origin}${data.url}`;
      setGeneratedUrl(fullUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full h-full max-w-7xl mx-auto">
      {/* Header section */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary tracking-tight mb-1">Ticket Operations</h1>
          <p className="text-on-surface-variant text-sm font-body">Sector 4 Node / Active Event: Cyber-Symphony Beta</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low text-primary hover:bg-surface-container px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-outline-variant/10">
            <span className="material-symbols-outlined text-[18px]" data-icon="download">download</span>
            Export Matrix
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-12 gap-6 pb-12">
        {/* Left Column: Metrics & History */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hero Metric */}
            <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden group border border-outline-variant/10">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              <div className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-4">Ingress Throughput</div>
              <div className="flex items-end gap-4">
                <div className="font-headline text-[3.5rem] leading-none font-bold text-primary">84<span className="text-2xl text-on-surface-variant">%</span></div>
                <div className="pb-2 text-sm text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
                  +12%
                </div>
              </div>
              <div className="mt-4 flex h-2 rounded-full overflow-hidden bg-surface-container-lowest">
                <div className="w-[84%] bg-gradient-to-r from-secondary to-secondary-fixed"></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-on-surface-variant font-label border-t border-outline-variant/10 pt-2">
                <span>Scanned: 12,405</span>
                <span>Issued: 14,800</span>
              </div>
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-center border border-outline-variant/10">
                <div className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Active Gates</div>
                <div className="font-headline text-3xl font-bold text-inverse-surface">24<span className="text-xl text-outline">/30</span></div>
              </div>
              <div className="bg-error-container/10 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden border border-error/10">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-error"></div>
                <div className="text-[0.6875rem] uppercase tracking-widest font-bold text-error mb-1">Anomalies Detected</div>
                <div className="font-headline text-3xl font-bold text-error">3</div>
              </div>
            </div>
          </div>
          
          {/* Recent Batches List */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-lg border border-outline-variant/10">
            <h2 className="text-[0.6875rem] uppercase tracking-widest font-bold text-on-surface-variant mb-6">Recent Bulk Generations</h2>
            <div className="flex flex-col gap-2">
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-outline font-label uppercase tracking-wider">
                <div className="col-span-4">Batch ID / Event</div>
                <div className="col-span-3">Zone</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-3 text-right">Status</div>
              </div>
              
              {/* Data Rows */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors items-center border border-transparent hover:border-outline-variant/10">
                <div className="col-span-1 md:col-span-4">
                  <div className="font-bold text-sm text-inverse-surface font-headline tracking-wide">B-883A</div>
                  <div className="text-xs text-outline truncate">Cyber-Symphony Beta</div>
                </div>
                <div className="col-span-1 md:col-span-3 text-sm text-primary">Sector 7G</div>
                <div className="col-span-1 md:col-span-2 md:text-right font-headline text-sm">5,000</div>
                <div className="col-span-1 md:col-span-3 flex md:justify-end">
                  <div className="bg-secondary/10 text-secondary rounded flex items-center gap-2 px-2 py-1 text-[0.65rem] uppercase tracking-widest font-bold w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_var(--tw-colors-secondary)]"></span> Ready
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Right Column: Generation Toolkit */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 self-start">
          <div className="bg-surface-variant/40 backdrop-blur-xl border-t border-l border-outline-variant/20 rounded-2xl p-6 shadow-xl sticky top-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-2xl" data-icon="qr_code_scanner">qr_code_scanner</span>
              <h2 className="font-headline text-lg font-bold text-primary tracking-tight">Mint Guest Ticket</h2>
            </div>
            
            <form onSubmit={handleGenerateSingle} className="space-y-5">
              {/* Output Display */}
              {generatedUrl ? (
                <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col items-center justify-center border border-primary/30 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary animate-pulse"></div>
                   <div className="bg-white p-3 rounded-lg shadow-xl mb-4">
                     <QRCodeCanvas value={generatedUrl} size={150} level={"H"} />
                   </div>
                   <p className="text-secondary text-xs uppercase tracking-widest font-bold mt-2">Active Encrypted Token</p>
                   <button 
                    type="button" 
                    onClick={() => setGeneratedUrl('')} 
                    className="mt-4 text-xs text-outline underline hover:text-on-surface"
                   >
                     Clear and Generate Another
                   </button>
                </div>
              ) : (
                <>
                  <div className="group relative">
                    <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Target Event</label>
                    <div className="relative bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/20">
                      <select className="w-full bg-transparent border-none text-sm text-inverse-surface focus:ring-0 p-0 outline-none">
                        <option className="bg-surface text-on-surface">Cyber-Symphony Beta</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Zone Alloc.</label>
                      <div className="relative bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/20">
                        <select className="w-full bg-transparent border-none text-sm text-inverse-surface focus:ring-0 p-0 outline-none">
                          <option className="bg-surface text-on-surface">VIP Deck</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Gate Binding</label>
                      <div className="relative bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/20">
                        <select className="w-full bg-transparent border-none text-sm text-inverse-surface focus:ring-0 p-0 outline-none">
                          <option className="bg-surface text-on-surface">North Node</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <label className="text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Target Type</label>
                    <div className="relative bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/20">
                      <select className="w-full bg-transparent border-none text-sm text-inverse-surface focus:ring-0 p-0 outline-none">
                        <option className="bg-surface text-on-surface">Single Guest QR Login</option>
                        <option className="bg-surface text-on-surface" disabled>Bulk Generation Batch</option>
                      </select>
                    </div>
                  </div>

                  {error && <div className="text-red-400 text-xs font-['Inter'] mt-2">{error}</div>}
                  
                  <div className="pt-4 border-t border-surface-container-highest/50">
                    <button disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm py-4 px-4 rounded-xl shadow-[0_8px_16px_rgba(6,14,32,0.4)] disabled:opacity-50 hover:shadow-[0_12px_24px_rgba(6,14,32,0.6)] hover:contrast-125 transition-all duration-300 flex items-center justify-center gap-2" type="submit">
                      <span className="material-symbols-outlined text-[18px]" data-icon="memory">{loading ? 'sync' : 'qr_code_2'}</span>
                      {loading ? 'Minting Cryptographic Token...' : 'Generate Guest Ticket'}
                    </button>
                    <div className="text-center mt-3 text-[0.65rem] text-outline tracking-wider uppercase font-label">
                      Mints a live Custom Auth Token for Guest Login
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
