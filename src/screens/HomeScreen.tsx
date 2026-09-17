import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Room } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { FilterChips } from '../components/FilterChips';
import { RoomCard, ROOM_CARD_HEIGHT } from '../components/RoomCard';
import {
  Search,
  X,
  Ticket,
  Sparkles,
  Building,
} from 'lucide-react-native';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useBookingStore((state) => state.userSession);
  const bookings = useBookingStore((state) => state.bookings);
  const filters = useBookingStore((state) => state.filters);
  const setFilter = useBookingStore((state) => state.setFilter);
  const resetFilters = useBookingStore((state) => state.resetFilters);
  const getFilteredRooms = useBookingStore((state) => state.getFilteredRooms);

  // Active user bookings count
  const activeBookingsCount = useMemo(
    () =>
      bookings.filter((b) => b.userId === user.id && b.status === 'confirmed').length,
    [bookings, user.id]
  );

  // Compute filtered rooms list
  const filteredRooms = getFilteredRooms();

  const handleRoomPress = useCallback(
    (roomId: string) => {
      navigation.navigate('RoomDetail', { roomId });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Room }) => {
      return <RoomCard room={item} onPress={handleRoomPress} />;
    },
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  // Performance-optimized layout calculation for FlatList (60fps scrolling)
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ROOM_CARD_HEIGHT + 16,
      offset: (ROOM_CARD_HEIGHT + 16) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.userProfile}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.greetingContainer}>
            <View style={styles.greetingTitleRow}>
              <Text style={styles.greetingText}>Xin chào,</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <Text style={styles.studentIdBadge}>
              VKU • {user.studentId}
            </Text>
          </View>
        </View>

        {/* My Bookings Ticket Button */}
        <TouchableOpacity
          style={styles.myBookingsBtn}
          onPress={() => navigation.navigate('MyBookings')}
          activeOpacity={0.8}
        >
          <Ticket size={20} color="#2563EB" />
          {activeBookingsCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{activeBookingsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm theo mã phòng, tên phòng (A.101, Lab...)"
            placeholderTextColor="#94A3B8"
            value={filters.searchQuery}
            onChangeText={(text) => setFilter({ searchQuery: text })}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {filters.searchQuery.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity
              onPress={() => setFilter({ searchQuery: '' })}
              style={styles.clearSearchBtn}
            >
              <X size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips Component */}
      <FilterChips />

      {/* Section Subtitle */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={16} color="#2563EB" />
          <Text style={styles.sectionTitle}>Danh sách phòng học VKU</Text>
        </View>
        <Text style={styles.roomCountText}>
          {filteredRooms.length} phòng khả dụng
        </Text>
      </View>

      {/* Optimized FlatList */}
      <FlatList
        data={filteredRooms}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thử chọn tòa nhà khác hoặc bỏ bớt tiêu chí lọc tiện ích.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentIdBadge: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 1,
  },
  myBookingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchBtn: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  roomCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

