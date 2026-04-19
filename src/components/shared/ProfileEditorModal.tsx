'use client';

import { useState } from 'react';
import { useGuest } from '@/app/guest/GuestContext';
import { executeMutation, mutationRef } from 'firebase/data-connect';
import { dataconnect } from '@/lib/firebase-client';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditorModal({ isOpen, onClose }: ProfileEditorModalProps) {
  const { profile, user, refreshProfile } = useGuest();
  
  const [formData, setFormData] = useState({
    name: profile?.name || user?.displayName || '',
    age: profile?.age?.toString() || '',
    idCardNumber: profile?.idCardNumber || '',
    phone: profile?.phone || '',
    email: profile?.email || user?.email || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const mRef = mutationRef(dataconnect, 'UpsertUserProfile', {
        id: user.uid,
        name: formData.name,
        age: parseInt(formData.age),
        idCardNumber: formData.idCardNumber,
        phone: formData.phone,
        email: formData.email
      });

      await executeMutation(mRef);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start p-4 pt-12 md:pt-24 overflow-y-auto custom-scrollbar">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#060D20]/95 backdrop-blur-xl animate-in fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0B1326] border border-outline-variant/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 mt-0 mb-12 flex flex-col min-h-[400px]">
        
        {/* Header (Sticky) */}
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-primary/5 shrink-0">
           <div>
              <h2 className="font-headline text-xl font-black italic tracking-tighter text-on-surface uppercase leading-none">Operative Credentials</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 opacity-60 relative flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 Tactical Identity Terminal
              </p>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
           
           <div className="space-y-4">
              <Field label="Full Name" icon="person" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
              
              <div className="grid grid-cols-2 gap-4">
                 <Field label="Tactical Age" type="number" icon="calendar_today" value={formData.age} onChange={v => setFormData({...formData, age: v})} required />
                 <Field label="Uplink Mobile" type="tel" icon="call" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} required />
              </div>
              
              <Field label="Identity Card (NAT)" icon="fingerprint" value={formData.idCardNumber} onChange={v => setFormData({...formData, idCardNumber: v})} required placeholder="NAT-XXXXXXXX" />
              
              <div className="space-y-1.5 opacity-50 pointer-events-none">
                 <label className="text-[9px] uppercase tracking-[0.2em] font-black text-on-surface-variant/60 ml-1">Authenticated Email</label>
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-base">verified</span>
                    <input disabled value={formData.email} className="w-full bg-surface-container/10 border border-outline-variant/10 rounded-xl py-3 pl-10 pr-4 text-[12px] font-mono" />
                 </div>
              </div>
           </div>

           {error && (
             <div className="p-4 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-lg">warning</span>
                <p className="text-[10px] text-error font-bold uppercase tracking-tight">{error}</p>
             </div>
           )}

           {success && (
             <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">Profile Synchronized Successfully</p>
             </div>
           )}

           <button 
             disabled={loading || success}
             className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_16px_48px_rgba(var(--color-primary-rgb),0.2)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3"
           >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save_as</span>
                  Commit Identity Updates
                </>
              )}
           </button>
        </form>

        <div className="px-8 pb-6 text-center">
           <p className="text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-[0.4em]">Sentinel Security Core v4.2</p>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}

function Field({ label, type = 'text', icon, value, onChange, required, placeholder }: FieldProps) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[9px] uppercase tracking-[0.2em] font-black text-on-surface-variant/60 ml-1">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-base opacity-60">{icon}</span>
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full bg-surface-container/20 border border-outline-variant/10 rounded-xl py-3 pl-10 pr-4 text-[12px] focus:border-primary/50 outline-none transition-all placeholder:text-on-surface-variant/20 text-on-surface font-medium"
        />
      </div>
    </div>
  );
}
