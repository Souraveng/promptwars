import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // Try to initialize using GOOGLE_APPLICATION_CREDENTIALS environment variable
  // Or fall back to initializing an empty array, relying on applicationDefault()
  // if running inside GCP (like Cloud Run or App Engine).
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "promptwar-492818",
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); // We will use Data Connect theoretically, but exporting firestore if needed.
