'use client';

import React from 'react';

interface CanvasElement {
  id: string;
  type: 'zone' | 'polygon' | 'seat' | 'text' | 'image' | 'icon';
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  opacity: number;
  rotation: number;
  access?: 'public' | 'staff' | 'restricted' | 'vip';
  capacity?: number;
  points?: { x: number; y: number }[];
}

interface VenueSeatingChartProps {
  elements: CanvasElement[];
  ticketCounts: Record<string, number>; // New: [elementId: count]
  selectedId: string | null;
  onSelect: (el: CanvasElement) => void;
  isLoading?: boolean;
}

export default function VenueSeatingChart({ 
  elements, 
  ticketCounts, 
  selectedId, 
  onSelect,
  isLoading 
}: VenueSeatingChartProps) {
  
  if (isLoading) {
    return (
      <div className="w-full aspect-[16/9] bg-black/40 rounded-3xl flex items-center justify-center border border-outline-variant/10">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate bounding box to center the view
  const minX = Math.min(...elements.map(el => el.x), 0);
  const minY = Math.min(...elements.map(el => el.y), 0);
  const maxX = Math.max(...elements.map(el => el.x + (el.w || 0)), 100);
  const maxY = Math.max(...elements.map(el => el.y + (el.h || 0)), 100);
  
  const padding = 10;
  const viewWidth = maxX - minX + padding * 2;
  const viewHeight = maxY - minY + padding * 2;

  return (
    <div className="relative w-full aspect-[16/9] bg-[#07090c] rounded-3xl overflow-hidden border border-outline-variant/15 shadow-inner select-none">
      {/* Legend */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/5 shadow-2xl">
         <LegendItem color="#4EDEA3" label="Available" />
         <LegendItem color="#FF5252" label="Occupied" />
         <LegendItem color="#4D8EFF" label="Selected" />
      </div>

      <svg 
        viewBox={`${minX - padding} ${minY - padding} ${viewWidth} ${viewHeight}`}
        className="w-full h-full"
      >
        {elements.map((el) => {
          const isBookable = el.type === 'seat' || el.type === 'zone' || el.type === 'polygon';
          if (!isBookable) return null;

          const count = ticketCounts[el.id] || 0;
          const capacity = el.capacity || (el.type === 'seat' ? 1 : 100); // Default high for zones if not set
          const isBooked = count >= capacity;
          const isSelected = selectedId === el.id;
          
          // Selection logic: Booked is Red, Selected is Blue, else Green (if bookable)
          let displayColor = '#4EDEA3'; // Green
          if (isBooked) displayColor = '#FF5252'; // Red
          if (isSelected) displayColor = '#4D8EFF'; // Blue

          const opacity = isBooked ? 0.8 : (isSelected ? 0.9 : 0.6);

          return (
            <g 
              key={el.id} 
              onClick={() => !isBooked && onSelect(el)}
              className={`${isBooked ? 'cursor-not-allowed' : 'cursor-pointer'} transition-all duration-300 group`}
            >
              {el.type === 'polygon' && el.points ? (
                <polygon 
                  points={el.points.map(p => `${p.x + el.x},${p.y + el.y}`).join(' ')}
                  fill={displayColor}
                  fillOpacity={opacity}
                  stroke={displayColor}
                  strokeWidth="0.5"
                  className="group-hover:fill-opacity-100 transition-opacity"
                />
              ) : (
                <rect 
                  x={el.x} y={el.y} width={el.w} height={el.h}
                  fill={displayColor}
                  fillOpacity={opacity}
                  stroke={displayColor}
                  strokeWidth="0.5"
                  rx={el.type === 'seat' ? 0.5 : 1}
                  className="group-hover:fill-opacity-100 transition-opacity"
                />
              )}
              
              {/* Text Label */}
              <text 
                x={el.x + (el.w ? el.w/2 : 0)} 
                y={el.y + (el.h ? el.h/2 : 0)} 
                fill="white" 
                fontSize="2.5" 
                fontWeight="black"
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 drop-shadow-md tracking-tighter"
                style={{ fontSize: el.type === 'seat' ? '1.5px' : '2.5px' }}
              >
                {el.label}
              </text>

              {/* Status Indicator */}
              {isBooked && (
                <circle 
                  cx={el.x + (el.w || 0) - 2} 
                  cy={el.y + 2} 
                  r="1.5" 
                  fill="#FF5252" 
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[8px] font-black uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}
