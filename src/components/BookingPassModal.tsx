import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Booking } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  AlertTriangle,
  QrCode,
  Sparkles,
} from 'lucide-react-native';

interface BookingPassModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onCancelBooking?: (bookingId: string) => void;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({
  visible,
  booking,
  onClose,
  onCancelBooking,
}) => {
  if (!booking) return null;

  const handleCancelPress = () => {
    Alert.alert(
      'Hủy lịch đặt phòng',
      `Bạn có chắc chắn muốn hủy lịch tại ${booking.roomName} lúc ${booking.timeSlot.label}? Khung giờ sẽ được giải phóng cho sinh viên khác.`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Xác nhận hủy',
          style: 'destructive',
          onPress: () => {
            if (onCancelBooking) {
              onCancelBooking(booking.id);
            }
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header with Close */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={20} color="#2563EB" />
              <Text style={styles.headerTitle}>Thẻ Check-in Phòng Học</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Ticket Card Container */}
            <View style={styles.ticketCard}>
              {/* Top part: Room info & Status */}
              <View style={styles.ticketTop}>
                <View style={styles.statusPill}>
                  <CheckCircle2 size={13} color="#10B981" />
                  <Text style={styles.statusPillText}>ĐẶT PHÒNG THÀNH CÔNG</Text>
                </View>

                <Text style={styles.roomName}>{booking.roomName}</Text>

                <View style={styles.locationRow}>
                  <MapPin size={15} color="#2563EB" />
                  <Text style={styles.locationText}>
                    Tòa nhà {booking.building} • Tầng {booking.floor} (Khuôn viên VKU)
                  </Text>
                </View>
              </View>

              {/* Dotted Divider with ticket notches */}
              <View style={styles.notchDividerWrapper}>
                <View style={[styles.notch, styles.notchLeft]} />
                <View style={styles.dashedLine} />
                <View style={[styles.notch, styles.notchRight]} />
              </View>

              {/* Middle part: QR Code */}
              <View style={styles.qrSection}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={booking.qrCode || `VKU-PASS-${booking.id}`}
                    size={170}
                    color="#0F172A"
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <View style={styles.qrLabelRow}>
                  <QrCode size={14} color="#64748B" />
                  <Text style={styles.qrLabelText}>
                    Mã xác thực: {booking.id.substring(0, 16)}...
                  </Text>
                </View>
                <Text style={styles.qrInstruction}>
                  Quét mã QR tại máy quét cửa phòng hoặc xuất trình cho quản lý VKU để mở khóa.
                </Text>
              </View>

              {/* Bottom part: Details Grid */}
              <View style={styles.ticketBottom}>
                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <View style={styles.detailLabelGroup}>
                      <Calendar size={13} color="#64748B" />
                      <Text style={styles.detailLabel}>NGÀY SỬ DỤNG</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {formatDisplayDate(booking.date)}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <View style={styles.detailLabelGroup}>
                      <Clock size={13} color="#64748B" />
                      <Text style={styles.detailLabel}>KHUNG GIỜ</Text>
                    </View>
                    <Text style={[styles.detailValue, styles.highlightSlot]}>
                      {booking.timeSlot.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.dividerInner} />

                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <View style={styles.detailLabelGroup}>
                      <User size={13} color="#64748B" />
                      <Text style={styles.detailLabel}>SINH VIÊN</Text>
                    </View>
                    <Text style={styles.detailValue}>{booking.userName}</Text>
                  </View>

                  <View style={styles.detailCol}>
                    <View style={styles.detailLabelGroup}>
                      <GraduationCap size={13} color="#64748B" />
                      <Text style={styles.detailLabel}>MÃ SỐ SV (MSSV)</Text>
                    </View>
                    <Text style={styles.detailValue}>{booking.userStudentId}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.doneButtonText}>Hoàn tất / Đóng thẻ</Text>
              </TouchableOpacity>

              {onCancelBooking && booking.status === 'confirmed' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancelPress}
                  activeOpacity={0.7}
                >
                  <AlertTriangle size={15} color="#EF4444" />
                  <Text style={styles.cancelBtnText}>Hủy lịch đặt phòng này</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketTop: {
    padding: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  notchDividerWrapper: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  notch: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    zIndex: 2,
  },
  notchLeft: {
    left: -12,
  },
  notchRight: {
    right: -12,
  },
  dashedLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  qrWrapper: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  qrLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  qrLabelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  qrInstruction: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
  },
  ticketBottom: {
    padding: 18,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  highlightSlot: {
    color: '#2563EB',
  },
  dividerInner: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  actionButtons: {
    marginTop: 20,
    gap: 12,
  },
  doneButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});

