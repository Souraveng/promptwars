import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopAppBar from '../components/shared/TopAppBar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock firebase-client to avoid init errors
vi.mock('@/lib/firebase-client', () => ({
  auth: {},
  dataconnect: {},
}));


// Mock GuestContext
vi.mock('@/app/guest/GuestContext', () => ({
  useGuest: () => ({
    profile: { name: 'Test Operative' },
    user: { email: 'test@example.com' },
    tickets: [],
    activeTicket: null,
    setActiveTicket: vi.fn(),
  }),
}));

describe('TopAppBar', () => {
  it('renders the application title', () => {
    render(<TopAppBar />);
    expect(screen.getByText(/AETHER OS/i)).toBeInTheDocument();
  });

  it('opens the profile menu when account button is clicked', () => {
    render(<TopAppBar />);
    const profileButton = screen.getByRole('button', { name: /account_circle/i });
    fireEvent.click(profileButton);
    expect(screen.getByText(/Test Operative/i)).toBeInTheDocument();
  });
});
