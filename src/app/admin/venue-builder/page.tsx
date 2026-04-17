"use client";
import React, { useState, useRef, useCallback } from 'react';

type ElementType = 'zone' | 'gate' | 'stall' | 'washroom';

interface CanvasElement {
  id: string;
  type: ElementType;
  label: string;
  x: number; // percent of canvas width
  y: number; // percent of canvas height
}

const CFG: Record<ElementType, { icon: string; color: string; bg: string; border: string; defaultLabel: string }> = {
  zone:     { icon: 'polyline',   color: 'text-secondary',          bg: 'bg-secondary/10',       border: 'border-secondary/50',       defaultLabel: 'New Zone'  },
  gate:     { icon: 'gate',       color: 'text-primary',            bg: 'bg-primary/10',         border: 'border-primary/50',         defaultLabel: 'New Gate'  },
  stall:    { icon: 'storefront', color: 'text-tertiary',           bg: 'bg-tertiary/10',        border: 'border-tertiary/50',        defaultLabel: 'New Stall' },
  washroom: { icon: 'wc',         color: 'text-on-surface-variant', bg: 'bg-surface-container',  border: 'border-outline-variant/40', defaultLabel: 'Washroom'  },
};

/* ── Add Element Modal ── */
function AddElementModal({ type, onConfirm, onClose }: { type: ElementType; onConfirm: (l: string) => void; onClose: () => void }) {
  const [label, setLabel] = useState(CFG[type].defaultLabel);
  const cfg = CFG[type];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${cfg.color}`}>{cfg.icon}</span>
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

/* ── Publish Modal ── */
function PublishModal({ onClose }: { onClose: () => void }) {
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);
  const go = () => { setPublishing(true); setTimeout(() => { setPublishing(false); setDone(true); }, 1800); };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!publishing ? onClose : undefined} />
      <div className="relative w-full max-w-sm bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        {done ? (
          <>
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="material-symbols-outlined text-5xl text-secondary">check_circle</span>
              <h3 className="font-headline text-lg font-bold text-on-surface">Published!</h3>
              <p className="text-sm text-on-surface-variant text-center">Venue map is now live on the Guest PWA.</p>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold bg-secondary text-on-secondary-container">Done</button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">cloud_upload</span>
              <h3 className="font-headline text-base font-bold text-on-surface">Publish to Guest PWA</h3>
            </div>
            <p className="text-sm text-on-surface-variant">Push the current venue layout live to all guest devices?</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={go} disabled={publishing} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-secondary text-on-secondary-container hover:brightness-110 disabled:opacity-70 flex items-center justify-center gap-2 transition-all">
                {publishing && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                {publishing ? 'Publishing...' : 'Confirm Publish'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Draggable Element ── */
function DraggableElement({ el, selected, onSelect, onDragEnd }: {
  el: CanvasElement;
  selected: boolean;
  onSelect: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  const cfg = CFG[el.type];
  const dragStart = useRef<{ px: number; py: number; ex: number; ey: number } | null>(null);
  const canvasRef = useRef<HTMLElement | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect();
    // find canvas container (parent with data-canvas)
    let node: HTMLElement | null = (e.currentTarget as HTMLElement).parentElement;
    while (node && !node.dataset.canvas) node = node.parentElement;
    canvasRef.current = node;
    dragStart.current = { px: e.clientX, py: e.clientY, ex: el.x, ey: el.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [el.x, el.y, onSelect]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.px) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.py) / rect.height) * 100;
    const nx = Math.max(0, Math.min(90, dragStart.current.ex + dx));
    const ny = Math.max(0, Math.min(85, dragStart.current.ey + dy));
    onDragEnd(el.id, nx, ny);
  }, [el.id, onDragEnd]);

  const onPointerUp = useCallback(() => { dragStart.current = null; }, []);

  const isCircle = el.type === 'washroom' || el.type === 'gate';

  return (
    <div
      className={`absolute group cursor-grab active:cursor-grabbing select-none transition-[box-shadow] ${selected ? 'z-20' : 'z-10'}`}
      style={{ left: `${el.x}%`, top: `${el.y}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {isCircle ? (
        <div className={`p-3 ${cfg.bg} backdrop-blur-md rounded-full border-2 ${selected ? 'border-primary shadow-[0_0_16px_rgba(188,199,222,0.4)]' : cfg.border} flex flex-col items-center gap-1 transition-all`}>
          <span className={`material-symbols-outlined ${cfg.color}`}>{cfg.icon}</span>
          <span className={`text-[9px] font-bold uppercase ${cfg.color}`}>{el.label}</span>
        </div>
      ) : (
        <div className={`w-36 h-20 border-2 ${selected ? 'border-primary shadow-[0_0_16px_rgba(188,199,222,0.4)]' : cfg.border} ${cfg.bg} rounded-xl flex items-center justify-center backdrop-blur-sm transition-all`}>
          <span className={`text-[10px] font-headline uppercase font-bold ${cfg.color} tracking-widest text-center px-2`}>{el.label}</span>
        </div>
      )}
      {/* Delete badge on hover */}
      <button
        className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-error rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 hidden group-hover:flex"
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDragEnd(el.id, -999, -999); }}
        title="Delete"
      >
        <span className="material-symbols-outlined text-on-error" style={{ fontSize: '12px' }}>close</span>
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function VenueBuilderPage() {
  const [layersOpen, setLayersOpen] = useState(false);
  const [addModal, setAddModal] = useState<ElementType | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: '1', type: 'zone',     label: 'Main Stage',    x: 30, y: 20 },
    { id: '2', type: 'washroom', label: 'Washroom',      x: 60, y: 50 },
    { id: '3', type: 'zone',     label: 'VIP Section A', x: 10, y: 70 },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapSrc, setMapSrc] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBhmrsrH6KDg6rtnaFUY3beL1F8HN4FGonEoX7hAE-YFg82LrRwSGp8Nzh8SjpGAh3B0fArDNOh6-Ea5qpiToQ1FEn_W8U5Zk9iRpi6qc3BJy9aoR1ZDnNTB64VGeo1_e67Nu2lRW5q77lzIeTlxPrq4LezeWjIlwzatHixzF7L4XVOUUu0DNKRn0hISA33oxDDbhJrAkJTKwZ4R95P8ymuBjl_wsklWRCDN_e8mIsub_qnXdDWIiJwYVs_MNqcBSztkzlTXloNph2v');

  const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMapSrc(URL.createObjectURL(file));
  };

  const handleAddElement = (type: ElementType, label: string) => {
    const id = Date.now().toString();
    const x = 15 + Math.random() * 50;
    const y = 15 + Math.random() * 50;
    setElements(prev => [...prev, { id, type, label, x, y }]);
    setSelectedId(id);
  };

  // onDragEnd doubles as delete when x === -999
  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    if (x === -999) {
      setElements(prev => prev.filter(e => e.id !== id));
      setSelectedId(null);
    } else {
      setElements(prev => prev.map(e => e.id === id ? { ...e, x, y } : e));
    }
  }, []);

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(e => e.id !== selectedId));
    setSelectedId(null);
  };

  const selectedEl = elements.find(e => e.id === selectedId) ?? null;

  return (
    <>
      {addModal && <AddElementModal type={addModal} onConfirm={l => handleAddElement(addModal, l)} onClose={() => setAddModal(null)} />}
      <input ref={fileInputRef} type="file" accept=".svg,.png,.jpg,.jpeg" className="hidden" onChange={handleImportMap} />

      <div className="flex bg-surface-container-lowest overflow-hidden h-full">
        <main className="flex-1 flex flex-col relative bg-surface-container-lowest">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-surface-container/30 backdrop-blur-md border-b border-outline-variant/10 flex-wrap gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <div className="flex bg-surface-container-low p-1 rounded-xl">
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-primary hover:bg-surface-container rounded-lg flex items-center gap-1.5 px-2 transition-all">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span className="text-xs font-medium">Import Map</span>
                </button>
              </div>
              <div className="h-6 w-px bg-outline-variant/20 mx-1" />
              <div className="flex gap-1 flex-wrap">
                {(['zone', 'gate', 'stall', 'washroom'] as ElementType[]).map(type => (
                  <button key={type} onClick={() => setAddModal(type)} className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-sm">{CFG[type].icon}</span>
                    <span className="text-xs font-medium capitalize">Add {type}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setSaved(true) as unknown as void || setTimeout(() => setSaved(false), 2000)}
                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${saved ? 'bg-secondary/10 text-secondary border-secondary/30' : 'text-primary border-primary/20 hover:bg-primary/5'}`}>
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  const data = JSON.stringify({ elements, mapSrc }, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'venue-layout.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-secondary text-on-secondary-container rounded-lg hover:brightness-110 shadow-[0_0_20px_rgba(78,222,163,0.2)] transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">download</span>
                Download Layout
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(rgba(188,199,222,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"
            onClick={() => setSelectedId(null)}>
            <div className="relative w-[800px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10" data-canvas="true">
              <img className="w-full h-full object-cover opacity-40 mix-blend-screen grayscale pointer-events-none" src={mapSrc} alt="venue map" />
              {elements.map(el => (
                <DraggableElement
                  key={el.id}
                  el={el}
                  selected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>

            {/* Layers Panel */}
            <div className="hidden md:flex absolute left-6 bottom-6 flex-col gap-2 z-10 w-56">
              <button onClick={() => setLayersOpen(o => !o)} className="self-start flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-variant/70 backdrop-blur-xl border border-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors shadow-lg">
                <span className="material-symbols-outlined text-sm">layers</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Layers</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-300" style={{ transform: layersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_less</span>
              </button>
              <div className="flex flex-col gap-2 overflow-hidden transition-all duration-300" style={{ maxHeight: layersOpen ? '400px' : '0px', opacity: layersOpen ? 1 : 0 }}>
                <div className="bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 p-4 rounded-2xl shadow-2xl">
                  {[{ label: 'Zones & Areas', visible: true }, { label: 'Entry Gates', visible: true }, { label: 'Restrooms', visible: false }, { label: 'Vendor Stalls', visible: true }].map(({ label, visible }) => (
                    <div key={label} className={`flex items-center justify-between p-2 hover:bg-surface-container rounded-lg cursor-pointer ${!visible ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-sm ${visible ? 'text-secondary' : 'text-on-surface-variant'}`}>{visible ? 'visibility' : 'visibility_off'}</span>
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${visible ? 'bg-secondary shadow-[0_0_8px_#4edea3]' : 'bg-outline-variant'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-6 bottom-6 flex flex-col gap-2">
              {['add', 'remove', 'center_focus_strong'].map(icon => (
                <button key={icon} className="w-10 h-10 bg-surface-variant/60 backdrop-blur-xl border-t border-l border-outline-variant/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Property Inspector */}
        <aside className="hidden xl:flex w-80 bg-surface-variant/30 backdrop-blur-xl z-40 flex-col border-l border-outline-variant/20 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h2 className="font-headline text-lg font-bold text-primary">Property Inspector</h2>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
              {selectedEl ? <>Editing: <span className="text-secondary">{selectedEl.label}</span></> : 'No element selected'}
            </p>
          </div>

          {selectedEl ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Element Label</label>
                  <input
                    key={selectedEl.id}
                    defaultValue={selectedEl.label}
                    onBlur={e => setElements(prev => prev.map(el => el.id === selectedEl.id ? { ...el, label: e.target.value } : el))}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Type</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${CFG[selectedEl.type].bg} border ${CFG[selectedEl.type].border}`}>
                    <span className={`material-symbols-outlined text-sm ${CFG[selectedEl.type].color}`}>{CFG[selectedEl.type].icon}</span>
                    <span className={`text-xs font-bold capitalize ${CFG[selectedEl.type].color}`}>{selectedEl.type}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Position</label>
                  <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                    <div className="bg-surface-container-lowest rounded-lg px-3 py-2">X: {selectedEl.x.toFixed(1)}%</div>
                    <div className="bg-surface-container-lowest rounded-lg px-3 py-2">Y: {selectedEl.y.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Access Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-4 py-2.5 bg-secondary/10 border border-secondary/50 text-secondary rounded-xl text-xs font-bold">Public</button>
                    <button className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors">Restricted</button>
                  </div>
                </div>
                <div className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider pt-2">
                  Tip: drag to reposition · hover for delete ×
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant/10 bg-surface-variant/60">
                <button onClick={handleDeleteSelected} className="w-full py-3.5 bg-error-container/20 text-error hover:bg-error-container/40 border border-error/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
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
