import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  ExploreTab: undefined;
  MyBookingsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  RoomDetail: {
    roomId: string;
    initialDate?: string;
  };
};
