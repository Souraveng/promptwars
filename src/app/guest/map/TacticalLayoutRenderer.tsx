'use client';

import React, { useRef, useState, useEffect } from 'react';

interface LayoutElement {
  id: string;
  type: 'zone' | 'gate' | 'stall' | 'washroom' | 'polygon' | 'seat';
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
  rotation: number;
  capacity?: number;
}

interface Props {
  elements: LayoutElement[];
  highlightSeat?: string; // Seat label to highlight (e.g., '45F')
  highlightGate?: string;
  onElementClick?: (el: LayoutElement) => void;
}

export default function TacticalLayoutRenderer({ elements, highlightSeat, highlightGate, onElementClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Auto-center on highlighted seat if possible
  useEffect(() => {
    if (highlightSeat) {
      const seat = elements.find(e => e.type === 'seat' && e.label === highlightSeat);
      if (seat) {
        // Move offset to center this component
        setOffset({ x: -seat.x + 40, y: -seat.y + 40 });
        setZoom(2.5);
      }
    }
  }, [highlightSeat, elements]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - lastPos.current.x) / zoom;
    const dy = (e.clientY - lastPos.current.y) / zoom;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(1, Math.min(5, z * delta)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#0a0c10] overflow-hidden cursor-crosshair touch-none select-none rounded-3xl border border-white/5 shadow-2xl"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* HUD Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Transformation Container */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
        style={{ 
          transform: `scale(${zoom}) translate(${offset.x}%, ${offset.y}%)`,
          width: '100%',
          height: '100%'
        }}
      >
        {elements.map((el) => {
          const isHighlighted = (el.type === 'seat' && el.label === highlightSeat) || (el.type === 'gate' && el.label === highlightGate);
          
          return (
            <div
              key={el.id}
              onClick={() => onElementClick?.(el)}
              className={`absolute flex items-center justify-center border transition-all duration-500 rounded-lg pointer-events-auto
                ${isHighlighted ? 'ring-4 ring-primary shadow-[0_0_30px_rgba(59,130,246,0.8)] z-50' : 'z-10'}`}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                height: `${el.h}%`,
                backgroundColor: isHighlighted ? `${el.color}99` : `${el.color}33`,
                borderColor: isHighlighted ? '#fff' : `${el.color}66`,
                transform: `rotate(${el.rotation || 0}deg)`,
                opacity: el.opacity / 100
              }}
            >
              {el.type !== 'seat' && (
                <span className="text-[8px] font-bold uppercase tracking-tighter text-white/90 truncate px-1">
                  {el.label}
                </span>
              )}
              {el.type === 'seat' && isHighlighted && (
                <span className="material-symbols-outlined text-[12px] text-white animate-bounce" data-icon="person_pin">person_pin</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
        <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="w-8 h-8 rounded-lg bg-surface-container-high/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-on-surface">
          <span className="material-symbols-outlined text-sm">zoom_in</span>
        </button>
        <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="w-8 h-8 rounded-lg bg-surface-container-high/80 backdrop-blur-md flex items-center justify-center border border-white/10 text-on-surface">
          <span className="material-symbols-outlined text-sm">zoom_out</span>
        </button>
      </div>

      {/* Target Status HUD */}
      {highlightSeat && (
        <div className="absolute top-4 left-4 z-20 bg-primary/20 backdrop-blur-md px-3 py-2 rounded-xl border border-primary/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-primary-fixed uppercase tracking-widest">ASSIGNED_ZONE</span>
            <span className="text-xs font-bold text-white uppercase tracking-tight">{highlightSeat}</span>
          </div>
        </div>
      )}
    </div>
  );
}
