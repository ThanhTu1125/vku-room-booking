import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { useBookingStore } from '../store/useBookingStore';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const currentUser = useBookingStore(state => state.currentUser);
  const isAuthChecking = useBookingStore(state => state.isAuthChecking);
  const hasHydrated = useBookingStore(state => state._hasHydrated);

  // 1. Màn hình Splash/Loading khi Firebase đang kiểm tra session hoặc store đang hydrate
  if (isAuthChecking || !hasHydrated) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>VKU</Text>
        </View>
        <Text style={styles.splashTitle}>VKU Study Space</Text>
        <Text style={styles.splashSubtitle}>Hệ thống Đặt phòng học & Phòng Lab</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
        <Text style={styles.checkingText}>Đang xác thực thông tin...</Text>
      </View>
    );
  }

  // 2. Navigation Container chứa Auth Flow và Main Flow chuyển đổi theo currentUser
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {currentUser ? (
          // Main Flow: Người dùng đã đăng nhập
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="RoomDetail"
              component={RoomDetailScreen}
              options={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          // Auth Flow: Người dùng chưa đăng nhập
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'fade',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 6,
  },
  splashSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 8,
  },
  checkingText: {
    fontSize: 12,
    color: COLORS.textSubtle,
    marginTop: 12,
  },
});
