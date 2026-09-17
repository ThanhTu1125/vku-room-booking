import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
