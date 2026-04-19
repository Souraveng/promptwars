"use client";
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import html2canvas from 'html2canvas'; // Keeping for potential use in DownloadModal
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
  rotation: number;
  access: 'public' | 'restricted';
  capacity?: number;
  points?: { x: number; y: number }[];
}

const CFG: Record<ElementType, { icon: string; defaultLabel: string }> = {
  zone:     { icon: 'polyline',    defaultLabel: 'New Zone'  },
  gate:     { icon: 'gate',        defaultLabel: 'New Gate'  },
  stall:    { icon: 'storefront',  defaultLabel: 'New Stall' },
  washroom: { icon: 'wc',          defaultLabel: 'Washroom'  },
  polygon:  { icon: 'draw',        defaultLabel: 'Custom Zone' },
  seat:     { icon: 'chair',       defaultLabel: 'Seat' },
};

const COLORS = ['#4edea3', '#bcc7de', '#ffb2b7', '#ee3a5a', '#6fcfff', '#f9c74f', '#a78bfa', '#fb923c'];

/* ── Add Element Modal ── */
function AddElementModal({ type, onConfirm, onClose }: {
  type: ElementType; onConfirm: (l: string) => void; onClose: () => void;
}) {
  const [label, setLabel] = useState(CFG[type].defaultLabel);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors opacity-100" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(label); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-fixed transition-colors">Add to Canvas</button>
        </div>
      </div>
    </div>
  );
}

