import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD71ljbIMa8n-1BEC2Xx-Aq7YkSw-crRMY",
  authDomain: "blood-bridge-d03fb.firebaseapp.com",
  projectId: "blood-bridge-d03fb",
  storageBucket: "blood-bridge-d03fb.firebasestorage.app",
  messagingSenderId: "947984663234",
  appId: "1:947984663234:web:4942e4e4fb03e563f6315b",
  measurementId: "G-PC3MR30QSZ",
};

const app = initializeApp(firebaseConfig);

// Auth must be initialized before anything else — it's used everywhere
export const auth = getAuth(app);

// Analytics is optional; some environments (ad-blockers, SSR) don't support it
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Firebase Analytics unavailable:", e.message);
}
export { analytics };

export default app;
