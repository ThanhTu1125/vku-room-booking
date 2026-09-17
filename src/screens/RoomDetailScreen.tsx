import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TimeSlot, Booking } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { DateSelector } from '../components/DateSelector';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { BookingPassModal } from '../components/BookingPassModal';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  ArrowLeft,
  Users,
  Building2,
  Layers,
  CheckCircle2,
  Sun,
  Wifi,
  Tv,
  Projector,
  Wind,
  Volume2,
  Zap,
  Mic,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react-native';

type RoomDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'RoomDetail'
>;

const getEquipmentIcon = (name: string) => {
  switch (name) {
    case 'Projector':
      return <Projector size={16} color="#2563EB" />;
    case 'Smart TV':
      return <Tv size={16} color="#2563EB" />;
    case 'High-Speed LAN':
      return <Wifi size={16} color="#2563EB" />;
    case 'Air Conditioner':
      return <Wind size={16} color="#2563EB" />;
    case 'Sound System':
      return <Volume2 size={16} color="#2563EB" />;
    case 'Power Outlets':
      return <Zap size={16} color="#2563EB" />;
    case 'Conference Mic':
      return <Mic size={16} color="#2563EB" />;
    default:
      return <CheckCircle2 size={16} color="#2563EB" />;
  }
};

export const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { roomId } = route.params;

  // Store access
  const room = useBookingStore((state) => state.getRoomById(roomId));
  const bookRoom = useBookingStore((state) => state.bookRoom);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  const isSlotBooked = useBookingStore((state) => state.isSlotBooked);

  // Local interaction state
  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pass Modal state
  const [passModalVisible, setPassModalVisible] = useState<boolean>(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  if (!room) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy phòng học.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    // If selected slot is already booked on the newly selected date, reset selection
    if (selectedSlot && isSlotBooked(room.id, newDate, selectedSlot.startTime)) {
      setSelectedSlot(null);
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn khung giờ', 'Vui lòng chọn 1 khung giờ học 2 tiếng khả dụng.');
      return;
    }

    // Atomic conflict verification
    if (isSlotBooked(room.id, selectedDate, selectedSlot.startTime)) {
      Alert.alert(
        'Khung giờ đã bị trùng!',
        `Khung giờ ${selectedSlot.label} vào ngày này vừa được người khác đặt. Vui lòng chọn ca học khác.`
      );
      setSelectedSlot(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await bookRoom(room.id, selectedDate, selectedSlot);

      if (result.success && result.booking) {
        setCurrentBooking(result.booking);
        setPassModalVisible(true);
        setSelectedSlot(null); // Reset selection
      } else {
        Alert.alert('Lỗi đặt phòng', result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err: any) {
      Alert.alert('Lỗi hệ thống', err.message || 'Không thể hoàn tất đặt phòng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Room Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image source={{ uri: room.image }} style={styles.heroImage} />

          {/* Top floating back button */}
          <TouchableOpacity
            style={styles.floatingBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>

          {/* Floating Building pill */}
          <View style={styles.buildingTag}>
            <Building2 size={13} color="#FFFFFF" />
            <Text style={styles.buildingTagText}>
              Tòa {room.building} • Tầng {room.floor}
            </Text>
          </View>
        </View>

        {/* Room Header Info */}
        <View style={styles.roomHeaderSection}>
          <View style={styles.roomTitleRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{room.code}</Text>
            </View>
            <View style={styles.roomTitleCol}>
              <Text style={styles.roomNameText}>{room.name}</Text>
              <Text style={styles.campusSubtitle}>
                Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)
              </Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>{room.description}</Text>

          {/* Spec Cards Row */}
          <View style={styles.specCardsRow}>
            <View style={styles.specCard}>
              <Users size={20} color="#2563EB" />
              <Text style={styles.specValue}>{room.capacity} Người</Text>
              <Text style={styles.specLabel}>Sức chứa tối đa</Text>
            </View>

            <View style={styles.specCard}>
              <Layers size={20} color="#059669" />
              <Text style={styles.specValue}>Tầng {room.floor}</Text>
              <Text style={styles.specLabel}>Vị trí tầng</Text>
            </View>

            <View style={styles.specCard}>
              <Sun size={20} color="#D97706" />
              <Text style={styles.specValue}>{room.lightingType || 'Tự nhiên'}</Text>
              <Text style={styles.specLabel}>Ánh sáng</Text>
            </View>
          </View>
        </View>

        {/* Equipment Badges Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>Trang thiết bị & Tiện nghi</Text>
          <View style={styles.equipmentGrid}>
            {room.equipment.map((item) => (
              <View key={item} style={styles.equipmentItem}>
                <View style={styles.equipIconBox}>{getEquipmentIcon(item)}</View>
                <Text style={styles.equipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7-Day Interactive Date Selector */}
        <View style={styles.sectionBlock}>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
          />
        </View>

        {/* Discrete 2-Hour Time Slots with conflict lock */}
        <View style={styles.sectionBlock}>
          <TimeSlotPicker
            roomId={room.id}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </View>

        {/* Conflict Notice Info Box */}
        <View style={styles.noticeBox}>
          <ShieldAlert size={18} color="#2563EB" />
          <Text style={styles.noticeText}>
            Hệ thống áp dụng cơ chế tự động chống xung đột lịch (Conflict Prevention).
            Mỗi phiên học cố định 2 giờ và yêu cầu quét QR check-in đúng giờ.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Booking Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.summaryCol}>
          <Text style={styles.summaryDateLabel}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <Text style={styles.summarySlotValue}>
            {selectedSlot ? selectedSlot.label : 'Chưa chọn ca học'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmBookingBtn,
            (!selectedSlot || isSubmitting) && styles.confirmBookingBtnDisabled,
          ]}
          disabled={!selectedSlot || isSubmitting}
          onPress={handleBookingConfirm}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <CalendarCheck size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Xác nhận đặt</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Booking Pass Modal */}
      <BookingPassModal
        visible={passModalVisible}
        booking={currentBooking}
        onClose={() => {
          setPassModalVisible(false);
          navigation.navigate('MyBookings');
        }}
        onCancelBooking={async (bookingId) => {
          await cancelBooking(bookingId);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroImageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: '#CBD5E1',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 24,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buildingTag: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buildingTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roomHeaderSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  codeBadgeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  roomTitleCol: {
    flex: 1,
  },
  roomNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  campusSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  specCardsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 18,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  specLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  sectionBlock: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  equipIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  noticeBox: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  summaryCol: {
    flex: 1,
  },
  summaryDateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  summarySlotValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  confirmBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBookingBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

