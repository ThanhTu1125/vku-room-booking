import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation';
import {
  setupNotificationHandler,
  setupNotificationChannel,
} from './src/utils/notificationHelper';

export default function App() {
  useEffect(() => {
    // Khởi tạo notification handler và Android Channel an toàn trong try/catch
    setupNotificationHandler();
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
