import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/config/firebase';
import { useBookingStore } from './src/store/useBookingStore';
import { User } from './src/types';
import { RootNavigator } from './src/navigation';
import {
  setupNotificationHandler,
  setupNotificationChannel,
} from './src/utils/notificationHelper';

// Ẩn CHÍNH XÁC các warning đã biết, an toàn và không nghiêm trọng trên Expo Go / Snack
// KHÔNG dùng LogBox.ignoreAllLogs(true) để vẫn giữ lại các cảnh báo/lỗi thực sự cần thiết khi phát triển
LogBox.ignoreLogs([
  'Error encountered while fetching auto-registration state',
  'expo-notifications functionality is not fully supported in Expo Go',
  'Bỏ qua setupNotificationChannel',
  'NotificationsChannelsProvider',
  'setLayoutAnimationEnabledExperimental is currently a no-op in the New Architecture',
]);

export default function App() {
  useEffect(() => {
    // Khởi tạo notification handler và Android Channel an toàn trong try/catch (chỉ gọi 1 lần duy nhất)
    setupNotificationHandler();
    setupNotificationChannel().catch(err => {
      console.log('[App] Không thể khởi tạo Android Notification Channel (an toàn):', err);
    });

    // Lắng nghe thay đổi trạng thái đăng nhập Firebase Authentication
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      try {
        if (firebaseUser) {
          let userProfileData: any = null;
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              userProfileData = userDocSnap.data();
            }
          } catch (err) {
            console.warn('[App] Lỗi khi đọc user profile từ Firestore:', err);
          }

          const fullUser: User = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            email: firebaseUser.email || userProfileData?.email || '',
            displayName:
              userProfileData?.displayName ||
              firebaseUser.displayName ||
              'Sinh viên VKU',
            name:
              userProfileData?.displayName ||
              firebaseUser.displayName ||
              'Sinh viên VKU',
            studentId: userProfileData?.studentId || '',
            createdAt: userProfileData?.createdAt || new Date().toISOString(),
          };

          useBookingStore.getState().setCurrentUser(fullUser);
        } else {
          useBookingStore.getState().setCurrentUser(null);
        }
      } catch (err) {
        console.warn('[App] Lỗi xử lý onAuthStateChanged:', err);
        useBookingStore.getState().setCurrentUser(null);
      } finally {
        useBookingStore.getState().setIsAuthChecking(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
