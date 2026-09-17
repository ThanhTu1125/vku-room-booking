import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeStackNavigator } from './HomeStackNavigator';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useBookingStore } from '../store/useBookingStore';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  const bookings = useBookingStore(state => state.bookings);
  const currentUser = useBookingStore(state => state.currentUser);

  // Đếm số lượng booking sắp tới của riêng người dùng hiện tại
  const activeBookingsCount = currentUser
    ? bookings.filter(b => b.userId === currentUser.id && b.status === 'upcoming').length
    : 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Tìm phòng',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookingsTab"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Đặt phòng của tôi',
          tabBarBadge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
