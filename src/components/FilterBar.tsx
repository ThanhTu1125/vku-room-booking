import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useBookingStore } from '../store/useBookingStore';
import { FilterChip } from './FilterChip';
import { BUILDINGS } from '../constants/buildings';
import { EQUIPMENT_LIST } from '../constants/equipment';
import { CAPACITY_RANGES, CapacityRange } from '../constants/capacityRanges';
import { COLORS } from '../constants/colors';
import { Building, Equipment } from '../types';

export const FilterBar: React.FC = () => {
  const filters = useBookingStore(state => state.filters);
  const setSearchText = useBookingStore(state => state.setSearchText);
  const toggleBuildingFilter = useBookingStore(state => state.toggleBuildingFilter);
  const toggleEquipmentFilter = useBookingStore(state => state.toggleEquipmentFilter);
  const setCapacityRange = useBookingStore(state => state.setCapacityRange);
  const resetFilters = useBookingStore(state => state.resetFilters);

  // State cục bộ cho ô tìm kiếm để phản hồi tức thì
  const [localSearch, setLocalSearch] = useState(filters.searchText);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đồng bộ nếu store bị reset từ bên ngoài
  useEffect(() => {
    setLocalSearch(filters.searchText);
  }, [filters.searchText]);

  // Xử lý debounce ~300ms trước khi đẩy vào store
  const handleTextChange = useCallback(
    (text: string) => {
      setLocalSearch(text);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setSearchText(text);
      }, 300);
    },
    [setSearchText]
  );

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleClearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setLocalSearch('');
    setSearchText('');
  }, [setSearchText]);

  // Kiểm tra trạng thái active của Capacity Range
  const isCapacityActive = useCallback(
    (range: CapacityRange) => {
      if (range.id === 'all') {
        return filters.capacityRange === null;
      }
      if (!filters.capacityRange) return false;
      return (
        filters.capacityRange[0] === range.min && filters.capacityRange[1] === range.max
      );
    },
    [filters.capacityRange]
  );

  const handleSelectCapacity = useCallback(
    (range: CapacityRange) => {
      if (range.id === 'all') {
        setCapacityRange(null);
      } else {
        // Toggle nếu đang chọn chính nó thì đưa về null
        if (
          filters.capacityRange &&
          filters.capacityRange[0] === range.min &&
          filters.capacityRange[1] === range.max
        ) {
          setCapacityRange(null);
        } else {
          setCapacityRange([range.min, range.max]);
        }
      }
    },
    [filters.capacityRange, setCapacityRange]
  );

  const hasActiveFilters =
    filters.searchText.trim().length > 0 ||
    filters.buildings.length > 0 ||
    filters.capacityRange !== null ||
    filters.equipment.length > 0;

  return (
    <View style={styles.container}>
      {/* 1. Ô tìm kiếm với debounce */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Tìm theo tên phòng, mã phòng..."
            placeholderTextColor={COLORS.textSubtle}
            style={styles.searchInput}
            value={localSearch}
            onChangeText={handleTextChange}
            clearButtonMode="never"
            autoCorrect={false}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Hàng FilterChip cuộn ngang gồm Tòa nhà, Sức chứa, Thiết bị */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScrollContent}
      >
        {/* Nút Reset bộ lọc nhanh khi đang có filter */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.resetChip}
            onPress={resetFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.resetChipText}>↺ Xóa lọc</Text>
          </TouchableOpacity>
        )}

        {/* Nhóm lọc Tòa Nhà */}
        <View style={styles.groupDivider} />
        <Text style={styles.categoryLabel}>Tòa:</Text>
        {BUILDINGS.map(b => (
          <FilterChip
            key={`b-${b}`}
            label={`Tòa ${b}`}
            isActive={filters.buildings.includes(b as Building)}
            onPress={() => toggleBuildingFilter(b as Building)}
          />
        ))}

        {/* Nhóm lọc Sức chứa */}
        <View style={styles.groupDivider} />
        <Text style={styles.categoryLabel}>Sức chứa:</Text>
        {CAPACITY_RANGES.map(range => (
          <FilterChip
            key={`cap-${range.id}`}
            label={range.label}
            isActive={isCapacityActive(range)}
            onPress={() => handleSelectCapacity(range)}
          />
        ))}

        {/* Nhóm lọc Trang thiết bị */}
        <View style={styles.groupDivider} />
        <Text style={styles.categoryLabel}>Thiết bị:</Text>
        {EQUIPMENT_LIST.map(eq => (
          <FilterChip
            key={`eq-${eq}`}
            label={eq}
            isActive={filters.equipment.includes(eq as Equipment)}
            onPress={() => toggleEquipmentFilter(eq as Equipment)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  groupDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 6,
  },
  resetChip: {
    backgroundColor: COLORS.occupiedSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 4,
    borderWidth: 1,
    borderColor: COLORS.occupied,
  },
  resetChipText: {
    fontSize: 12,
    color: COLORS.occupied,
    fontWeight: '700',
  },
});
