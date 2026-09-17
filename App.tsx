import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation';
import { requestNotificationPermissions } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    // Khởi tạo quyền thông báo cục bộ và thiết lập Android Channel
    const setupNotifications = async () => {
      try {
        await requestNotificationPermissions();
      } catch (error) {
        console.warn('Không thể khởi tạo thông báo cục bộ:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
