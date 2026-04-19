'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, dataconnect } from '@/lib/firebase-client';
import { executeQuery } from 'firebase/data-connect';
import { GetUserProfileData, GetGuestTicketsData, Ticket } from '@/types/dataconnect';
import { queryRef } from 'firebase/data-connect';

interface GuestContextType {
  user: User | null;
  profile: any | null;
  tickets: any[];
  activeTicket: any | null;
  loading: boolean;
  refreshTickets: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveTicket: (ticket: any) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndTickets = async (uid: string) => {
    try {
      // 1. Fetch Profile
      const pRef = queryRef<GetUserProfileData, { id: string }>(dataconnect, 'GetUserProfile', { id: uid });
      const pResult = await executeQuery(pRef);
      setProfile(pResult.data?.userProfile || null);
    } catch (err) {
      console.warn('GuestContext: Profile sync skipped or missing', err);
      setProfile(null);
    }

    try {
      // 2. Fetch Tickets
      const tRef = queryRef<GetGuestTicketsData, { userId: string }>(dataconnect, 'GetGuestTickets', { userId: uid });
      const tResult = await executeQuery(tRef);
      const guestTickets = tResult.data?.tickets || [];
      setTickets(guestTickets);

      if (guestTickets.length > 0) {
        const live = guestTickets.find(t => t.event.isActive) || guestTickets[0];
        setActiveTicket(live);
      }
    } catch (err) {
      console.error('GuestContext: Ticket Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfileAndTickets(firebaseUser.uid);
      } else {
        setProfile(null);
        setTickets([]);
        setActiveTicket(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshTickets = async () => {
    if (user) await fetchProfileAndTickets(user.uid);
  };

  return (
    <GuestContext.Provider value={{
      user,
      profile,
      tickets,
      activeTicket,
      loading,
      refreshTickets,
      refreshProfile: refreshTickets,
      setActiveTicket
    }}>
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
