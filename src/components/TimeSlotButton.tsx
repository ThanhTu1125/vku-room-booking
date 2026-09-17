import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { TimeSlot } from '../types';
import { SlotAvailabilityStatus } from '../utils/conflictChecker';
import { formatSlotLabel } from '../utils/dateHelpers';
import { COLORS } from '../constants/colors';

interface TimeSlotButtonProps {
  slot: TimeSlot;
  status: SlotAvailabilityStatus;
  isSelected: boolean;
  onPress: () => void;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = ({
  slot,
  status,
  isSelected,
  onPress,
}) => {
  const isAvailable = status === 'AVAILABLE';
  const isBooked = status === 'BOOKED';
  const isPast = status === 'PAST';

  let statusLabel = 'Còn trống';
  let badgeColor: string = COLORS.available;
  let badgeBg: string = COLORS.availableSoft;

  if (isBooked) {
    statusLabel = 'Đã đặt';
    badgeColor = COLORS.occupied;
    badgeBg = COLORS.occupiedSoft;
  } else if (isPast) {
    statusLabel = 'Đã qua';
    badgeColor = COLORS.textSubtle;
    badgeBg = COLORS.disabledBackground;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!isAvailable}
      onPress={onPress}
      style={[
        styles.container,
        isAvailable && styles.containerAvailable,
        isSelected && styles.containerSelected,
        !isAvailable && styles.containerDisabled,
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.slotLabel,
            isSelected && styles.textSelected,
            !isAvailable && styles.textDisabled,
          ]}
        >
          {formatSlotLabel(slot)}
        </Text>
        <Text
          style={[
            styles.timeRange,
            isSelected && styles.textSelectedSecondary,
            !isAvailable && styles.textDisabled,
          ]}
        >
          {slot.startTime} - {slot.endTime} (2 tiếng)
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : badgeBg },
        ]}
      >
        <Text style={[styles.badgeText, { color: isSelected ? '#FFFFFF' : badgeColor }]}>
          {isSelected ? 'Đang chọn' : statusLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  containerAvailable: {
    borderColor: COLORS.border,
  },
  containerSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  containerDisabled: {
    backgroundColor: COLORS.disabledBackground,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  timeRange: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textSelectedSecondary: {
    color: '#E0E7FF',
  },
  textDisabled: {
    color: COLORS.textSubtle,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
