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
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let dataconnect: DataConnect | undefined;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  storage = getStorage(app);
  dataconnect = getDataConnect(app, {
    service: "promptwar",
    location: "us-central1",
    connector: "example"
  });
} catch (e) {
  if (typeof window !== 'undefined') {
    console.error("Critical: Firebase Initialization Failed. This usually happens when 'NEXT_PUBLIC_FIREBASE_API_KEY' is missing or invalid at build-time. Please check your Cloud Build Substitution Variables.", e);
  }
}

const _auth = auth as Auth;
const _storage = storage as FirebaseStorage;
const _dataconnect = dataconnect as DataConnect;

export { _auth as auth, _storage as storage, _dataconnect as dataconnect };

// Connect to emulator in development
if (process.env.NODE_ENV !== 'production') {
  // Use explicit IP to avoid 'localhost' resolution inconsistencies
  const host = '127.0.0.1';
  
  if (dataconnect) {
    console.info(`[Firebase] Connecting to Data Connect Emulator at ${host}:9399`);
    connectDataConnectEmulator(dataconnect, host, 9399);
  }
  
  if (storage) {
    console.info(`[Firebase] Connecting to Storage Emulator at ${host}:9199`);
    connectStorageEmulator(storage, host, 9199);
  }
}
