'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, dataconnect } from '@/lib/firebase-client';
import { executeQuery, queryRef } from 'firebase/data-connect';
import { 
  UserProfile, 
  Ticket, 
  GetUserProfileData, 
  GetGuestTicketsData 
} from '@/types/dataconnect';

interface GuestContextType {
  user: User | null;
  profile: UserProfile | null;
  tickets: (Ticket & { event: any })[];
  activeTicket: (Ticket & { event: any }) | null;
  loading: boolean;
  refreshTickets: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveTicket: (ticket: (Ticket & { event: any }) | null) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<(Ticket & { event: any })[]>([]);
  const [activeTicket, setActiveTicket] = useState<(Ticket & { event: any }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndTickets = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      // Parallel Execution for Efficiency
      const [pRef, tRef] = await Promise.all([
        queryRef<GetUserProfileData, { uid: string }>(dataconnect, 'GetUserProfile', { uid: uid }),
        queryRef<GetGuestTicketsData, { userId: string }>(dataconnect, 'GetGuestTickets', { userId: uid })
      ]);

      const [pResult, tResult] = await Promise.all([
        executeQuery(pRef),
        executeQuery(tRef)
      ]);

      const userProfile = pResult.data?.userProfiles?.[0] || null;
      const guestTickets = tResult.data?.tickets || [];

      setProfile(userProfile as any);
      setTickets(guestTickets);

      // Restore active ticket from session storage
      const savedTicketId = sessionStorage.getItem('active_deployment_id');
      if (savedTicketId) {
        const found = guestTickets.find(t => t.id === savedTicketId);
        if (found) setActiveTicket(found);
      }
    } catch (err) {
      console.error('GuestContext: Handshake Sync Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfileAndTickets(firebaseUser.uid);
      } else {
        setProfile(null);
        setTickets([]);
        setActiveTicket(null);
        sessionStorage.removeItem('active_deployment_id');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchProfileAndTickets]);

  const handleSetActiveTicket = useCallback((ticket: (Ticket & { event: any }) | null) => {
    setActiveTicket(ticket);
    if (ticket) {
      sessionStorage.setItem('active_deployment_id', ticket.id);
    } else {
      sessionStorage.removeItem('active_deployment_id');
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (user) await fetchProfileAndTickets(user.uid);
  }, [user, fetchProfileAndTickets]);

  const contextValue = useMemo(() => ({
    user,
    profile,
    tickets,
    activeTicket,
    loading,
    refreshTickets: refreshData,
    refreshProfile: refreshData,
    setActiveTicket: handleSetActiveTicket
  }), [user, profile, tickets, activeTicket, loading, refreshData, handleSetActiveTicket]);

  return (
    <GuestContext.Provider value={contextValue}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
