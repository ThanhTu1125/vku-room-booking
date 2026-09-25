import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Booking, Room } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { COLORS } from '../constants/colors';
import { formatDisplayDate } from '../utils/dateHelpers';
import { getBookingDisplayStatus } from '../utils/bookingStatusHelper';

export interface BookingListItemProps {
  booking: Booking;
  room?: Room;
  onPressQR?: (booking: Booking, room?: Room) => void;
  onCancel?: (booking: Booking) => void;
}

const BookingListItemComponent: React.FC<BookingListItemProps> = ({
  booking,
  room,
  onPressQR,
  onCancel,
}) => {
  const slot = TIME_SLOTS.find(s => s.id === booking.timeSlotId);
  const timeSlotLabel =
    booking.timeSlotLabel ||
    (slot ? `${slot.startTime} - ${slot.endTime}` : booking.timeSlotId);
  const displayStatus = getBookingDisplayStatus(booking);

  // Badge trạng thái tính toán động
  let statusText = 'Sắp tới';
  let statusColor: string = COLORS.primary;
  let statusBg: string = COLORS.primarySoft;

  if (displayStatus === 'past') {
    statusText = 'Đã qua';
    statusColor = COLORS.textMuted;
    statusBg = COLORS.divider;
  } else if (displayStatus === 'cancelled') {
    statusText = 'Đã hủy';
    statusColor = COLORS.occupied;
    statusBg = COLORS.occupiedSoft;
  }

  const shortCode = (booking.id || '').slice(0, 8).toUpperCase();
  const roomNameDisplay = room?.name || booking.roomName || 'Phòng học VKU';
  const buildingDisplay = room?.building || booking.building || 'VKU';
  const floorDisplay = room?.floor || booking.floor || 1;

  return (
    <View style={styles.card}>
      {/* Header: Tên phòng & Trạng thái */}
      <View style={styles.headerRow}>
        <View style={styles.roomInfoWrap}>
          <Text style={styles.roomName} numberOfLines={1}>
            {roomNameDisplay}
          </Text>
          <Text style={styles.subLocation}>
            Tòa {buildingDisplay} • Tầng {floorDisplay} • Mã {shortCode}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Thông tin ngày & ca học */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Ngày học:</Text>
          <Text style={styles.detailValue}>{formatDisplayDate(booking.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⏰ Khung giờ:</Text>
          <View style={styles.slotBadge}>
            <Text style={styles.slotBadgeText}>{timeSlotLabel}</Text>
          </View>
        </View>
      </View>

      {/* Nút hành động */}
      <View style={styles.actionRow}>
        {/* Nút mở QR Pass */}
        <TouchableOpacity
          style={styles.qrPassButton}
          activeOpacity={0.8}
          onPress={() => onPressQR?.(booking, room)}
        >
          <Text style={styles.qrPassButtonText}>📱 Xem mã QR Pass</Text>
        </TouchableOpacity>

        {/* Nút Hủy đặt phòng (chỉ áp dụng cho ca SẮP TỚI, không cho hủy ca đã qua) */}
        {displayStatus === 'upcoming' && onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.8}
            onPress={() => onCancel(booking)}
          >
            <Text style={styles.cancelButtonText}>🗑️ Hủy đặt phòng</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// So sánh props để tránh re-render không cần thiết
export const BookingListItem = React.memo(BookingListItemComponent, (prev, next) => {
  return (
    prev.booking.id === next.booking.id &&
    prev.booking.status === next.booking.status &&
    prev.booking.date === next.booking.date &&
    prev.booking.timeSlotId === next.booking.timeSlotId &&
    getBookingDisplayStatus(prev.booking) === getBookingDisplayStatus(next.booking) &&
    prev.room?.id === next.room?.id
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  roomInfoWrap: {
    flex: 1,
    marginRight: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  subLocation: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 8,
  },
  detailsBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  slotBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  slotBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qrPassButton: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrPassButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.occupiedSoft,
    backgroundColor: COLORS.occupiedSoft,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.occupied,
    fontSize: 12,
    fontWeight: '700',
  },
});
