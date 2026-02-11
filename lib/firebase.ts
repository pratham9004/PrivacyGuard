import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpUvc_ViK0AysMXG3KWBxMQ1cRE2FcgTM",
  authDomain: "privacyguard-a5b33.firebaseapp.com",
  projectId: "privacyguard-a5b33",
  storageBucket: "privacyguard-a5b33.firebasestorage.app",
  messagingSenderId: "662506352864",
  appId: "1:662506352864:web:b98cc3f06e9819dfd42085",
  measurementId: "G-QZ3MDJ5MGN"
};

// Singleton instances (initialized lazily)
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

// Initialize Firebase only once
export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      _app = existingApps[0];
    } else {
      _app = initializeApp(firebaseConfig);
    }
  }
  return _app;
}

export function getAuthInstance(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export function getFirestoreInstance(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

// Export singleton instances
export const app = getFirebaseApp();
export const auth = getAuthInstance();
export const db = getFirestoreInstance();
