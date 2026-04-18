"use client";
import React, { useState, useRef, useCallback } from 'react';

type ElementType = 'zone' | 'gate' | 'stall' | 'washroom';

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
}

const CFG: Record<ElementType, { icon: string; defaultLabel: string }> = {
  zone:     { icon: 'polyline',    defaultLabel: 'New Zone'  },
  gate:     { icon: 'gate',        defaultLabel: 'New Gate'  },
  stall:    { icon: 'storefront',  defaultLabel: 'New Stall' },
  washroom: { icon: 'wc',          defaultLabel: 'Washroom'  },
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
function CanvasEl({ el, selected, onSelect, onUpdate, onDelete }: {
  el: CanvasElement;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, patch: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLElement | null>(null);
  const dragStart = useRef<{ px: number; py: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ px: number; py: number; ew: number; eh: number; corner: string } | null>(null);
  const rotateStart = useRef<{ cx: number; cy: number; startAngle: number } | null>(null);

  const getCanvas = (el: HTMLElement) => {
    let node: HTMLElement | null = el.parentElement;
    while (node && !node.dataset.canvas) node = node.parentElement;
    return node;
  };

  /* drag */
  const onDragDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    canvasRef.current = getCanvas(e.currentTarget as HTMLElement);
    dragStart.current = { px: e.clientX, py: e.clientY, ex: el.x, ey: el.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [el.x, el.y, onSelect]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.py) / rect.height) * 100;
    onUpdate(el.id, {
      x: Math.max(0, Math.min(100 - el.w, dragStart.current.ex + dx)),
      y: Math.max(0, Math.min(100 - el.h, dragStart.current.ey + dy)),
    });
  }, [el.id, el.w, el.h, onUpdate]);

  const onDragUp = useCallback(() => { dragStart.current = null; }, []);

  /* resize */
  const onResizeDown = useCallback((e: React.PointerEvent, corner: string) => {
    e.stopPropagation();
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
      data-element="true"
      className={`absolute select-none ${selected ? 'z-20' : 'z-10'}`}
      style={{
        left: `${el.x}%`, top: `${el.y}%`,
        width: `${el.w}%`, height: `${el.h}%`,
        opacity: el.opacity / 100,
        transform: `rotate(${el.rotation ?? 0}deg)`,
        transformOrigin: 'center center',
      }}
      onPointerDown={onDragDown}
      onPointerMove={e => { onDragMove(e); onResizeMove(e); onRotateMove(e); }}
      onPointerUp={() => { onDragUp(); onResizeUp(); onRotateUp(); }}
    >
      {/* Body */}
      <div
        className={`w-full h-full rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-all`}
        style={{
          backgroundColor: el.color + '22',
          border: `2px solid ${selected ? '#bcc7de' : el.color}`,
          boxShadow: selected ? `0 0 16px ${el.color}66` : 'none',
        }}
      >
        <span className="text-[10px] font-headline uppercase font-bold tracking-widest text-center px-2 break-words"
          style={{ color: el.color }}>
          {el.label}
        </span>
      </div>

      {/* Delete badge */}
      {selected && (
        <button
          className="absolute -top-3 -right-3 w-5 h-5 bg-error rounded-full flex items-center justify-center z-30 shadow-lg"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(el.id); }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>close</span>
        </button>
      )}

      {/* Resize handles — only when selected */}
      {selected && (
        <>
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
      { id: '1', type: 'zone',     label: 'Main Stage',    x: 25, y: 15, w: 22, h: 20, color: '#4edea3', opacity: 100, rotation: 0, access: 'public' },
      { id: '2', type: 'washroom', label: 'Washroom',      x: 60, y: 50, w: 10, h: 12, color: '#bcc7de', opacity: 100, rotation: 0, access: 'public' },
      { id: '3', type: 'zone',     label: 'VIP Section A', x: 8,  y: 65, w: 18, h: 18, color: '#4edea3', opacity: 80,  rotation: 0, access: 'restricted' },
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

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ elements, mapSrc }));
      setTimeout(() => setSaveStatus('saved'), 400);
      setTimeout(() => setSaveStatus('idle'), 2200);
    } catch {
      setSaveStatus('idle');
    }
  };

  const handleZoom = (dir: 'in' | 'out' | 'reset') => {
    setZoom(z => dir === 'reset' ? 1 : dir === 'in' ? Math.min(2, z + 0.15) : Math.max(0.4, z - 0.15));
  };

  const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMapSrc(URL.createObjectURL(file));
  };

  const handleAddElement = (type: ElementType, label: string) => {
    const id = Date.now().toString();
    setElements(prev => [...prev, {
      id, type, label,
      x: 20 + Math.random() * 30, y: 20 + Math.random() * 30,
      w: 18, h: 16,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 100, rotation: 0, access: 'public',
    }]);
    setSelectedId(id);
  };

  const handleUpdate = useCallback((id: string, patch: Partial<CanvasElement>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
    setSelectedId(null);
  }, []);

  const selectedEl = elements.find(e => e.id === selectedId) ?? null;

  return (
    <>
      {addModal && <AddElementModal type={addModal} onConfirm={l => handleAddElement(addModal, l)} onClose={() => setAddModal(null)} />}
      {downloadModal && <DownloadModal elements={elements} mapSrc={mapSrc} canvasRef={canvasWrapRef} onClose={() => setDownloadModal(false)} />}
      <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg" className="hidden" onChange={handleImportMap} />

      <div className="flex bg-surface-container-lowest overflow-hidden h-full">
        <main className="flex-1 flex flex-col relative bg-surface-container-lowest min-w-0">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 bg-surface-container/30 backdrop-blur-md border-b border-outline-variant/10 gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-primary hover:bg-surface-container rounded-lg flex items-center gap-1.5 px-2 transition-all">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span className="text-xs font-medium">Import Map</span>
                </button>
              </div>
              <div className="h-6 w-px bg-outline-variant/20 mx-1 hidden sm:block" />
              <div className="flex gap-1 flex-wrap">
                {(['zone', 'gate', 'stall', 'washroom'] as ElementType[]).map(type => (
                  <button key={type} onClick={() => setAddModal(type)} className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-sm">{CFG[type].icon}</span>
                    <span className="text-xs font-medium capitalize hidden sm:inline">Add {type}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleSave}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border flex items-center gap-1.5
                  ${saveStatus === 'saved' ? 'bg-secondary/10 text-secondary border-secondary/30'
                  : saveStatus === 'saving' ? 'bg-primary/10 text-primary border-primary/20 opacity-70'
                  : 'text-primary border-primary/20 hover:bg-primary/5'}`}>
                {saveStatus === 'saving' && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setDownloadModal(true)}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-secondary text-on-secondary-container rounded-lg hover:brightness-110 shadow-[0_0_20px_rgba(78,222,163,0.2)] transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">download</span>
                Download
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            className="flex-1 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(rgba(188,199,222,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"
            onClick={e => { if (!(e.target as HTMLElement).closest('[data-element]')) setSelectedId(null); }}
          >
            <div className="relative w-full h-full max-w-[800px] max-h-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10"
              data-canvas="true"
              ref={canvasWrapRef}
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
            >
              <img className="w-full h-full object-cover opacity-40 mix-blend-screen grayscale pointer-events-none" src={mapSrc} alt="venue map" />
              {elements.map(el => (
                <CanvasEl key={el.id} el={el} selected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
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

        {/* Property Inspector */}
        <aside className={`${selectedEl ? 'flex' : 'hidden xl:flex'} w-72 bg-surface-variant/30 backdrop-blur-xl z-40 flex-col border-l border-outline-variant/20 overflow-hidden shrink-0`}>
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
        </aside>
      </div>
    </>
  );
}
