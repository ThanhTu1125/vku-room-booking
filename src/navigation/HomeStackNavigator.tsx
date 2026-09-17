import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="RoomList" component={HomeScreen} />
      <Stack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};
