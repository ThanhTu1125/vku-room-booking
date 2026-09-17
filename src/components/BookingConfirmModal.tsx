import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Room, TimeSlot, User } from '../types';
import { COLORS } from '../constants/colors';
import { formatDisplayDate } from '../utils/dateHelpers';

export interface BookingConfirmModalProps {
  visible: boolean;
  room: Room;
  date: string;
  timeSlot: TimeSlot | null;
  currentUser: User | null;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  visible,
  room,
  date,
  timeSlot,
  currentUser,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!timeSlot) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>📋</Text>
            <Text style={styles.title}>Xác Nhận Đặt Phòng</Text>
            <Text style={styles.subtitle}>
              Vui lòng kiểm tra lại thông tin trước khi giữ chỗ
            </Text>
          </View>

          {/* Booking Summary Card */}
          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Phòng học:</Text>
              <Text style={styles.valueHighlight} numberOfLines={1}>
                {room.name}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Vị trí:</Text>
              <Text style={styles.value}>
                Tòa {room.building} • Tầng {room.floor}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ngày mượn:</Text>
              <Text style={styles.value}>{formatDisplayDate(date)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Khung giờ:</Text>
              <View style={styles.slotBadge}>
                <Text style={styles.slotBadgeText}>
                  {timeSlot.startTime} - {timeSlot.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Sinh viên:</Text>
              <Text style={styles.value}>
                {currentUser?.name || 'Sinh viên VKU'} (
                {currentUser?.studentId || '23IT296'})
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Quy định:</Text>
              <Text style={styles.subRule}>Check-in bằng QR trong 15 phút đầu</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              <Text style={styles.confirmButtonText}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt'}
              </Text>
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
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  slotBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  subRule: {
    fontSize: 11,
    color: COLORS.occupiedWarning,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.divider,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1.6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
