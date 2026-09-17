import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { requestNotificationPermissions } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    /**
     * =========================================================================
     * KHỞI TẠO THÔNG BÁO CỤC BỘ (LOCAL NOTIFICATIONS ONLY)
     * =========================================================================
     * - Chỉ xin quyền thông báo cục bộ và tạo Android Channel khi khởi động app.
     * - TUYỆT ĐỐI KHÔNG gắn các listener runtime như:
     *     * Notifications.addNotificationReceivedListener(...)
     *     * Notifications.addNotificationResponseReceivedListener(...)
     *     * Notifications.addPushTokenListener(...)
     *   để tránh kích hoạt warning hoặc crash không mong muốn trên Expo Go (SDK 57).
     * =========================================================================
     */
    const initLocalNotifications = async () => {
      try {
        await requestNotificationPermissions();
      } catch (err) {
        console.warn('[VKU App] Không thể khởi tạo quyền thông báo cục bộ:', err);
      }
    };

    initLocalNotifications();

    /**
     * Ghi chú: Nếu chuyển sang EAS Development Build trong tương lai và cần hứng
     * tương tác khi người dùng chạm vào thông báo, có thể mở lại đoạn code mẫu sau:
     *
     * // const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
     * //   console.log('Notification received:', notification);
     * // });
     * // const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
     * //   console.log('Notification clicked:', response);
     * // });
     * // return () => {
     * //   receivedSubscription.remove();
     * //   responseSubscription.remove();
     * // };
     */
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
