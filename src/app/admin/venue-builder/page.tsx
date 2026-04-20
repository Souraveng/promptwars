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
  type: ElementType;
  onConfirm: (label: string, capacity?: number) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(CFG[type].defaultLabel);
  const [capacity, setCapacity] = useState(100);

  const showCapacity = type === 'zone' || type === 'stall';

  const handleConfirm = () => {
    onConfirm(label, showCapacity ? capacity : undefined);
    onClose();
  };

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
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors" />
        </div>
        {showCapacity && (
          <div>
            <label className="block text-[0.6875rem] uppercase tracking-wider text-on-surface-variant mb-1.5 font-semibold">
              Capacity <span className="text-secondary normal-case tracking-normal font-normal">(max persons)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={1} value={capacity}
                onChange={e => setCapacity(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              />
              <div className="flex flex-col items-center px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-xl">
                <span className="text-lg font-bold text-secondary">{capacity.toLocaleString()}</span>
                <span className="text-[9px] uppercase tracking-wider text-on-surface-variant">persons</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-fixed transition-colors">Add to Canvas</button>
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
                <button onClick={() => { onSelect(layout); onClose(); }} className="px-5 py-2 bg-primary text-on-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:brightness-110">Open Project</button>
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
  onDragStart: () => void; // called when drag begins so parent can snapshot positions
  onSelect: (id: string, multi?: boolean) => void;
  onDelete: (id: string) => void;
  isEraserMode?: boolean;
  recordAction: () => void;
}

const CanvasEl: React.FC<CanvasElProps> = ({ el, selected, selectedIds, onUpdate, onUpdateBulk, onDragStart, onSelect, onDelete, isEraserMode, recordAction }) => {
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLElement | null>(null);
  const dragStart = useRef<{ px: number; py: number } | null>(null);
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
    e.stopPropagation();
    if (!selectedIds.includes(el.id)) onSelect(el.id, e.shiftKey);
    recordAction();
    onDragStart(); // snapshot all selected positions in parent
    canvasRef.current = getCanvas(e.currentTarget as HTMLElement);
    dragStart.current = { px: e.clientX, py: e.clientY };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!dragStart.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.py) / rect.height) * 100;
    if (selectedIds.length > 1 && selectedIds.includes(el.id)) {
      onUpdateBulk(selectedIds, dx, dy);
    } else {
      onUpdateBulk([el.id], dx, dy);
    }
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
      onPointerUp={e => {
        e.stopPropagation();
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        setIsDragging(false);
        dragStart.current = null;
        resizeStart.current = null;
        rotateStart.current = null;
      }}>
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
  const [canvasBg, setCanvasBg] = useState('#0a0c10');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [canvasBgImage, setCanvasBgImage] = useState<string>('');
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [addModal, setAddModal] = useState<ElementType | null>(null);
  const [gridModal, setGridModal] = useState(false);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [layoutName, setLayoutName] = useState('New Stadium Layout');
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
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

  const handleDragStart = useCallback(() => {
    // Snapshot current positions of ALL elements so bulk move uses absolute offsets
    setElements(current => {
      dragInitialElements.current = JSON.parse(JSON.stringify(current));
      return current;
    });
  }, []);

  const handleUpdateBulk = useCallback((ids: string[], dx: number, dy: number) => {
    // dragInitialElements is populated by onDragStart before first move
    if (dragInitialElements.current.length === 0) return;
    setElements(prev => prev.map(e => {
      if (!ids.includes(e.id)) return e;
      const initial = dragInitialElements.current.find(i => i.id === e.id);
      if (!initial) return e;
      return { ...e, x: initial.x + dx, y: initial.y + dy };
    }));
  }, []);

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

  const handleAdd = (type: ElementType, label: string, capacity?: number) => {
    recordAction();
    const id = Date.now().toString();
    setElements(prev => [...prev, { id, type, label, x: 40, y: 40, w: 15, h: 10, color: COLORS[Math.floor(Math.random() * COLORS.length)], opacity: 100, rotation: 0, access: 'public', capacity: capacity ?? 100 }]);
    setSelectedIds([id]);
  };

  const handleFetchLayouts = async () => {
    setIsFetching(true);
    try {
      const response = await executeQuery<ListVenueLayoutsData, any>(queryRef(dataconnect, 'ListVenueLayouts'));
      console.log('[VenueBuilder] Fetch response:', response);
      if (response.data?.venueLayouts) {
        setSavedLayouts(response.data.venueLayouts);
      } else {
        setSavedLayouts([]);
      }
      setLoadModalOpen(true);
    } catch (err) {
      console.error('[VenueBuilder] Error fetching layouts:', err);
      alert("Failed to fetch layouts. Check connection or console.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleLoadProject = (layout: any) => {
    try {
      const parsedElements = JSON.parse(layout.elements);
      recordAction();
      setElements(parsedElements);
      setLayoutName(layout.name);
      setCurrentLayoutId(layout.id);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error parsing layout elements:', err);
    }
  };

  const handleSave = async () => {
    if (elements.length === 0) {
      alert("Canvas is empty. Add some elements before saving.");
      return;
    }
    
    setIsSaving(true);
    try {
      const elementsJson = JSON.stringify(elements);
      
      if (currentLayoutId) {
        // Update existing
        await executeMutation(mutationRef(dataconnect, 'UpdateVenueLayout', {
          id: currentLayoutId,
          name: layoutName,
          elements: elementsJson
        }));
        alert("Layout updated successfully!");
      } else {
        // Create new
        const { data } = await executeMutation<any, any>(mutationRef(dataconnect, 'CreateVenueLayout', {
          name: layoutName,
          elements: elementsJson
        }));
        
        if (data?.venueLayout_insert?.id) {
          setCurrentLayoutId(data.venueLayout_insert.id);
        }
        alert("New layout saved successfully!");
      }
    } catch (err) {
      console.error('Error saving layout:', err);
      alert("Failed to save layout. Check console for details.");
    } finally {
      setIsSaving(false);
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
    setShowBgPicker(false);
    setToolMenuOpen(false);
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
    dragInitialElements.current = []; // reset bulk drag state
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
    <div className={`relative w-full h-full flex overflow-hidden text-on-surface font-sans transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[9999]' : ''}`}>

      <main className="flex-1 relative flex flex-col overflow-hidden bg-[#1a1d24]">
        {/* Workspace dot pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(78,222,163,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* ── Sticky Toolbar ── */}
        <div className="relative z-10 flex items-center justify-between px-4 py-2 bg-[#0d1117]/95 backdrop-blur-md border-b border-white/5 shrink-0 gap-2 flex-wrap">
          {/* Left: layout name + history */}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-lg mr-1">stadium</span>
            <input
              value={layoutName}
              onChange={e => setLayoutName(e.target.value)}
              className="bg-transparent border-none font-bold text-sm outline-none w-40 text-on-surface"
            />
            <div className="h-5 w-px bg-white/10 mx-2" />
            <button onClick={undo} title="Undo (Ctrl+Z)"
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-white/5 text-lg">undo</button>
            <button onClick={redo} title="Redo (Ctrl+Y)"
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-white/5 text-lg">redo</button>
            <div className="h-5 w-px bg-white/10 mx-2" />
            <button onClick={handleFetchLayouts} disabled={isFetching} title="Load Project"
              className={`material-symbols-outlined transition-colors p-1.5 rounded-lg hover:bg-white/5 text-lg ${isFetching ? 'text-primary animate-spin' : 'text-on-surface-variant hover:text-primary'}`}>
              {isFetching ? 'sync' : 'folder_open'}
            </button>
            <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-white/5 text-lg">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </button>
          </div>

          {/* Center: quick tool shortcuts */}
          <div className="flex items-center gap-1">
            <button onClick={() => setPanMode(!panMode)} title="Pan (Space)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${panMode ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-sm">pan_tool</span>Pan
            </button>
            <div className="h-5 w-px bg-white/10 mx-1" />
            {(Object.keys(CFG) as ElementType[]).filter(t => t !== 'polygon' && t !== 'seat').map(type => (
              <button key={type} onClick={() => setAddModal(type)} title={`Add ${type}`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-white/5 hover:text-primary transition-all">
                <span className="material-symbols-outlined text-sm text-primary">{CFG[type].icon}</span>
                <span className="hidden lg:inline">{type}</span>
              </button>
            ))}
            <div className="h-5 w-px bg-white/10 mx-1" />
            <button onClick={() => setIsEraserMode(!isEraserMode)} title="Eraser"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isEraserMode ? 'bg-error text-white' : 'text-on-surface-variant hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-sm">auto_fix_off</span>
              <span className="hidden lg:inline">Eraser</span>
            </button>
            <button onClick={() => setGridModal(true)} title="Grid"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-sm text-secondary">grid_view</span>
              <span className="hidden lg:inline">Grid</span>
            </button>
            <button onClick={() => setShowBgPicker(o => !o)} title="Canvas Color"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-white/5 transition-all">
              <div className="w-3.5 h-3.5 rounded border border-white/20" style={{ backgroundColor: canvasBg }} />
              <span className="hidden lg:inline">Canvas</span>
            </button>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-on-primary px-5 py-2 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

        {/* Canvas color picker — drops below toolbar */}
        {showBgPicker && (
          <div className="absolute top-[52px] right-4 z-[200] bg-[#0d1117] border border-outline-variant/20 rounded-2xl shadow-2xl w-64 overflow-hidden">
            {/* Hidden file input */}
            <input ref={bgImageInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setCanvasBgImage(url);
                  setShowBgPicker(false);
                }
              }} />

            {/* Color section */}
            <div className="px-4 py-3 border-b border-outline-variant/10">
              <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Canvas Color</p>
            </div>
            <div className="p-3 grid grid-cols-5 gap-2">
              {['#0a0c10','#111827','#1a1a2e','#0f172a','#18181b','#1e293b','#2d1b69','#0c1a0c','#1a0c0c','#ffffff','#f8fafc','#e2e8f0','#94a3b8','#475569','#334155'].map(c => (
                <button key={c} onClick={() => { setCanvasBg(c); setCanvasBgImage(''); setShowBgPicker(false); }}
                  className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${canvasBg === c && !canvasBgImage ? 'border-primary scale-110' : 'border-outline-variant/20'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="px-3 pb-3 flex items-center gap-2">
              <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold shrink-0">Custom</label>
              <input type="color" value={canvasBg}
                onChange={e => { setCanvasBg(e.target.value); setCanvasBgImage(''); }}
                className="flex-1 h-7 rounded cursor-pointer border border-outline-variant/20" />
            </div>

            {/* Background image section */}
            <div className="border-t border-outline-variant/10 px-4 py-3">
              <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Background Image</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => bgImageInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
                  Upload Image
                </button>
                {canvasBgImage && (
                  <div className="relative rounded-xl overflow-hidden border border-outline-variant/20">
                    <img src={canvasBgImage} alt="bg preview" className="w-full h-16 object-cover opacity-70" />
                    <button
                      onClick={() => setCanvasBgImage('')}
                      className="absolute top-1 right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '11px' }}>close</span>
                    </button>
                    <span className="absolute bottom-1 left-2 text-[9px] text-white font-bold uppercase tracking-wider">Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Viewport — workspace area, pan/zoom here */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center"
          style={{ cursor: panMode ? 'grab' : 'default' }}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onContextMenu={e => e.preventDefault()}>

          {/* The actual canvas — fixed size, zoomed/panned */}
          <div
            ref={canvasWrapRef}
            data-canvas="true"
            className="relative shadow-2xl"
            style={{
              width: '900px',
              height: '600px',
              backgroundColor: canvasBg,
              backgroundImage: canvasBgImage ? `url(${canvasBgImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: 'center center',
              flexShrink: 0,
            }}>

            {/* Elements */}
            {elements.map(el => (
              <CanvasEl key={el.id} el={el} selected={selectedIds.includes(el.id)} selectedIds={selectedIds}
                onSelect={(id, m) => setSelectedIds(prev => m ? (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]) : [id])}
                onUpdate={handleUpdate} onUpdateBulk={handleUpdateBulk} onDragStart={handleDragStart}
                onDelete={handleDelete} recordAction={recordAction} />
            ))}

            {/* Marquee UI */}
            {selectionRect && canvasWrapRef.current && (
              <div className="absolute border ring-1 ring-primary/40 bg-primary/5 pointer-events-none z-50 rounded"
                style={{
                  left: (Math.min(selectionRect.x1, selectionRect.x2) - canvasWrapRef.current.getBoundingClientRect().left) / zoom,
                  top: (Math.min(selectionRect.y1, selectionRect.y2) - canvasWrapRef.current.getBoundingClientRect().top) / zoom,
                  width: Math.abs(selectionRect.x1 - selectionRect.x2) / zoom,
                  height: Math.abs(selectionRect.y1 - selectionRect.y2) / zoom,
                  borderColor: '#0066FF'
                }} />
            )}
          </div>
        </div>

        {/* Zoom Controls — bottom right */}
        <div className="absolute bottom-6 right-6 z-[100] flex items-center gap-2 bg-[#0d1117]/90 backdrop-blur-xl border border-outline-variant/20 p-2 rounded-2xl shadow-2xl">
           <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="material-symbols-outlined p-1.5 hover:text-primary transition-colors text-on-surface-variant">remove</button>
           <span className="text-xs font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
           <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="material-symbols-outlined p-1.5 hover:text-primary transition-colors text-on-surface-variant">add</button>
           <div className="w-px h-5 bg-outline-variant/20 mx-1" />
           <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }} className="material-symbols-outlined p-1.5 hover:text-primary transition-colors text-on-surface-variant" title="Reset">restart_alt</button>
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
                {(selectedEl.type === 'zone' || selectedEl.type === 'stall' || selectedEl.type === 'seat') && (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
                      Capacity {selectedEl.type === 'seat' ? '(fixed: 1)' : ''}
                    </label>
                    {selectedEl.type === 'seat' ? (
                      <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                        <span className="material-symbols-outlined text-secondary text-sm">chair</span>
                        <span className="text-sm font-bold text-secondary">1 seat</span>
                        <span className="text-xs text-on-surface-variant ml-auto">Fixed capacity</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input
                          type="number" min={1}
                          value={selectedEl.capacity ?? 100}
                          onChange={e => handleUpdate(selectedEl.id, { capacity: Math.max(1, Number(e.target.value)) })}
                          className="flex-1 bg-surface-container-highest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
                        />
                        <div className="flex flex-col items-center px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-xl shrink-0">
                          <span className="text-base font-bold text-secondary">{(selectedEl.capacity ?? 100).toLocaleString()}</span>
                          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant">persons</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

      {addModal && <AddElementModal type={addModal} onConfirm={(label, capacity) => handleAdd(addModal, label, capacity)} onClose={() => setAddModal(null)} />}
      
      {loadModalOpen && <LoadLayoutModal layouts={savedLayouts} onSelect={handleLoadProject} onClose={() => setLoadModalOpen(false)} />}

      {gridModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGridModal(false)} />
           <div className="relative w-full max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-6">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-1">Generate Seat Grid</h3>
              <p className="text-xs text-on-surface-variant mb-4">Each cell = 1 seat (capacity 1)</p>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rows</label>
                      <input type="number" id="g-rows" defaultValue="5" min="1" max="50"
                        className="w-full bg-surface-container-highest rounded-xl px-4 py-2 outline-none border border-outline-variant/10"
                        onChange={() => {
                          const r = Number((document.getElementById('g-rows') as HTMLInputElement).value);
                          const c = Number((document.getElementById('g-cols') as HTMLInputElement).value);
                          const cap = document.getElementById('g-capacity');
                          if (cap) cap.textContent = String(r * c);
                        }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cols</label>
                      <input type="number" id="g-cols" defaultValue="8" min="1" max="50"
                        className="w-full bg-surface-container-highest rounded-xl px-4 py-2 outline-none border border-outline-variant/10"
                        onChange={() => {
                          const r = Number((document.getElementById('g-rows') as HTMLInputElement).value);
                          const c = Number((document.getElementById('g-cols') as HTMLInputElement).value);
                          const cap = document.getElementById('g-capacity');
                          if (cap) cap.textContent = String(r * c);
                        }} />
                    </div>
                 </div>

                 {/* Capacity display */}
                 <div className="flex items-center justify-between bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                   <div>
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total Capacity</p>
                     <p className="text-xs text-on-surface-variant mt-0.5">1 seat per cell</p>
                   </div>
                   <div className="text-right">
                     <span id="g-capacity" className="text-2xl font-bold text-secondary">40</span>
                     <span className="text-xs text-on-surface-variant ml-1">seats</span>
                   </div>
                 </div>

                 <button onClick={() => {
                   const rows = Number((document.getElementById('g-rows') as HTMLInputElement).value);
                   const cols = Number((document.getElementById('g-cols') as HTMLInputElement).value);
                   const newSeats: CanvasElement[] = [];
                   for (let r=0; r<rows; r++) {
                     for (let c=0; c<cols; c++) {
                       newSeats.push({
                         id: `s-${Date.now()}-${r}-${c}`,
                         type: 'seat', label: `${r+1}-${c+1}`,
                         x: 30 + c*3, y: 30 + r*4, w: 2, h: 3,
                         color: '#4edea3', opacity: 100, rotation: 0,
                         access: 'public', capacity: 1
                       });
                     }
                   }
                   recordAction();
                   setElements(prev => [...prev, ...newSeats]);
                   setGridModal(false);
                 }} className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:brightness-110 transition-all">
                   Generate Grid
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
