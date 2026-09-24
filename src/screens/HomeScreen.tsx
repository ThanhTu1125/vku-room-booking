import React, { useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ListRenderItem,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useBookingStore } from '../store/useBookingStore';
import { RoomCard, ROOM_CARD_TOTAL_ITEM_HEIGHT } from '../components/RoomCard';
import { FilterBar } from '../components/FilterBar';
import { COLORS } from '../constants/colors';
import { Room } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const currentUser = useBookingStore(state => state.currentUser);
  const rooms = useBookingStore(state => state.rooms);
  const filters = useBookingStore(state => state.filters);
  const getFilteredRooms = useBookingStore(state => state.getFilteredRooms);
  const resetFilters = useBookingStore(state => state.resetFilters);

  // Kích hoạt LayoutAnimation trên Android (chỉ cần thiết cho Old Architecture)
  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental &&
      // @ts-ignore
      !global._IS_FABRIC
    ) {
      try {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      } catch {}
    }
  }, []);

  // Lấy danh sách phòng đã áp dụng bộ lọc từ store (reactive với filters và rooms)
  const filteredRooms = useMemo(
    () => getFilteredRooms(),
    [getFilteredRooms, filters, rooms]
  );

  // Hiệu ứng chuyển động mượt mà khi danh sách phòng thay đổi do lọc/tìm kiếm
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [filteredRooms]);

  // Navigation sang chi tiết phòng được memo hóa
  const handleRoomPress = useCallback(
    (roomId: string) => {
      navigation.navigate('RoomDetail', { roomId });
    },
    [navigation]
  );

  // renderItem memoized tuyệt đối, không tạo function closure mới mỗi lần render
  const renderItem: ListRenderItem<Room> = useCallback(
    ({ item }) => <RoomCard room={item} onPress={() => handleRoomPress(item.id)} />,
    [handleRoomPress]
  );

  // keyExtractor memoized
  const keyExtractor = useCallback((item: Room) => item.id, []);

  // getItemLayout cố định chuẩn xác giúp FlatList nhảy trực tiếp vị trí cuộn O(1)
  const getItemLayout = useCallback(
    (_data: ArrayLike<Room> | null | undefined, index: number) => ({
      length: ROOM_CARD_TOTAL_ITEM_HEIGHT,
      offset: ROOM_CARD_TOTAL_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Empty state component
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🏢</Text>
        <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
        <Text style={styles.emptySubtitle}>
          Thử tìm kiếm với từ khóa khác hoặc xóa bớt các điều kiện lọc tòa nhà, sức chứa
          và trang thiết bị.
        </Text>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={resetFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.resetBtnText}>Xóa bộ lọc</Text>
        </TouchableOpacity>
      </View>
    ),
    [resetFilters]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header thương hiệu VKU */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeSubtitle}>Hệ thống Đặt phòng học</Text>
          <Text style={styles.welcomeTitle}>VKU Study Space 🎓</Text>
        </View>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{currentUser?.studentId || 'VKU'}</Text>
        </View>
      </View>

      {/* Thanh tìm kiếm & bộ lọc đa tiêu chí (Debounce 300ms) */}
      <FilterBar />

      {/* Thông tin số lượng kết quả */}
      <View style={styles.resultInfoRow}>
        <Text style={styles.resultCountText}>
          Tìm thấy <Text style={styles.boldText}>{filteredRooms.length}</Text> phòng học
          phù hợp
        </Text>
      </View>

      {/* Danh sách phòng học với FlatList hiệu năng tối đa */}
      <FlatList
        data={filteredRooms}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  userBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  userBadgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  resultInfoRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCountText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
