import { vi } from 'vitest';

export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
};

export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
};

export const mockDataConnect = {
  connector: vi.fn(),
  mutation: vi.fn(),
  query: vi.fn(),
};

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  connectStorageEmulator: vi.fn(),
}));

vi.mock('firebase/data-connect', () => ({
  getDataConnect: vi.fn(() => mockDataConnect),
  connectDataConnectEmulator: vi.fn(),
}));

vi.mock('@/lib/firebase-client', () => ({
  auth: mockAuth,
  storage: {},
  dataconnect: mockDataConnect,
}));
