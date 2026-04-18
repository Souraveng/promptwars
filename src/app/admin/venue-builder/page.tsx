"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { dataconnect } from '@/lib/firebase-client';
import { executeMutation, executeQuery, mutationRef, queryRef } from 'firebase/data-connect';
import { ListVenueLayoutsData, VenueLayout } from '@/types/dataconnect';

type ElementType = 'zone' | 'gate' | 'stall' | 'washroom' | 'polygon' | 'seat';

interface CanvasElement {
  id: string;
  type: ElementType;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
  rotation: number; // degrees
  access: 'public' | 'restricted';
  capacity?: number;
  points?: { x: number; y: number }[]; // For polygons
  parentId?: string; // For grouping seats
}

const CFG: Record<ElementType, { icon: string; defaultLabel: string }> = {
  zone:     { icon: 'polyline',    defaultLabel: 'New Zone'  },
  gate:     { icon: 'gate',        defaultLabel: 'New Gate'  },
  stall:    { icon: 'storefront',  defaultLabel: 'New Stall' },
  washroom: { icon: 'wc',          defaultLabel: 'Washroom'  },
  polygon:  { icon: 'draw',        defaultLabel: 'Custom Zone' },
  seat:     { icon: 'chair',       defaultLabel: 'Seat' },
};

const COLORS = [
  '#4edea3', '#bcc7de', '#ffb2b7', '#ee3a5a',
  '#6fcfff', '#f9c74f', '#a78bfa', '#fb923c',
];

/* ── Add Element Modal ── */
function AddElementModal({ type, onConfirm, onClose }: {
  type: ElementType; onConfirm: (l: string) => void; onClose: () => void;
}) {
  const [label, setLabel] = useState(CFG[type].defaultLabel);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">{CFG[type].icon}</span>
          <h3 className="font-headline text-base font-bold text-on-surface capitalize">Add {type}</h3>
        </div>
        <div>
          <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">Label</label>
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (onConfirm(label), onClose())}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(label); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-fixed transition-colors">Add to Canvas</button>
        </div>
      </div>
    </div>
  );
}

/* ── Draggable + Resizable Element ── */
interface CanvasElProps {
  el: CanvasElement;
  selected: boolean;
  onUpdate: (id: string, patch: Partial<CanvasElement>) => void;
  onSelect: () => void;
  onDelete: (id: string) => void;
  isEraserMode?: boolean;
  eraserType?: 'point' | 'brush';
  isPointerDown?: boolean;
  recordAction: () => void;
}

