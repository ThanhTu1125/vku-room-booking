import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  // @ts-ignore - getReactNativePersistence is provided by the React Native bundle of @firebase/auth
  getReactNativePersistence,
  getAuth,
  Auth,
} from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cấu hình Firebase Web App chính thức của dự án StudyRoomBooking
 * (Đã tạo sẵn trên Firebase Console với Firestore Database mặc định và Email/Password Auth)
 */
const firebaseConfig = {
  apiKey: 'AIzaSyA-RsPXLbBS6zq7JHYXeKzCiOlZlWVfmgo',
  authDomain: 'vku-room-booking-da919.firebaseapp.com',
  projectId: 'vku-room-booking-da919',
  storageBucket: 'vku-room-booking-da919.firebasestorage.app',
  messagingSenderId: '748852719768',
  appId: '1:748852719768:web:fc9dae55f6cb11a62c20ed',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Guard chống khởi tạo lại khi Fast Refresh / Hot Reload trong môi trường phát triển
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);

  // Khởi tạo Firebase Authentication với AsyncStorage persistence cho React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  // Khởi tạo Firestore với auto-detect long polling để tránh treo kết nối trên React Native
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
