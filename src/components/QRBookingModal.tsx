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
import QRCode from 'react-native-qrcode-svg';
import { Booking, Room } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { COLORS } from '../constants/colors';
import { formatDisplayDate } from '../utils/dateHelpers';
import { getBookingDisplayStatus } from '../utils/bookingStatusHelper';
import { useBookingStore } from '../store/useBookingStore';

export interface QRBookingModalProps {
  visible: boolean;
  booking: Booking | null;
  room: Room | null;
  onClose: () => void;
}

export const QRBookingModal: React.FC<QRBookingModalProps> = ({
  visible,
  booking,
  room,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const currentUser = useBookingStore(state => state.currentUser);

  if (!booking) return null;

  const slot = TIME_SLOTS.find(s => s.id === booking.timeSlotId);
  const timeSlotLabel =
    booking.timeSlotLabel ||
    (slot ? `${slot.startTime} - ${slot.endTime}` : booking.timeSlotId);
  const shortBookingId = (booking.id || '').slice(0, 8).toUpperCase();
  const dateFormatted = formatDisplayDate(booking.date);
  const displayStatus = getBookingDisplayStatus(booking);

  // Cấu hình nhãn và màu sắc theo trạng thái booking động
  const getStatusBadgeConfig = () => {
    switch (displayStatus) {
      case 'cancelled':
        return {
          text: '✕ ĐÃ HỦY LỊCH',
          bgColor: COLORS.occupiedSoft,
          textColor: COLORS.occupied,
        };
      case 'past':
        return {
          text: 'ĐÃ QUA GIỜ',
          bgColor: COLORS.divider,
          textColor: COLORS.textMuted,
        };
      case 'upcoming':
      default:
        return {
          text: 'CHỜ CHECK-IN',
          bgColor: COLORS.primarySoft,
          textColor: COLORS.primary,
        };
    }
  };

  const statusConfig = getStatusBadgeConfig();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={[
          styles.overlay,
          {
            paddingBottom: Math.max(insets.bottom, 16) + 4,
            paddingTop: Math.max(insets.top, 16) + 4,
          },
        ]}
        onPress={onClose}
      >
        <Pressable
          style={[styles.passCard, { maxHeight: '92%' }]}
          onPress={e => e.stopPropagation()}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContent}
          >
            {/* Header vé: Logo & Thông tin trường */}
            <View style={styles.header}>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.passBadge}>VKU SMART PASS</Text>
                <Text style={styles.title}>Vé Đặt Phòng Học</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Phần thông tin phòng học */}
            <View style={styles.roomSection}>
              <Text style={styles.roomName} numberOfLines={1}>
                {room?.name || booking.roomName || 'Phòng học VKU'}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.locationBadge}>
                  <Text style={styles.locationBadgeText}>
                    Tòa {room?.building || booking.building || 'A'} • Tầng{' '}
                    {room?.floor || booking.floor || 1}
                  </Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}
                >
                  <Text
                    style={[styles.statusBadgeText, { color: statusConfig.textColor }]}
                  >
                    {statusConfig.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* Đường kẻ răng cưa / vé cắt (Ticket Divider) */}
            <View style={styles.ticketDividerContainer}>
              <View style={styles.notchLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.notchRight} />
            </View>

            {/* Chi tiết ca học & ngày mượn */}
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Thời gian & Khung giờ:</Text>
              <Text style={styles.timeValue}>
                {dateFormatted} · {timeSlotLabel}
              </Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Mã vé: </Text>
                <Text style={styles.codeHighlight}>{shortBookingId}</Text>
                <Text style={styles.studentLabel}>
                  {' '}
                  • Sinh viên: {currentUser?.studentId || 'VKU'}
                </Text>
              </View>
            </View>

            {/* Mã QR trung tâm (Booking Pass QR Code) */}
            <View style={styles.qrContainer}>
              <View style={styles.qrWhiteBox}>
                <QRCode
                  value={booking.qrPayload || booking.id}
                  size={180}
                  color={COLORS.text}
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.qrHint}>
                Quét mã QR tại cửa phòng học để tự động mở khóa phòng
              </Text>
            </View>

            {/* Nút Đóng vé */}
            <TouchableOpacity
              style={styles.closeActionButton}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={styles.closeActionText}>Đóng vé</Text>
            </TouchableOpacity>
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
    padding: 18,
  },
  passCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  passBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  roomSection: {
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: -20,
  },
  notchLeft: {
    width: 14,
    height: 24,
    backgroundColor: COLORS.overlay,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  notchRight: {
    width: 14,
    height: 24,
    backgroundColor: COLORS.overlay,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  timeSection: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  codeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  codeHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  studentLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  qrWhiteBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  qrHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 8,
    lineHeight: 16,
  },
  closeActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  closeActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
