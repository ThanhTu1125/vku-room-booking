import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { TimeSlot } from '../types';
import { STANDARD_TIME_SLOTS } from '../utils/mockData';
import { useBookingStore } from '../store/useBookingStore';
import { isSlotInPast } from '../utils/dateUtils';
import { Clock, Lock, Check, AlertCircle } from 'lucide-react-native';

interface TimeSlotPickerProps {
  roomId: string;
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  roomId,
  selectedDate,
  selectedSlot,
  onSelectSlot,
}) => {
  const isSlotBooked = useBookingStore((state) => state.isSlotBooked);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Clock size={18} color="#2563EB" />
          <Text style={styles.title}>Khung giờ học khả dụng (2h/ca)</Text>
        </View>
        <Text style={styles.badgeInfo}>
          {STANDARD_TIME_SLOTS.length} ca trong ngày
        </Text>
      </View>

      <View style={styles.grid}>
        {STANDARD_TIME_SLOTS.map((slot) => {
          const booked = isSlotBooked(roomId, selectedDate, slot.startTime);
          const past = isSlotInPast(selectedDate, slot.startTime);
          const disabled = booked || past;
          const isSelected = selectedSlot?.id === slot.id && !disabled;

          let statusLabel = 'Còn trống';
          if (booked) {
            statusLabel = 'Đã đặt';
          } else if (past) {
            statusLabel = 'Đã qua';
          }

          return (
            <TouchableOpacity
              key={slot.id}
              disabled={disabled}
              onPress={() => onSelectSlot(slot)}
              activeOpacity={0.7}
              style={[
                styles.slotButton,
                disabled && styles.slotButtonDisabled,
                booked && styles.slotButtonBooked,
                isSelected && styles.slotButtonSelected,
              ]}
            >
              {/* Slot Time Header */}
              <View style={styles.slotHeader}>
                <Text
                  style={[
                    styles.slotTimeText,
                    disabled && styles.slotTextDisabled,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.startTime} – {slot.endTime}
                </Text>

                {isSelected ? (
                  <View style={styles.selectedIcon}>
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : booked ? (
                  <Lock size={13} color="#EF4444" />
                ) : past ? (
                  <AlertCircle size={13} color="#94A3B8" />
                ) : (
                  <View style={styles.availableDot} />
                )}
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  disabled && styles.statusBadgeDisabled,
                  booked && styles.statusBadgeBooked,
                  isSelected && styles.statusBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    disabled && styles.statusTextDisabled,
                    booked && styles.statusTextBooked,
                    isSelected && styles.statusTextSelected,
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Còn trống</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Đã có người đặt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
          <Text style={styles.legendText}>Đang chọn</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeInfo: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  slotButtonDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  slotButtonBooked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    opacity: 0.9,
  },
  slotButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTimeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotTextDisabled: {
    color: '#94A3B8',
  },
  slotTextSelected: {
    color: '#1D4ED8',
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  selectedIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
  },
  statusBadgeDisabled: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeBooked: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeSelected: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  statusTextDisabled: {
    color: '#64748B',
  },
  statusTextBooked: {
    color: '#DC2626',
  },
  statusTextSelected: {
    color: '#1E40AF',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
    paddingVertical: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});

