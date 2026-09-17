import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useBookingStore } from '../store/useBookingStore';
import { TIME_SLOTS } from '../constants/timeSlots';
import { TimeSlot, Booking } from '../types';
import { TimeSlotButton } from '../components/TimeSlotButton';
import { DateSelector } from '../components/DateSelector';
import { QRModal } from '../components/QRModal';
import { getSlotAvailability } from '../utils/conflictChecker';
import { formatDisplayDate, formatSlotLabel } from '../utils/dateHelpers';
import { COLORS } from '../constants/colors';

type RouteProps = RouteProp<RootStackParamList, 'RoomDetail'>;

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { roomId, initialDate } = route.params;

  const room = useBookingStore(state => state.getRoomById(roomId));
  const bookings = useBookingStore(state => state.bookings);
  const createBooking = useBookingStore(state => state.createBooking);
  const checkInBooking = useBookingStore(state => state.checkInBooking);

  const [currentDate, setCurrentDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal QR Code sau khi đặt thành công
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  if (!room) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin phòng học.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBookRoom = async () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn ca học', 'Vui lòng chọn một ca học còn trống để tiếp tục.');
      return;
    }

    setIsSubmitting(true);
    const result = await createBooking({
      roomId: room.id,
      date: currentDate,
      timeSlot: selectedSlot,
    });
    setIsSubmitting(false);

    if (result.success && result.booking) {
      setCreatedBooking(result.booking);
      setShowQRModal(true);
      setSelectedSlot(null);
    } else {
      Alert.alert('Không thể đặt phòng', result.error || 'Đã xảy ra lỗi trùng lịch.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBackBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.circleBackBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {room.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: room.photoUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <View style={styles.codeTag}>
              <Text style={styles.codeTagText}>Tòa {room.building}</Text>
            </View>
            <View style={styles.capacityTag}>
              <Text style={styles.capacityTagText}>Sức chứa: {room.capacity} người</Text>
            </View>
          </View>
        </View>

        {/* Room Info */}
        <View style={styles.infoCard}>
          <View style={styles.headerRow}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    room.status === 'available'
                      ? COLORS.availableSoft
                      : COLORS.occupiedSoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      room.status === 'available' ? COLORS.available : COLORS.occupied,
                  },
                ]}
              >
                {room.status === 'available' ? 'Available' : 'Occupied'}
              </Text>
            </View>
          </View>

          <Text style={styles.roomLocation}>
            📍 Tòa nhà {room.building} • Tầng {room.floor}
          </Text>

          {/* Equipment List */}
          <Text style={styles.sectionHeader}>Trang thiết bị phòng</Text>
          <View style={styles.equipmentWrap}>
            {room.equipment.map(eq => (
              <View key={eq} style={styles.equipmentBadge}>
                <Text style={styles.equipmentBadgeText}>✓ {eq}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Date Selector for slots */}
        <View style={styles.bookingCard}>
          <Text style={styles.sectionHeader}>Chọn ngày muốn mượn phòng</Text>
          <DateSelector
            selectedDate={currentDate}
            onSelectDate={date => {
              setCurrentDate(date);
              setSelectedSlot(null);
            }}
          />

          <View style={styles.selectedDateInfo}>
            <Text style={styles.selectedDateText}>
              Lịch các ca trong ngày: {formatDisplayDate(currentDate)}
            </Text>
          </View>

          {/* Time Slots List */}
          <View style={styles.slotsContainer}>
            {TIME_SLOTS.map(slot => {
              const status = getSlotAvailability(room, currentDate, slot, bookings);
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <TimeSlotButton
                  key={slot.id}
                  slot={slot}
                  status={status}
                  isSelected={isSelected}
                  onPress={() => setSelectedSlot(slot)}
                />
              );
            })}
          </View>

          {/* Submit Booking Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!selectedSlot || isSubmitting) && styles.submitBtnDisabled,
            ]}
            disabled={!selectedSlot || isSubmitting}
            activeOpacity={0.8}
            onPress={handleBookRoom}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting
                ? 'Đang xử lý...'
                : selectedSlot
                  ? `Xác nhận đặt: ${formatSlotLabel(selectedSlot)}`
                  : 'Vui lòng chọn ca học còn trống'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Ticket Modal */}
      <QRModal
        visible={showQRModal}
        booking={createdBooking}
        room={room}
        onClose={() => setShowQRModal(false)}
        onCheckIn={id => {
          checkInBooking(id);
          if (createdBooking) {
            setCreatedBooking({ ...createdBooking, status: 'checked-in' });
          }
          Alert.alert('Thành công', 'Đã check-in vào phòng học thành công!');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  circleBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  circleBackBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    maxWidth: '70%',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codeTagText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  capacityTag: {
    backgroundColor: 'rgba(29, 78, 216, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  capacityTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roomLocation: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  equipmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  equipmentBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedDateInfo: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 10,
  },
  selectedDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  slotsContainer: {
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
