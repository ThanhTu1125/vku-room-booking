import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BuildingCode, EquipmentType } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { X, SlidersHorizontal } from 'lucide-react-native';

const BUILDINGS: BuildingCode[] = ['All', 'A', 'B', 'C', 'V'];

const CAPACITY_OPTIONS: { label: string; value: 'all' | 'small' | 'medium' | 'large' }[] = [
  { label: 'Tất cả sức chứa', value: 'all' },
  { label: '< 6 chỗ (Nhóm nhỏ)', value: 'small' },
  { label: '6 - 10 chỗ (Vừa)', value: 'medium' },
  { label: '> 10 chỗ (Hội thảo)', value: 'large' },
];

const POPULAR_EQUIPMENT: EquipmentType[] = [
  'Projector',
  'Smart TV',
  'Whiteboard',
  'High-Speed LAN',
  'Air Conditioner',
  'Sound System',
];

export const FilterChips: React.FC = () => {
  const filters = useBookingStore((state) => state.filters);
  const setFilter = useBookingStore((state) => state.setFilter);
  const resetFilters = useBookingStore((state) => state.resetFilters);
  const toggleEquipment = useBookingStore((state) => state.toggleEquipmentFilter);

  const hasActiveFilters =
    filters.building !== 'All' ||
    filters.capacityCategory !== 'all' ||
    filters.equipment.length > 0 ||
    filters.searchQuery !== '';

  return (
    <View style={styles.container}>
      {/* Buildings Bar */}
      <View style={styles.rowWrapper}>
        <Text style={styles.sectionLabel}>Tòa nhà:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {BUILDINGS.map((b) => {
            const isSelected = filters.building === b;
            return (
              <TouchableOpacity
                key={b}
                onPress={() => setFilter({ building: b })}
                activeOpacity={0.7}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {b === 'All' ? 'Tất cả tòa' : `Tòa ${b}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Capacity & Equipment Filter Bar */}
      <View style={styles.rowWrapper}>
        <Text style={styles.sectionLabel}>Sức chứa:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {CAPACITY_OPTIONS.map((cap) => {
            const isSelected = filters.capacityCategory === cap.value;
            return (
              <TouchableOpacity
                key={cap.value}
                onPress={() => setFilter({ capacityCategory: cap.value })}
                activeOpacity={0.7}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {cap.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Equipment Badges Scroll */}
      <View style={styles.rowWrapper}>
        <Text style={styles.sectionLabel}>Tiện ích:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {POPULAR_EQUIPMENT.map((eq) => {
            const isSelected = filters.equipment.includes(eq);
            return (
              <TouchableOpacity
                key={eq}
                onPress={() => toggleEquipment(eq)}
                activeOpacity={0.7}
                style={[styles.chip, isSelected && styles.chipActiveEquipment]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextActiveEquipment,
                  ]}
                >
                  {eq}
                </Text>
              </TouchableOpacity>
            );
          })}

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={resetFilters}
              activeOpacity={0.7}
              style={styles.resetButton}
            >
              <X size={14} color="#EF4444" />
              <Text style={styles.resetText}>Xóa lọc</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    width: 68,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollList: {
    gap: 8,
    alignItems: 'center',
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  chipActiveEquipment: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipTextActiveEquipment: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  resetText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
});

