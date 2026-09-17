import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Booking, Room } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { COLORS } from '../constants/colors';
import { formatDisplayDate, formatSlotLabel } from '../utils/dateHelpers';
import { useBookingStore } from '../store/useBookingStore';

interface QRModalProps {
  visible: boolean;
  booking: Booking | null;
  room?: Room | null;
  onClose: () => void;
  onCheckIn?: (bookingId: string) => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  visible,
  booking,
  room,
  onClose,
  onCheckIn,
}) => {
  const currentUser = useBookingStore(state => state.currentUser);

  if (!booking) return null;

  const isCheckedIn = booking.status === 'checked-in';
  const slot = TIME_SLOTS.find(s => s.id === booking.timeSlotId);
  const timeText = slot ? formatSlotLabel(slot) : booking.timeSlotId;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Vé Check-in Phòng Học</Text>
              <Text style={styles.subtitle}>Mã vé: {booking.id}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={booking.qrPayload || booking.id}
                size={180}
                color={COLORS.text}
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.qrInstruction}>
              Đưa mã này trước máy quét tại cửa phòng học để mở khóa cửa tự động.
            </Text>
          </View>

          {/* Ticket Information */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phòng học:</Text>
              <Text style={styles.infoValue}>
                {room ? `${room.name} (Tòa ${room.building})` : booking.roomId}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian:</Text>
              <Text style={styles.infoValue}>{timeText}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày:</Text>
              <Text style={styles.infoValue}>{formatDisplayDate(booking.date)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sinh viên:</Text>
              <Text style={styles.infoValue}>
                {currentUser?.name || 'Sinh viên VKU'} (
                {currentUser?.studentId || '23IT296'})
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isCheckedIn
                      ? COLORS.successSoft
                      : COLORS.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isCheckedIn ? COLORS.success : COLORS.primary,
                    },
                  ]}
                >
                  {isCheckedIn ? '✓ Đã Check-in' : 'Chờ Check-in'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {!isCheckedIn && onCheckIn && (
              <TouchableOpacity
                style={styles.checkInButton}
                activeOpacity={0.8}
                onPress={() => {
                  onCheckIn(booking.id);
                }}
              >
                <Text style={styles.checkInButtonText}>Mô phỏng Quét Check-in</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.doneButton}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  qrWrapper: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  qrInstruction: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  infoSection: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    marginTop: 8,
  },
  checkInButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: COLORS.divider,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
