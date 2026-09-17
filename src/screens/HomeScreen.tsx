import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useRooms } from '../hooks/useRooms';
import { useFilterStore } from '../store/useFilterStore';
import { useBookingStore } from '../store/useBookingStore';
import { RoomCard } from '../components/RoomCard';
import { DateSelector } from '../components/DateSelector';
import { FilterChip } from '../components/FilterChip';
import { BUILDINGS } from '../constants/buildings';
import { COLORS } from '../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useBookingStore(state => state.currentUser);

  const { filteredRooms, selectedDate, activeFilterCount } = useRooms();

  const selectedBuilding = useFilterStore(state => state.selectedBuilding);
  const setBuilding = useFilterStore(state => state.setBuilding);
  const setDate = useFilterStore(state => state.setDate);
  const searchQuery = useFilterStore(state => state.searchQuery);
  const setSearchQuery = useFilterStore(state => state.setSearchQuery);
  const resetFilters = useFilterStore(state => state.resetFilters);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeSubtitle}>Hệ thống Đặt phòng học</Text>
          <Text style={styles.welcomeTitle}>VKU Study Space 🎓</Text>
        </View>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{currentUser.studentId || '23IT'}</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Tìm theo tên phòng, mã phòng, tầng..."
            placeholderTextColor={COLORS.textSubtle}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date Selector Row */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📅 Chọn ngày đặt phòng</Text>
      </View>
      <DateSelector selectedDate={selectedDate} onSelectDate={setDate} />

      {/* Building Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          data={BUILDINGS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <FilterChip
              label={item.shortName}
              isSelected={selectedBuilding === item.id}
              onPress={() => setBuilding(item.id)}
            />
          )}
        />
      </View>

      {/* Room Count & Reset Button */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCount}>
          Tìm thấy <Text style={styles.bold}>{filteredRooms.length}</Text> phòng khả dụng
        </Text>
        {activeFilterCount > 0 && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetFilterText}>Đặt lại bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.roomList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            availableSlotsCount={item.availableSlotsCount}
            totalSlotsCount={item.totalSlotsCount}
            onPress={() =>
              navigation.navigate('RoomDetail', {
                roomId: item.id,
                initialDate: selectedDate,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏢</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
            <Text style={styles.emptySubtitle}>
              Hãy thử chọn ngày khác hoặc bỏ bớt các tiêu chí lọc tòa nhà.
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetBtnText}>Xem tất cả phòng</Text>
            </TouchableOpacity>
          </View>
        }
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
    paddingBottom: 12,
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
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  clearSearchIcon: {
    fontSize: 14,
    color: COLORS.textSubtle,
    padding: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterSection: {
    marginVertical: 4,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  resetFilterText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  roomList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
