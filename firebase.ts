import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDqlL6ZXC2elc4R45Lq248x4mSp1peeYYI",
  authDomain: "courtesy-app-4d70d.firebaseapp.com",
  projectId: "courtesy-app-4d70d",
  storageBucket: "courtesy-app-4d70d.appspot.com",
  messagingSenderId: "491960981294",
  appId: "1:491960981294:web:666d998290ba7489d90cbf",
  measurementId: "G-XJ73VKQGG1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);