/* ── Load Layout Modal ── */
function LoadLayoutModal({ layouts, onSelect, onClose }: {
  layouts: any[]; onSelect: (l: any) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-container-low border border-outline-variant/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">folder_open</span>
             <h3 className="font-headline text-lg font-bold text-on-surface">Load Venue Layout</h3>
          </div>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {layouts.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant opacity-40">No saved layouts found.</div>
          ) : (
            layouts.map(layout => (
              <div key={layout.id} className="group flex items-center justify-between p-4 bg-surface-container-highest border border-outline-variant/10 rounded-2xl hover:border-primary/40 transition-all">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-on-surface">{layout.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                    Created {new Date(layout.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button onClick={() => { onSelect(layout); onClose(); }} className="px-5 py-2 bg-primary text-on-primary rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:brightness-110">Open Project</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Draggable + Resizable Element ── */
interface CanvasElProps {
  el: CanvasElement;
  selected: boolean;
  selectedIds: string[];
  onUpdate: (id: string, patch: Partial<CanvasElement>) => void;
  onUpdateBulk: (ids: string[], dx: number, dy: number) => void;
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  isEraserMode?: boolean;
  isPointerDown?: boolean;
  recordAction: () => void;
}

const CanvasEl: React.FC<CanvasElProps> = ({ el, selected, selectedIds, onUpdate, onUpdateBulk, onSelect, onDelete, isEraserMode, isPointerDown, recordAction }) => {
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLElement | null>(null);
  const dragStart = useRef<{ px: number; py: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ px: number; py: number; ew: number; eh: number; corner: string } | null>(null);
  const rotateStart = useRef<{ cx: number; cy: number; startAngle: number } | null>(null);

  const getCanvas = (element: HTMLElement) => {
    let node: HTMLElement | null = element.parentElement;
    while (node && node.dataset.canvas !== "true") node = node.parentElement;
    return node;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEraserMode) onDelete(el.id);
    else onSelect(el.id, e.shiftKey);
  };

  const onDragDown = (e: React.PointerEvent) => {
    if (isEraserMode || e.button === 1) return;
    if (!selectedIds.includes(el.id)) onSelect(el.id, e.shiftKey);
    recordAction();
    canvasRef.current = getCanvas(e.currentTarget as HTMLElement);
    dragStart.current = { px: e.clientX, py: e.clientY, ex: el.x, ey: el.y };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!dragStart.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.py) / rect.height) * 100;
    if (selectedIds.length > 1 && selectedIds.includes(el.id)) onUpdateBulk(selectedIds, dx, dy);
    else onUpdate(el.id, { x: dragStart.current.ex + dx, y: dragStart.current.ey + dy });
  };

  const onResizeDown = (e: React.PointerEvent, corner: string) => {
    e.stopPropagation();
    recordAction();
    canvasRef.current = getCanvas(e.currentTarget as HTMLElement);
    resizeStart.current = { px: e.clientX, py: e.clientY, ew: el.w, eh: el.h, corner };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizeStart.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - resizeStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - resizeStart.current.py) / rect.height) * 100;
    const { corner, ew, eh } = resizeStart.current;
    let patch: Partial<CanvasElement> = {};
    if (corner.includes('e')) patch.w = Math.max(2, ew + dx);
    else if (corner.includes('w')) { patch.w = Math.max(2, ew - dx); patch.x = el.x + dx; }
    if (corner.includes('s')) patch.h = Math.max(2, eh + dy);
    else if (corner.includes('n')) { patch.h = Math.max(2, eh - dy); patch.y = el.y + dy; }
    onUpdate(el.id, patch);
  };

  const onRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    recordAction();
    const rect = (e.currentTarget as HTMLElement).closest('[data-element]')!.getBoundingClientRect();
    rotateStart.current = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, startAngle: Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2)) * (180 / Math.PI) - (el.rotation ?? 0) };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onRotateMove = (e: React.PointerEvent) => {
    if (!rotateStart.current) return;
    const { cx, cy, startAngle } = rotateStart.current;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    onUpdate(el.id, { rotation: Math.round(angle - startAngle) });
  };

  return (
    <div data-element={el.id} className={`absolute select-none ${selected ? 'z-20' : 'z-10'}`}
      style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`, transform: `rotate(${el.rotation ?? 0}deg)`, transformOrigin: 'center center', opacity: el.opacity / 100 }}
      onClick={handleClick} onPointerDown={onDragDown} 
      onPointerMove={e => { onDragMove(e); if (resizeStart.current) onResizeMove(e); if (rotateStart.current) onRotateMove(e); }}
      onPointerUp={e => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); setIsDragging(false); resizeStart.current = null; rotateStart.current = null; }}>
      <div className={`w-full h-full rounded-xl flex items-center justify-center transition-all overflow-hidden border ${selected ? 'border-[#0066FF] shadow-[0_0_0_1px_#0066FF]' : 'border-outline-variant/20'}`}
        style={{ backgroundColor: selected ? el.color + '33' : el.color + '15' }}>
        {el.type === 'seat' ? <div className="w-[60%] h-[60%] border rounded-sm" style={{ borderColor: el.color }} /> : <span className="text-[10px] uppercase font-bold px-2 text-center" style={{ color: el.color }}>{el.label}</span>}
      </div>
      {selected && !isEraserMode && (
        <>
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-[#0066FF] z-40 cursor-nwse-resize" onPointerDown={e => onResizeDown(e, 'nw')} />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-[#0066FF] z-40 cursor-nesw-resize" onPointerDown={e => onResizeDown(e, 'ne')} />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-[#0066FF] z-40 cursor-nesw-resize" onPointerDown={e => onResizeDown(e, 'sw')} />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-[#0066FF] z-40 cursor-nwse-resize" onPointerDown={e => onResizeDown(e, 'se')} />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 cursor-grab z-30" onPointerDown={onRotateDown}><span className="material-symbols-outlined text-primary text-lg bg-surface-container rounded-full p-1 shadow-lg">rotate_right</span></div>
        </>
      )}
    </div>
  );
};

/* ── Main Page ── */
export default function VenueBuilderPage() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [addModal, setAddModal] = useState<ElementType | null>(null);
  const [gridModal, setGridModal] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [layoutName, setLayoutName] = useState('New Stadium Layout');
  
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const dragInitialElements = useRef<CanvasElement[]>([]);

  const recordAction = useCallback((custom?: CanvasElement[]) => {
    setUndoStack(prev => [...prev.slice(-49), custom || elements]);
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

  const handleUpdate = useCallback((id: string, patch: Partial<CanvasElement>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const handleUpdateBulk = useCallback((ids: string[], dx: number, dy: number) => {
    if (dragInitialElements.current.length === 0) dragInitialElements.current = JSON.parse(JSON.stringify(elements));
    setElements(prev => prev.map(e => ids.includes(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e));
    dragInitialElements.current = []; // Reset after apply
  }, [elements]);

  const handleDelete = useCallback((id: string) => {
    recordAction();
    setElements(prev => prev.filter(e => e.id !== id));
    setSelectedIds(prev => prev.filter(p => p !== id));
  }, [recordAction]);

  const handleAIEnhancement = async () => {
    setIsAiProcessing(true);
    // Logic for enhancement would go here
    setTimeout(() => setIsAiProcessing(false), 2000);
  };

  const handleAIArchitect = async (mode: 'merge' | 'replace') => {
    setIsAiProcessing(true);
    // Logic for architecting would go here
    setTimeout(() => setIsAiProcessing(false), 2000);
  };

  const handleAdd = (type: ElementType, label: string) => {
    recordAction();
    const id = Date.now().toString();
    setElements(prev => [...prev, { id, type, label, x: 40, y: 40, w: 15, h: 10, color: COLORS[Math.floor(Math.random() * COLORS.length)], opacity: 100, rotation: 0, access: 'public', capacity: 100 }]);
    setSelectedIds([id]);
  };

  const handleFetchLayouts = async () => {
    try {
      const { data } = await executeQuery<ListVenueLayoutsData, any>(queryRef(dataconnect, 'ListVenueLayouts'));
      if (data?.venueLayouts) setSavedLayouts(data.venueLayouts);
      setLoadModalOpen(true);
    } catch (err) {
      console.error('Error fetching layouts:', err);
    }
  };

  const handleLoadProject = (layout: any) => {
    try {
      const parsedElements = JSON.parse(layout.elements);
      recordAction();
      setElements(parsedElements);
      setLayoutName(layout.name);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error parsing layout elements:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === ' ' && !panMode) setPanMode(true);
      if (e.key === 'Delete' || e.key === 'Backspace') selectedIds.forEach(id => handleDelete(id));
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === ' ') setPanMode(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [panMode, selectedIds, undo, redo, handleDelete]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (panMode || e.button === 1) {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }
    const isBg = (e.target as HTMLElement).dataset.canvas === "true";
    if (isBg) {
      if (!e.shiftKey) setSelectedIds([]);
      setSelectionRect({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (panMode || e.button === 1) {
      setPanOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
      return;
    }
    if (selectionRect) setSelectionRect(prev => prev ? { ...prev, x2: e.clientX, y2: e.clientY } : null);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (selectionRect && canvasWrapRef.current) {
      const rect = canvasWrapRef.current.getBoundingClientRect();
      const getX = (cx: number) => ((cx - rect.left) / rect.width) * 100;
      const getY = (cy: number) => ((cy - rect.top) / rect.height) * 100;
      const xMin = Math.min(getX(selectionRect.x1), getX(selectionRect.x2));
      const xMax = Math.max(getX(selectionRect.x1), getX(selectionRect.x2));
      const yMin = Math.min(getY(selectionRect.y1), getY(selectionRect.y2));
      const yMax = Math.max(getY(selectionRect.y1), getY(selectionRect.y2));
      const hits = elements.filter(el => el.x < xMax && el.x + el.w > xMin && el.y < yMax && el.y + el.h > yMin).map(el => el.id);
      
      if (isEraserMode) {
        if (hits.length > 0) {
          recordAction();
          setElements(prev => prev.filter(el => !hits.includes(el.id)));
          setSelectedIds([]);
        }
      } else {
        setSelectedIds(prev => e.shiftKey ? Array.from(new Set([...prev, ...hits])) : hits);
      }
      setSelectionRect(null);
    }
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const selectedEl = useMemo(() => elements.find(e => e.id === selectedIds[0]), [elements, selectedIds]);

  return (
    <div className={`relative w-full h-full bg-[#0a0c10] flex overflow-hidden text-on-surface font-sans transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      {/* Background Dots */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #4edea3 1px, transparent 1px)', 
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`, 
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px` 
        }} />

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 bg-surface-container/60 backdrop-blur-xl border border-outline-variant/10 px-4 py-2 rounded-2xl shadow-2xl pointer-events-auto">
            <span className="material-symbols-outlined text-primary">stadium</span>
            <input value={layoutName} onChange={e => setLayoutName(e.target.value)} className="bg-transparent border-none font-bold text-sm outline-none w-48" />
            <div className="h-4 w-px bg-outline-variant/20 mx-2" />
            <button onClick={undo} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg" title="Undo">undo</button>
            <button onClick={redo} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg" title="Redo">redo</button>
            <div className="h-4 w-px bg-outline-variant/20 mx-2" />
            <button onClick={handleFetchLayouts} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg" title="Load Project">folder_open</button>
            <button onClick={toggleFullscreen} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </button>
          </div>
          <button className="bg-primary text-on-primary px-6 py-2 rounded-2xl font-bold text-sm shadow-lg pointer-events-auto hover:brightness-110 active:scale-95 transition-all">Save Changes</button>
        </div>

        {/* Viewport */}
        <div className="flex-1 relative cursor-crosshair overflow-hidden flex items-center justify-center translate-z-0" data-canvas="true"
          onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={handleCanvasPointerUp} onContextMenu={e => e.preventDefault()}>
          
          <div ref={canvasWrapRef} data-canvas="true" className="relative transition-transform duration-75 flex items-center justify-center"
            style={{ 
              width: '4000px', 
              height: '4000px', 
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`, 
              transformOrigin: 'center center' 
            }}>
            
            {/* Map Layer */}
            <div className="absolute inset-0 bg-[#0d1117] rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden pointer-events-none" />

            {/* Elements */}
            {elements.map(el => (
              <CanvasEl key={el.id} el={el} selected={selectedIds.includes(el.id)} selectedIds={selectedIds} onSelect={(id, m) => setSelectedIds(prev => m ? (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]) : [id])} onUpdate={handleUpdate} onUpdateBulk={handleUpdateBulk} onDelete={handleDelete} recordAction={recordAction} />
            ))}

            {/* Marquee UI */}
            {selectionRect && (
              <div className="absolute border ring-1 ring-primary/40 bg-primary/5 pointer-events-none z-50 rounded"
                style={{
                  left: Math.min(selectionRect.x1, selectionRect.x2) - (canvasWrapRef.current?.getBoundingClientRect().left ?? 0),
                  top: Math.min(selectionRect.y1, selectionRect.y2) - (canvasWrapRef.current?.getBoundingClientRect().top ?? 0),
                  width: Math.abs(selectionRect.x1 - selectionRect.x2),
                  height: Math.abs(selectionRect.y1 - selectionRect.y2),
                  borderColor: '#0066FF'
                }} />
            )}
          </div>
        </div>

        {/* Floating Bottom Toolbar */}
        <div className="absolute bottom-10 left-12 right-12 z-[100] flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 bg-surface-container/60 backdrop-blur-2xl border border-outline-variant/10 p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
            <button onClick={() => setPanMode(!panMode)} className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${panMode ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined">pan_tool</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Pan</span>
            </button>
            <div className="w-px h-10 bg-outline-variant/20 mx-2" />
            {(Object.keys(CFG) as ElementType[]).filter(t => t !== 'polygon' && t !== 'seat').map(type => (
              <button key={type} onClick={() => setAddModal(type)} className="p-4 rounded-2xl flex flex-col items-center gap-1 hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-primary">{CFG[type].icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{type}</span>
              </button>
            ))}
            <button onClick={() => setGridModal(true)} className="p-4 rounded-2xl flex flex-col items-center gap-1 hover:bg-surface-container-high transition-all">
               <span className="material-symbols-outlined text-secondary">grid_view</span>
               <span className="text-[10px] font-bold uppercase tracking-wider">Grid</span>
            </button>
            <div className="w-px h-10 bg-outline-variant/20 mx-2" />
            <button onClick={() => setIsEraserMode(!isEraserMode)} className={`p-4 rounded-2xl flex flex-col items-center gap-1 transition-all ${isEraserMode ? 'bg-error text-white' : 'hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined">auto_fix_off</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Eraser</span>
            </button>
          </div>
        </div>

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-10 right-10 z-[100] flex items-center gap-3 bg-surface-container/60 backdrop-blur-xl border border-outline-variant/10 p-2 rounded-2xl shadow-2xl">
           <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="material-symbols-outlined p-2 hover:text-primary transition-colors">remove</button>
           <span className="text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
           <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="material-symbols-outlined p-2 hover:text-primary transition-colors">add</button>
           <div className="w-px h-6 bg-outline-variant/20 mx-1" />
           <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="material-symbols-outlined p-2 hover:text-primary transition-colors">restart_alt</button>
        </div>
      </main>

      {/* Property & AI Sidebar */}
      <aside className={`w-80 bg-surface-container-high border-l border-outline-variant/10 flex flex-col z-[110] transition-all duration-300 ${((selectedIds.length > 0 || aiPanelOpen) && !isFullscreen) ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="flex border-b border-outline-variant/10 h-14 shrink-0">
          <button onClick={() => setAiPanelOpen(false)} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${!aiPanelOpen ? 'text-primary bg-primary/5' : 'hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-sm">settings</span> Properties
          </button>
          <button onClick={() => setAiPanelOpen(true)} className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${aiPanelOpen ? 'text-primary bg-primary/5' : 'hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Architect
          </button>
        </div>

        {!aiPanelOpen ? (
          selectedIds.length === 1 && selectedEl ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Properties</h2>
                <button onClick={() => setSelectedIds([])} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                   <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">Name</label>
                   <input value={selectedEl.label} onChange={e => handleUpdate(selectedEl.id, { label: e.target.value })} className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 outline-none" />
                </div>
                <div className="space-y-4">
                   <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">Metrics</label>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10"><span className="text-[8px] font-bold text-primary block mb-1 uppercase">X Pos</span><input type="number" value={Math.round(selectedEl.x)} onChange={e => handleUpdate(selectedEl.id, { x: Number(e.target.value) })} className="bg-transparent border-none p-0 w-full text-xs" /></div>
                      <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10"><span className="text-[8px] font-bold text-primary block mb-1 uppercase">Y Pos</span><input type="number" value={Math.round(selectedEl.y)} onChange={e => handleUpdate(selectedEl.id, { y: Number(e.target.value) })} className="bg-transparent border-none p-0 w-full text-xs" /></div>
                      <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10"><span className="text-[8px] font-bold text-primary block mb-1 uppercase">Width</span><input type="number" value={Math.round(selectedEl.w)} onChange={e => handleUpdate(selectedEl.id, { w: Number(e.target.value) })} className="bg-transparent border-none p-0 w-full text-xs" /></div>
                      <div className="bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10"><span className="text-[8px] font-bold text-primary block mb-1 uppercase">Height</span><input type="number" value={Math.round(selectedEl.h)} onChange={e => handleUpdate(selectedEl.id, { h: Number(e.target.value) })} className="bg-transparent border-none p-0 w-full text-xs" /></div>
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-2">Appearance</label>
                   <div className="flex items-center gap-4 bg-surface-container-highest p-3 rounded-xl border border-outline-variant/10">
                     <input type="color" value={selectedEl.color} onChange={e => handleUpdate(selectedEl.id, { color: e.target.value })} className="w-10 h-10 rounded border-none p-0 cursor-pointer" />
                     <input type="range" min="10" max="100" value={selectedEl.opacity} onChange={e => handleUpdate(selectedEl.id, { opacity: Number(e.target.value) })} className="flex-1 accent-primary" />
                   </div>
                </div>
                <button onClick={() => handleDelete(selectedEl.id)} className="w-full py-4 bg-error/10 text-error rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2 mt-auto border border-error/20">
                   <span className="material-symbols-outlined text-sm">delete</span> Remove Element
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-20">touch_app</span>
              <p className="text-sm">Select an element to view its properties.</p>
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                AI Architect
              </h3>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Describe your layout and the AI will generate it for you.
              </p>
            </div>
            <textarea 
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="What should I build?"
              className="flex-1 bg-surface-container-highest border border-outline-variant/20 rounded-2xl p-4 text-xs outline-none focus:border-primary transition-all resize-none font-medium leading-relaxed"
            />
            <div className="space-y-3">
              <button 
                disabled={isAiProcessing || elements.length === 0}
                onClick={handleAIEnhancement}
                className="w-full py-4 bg-primary text-on-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAiProcessing ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">auto_fix_high</span>}
                Enhance Layout
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAIArchitect('merge')} disabled={isAiProcessing || !aiPrompt} className="py-4 bg-surface-container-high text-primary border border-primary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all disabled:opacity-50">Merge</button>
                <button onClick={() => handleAIArchitect('replace')} disabled={isAiProcessing || !aiPrompt} className="py-4 bg-surface-container-high text-error border border-error/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-error/5 transition-all disabled:opacity-50">Replace</button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {addModal && <AddElementModal type={addModal} onConfirm={label => handleAdd(addModal, label)} onClose={() => setAddModal(null)} />}
      
      {loadModalOpen && <LoadLayoutModal layouts={savedLayouts} onSelect={handleLoadProject} onClose={() => setLoadModalOpen(false)} />}

      {gridModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGridModal(false)} />
           <div className="relative w-full max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-6">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Generate Seat Grid</h3>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rows</label><input type="number" id="g-rows" defaultValue="5" className="w-full bg-surface-container-highest rounded-xl px-4 py-2 outline-none border border-outline-variant/10" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cols</label><input type="number" id="g-cols" defaultValue="8" className="w-full bg-surface-container-highest rounded-xl px-4 py-2 outline-none border border-outline-variant/10" /></div>
                 </div>
                 <button onClick={() => {
                   const rows = Number((document.getElementById('g-rows') as HTMLInputElement).value);
                   const cols = Number((document.getElementById('g-cols') as HTMLInputElement).value);
                   const newSeats: CanvasElement[] = [];
                   for (let r=0; r<rows; r++) {
                     for (let c=0; c<cols; c++) {
                       newSeats.push({ id: `s-${Date.now()}-${r}-${c}`, type: 'seat', label: `${r+1}-${c+1}`, x: 30 + c*3, y: 30 + r*4, w: 2, h: 3, color: '#4edea3', opacity: 100, rotation: 0, access: 'public' });
                     }
                   }
                   recordAction();
                   setElements(prev => [...prev, ...newSeats]);
                   setGridModal(false);
                 }} className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:brightness-110 transition-all">Generate Grid</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
