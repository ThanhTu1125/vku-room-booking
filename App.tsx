import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { RootNavigator } from './src/navigation';
import { setupNotificationChannel } from './src/utils/notificationHelper';

/**
 * Cấu hình handler mặc định để thông báo hiển thị banner và phát âm thanh
 * ngay cả khi người dùng đang mở ứng dụng (Foreground mode).
 *
 * Kiểm tra theo chuẩn Expo SDK 57:
 * `shouldShowBanner`: Hiển thị banner pop-up đầu màn hình
 * `shouldShowList`: Hiển thị trong trung tâm thông báo (Notification Center)
 * `shouldPlaySound`: Cho phép phát chuông báo
 * `shouldShowAlert`: Fallback tương thích các phiên bản Expo trước đó
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // Khởi tạo Android Notification Channel khi app chạy (cần thiết cho Android 8.0+)
    setupNotificationChannel().catch(err => {
      console.warn('[App] Không thể khởi tạo Android Notification Channel:', err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
