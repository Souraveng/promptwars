import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDataConnect, connectDataConnectEmulator, DataConnect } from "firebase/data-connect";
import { getStorage, connectStorageEmulator, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
export const GOOGLE_MAPS_API_KEY = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || firebaseConfig.apiKey || "") as string;
export const MAP_LIBRARIES: ("places" | "marker" | "visualization")[] = ["places", "marker", "visualization"];
export const DEFAULT_MAP_ID = '8e0a97af9386f9';

// Initialize Firebase securely (prevent overlapping multiple instances in Next.js Dev Mode)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const storage = getStorage(app);
export const dataconnect = getDataConnect(app, {
  service: "promptwar",
  location: "us-central1",
  connector: "example"
});

// Connect to emulator in development
if (process.env.NODE_ENV !== 'production') {
  // Use explicit IP to avoid 'localhost' resolution inconsistencies
  const host = '127.0.0.1';
  console.info(`[Firebase] Connecting to Data Connect Emulator at ${host}:9399`);
  connectDataConnectEmulator(dataconnect, host, 9399);
  
  console.info(`[Firebase] Connecting to Storage Emulator at ${host}:9199`);
  connectStorageEmulator(storage, host, 9199);
}
