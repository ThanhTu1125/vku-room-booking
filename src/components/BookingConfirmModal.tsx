import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  if (!timeSlot) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={[
          styles.overlay,
          {
            paddingBottom: Math.max(insets.bottom, 20) + 4,
            paddingTop: Math.max(insets.top, 20) + 4,
          },
        ]}
        onPress={onCancel}
      >
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContent}
          >
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
                <Text style={styles.valueTime}>
                  {timeSlot.startTime} - {timeSlot.endTime}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Người đặt:</Text>
                <Text style={styles.value}>{currentUser?.name || 'Sinh viên VKU'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>MSSV:</Text>
                <Text style={styles.value}>{currentUser?.studentId || '23IT296'}</Text>
              </View>
            </View>

            {/* Warning Note */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                ⚠️ Lưu ý: Bạn cần có mặt và quét mã QR check-in trong vòng 15 phút đầu của
                ca học để hệ thống xác nhận giữ phòng.
              </Text>
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
                style={[
                  styles.confirmButton,
                  isSubmitting && styles.confirmButtonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={onConfirm}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmButtonText}>
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  cardScrollContent: {
    padding: 22,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  valueTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  noticeBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 13,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
