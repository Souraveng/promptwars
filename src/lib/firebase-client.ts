import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDataConnect, connectDataConnectEmulator } from "firebase/data-connect";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDFNYR1SS6avIQz4eGP8PaFarGQEjbalXU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "promptwar-492818.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promptwar-492818",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "promptwar-492818.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "189123787075",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:189123787075:web:d32224509dd201578957f6",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-L5GG7XT1Y2"
};
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || firebaseConfig.apiKey;
export const MAP_LIBRARIES: ("places" | "marker")[] = ["places", "marker"];
export const DEFAULT_MAP_ID = '8e0a97af9386f9';

// Initialize Firebase securely (prevent overlapping multiple instances in Next.js Dev Mode)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const dataconnect = getDataConnect(app, {
  service: "promptwar",
  location: "us-central1",
  connector: "example"
});

// Connect to emulator in development - using 127.0.0.1 for better reliability
if (typeof window !== 'undefined') {
  const isDev = window.location.hostname === 'localhost' || process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.info('[Firebase] Connecting to Data Connect Emulator at 127.0.0.1:9399');
    connectDataConnectEmulator(dataconnect, '127.0.0.1', 9399);
  }
}
