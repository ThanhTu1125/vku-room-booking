import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBookingStore } from '../store/useBookingStore';
import { COLORS } from '../constants/colors';

export interface TimeSlotGridProps {
  roomId: string;
  selectedDate: string;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  roomId,
  selectedDate,
  selectedSlotId,
  onSelectSlot,
}) => {
  // Đăng ký lắng nghe bookings và hàm query từ store để trigger real-time re-render
  const bookings = useBookingStore(state => state.bookings);
  const getAvailableSlotsForRoom = useBookingStore(
    state => state.getAvailableSlotsForRoom
  );

  // Tính toán lại danh sách slot ngay lập tức khi roomId, selectedDate hoặc bookings thay đổi
  const slotItems = useMemo(() => {
    return getAvailableSlotsForRoom(roomId, selectedDate);
  }, [getAvailableSlotsForRoom, roomId, selectedDate, bookings]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>⏰ Chọn khung giờ học (2 tiếng/ca)</Text>
        <Text style={styles.subNote}>Chọn 1 ca còn trống</Text>
      </View>

      {/* Lưới 2x2 các khung giờ */}
      <View style={styles.grid}>
        {slotItems.map(({ slot, isBooked }) => {
          const isSelected = selectedSlotId === slot.id;

          return (
            <TouchableOpacity
              key={slot.id}
              activeOpacity={0.75}
              disabled={isBooked}
              onPress={() => onSelectSlot(slot.id)}
              style={[
                styles.slotCard,
                isBooked
                  ? styles.slotCardBooked
                  : isSelected
                    ? styles.slotCardSelected
                    : styles.slotCardAvailable,
              ]}
            >
              <View style={styles.slotHeader}>
                <Text
                  style={[
                    styles.slotIdText,
                    isBooked
                      ? styles.textBooked
                      : isSelected
                        ? styles.textSelectedLight
                        : styles.textAvailableSub,
                  ]}
                >
                  {slot.id.toUpperCase()}
                </Text>

                {/* Badge trạng thái ca học */}
                {isBooked ? (
                  <View style={styles.bookedBadge}>
                    <Text style={styles.bookedBadgeText}>🔒 Đã đặt</Text>
                  </View>
                ) : isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓ Đang chọn</Text>
                  </View>
                ) : (
                  <View style={styles.availableBadge}>
                    <Text style={styles.availableBadgeText}>Còn trống</Text>
                  </View>
                )}
              </View>

              {/* Giờ bắt đầu - kết thúc */}
              <Text
                style={[
                  styles.timeRangeText,
                  isBooked
                    ? styles.textBooked
                    : isSelected
                      ? styles.textSelected
                      : styles.textAvailableMain,
                ]}
              >
                {slot.startTime} - {slot.endTime}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  subNote: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  slotCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 82,
    justifyContent: 'space-between',
  },
  slotCardAvailable: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  slotCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  slotCardBooked: {
    backgroundColor: COLORS.disabledBackground,
    borderColor: COLORS.border,
    opacity: 0.65,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotIdText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookedBadge: {
    backgroundColor: COLORS.occupiedSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookedBadgeText: {
    color: COLORS.occupied,
    fontSize: 10,
    fontWeight: '700',
  },
  selectedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  availableBadge: {
    backgroundColor: COLORS.availableSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  availableBadgeText: {
    color: COLORS.available,
    fontSize: 10,
    fontWeight: '600',
  },
  timeRangeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  textAvailableMain: {
    color: COLORS.text,
  },
  textAvailableSub: {
    color: COLORS.textMuted,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textSelectedLight: {
    color: '#BFDBFE',
  },
  textBooked: {
    color: COLORS.textSubtle,
  },
});