const CanvasEl: React.FC<CanvasElProps> = ({ el, selected, onUpdate, onSelect, onDelete, isEraserMode, eraserType, isPointerDown, recordAction }) => {
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLElement | null>(null);
  const dragStart = useRef<{ px: number; py: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ px: number; py: number; ew: number; eh: number; corner: string } | null>(null);
  const rotateStart = useRef<{ cx: number; cy: number; startAngle: number } | null>(null);

  const getCanvas = (el: HTMLElement) => {
    let node: HTMLElement | null = el.parentElement;
    while (node && !node.dataset.canvas) node = node.parentElement;
    return node;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEraserMode) {
      onDelete(el.id);
    } else {
      onSelect();
    }
  };
  
  const handlePointerEnter = (e: React.PointerEvent) => {
    if (isEraserMode && eraserType === 'brush' && isPointerDown) {
      onDelete(el.id);
    }
  };

  /* drag */
  const onDragDown = useCallback((e: React.PointerEvent) => {
    if (isEraserMode) return;
    e.stopPropagation();
    recordAction();
    onSelect();
    canvasRef.current = getCanvas(e.currentTarget as HTMLElement);
    dragStart.current = { px: e.clientX, py: e.clientY, ex: el.x, ey: el.y };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [el.x, el.y, onSelect, isEraserMode]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current || !canvasRef.current || isEraserMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.py) / rect.height) * 100;
    onUpdate(el.id, {
      x: Math.max(0, Math.min(100 - el.w, dragStart.current.ex + dx)),
      y: Math.max(0, Math.min(100 - el.h, dragStart.current.ey + dy)),
    });
  }, [el.id, el.w, el.h, onUpdate, isEraserMode]);

  const onDragUp = useCallback(() => { dragStart.current = null; setIsDragging(false); }, []);

  /* resize */
  const onResizeDown = useCallback((e: React.PointerEvent, corner: string) => {
    e.stopPropagation();
    recordAction();
    canvasRef.current = getCanvas(e.currentTarget as HTMLElement);
    resizeStart.current = { px: e.clientX, py: e.clientY, ew: el.w, eh: el.h, corner };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [el.w, el.h]);

  const onResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeStart.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - resizeStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - resizeStart.current.py) / rect.height) * 100;
    const { corner, ew, eh } = resizeStart.current;
    onUpdate(el.id, {
      w: Math.max(5, corner.includes('e') ? ew + dx : ew - dx),
      h: Math.max(4, corner.includes('s') ? eh + dy : eh - dy),
    });
  }, [el.id, onUpdate]);

  const onResizeUp = useCallback(() => { resizeStart.current = null; }, []);

  /* rotate */
  const onRotateDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    recordAction();
    const rect = (e.currentTarget as HTMLElement).closest('[data-element]')!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotateStart.current = { cx, cy, startAngle: startAngle - (el.rotation ?? 0) };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [el.rotation]);

  const onRotateMove = useCallback((e: React.PointerEvent) => {
    if (!rotateStart.current) return;
    const { cx, cy, startAngle } = rotateStart.current;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    onUpdate(el.id, { rotation: Math.round(angle - startAngle) });
  }, [el.id, onUpdate]);

  const onRotateUp = useCallback(() => { rotateStart.current = null; }, []);

  const handleStyle = 'absolute w-3 h-3 bg-primary border-2 border-[#0b1326] rounded-sm cursor-nwse-resize z-30';

  return (
    <div
      data-element={el.id}
      className={`absolute select-none ${selected ? 'z-20' : 'z-10'} ${isEraserMode ? 'cursor-not-allowed' : ''}`}
      style={{
        left: `${el.x}%`, top: `${el.y}%`,
        width: `${el.w}%`, height: `${el.h}%`,
        opacity: el.opacity / 100,
        transform: `rotate(${el.rotation ?? 0}deg)`,
        transformOrigin: 'center center',
      }}
      onPointerEnter={handlePointerEnter}
      onClick={handleClick}
      onPointerDown={onDragDown}
      onPointerMove={e => { onDragMove(e); onResizeMove(e); onRotateMove(e); }}
      onPointerUp={() => { onDragUp(); onResizeUp(); onRotateUp(); }}
    >
      {/* Body */}
      <div
        className={`w-full h-full rounded-xl flex items-center justify-center transition-all overflow-hidden ${isEraserMode ? 'hover:scale-95 hover:bg-error/20' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
          backgroundColor: el.type === 'polygon' ? 'transparent' : (el.color + '22'),
          border: el.type === 'polygon' ? 'none' : (`2px solid ${isEraserMode ? '#ff4d4d' : (selected ? '#bcc7de' : el.color)}`),
          boxShadow: (selected && el.type !== 'polygon') ? `0 0 16px ${el.color}66` : 'none',
        }}
      >
        {el.type === 'polygon' && el.points && (
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points={el.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill={el.color + (isEraserMode ? '66' : '44')}
              stroke={isEraserMode ? '#ff4d4d' : (selected ? '#bcc7de' : el.color)}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
        {el.type === 'seat' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[60%] h-[60%] rounded-[2px] border border-current opacity-40 mix-blend-screen" style={{ color: el.color }} />
          </div>
        )}
        <span className="relative z-10 text-[8px] font-headline uppercase font-bold tracking-tighter text-center px-1 break-words pointer-events-none"
          style={{ color: el.color }}>
          {el.type !== 'seat' && el.label}
          {(el.capacity && el.type !== 'seat') && <div className="text-[6px] opacity-70">CAP: {el.capacity}</div>}
        </span>
      </div>

      {/* Control points - Hidden in eraser mode */}
      {selected && !isEraserMode && (
        <>
          {/* Delete shortcut */}
          <button
            className="absolute -top-5 -right-5 w-6 h-6 bg-error rounded-full flex items-center justify-center z-40 shadow-2xl border-2 border-white/20 hover:scale-110 active:scale-90 transition-all"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(el.id); }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>close</span>
          </button>

          {/* Rotate handle — top center */}
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 cursor-grab z-30"
            onPointerDown={onRotateDown}
          >
            <div className="w-px h-4 bg-primary/60" />
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-fixed transition-colors">
              <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '14px' }}>rotate_right</span>
            </div>
          </div>
          <div className={`${handleStyle} -top-1.5 -left-1.5`} onPointerDown={e => onResizeDown(e, 'nw')} />
          <div className={`${handleStyle} -top-1.5 -right-1.5`} onPointerDown={e => onResizeDown(e, 'ne')} />
          <div className={`${handleStyle} -bottom-1.5 -left-1.5`} onPointerDown={e => onResizeDown(e, 'sw')} />
          <div className={`${handleStyle} -bottom-1.5 -right-1.5`} onPointerDown={e => onResizeDown(e, 'se')} />
        </>
      )}
    </div>
  );
}

/* ── Download Modal ── */
function DownloadModal({ elements, mapSrc, canvasRef, onClose }: {
  elements: CanvasElement[];
  mapSrc: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ elements, mapSrc }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'venue-layout.json'; a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const downloadPNG = async () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#0b1326', scale: 2, useCORS: true });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a'); a.href = url; a.download = 'venue-layout.png'; a.click();
    } catch {
      alert('PNG export failed. Try JSON instead.');
    }
    setDownloading(false);
    onClose();
  };

  const downloadSVG = () => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '800'); svg.setAttribute('height', '500');
    svg.setAttribute('xmlns', svgNS);
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', '800'); bg.setAttribute('height', '500'); bg.setAttribute('fill', '#0b1326');
    svg.appendChild(bg);
    elements.forEach(el => {
      const g = document.createElementNS(svgNS, 'g');
      const cx = (el.x / 100) * 800 + (el.w / 100) * 800 / 2;
      const cy = (el.y / 100) * 500 + (el.h / 100) * 500 / 2;
      g.setAttribute('transform', `rotate(${el.rotation ?? 0}, ${cx}, ${cy})`);
      g.setAttribute('opacity', String(el.opacity / 100));
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', String((el.x / 100) * 800));
      rect.setAttribute('y', String((el.y / 100) * 500));
      rect.setAttribute('width', String((el.w / 100) * 800));
      rect.setAttribute('height', String((el.h / 100) * 500));
      rect.setAttribute('rx', '8');
      rect.setAttribute('fill', el.color + '33');
      rect.setAttribute('stroke', el.color);
      rect.setAttribute('stroke-width', '2');
      g.appendChild(rect);
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', String(cx));
      text.setAttribute('y', String(cy));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', el.color);
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'bold');
      text.textContent = el.label.toUpperCase();
      g.appendChild(text);
      svg.appendChild(g);
    });
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'venue-layout.svg'; a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const formats = [
    { label: 'PNG Image', desc: 'High-res raster export', icon: 'image', action: downloadPNG, color: 'text-secondary' },
    { label: 'SVG Vector', desc: 'Scalable vector format', icon: 'polyline', action: downloadSVG, color: 'text-primary' },
    { label: 'JSON Data', desc: 'Re-importable layout file', icon: 'data_object', action: downloadJSON, color: 'text-tertiary' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-base font-bold text-on-surface">Download Layout</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface bg-surface-container rounded-full p-1 border border-outline-variant/20">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <p className="text-xs text-on-surface-variant">Choose your export format:</p>
        <div className="flex flex-col gap-2">
          {formats.map(({ label, desc, icon, action, color }) => (
            <button key={label} onClick={action} disabled={downloading}
              className="flex items-center gap-4 p-4 bg-surface-container rounded-xl hover:bg-surface-container-high border border-outline-variant/10 hover:border-outline-variant/30 transition-all text-left disabled:opacity-50">
              <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
              <div>
                <p className="text-sm font-bold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant">{desc}</p>
              </div>
              {downloading && label === 'PNG Image' && <span className="material-symbols-outlined text-sm animate-spin ml-auto text-secondary">sync</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function VenueBuilderPage() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [addModal, setAddModal] = useState<ElementType | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [zoom, setZoom] = useState(1);
  const [downloadModal, setDownloadModal] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [activePoints, setActivePoints] = useState<{ x: number, y: number }[]>([]);
  const [savedLayouts, setSavedLayouts] = useState<VenueLayout[]>([]);
  const [showLoadList, setShowLoadList] = useState(false);
  const [layoutName, setLayoutName] = useState('New Stadium Layout');
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gridModal, setGridModal] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReferenceImage, setAiReferenceImage] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // Undo/Redo & Eraser State
  const [undoStack, setUndoStack] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);
  const [eraserType, setEraserType] = useState<'point' | 'brush'>('point');
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [showEraserMenu, setShowEraserMenu] = useState(false);

  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = 'venue-builder-layout';

  const [elements, setElements] = useState<CanvasElement[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved).elements;
      } catch {}
    }
    return [
      { id: '1', type: 'zone',     label: 'Main Stage',    x: 25, y: 15, w: 22, h: 20, color: '#4edea3', opacity: 100, rotation: 0, access: 'public', capacity: 0 },
      { id: '2', type: 'washroom', label: 'Washroom',      x: 60, y: 50, w: 10, h: 12, color: '#bcc7de', opacity: 100, rotation: 0, access: 'public', capacity: 0 },
      { id: '3', type: 'zone',     label: 'VIP Section A', x: 8,  y: 65, w: 18, h: 18, color: '#4edea3', opacity: 80,  rotation: 0, access: 'restricted', capacity: 50 },
    ];
  });

  const [mapSrc, setMapSrc] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved).mapSrc;
      } catch {}
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhmrsrH6KDg6rtnaFUY3beL1F8HN4FGonEoX7hAE-YFg82LrRwSGp8Nzh8SjpGAh3B0fArDNOh6-Ea5qpiToQ1FEn_W8U5Zk9iRpi6qc3BJy9aoR1ZDnNTB64VGeo1_e67Nu2lRW5q77lzIeTlxPrq4LezeWjIlwzatHixzF7L4XVOUUu0DNKRn0hISA33oxDDbhJrAkJTKwZ4R95P8ymuBjl_wsklWRCDN_e8mIsub_qnXdDWIiJwYVs_MNqcBSztkzlTXloNph2v';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLayouts = async () => {
    try {
      const qRef = queryRef<ListVenueLayoutsData, {}>(dataconnect, 'ListVenueLayouts', {});
      const result = await executeQuery(qRef);
      if (result.data?.venueLayouts) setSavedLayouts(result.data.venueLayouts);
    } catch (err) {
      console.error('Failed to fetch layouts:', err);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const handleCloudSave = async () => {
    setSaveStatus('saving');
    try {
      const mRef = mutationRef(dataconnect, 'CreateVenueLayout', {
        name: layoutName,
        elements: JSON.stringify(elements)
      });
      await executeMutation(mRef);
      setSaveStatus('saved');
      window.dispatchEvent(new CustomEvent('venue-layout-saved'));
      setTimeout(() => setSaveStatus('idle'), 2000);
      fetchLayouts();
    } catch (err) {
      console.error('Failed to save layout:', err);
      setSaveStatus('idle');
    }
  };

  const recordAction = useCallback((customElements?: CanvasElement[]) => {
    setUndoStack(prev => [...prev.slice(-49), customElements || elements]);
    setRedoStack([]);
  }, [elements]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, elements]);
    setUndoStack(u => u.slice(0, -1));
    setElements(prev);
  }, [undoStack, elements]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, elements]);
    setRedoStack(r => r.slice(0, -1));
    setElements(next);
  }, [redoStack, elements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    const handleUp = () => setIsPointerDown(false);
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, []);

  const loadLayout = (layout: VenueLayout) => {
    try {
      setElements(JSON.parse(layout.elements));
      setLayoutName(layout.name);
      setShowLoadList(false);
    } catch (err) {
      console.error('Failed to parse layout:', err);
    }
  };


  const generateSeatGrid = (rows: number, cols: number, spacing: number) => {
    const startX = 25;
    const startY = 25;
    const seatSize = 2.5; // % of canvas
    const newSeats: CanvasElement[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newSeats.push({
          id: `seat-${Date.now()}-${r}-${c}`,
          type: 'seat',
          label: `${String.fromCharCode(65 + r)}${c + 1}`,
          x: startX + c * (seatSize + spacing),
          y: startY + r * (seatSize + spacing),
          w: seatSize,
          h: seatSize,
          color: '#4edea3',
          opacity: 100,
          rotation: 0,
          access: 'public',
        });
      }
    }
    recordAction();
    setElements(prev => [...prev, ...newSeats]);
    setGridModal(false);
  };

  const handleZoom = (dir: 'in' | 'out' | 'reset') => {
    setZoom(z => dir === 'reset' ? 1 : dir === 'in' ? Math.min(2, z + 0.15) : Math.max(0.4, z - 0.15));
  };

  const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMapSrc(URL.createObjectURL(file));
  };

  const handleAddElement = (type: ElementType, label: string) => {
    // Generate ID at the very start to ensure it is always defined
    const newId = Date.now().toString();

    if (type === 'polygon') {
      setIsDrawingPolygon(true);
      setActivePoints([]);
      setAddModal(null);
      return;
    }

    recordAction();
    setElements(prev => [...prev, {
      id: newId, 
      type, 
      label,
      x: 20 + Math.random() * 30, y: 20 + Math.random() * 30,
      w: 18, h: 16,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 100, rotation: 0, access: 'public',
      capacity: 100,
    }]);
    setSelectedId(newId);
  };

  const finalizePolygon = (label: string = 'Custom Zone') => {
    if (activePoints.length < 3) return;
    const id = Date.now().toString();
    // Calculate bounding box for the polygon
    const minX = Math.min(...activePoints.map(p => p.x));
    const minY = Math.min(...activePoints.map(p => p.y));
    const maxX = Math.max(...activePoints.map(p => p.x));
    const maxY = Math.max(...activePoints.map(p => p.y));
    
    // Normalize points to be relative to the bounding box [0, 100]
    const normalizedPoints = activePoints.map(p => ({
      x: ((p.x - minX) / (maxX - minX)) * 100,
      y: ((p.y - minY) / (maxY - minY)) * 100
    }));

    recordAction();
    setElements(prev => [...prev, {
      id, type: 'polygon', label,
      x: minX, y: minY, w: maxX - minX, h: maxY - minY,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 100, rotation: 0, access: 'public',
      capacity: 100,
      points: normalizedPoints
    }]);
    setSelectedId(id);
    setIsDrawingPolygon(false);
    setActivePoints([]);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isDrawingPolygon) {
      if (!(e.target as HTMLElement).closest('[data-element]')) setSelectedId(null);
      return;
    }
    const rect = canvasWrapRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActivePoints(prev => [...prev, { x, y }]);
  };

  const applyRadialLayout = () => {
    if (elements.length < 2) return;
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    const startAngle = -120 * (Math.PI / 180);
    const endAngle = -60 * (Math.PI / 180);
    const arcLength = endAngle - startAngle;

    recordAction();
    setElements(prev => prev.map((el, i) => {
      const angle = startAngle + (i / (prev.length - 1)) * arcLength;
      return {
        ...el,
        x: centerX + Math.cos(angle) * radius - el.w / 2,
        y: centerY + Math.sin(angle) * radius - el.h / 2,
        rotation: (angle * 180 / Math.PI) + 90
      };
    }));
  };

  const handleAIArchitect = async (mode: 'merge' | 'replace') => {
    if (!aiPrompt.trim()) return;
    setIsAiProcessing(true);
    
    try {
      // 1. Capture visual context
      const screenshot = await getCanvasSnapshot();
      if (!screenshot) return;

      // 2. Prepare prompt
      const systemPrompt = `You are a professional venue layout architect. 
      Analyze the provided visual context (canvas snapshot AND user reference image if present) and generate a JSON array of elements.
      Current Elements: ${JSON.stringify(elements)}
      User Request: ${aiPrompt}
      
      Output ONLY a JSON array of CanvasElement objects.`;

      const parts: any[] = [
        { text: systemPrompt },
        { inline_data: { mime_type: "image/jpeg", data: screenshot.split(',')[1] } }
      ];

      if (aiReferenceImage) {
        const isPdf = aiReferenceImage.startsWith('data:application/pdf');
        parts.push({ 
          inline_data: { 
            mime_type: isPdf ? "application/pdf" : "image/jpeg", 
            data: aiReferenceImage.split(',')[1] 
          } 
        });
      }

      // 3. Call Gemini
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await response.json();
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const newElements = JSON.parse(aiResponseText);

      if (Array.isArray(newElements)) {
        if (mode === 'replace') {
          recordAction();
          setElements(newElements);
        } else {
          recordAction();
          setElements(prev => [...prev, ...newElements]);
        }
        setAiPrompt('');
        setAiPanelOpen(false);
      }
    } catch (err) {
      console.error('AI Architect failed:', err);
      alert('AI generation failed. Please check your console or API key.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAIEnhancement = async () => {
    if (elements.length === 0) return;
    setIsAiProcessing(true);
    try {
      // 1. Snapshot
      const screenshot = await getCanvasSnapshot();
      if (!screenshot) return;

      // 2. Prepare prompt specifically for Enhancement
      const systemPrompt = `You are a Venue Layout Optimizer. 
      Analyze the current layout image and elements. 
      Identify misalignments, overlapping zones, or poorly distributed seats.
      Improve the layout by:
      - Straightening rows and columns of seats.
      - Fixing overlapping zones.
      - Ensuring clear paths/aisles.
      - Optimizing the placement for best venue capacity and flow.
      
      Current Elements: ${JSON.stringify(elements)}
      
      Output ONLY a JSON array of refined CanvasElement objects. 
      Keep the IDs same if possible, or generate new ones if needed.`;

      // 3. AI Call
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { inline_data: { mime_type: "image/jpeg", data: screenshot.split(',')[1] } }
            ]
          }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      const data = await resp.json();
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const refinedElements = JSON.parse(aiResponseText);

      if (Array.isArray(refinedElements)) {
        recordAction();
        setElements(refinedElements);
      }
    } catch (err) {
      console.error('Enhancement failed:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const getCanvasSnapshot = async () => {
    if (!canvasWrapRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(canvasWrapRef.current, { 
      backgroundColor: '#0a0c10', 
      scale: 0.5,
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        // Inject a style tag to override all modern CSS color functions that html2canvas fails to parse
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * { 
            background-color: transparent !important; 
            color: #ffffff !important; 
            border-color: rgba(255,255,255,0.2) !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          [data-element] {
            background-color: #1a1a1a !important;
            border: 1px solid #444 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    return canvas.toDataURL('image/jpeg', 0.6);
  };

  const handleUpdate = useCallback((id: string, patch: Partial<CanvasElement>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const handleDelete = useCallback((id: string) => {
    recordAction();
    setElements(prev => prev.filter(e => e.id !== id));
    setSelectedId(null);
  }, [recordAction]);

  const selectedEl = elements.find(e => e.id === selectedId) ?? null;

  return (
    <>
      {addModal && <AddElementModal type={addModal} onConfirm={l => handleAddElement(addModal, l)} onClose={() => setAddModal(null)} />}
      {downloadModal && <DownloadModal elements={elements} mapSrc={mapSrc} canvasRef={canvasWrapRef} onClose={() => setDownloadModal(false)} />}
      <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg" className="hidden" onChange={handleImportMap} />

      <div className="flex bg-surface-container-lowest h-full relative">
        <main className="flex-1 flex flex-col relative bg-surface-container-lowest min-w-0">

          <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 bg-surface-container/30 backdrop-blur-md border-b border-outline-variant/10 gap-2 transition-all duration-300 relative z-50 ${!sidebarOpen ? 'translate-y-[-100%] opacity-0 h-0 p-0 overflow-hidden' : ''}`}>
            <div className="flex items-center gap-1 flex-wrap">
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-primary hover:bg-surface-container rounded-lg flex items-center gap-1.5 px-2 transition-all">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span className="text-xs font-medium">Map</span>
                </button>
              </div>
              <div className="h-6 w-px bg-outline-variant/20 mx-1 hidden sm:block" />
              <input 
                value={layoutName} 
                onChange={e => setLayoutName(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-on-surface focus:ring-0 w-32"
                placeholder="Layout Name"
              />
              <div className="h-6 w-px bg-outline-variant/20 mx-1 hidden sm:block" />
              <div className="flex gap-1 flex-wrap">
                {(['zone', 'polygon', 'gate', 'stall', 'washroom'] as ElementType[]).map(type => (
                  <button key={type} onClick={() => setAddModal(type)} className={`p-1.5 rounded-xl transition-all flex items-center gap-1.5 px-2 ${isDrawingPolygon && type === 'polygon' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/10'}`}>
                    <span className="material-symbols-outlined text-sm">{CFG[type].icon}</span>
                    <span className="text-xs font-medium capitalize hidden sm:inline">{type === 'polygon' ? 'Draw' : `Add ${type}`}</span>
                  </button>
                ))}
                <button onClick={() => setGridModal(true)} className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                  <span className="material-symbols-outlined text-sm">grid_view</span>
                  <span className="text-xs font-medium hidden sm:inline">Seat Grid</span>
                </button>
                <div className="relative flex items-center">
                  <button 
                    onClick={() => setIsEraserMode(!isEraserMode)} 
                    onContextMenu={(e) => { e.preventDefault(); setShowEraserMenu(!showEraserMenu); }}
                    className={`p-1.5 rounded-xl transition-all flex items-center gap-1.5 px-2 ${isEraserMode ? 'bg-error text-on-error' : 'text-on-surface-variant hover:text-error hover:bg-error/10'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{eraserType === 'brush' ? 'brush' : 'ink_eraser'}</span>
                    <span className="text-xs font-medium hidden sm:inline">Eraser</span>
                    <span className="material-symbols-outlined text-[10px] opacity-50" onClick={(e) => { e.stopPropagation(); setShowEraserMenu(!showEraserMenu); }}>{showEraserMenu ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {showEraserMenu && (
                    <div className="absolute top-10 left-0 w-32 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl z-[60] overflow-hidden py-1">
                      <button onClick={() => { setEraserType('point'); setShowEraserMenu(false); setIsEraserMode(true); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-surface-container transition-colors flex items-center gap-2 ${eraserType === 'point' ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-xs">ink_eraser</span> Point
                      </button>
                      <button onClick={() => { setEraserType('brush'); setShowEraserMenu(false); setIsEraserMode(true); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-surface-container transition-colors flex items-center gap-2 ${eraserType === 'brush' ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-xs">brush</span> Brush/Drag
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-6 w-px bg-outline-variant/20 mx-1 hidden sm:block" />
              <div className="flex bg-surface-container-low p-1 rounded-xl gap-0.5">
                <button 
                  disabled={undoStack.length === 0}
                  onClick={undo}
                  className="p-1.5 text-on-surface-variant hover:text-primary disabled:opacity-30 rounded-lg flex items-center transition-all"
                  title="Undo (Ctrl+Z)"
                >
                  <span className="material-symbols-outlined text-sm">undo</span>
                </button>
                <button 
                  disabled={redoStack.length === 0}
                  onClick={redo}
                  className="p-1.5 text-on-surface-variant hover:text-primary disabled:opacity-30 rounded-lg flex items-center transition-all"
                  title="Redo (Ctrl+Y)"
                >
                  <span className="material-symbols-outlined text-sm">redo</span>
                </button>
              </div>
              <div className="h-6 w-px bg-outline-variant/20 mx-1 hidden sm:block" />
              <button onClick={applyRadialLayout} className="p-1.5 text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2" title="Distribute selected elements in an arc">
                <span className="material-symbols-outlined text-sm">hdr_strong</span>
                <span className="text-xs font-medium hidden sm:inline">Radial</span>
              </button>
            </div>

            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 px-3 bg-surface-container-high border border-outline-variant/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all flex items-center gap-2 z-50">
              <span className="material-symbols-outlined text-sm">{sidebarOpen ? 'visibility_off' : 'visibility'}</span>
              {!sidebarOpen ? 'Show UI' : 'Hide UI'}
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button onClick={() => setShowLoadList(!showLoadList)}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">folder_open</span>
                  Open
                </button>
                {showLoadList && (
                  <div className="absolute top-10 right-0 w-48 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl z-[60] overflow-hidden py-2">
                    {savedLayouts.length === 0 ? (
                      <p className="px-4 py-2 text-[10px] text-on-surface-variant">No saved layouts</p>
                    ) : savedLayouts.map(l => (
                      <button key={l.id} onClick={() => loadLayout(l)} className="w-full text-left px-4 py-2 text-xs hover:bg-surface-container transition-colors truncate">
                        {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleCloudSave}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border flex items-center gap-1.5
                  ${saveStatus === 'saved' ? 'bg-secondary/10 text-secondary border-secondary/30'
                  : saveStatus === 'saving' ? 'bg-primary/10 text-primary border-primary/20 opacity-70'
                  : 'text-primary border-primary/20 hover:bg-primary/5'}`}>
                {saveStatus === 'saving' && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Cloud Save'}
              </button>
            </div>
          </div>

          {/* Floating UI Restore Button */}
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="fixed top-4 right-4 z-[100] w-12 h-12 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-fade-in"
              title="Restore UI"
            >
              <span className="material-symbols-outlined">visibility</span>
            </button>
          )}

          {/* Canvas */}
          <div
            className={`flex-1 relative overflow-hidden flex items-center justify-center bg-[#0a0c10] ${isDrawingPolygon ? 'cursor-crosshair' : ''}`}
            onPointerDown={(e) => {
              if (isEraserMode && eraserType === 'brush') {
                recordAction();
                setIsPointerDown(true);
              }
            }}
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(188,199,222,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(188,199,222,0.05) 1px, transparent 1px),
                radial-gradient(circle at center, rgba(78,222,163,0.03) 0%, transparent 70%)
              `,
              backgroundSize: '40px 40px, 40px 40px, 100% 100%'
            }}
            onClick={handleCanvasClick}
          >
            <div className="relative w-full h-full max-w-[1000px] max-h-[600px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10 bg-black/40 backdrop-blur-sm"
              data-canvas="true"
              ref={canvasWrapRef}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
            >
              {/* Drawing Preview */}
              {isDrawingPolygon && activePoints.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    points={activePoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#4edea3"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {activePoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="#4edea3" />
                  ))}
                </svg>
              )}

              {elements.map(el => (
                <CanvasEl key={el.id} el={el} selected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isEraserMode={isEraserMode}
                  eraserType={eraserType}
                  isPointerDown={isPointerDown}
                  recordAction={recordAction}
                />
              ))}
            </div>

            {/* Layers Panel */}
            <div className="hidden md:flex absolute left-4 bottom-4 flex-col gap-2 z-10 w-52">
              <button onClick={() => setLayersOpen(o => !o)} className="self-start flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-variant/70 backdrop-blur-xl border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors shadow-lg">
                <span className="material-symbols-outlined text-sm">layers</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Layers</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-300" style={{ transform: layersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_less</span>
              </button>
              <div className="flex flex-col gap-2 overflow-hidden transition-all duration-300" style={{ maxHeight: layersOpen ? '300px' : '0px', opacity: layersOpen ? 1 : 0 }}>
                <div className="bg-surface-variant/60 backdrop-blur-xl border border-outline-variant/20 p-3 rounded-2xl shadow-2xl space-y-1">
                  {elements.map(el => (
                    <div key={el.id} onClick={() => setSelectedId(el.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedId === el.id ? 'bg-surface-container' : 'hover:bg-surface-container/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm" style={{ color: el.color }}>{CFG[el.type].icon}</span>
                        <span className="text-xs font-medium truncate max-w-[100px]">{el.label}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: el.color }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-2">
              <button onClick={() => handleZoom('in')} className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" title="Zoom In">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button onClick={() => handleZoom('out')} className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" title="Zoom Out">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <button onClick={() => handleZoom('reset')} className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" title="Reset Zoom">
                <span className="material-symbols-outlined">center_focus_strong</span>
              </button>
              <div className="text-[9px] text-on-surface-variant text-center font-bold">{Math.round(zoom * 100)}%</div>
            </div>
          </div>
        </main>

        {/* Property Inspector / AI Architect Sidebar */}
        <aside className={`${(selectedId || aiPanelOpen) ? 'flex' : 'hidden xl:flex'} w-80 bg-surface-variant/30 backdrop-blur-xl z-40 flex-col border-l border-outline-variant/20 transition-all duration-300 ${!sidebarOpen ? 'translate-x-full w-0 opacity-0 overflow-hidden' : ''}`}>
          
          <div className="flex border-b border-outline-variant/10 text-on-surface-variant h-14 shrink-0">
            <button onClick={() => setAiPanelOpen(false)} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${!aiPanelOpen ? 'text-primary bg-primary/5' : 'hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-sm">settings</span> Properties
            </button>
            <button onClick={() => setAiPanelOpen(true)} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${aiPanelOpen ? 'text-primary bg-primary/5' : 'hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Architect
            </button>
          </div>

          {!aiPanelOpen ? (
            <>
              <div className="p-4 border-b border-outline-variant/10 flex items-start justify-between gap-2">
            <div>
              <h2 className="font-headline text-base font-bold text-primary">Property Inspector</h2>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                {selectedEl ? <><span className="text-secondary">{selectedEl.label}</span></> : 'No element selected'}
              </p>
            </div>
            {selectedEl && (
              <button onClick={() => setSelectedId(null)} className="text-outline hover:text-on-surface bg-surface-container hover:bg-surface-bright rounded-full p-1 border border-outline-variant/20 shrink-0">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {selectedEl ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">

                {/* Label */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Label</label>
                  <input
                    key={selectedEl.id}
                    defaultValue={selectedEl.label}
                    onBlur={e => handleUpdate(selectedEl.id, { label: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                  />
                </div>

                {/* Capacity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Seat Capacity</label>
                  <input
                    type="number"
                    key={`cap-${selectedEl.id}`}
                    defaultValue={selectedEl.capacity || 0}
                    onBlur={e => handleUpdate(selectedEl.id, { capacity: Number(e.target.value) })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => handleUpdate(selectedEl.id, { color: c })}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${selectedEl.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    {/* Custom color */}
                    <label className="w-7 h-7 rounded-full border-2 border-outline-variant/40 flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden" title="Custom color">
                      <input type="color" value={selectedEl.color} onChange={e => handleUpdate(selectedEl.id, { color: e.target.value })} className="opacity-0 absolute w-0 h-0" />
                      <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '14px' }}>colorize</span>
                    </label>
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Size (% of canvas)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-on-surface-variant mb-1">Width: {selectedEl.w.toFixed(0)}%</p>
                      <input type="range" min={5} max={80} value={selectedEl.w}
                        onChange={e => handleUpdate(selectedEl.id, { w: Number(e.target.value) })}
                        className="w-full accent-secondary cursor-pointer" />
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant mb-1">Height: {selectedEl.h.toFixed(0)}%</p>
                      <input type="range" min={4} max={70} value={selectedEl.h}
                        onChange={e => handleUpdate(selectedEl.id, { h: Number(e.target.value) })}
                        className="w-full accent-secondary cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Opacity: {selectedEl.opacity}%</label>
                  <input type="range" min={20} max={100} value={selectedEl.opacity}
                    onChange={e => handleUpdate(selectedEl.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer" />
                </div>

                {/* Rotation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Rotation: {selectedEl.rotation ?? 0}°</label>
                    <button onClick={() => handleUpdate(selectedEl.id, { rotation: 0 })}
                      className="text-[9px] text-primary hover:text-primary-fixed uppercase tracking-wider">Reset</button>
                  </div>
                  <input type="range" min={-180} max={180} value={selectedEl.rotation ?? 0}
                    onChange={e => handleUpdate(selectedEl.id, { rotation: Number(e.target.value) })}
                    className="w-full accent-secondary cursor-pointer" />
                  <div className="flex gap-1 mt-1">
                    {[0, 45, 90, 135, -90, -45].map(deg => (
                      <button key={deg} onClick={() => handleUpdate(selectedEl.id, { rotation: deg })}
                        className="flex-1 py-1 text-[9px] font-bold rounded-lg bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Position</label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                    <div className="bg-surface-container-lowest rounded-lg px-3 py-2">X: {selectedEl.x.toFixed(1)}%</div>
                    <div className="bg-surface-container-lowest rounded-lg px-3 py-2">Y: {selectedEl.y.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Access */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Access Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleUpdate(selectedEl.id, { access: 'public' })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedEl.access !== 'restricted' ? 'bg-secondary/10 border-secondary/50 text-secondary' : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'}`}>
                      Public
                    </button>
                    <button onClick={() => handleUpdate(selectedEl.id, { access: 'restricted' })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedEl.access === 'restricted' ? 'bg-error/10 border-error/50 text-error' : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'}`}>
                      Restricted
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider">Drag to move · corner handles to resize · top handle to rotate</p>
              </div>

              <div className="p-4 border-t border-outline-variant/10 bg-surface-variant/60">
                <button onClick={() => handleDelete(selectedEl.id)}
                  className="w-full py-3 bg-error-container/20 text-error hover:bg-error-container/40 border border-error/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                  Delete Element
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-outline">touch_app</span>
              <p className="text-sm text-on-surface-variant">Click an element on the canvas to inspect and edit it.</p>
            </div>
          )}
        </>
        ) : (
          /* AI Architect Panel */
          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                AI Architect
              </h3>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Describe your layout (e.g., "Create a semi-circle of 10 VIP zones facing the stage") and the AI will "scan" the current canvas to generate them.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="relative flex-1 flex flex-col group">
                <textarea 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onPaste={async (e) => {
                    const item = e.clipboardData.items[0];
                    if (item && item.type.startsWith('image')) {
                      const blob = item.getAsFile();
                      if (blob) {
                        const reader = new FileReader();
                        reader.onload = (re) => setAiReferenceImage(re.target?.result as string);
                        reader.readAsDataURL(blob);
                      }
                    }
                  }}
                  placeholder="What should I build? (Paste image/docs to attach)"
                  className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-2xl p-4 text-xs outline-none focus:border-primary transition-all resize-none font-medium leading-relaxed pb-12"
                />
                <div className="absolute left-3 bottom-3 flex items-center gap-2">
                  <label className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-center cursor-pointer hover:bg-surface-bright hover:border-primary transition-all text-outline-variant hover:text-primary">
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => setAiReferenceImage(re.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                  </label>
                  {aiReferenceImage && (
                    <div className="relative group/thumb">
                      {aiReferenceImage.startsWith('data:application/pdf') ? (
                        <div className="w-8 h-8 rounded-lg bg-error/20 border border-error/40 flex items-center justify-center">
                          <span className="material-symbols-outlined text-error text-lg">description</span>
                        </div>
                      ) : (
                        <img src={aiReferenceImage} className="w-8 h-8 rounded-lg object-cover border border-primary/40" />
                      )}
                      <button onClick={() => setAiReferenceImage(null)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error text-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover/thumb:scale-100 transition-transform">
                        <span className="material-symbols-outlined text-[8px]">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  disabled={isAiProcessing || elements.length === 0}
                  onClick={handleAIEnhancement}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isAiProcessing ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">auto_fix_high</span>}
                  Enhance & Fix Layout
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={isAiProcessing || !aiPrompt}
                    onClick={() => handleAIArchitect('merge')}
                    className="py-3.5 bg-surface-container-high text-primary border border-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {isAiProcessing ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">add_circle</span>}
                    Merge
                  </button>
                  <button 
                    disabled={isAiProcessing || !aiPrompt}
                    onClick={() => handleAIArchitect('replace')}
                    className="py-3.5 bg-surface-container-high text-error border border-error/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-error/5 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    Replace
                  </button>
                </div>
                
                <button 
                  onClick={() => { recordAction(); setElements([]); }}
                  className="w-full py-2.5 bg-error/5 text-error/60 border border-error/10 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-error/10 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xs">delete_sweep</span>
                  Clear Canvas
                </button>

                <p className="text-[9px] text-on-surface-variant/60 text-center uppercase tracking-wider font-bold">
                  AI will "scan" your layout to fix misalignments or add elements
                </p>
              </div>
            </div>

            <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10 mt-auto space-y-2">
              <p className="text-[8px] text-secondary font-bold uppercase tracking-tighter leading-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[10px]">info</span>
                Uses Gemini 2.5 Flash
              </p>
              <div className="text-[7px] text-on-surface-variant/60 leading-tight uppercase font-medium">
                Tip: Get a <a href="https://aistudio.google.com" target="_blank" className="underline text-primary">Free API Key</a> at Google AI Studio for the newest Flash models.
              </div>
            </div>
          </div>
        )}
        </aside>
      </div>

      {/* Grid Generator Modal */}
      {gridModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Seat Grid Generator</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Rows</label>
                  <input type="number" id="gridRows" defaultValue="5" className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Columns</label>
                  <input type="number" id="gridCols" defaultValue="10" className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Spacing (%)</label>
                <input type="number" id="gridSpacing" defaultValue="0.5" step="0.1" className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setGridModal(false)} className="flex-1 py-3 text-sm font-bold border border-outline-variant/20 rounded-xl hover:bg-surface-container-highest transition-all">Cancel</button>
                <button onClick={() => {
                  const rows = Number((document.getElementById('gridRows') as HTMLInputElement).value);
                  const cols = Number((document.getElementById('gridCols') as HTMLInputElement).value);
                  const spacing = Number((document.getElementById('gridSpacing') as HTMLInputElement).value);
                  generateSeatGrid(rows, cols, spacing);
                }} className="flex-1 py-3 text-sm font-bold bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20">Generate Grid</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
