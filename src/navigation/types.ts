import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  RoomList: undefined;
  RoomDetail: {
    roomId: string;
    initialDate?: string;
  };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  MyBookingsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  RoomDetail: {
    roomId: string;
    initialDate?: string;
  };
};
