import React, { memo } from 'react';
import { EmergencyEvent } from '@/types/dataconnect';

interface SignalStreamProps {
  signals: EmergencyEvent[];
  onSignalClick: (signal: EmergencyEvent) => void;
}

function EmergencyIcon({ type }: { type: string }) {
  const icon = type.includes('SOS') ? 'warning' : 'medical_services';
  return <span className="material-symbols-outlined text-sm">{icon}</span>;
}

const SignalItem = memo(({ signal, onClick }: { signal: EmergencyEvent, onClick: () => void }) => (
  <div 
    className="bg-surface-container-highest p-4 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group relative"
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 rounded-lg ${signal.priority === 'HIGH' ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'}`}>
        <EmergencyIcon type={signal.type} />
      </div>
      <span className="text-[9px] font-mono text-on-surface-variant">{new Date(signal.timestamp).toLocaleTimeString()}</span>
    </div>
    <h4 className="text-sm font-bold text-on-surface uppercase tracking-tight">{signal.type}</h4>
    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{signal.details}</p>
    <div className="mt-3 pt-3 border-t border-outline-variant/5 flex justify-between items-center">
      <div className="flex items-center gap-1 text-[9px] text-primary-fixed-dim font-bold">
        <span className="material-symbols-outlined text-[10px]">location_on</span>
        {signal.lat && signal.lng ? `${signal.lat.toFixed(4)}, ${signal.lng.toFixed(4)}` : 'NO_LOCATION'}
      </div>
      <button className="text-[10px] font-bold text-secondary hover:text-white transition-colors bg-secondary/5 px-2 py-0.5 rounded border border-secondary/10">ACKNOWLEDGE</button>
    </div>
  </div>
));

SignalItem.displayName = 'SignalItem';

const SignalStream = memo(({ signals, onSignalClick }: SignalStreamProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
      {signals.length === 0 ? (
        <div className="text-center py-16 opacity-30 select-none flex flex-col items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant">
            <path d="M1 6l5 5 4-4 4 4 5-5M1 12l5 5 4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm font-medium">Scanning for signals...</p>
        </div>
      ) : (
        signals.map((signal) => (
          <SignalItem 
            key={signal.id} 
            signal={signal} 
            onClick={() => onSignalClick(signal)} 
          />
        ))
      )}
    </div>
  );
});

SignalStream.displayName = 'SignalStream';
export default SignalStream;
