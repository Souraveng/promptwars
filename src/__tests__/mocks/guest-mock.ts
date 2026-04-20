import { vi } from 'vitest';

export const mockGuestContext = {
  user: { uid: 'test-uid', email: 'test@example.com' },
  profile: { name: 'Test Operative', email: 'test@example.com' },
  tickets: [],
  activeTicket: null,
  loading: false,
  refreshTickets: vi.fn(),
  refreshProfile: vi.fn(),
  setActiveTicket: vi.fn(),
};

vi.mock('@/app/guest/GuestContext', () => ({
  useGuest: () => mockGuestContext,
  GuestProvider: ({ children }: { children: React.ReactNode }) => children,
}));
