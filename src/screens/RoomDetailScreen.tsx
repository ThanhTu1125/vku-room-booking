import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../navigation/types';
import { Booking } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { TIME_SLOTS } from '../constants/timeSlots';
import { DateSelector } from '../components/DateSelector';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { BookingConfirmModal } from '../components/BookingConfirmModal';
import { QRBookingModal } from '../components/QRBookingModal';
import { getTodayString } from '../utils/dateHelpers';
import { requestNotificationPermission } from '../utils/notificationHelper';
import { COLORS } from '../constants/colors';

type RouteProps = RouteProp<HomeStackParamList, 'RoomDetail'>;

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { roomId, initialDate } = route.params;

  // Lấy thông tin phòng và actions từ Zustand store
  const room = useBookingStore(state => state.getRoomById(roomId));
  const currentUser = useBookingStore(state => state.currentUser);
  const createBooking = useBookingStore(state => state.createBooking);

  // State cục bộ quản lý ngày và khung giờ đang chọn
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || getTodayString()
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tìm đối tượng TimeSlot tương ứng với slot đang chọn
  const currentSlot = useMemo(() => {
    return TIME_SLOTS.find(s => s.id === selectedSlotId) || null;
  }, [selectedSlotId]);

  // Khi người dùng đổi ngày mượn -> reset khung giờ đã chọn
  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
  }, []);

  // Xử lý xác nhận đặt phòng trong Confirm Modal
  const handleConfirmBooking = useCallback(async () => {
    if (!selectedSlotId || !room) return;

    setIsSubmitting(true);

    // 🔔 Xin quyền thông báo Just-in-Time ngay trước khi đặt phòng
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      // Thông báo người dùng đã tắt quyền, KHÔNG chặn luồng đặt phòng chính
      Alert.alert(
        'Thông báo nhắc nhở bị tắt',
        'Bạn đã tắt thông báo, sẽ không nhận được nhắc nhở check-in trước giờ học 15 phút.',
        [{ text: 'Đã hiểu, tiếp tục đặt' }]
      );
    }

    const result = await createBooking(room.id, selectedDate, selectedSlotId);
    setIsSubmitting(false);

    // Đóng modal xác nhận
    setIsConfirmModalVisible(false);

    if (result.success && result.booking) {
      // Đặt phòng thành công -> Mở trực tiếp vé điện tử QRBookingModal
      setCreatedBooking(result.booking);
      setIsQRModalVisible(true);
      // Reset trạng thái chọn sau khi đặt thành công
      setSelectedSlotId(null);
    } else {
      // Trường hợp phát sinh xung đột (race condition hoặc slot vừa bị đặt)
      Alert.alert(
        '⚠️ Không thể đặt phòng',
        result.error ||
          'Khung giờ này vừa được đặt bởi người khác, vui lòng chọn khung giờ khác.',
        [{ text: 'Đồng ý' }]
      );
      // Tự động giải phóng slot đã chọn để refresh lại lưới
      setSelectedSlotId(null);
    }
  }, [selectedSlotId, room, selectedDate, createBooking]);

  if (!room) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin phòng học.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isRoomAvailable = room.status === 'available';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header điều hướng trên cùng */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBackBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.circleBackBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {room.name}
        </Text>
        <View style={styles.placeholderBox} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
      >
        {/* 2. Ảnh lớn của phòng học */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: room.photoUrl }}
            style={styles.largeImage}
            resizeMode="cover"
          />
          <View style={styles.imageBadgesOverlay}>
            <View style={styles.buildingTag}>
              <Text style={styles.buildingTagText}>Building {room.building}</Text>
            </View>
            <View style={styles.floorTag}>
              <Text style={styles.floorTagText}>Tầng {room.floor}</Text>
            </View>
          </View>
        </View>

        {/* 3. Thông tin chi tiết phòng học */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View
              style={[
                styles.statusBadge,
                isRoomAvailable ? styles.statusAvailable : styles.statusOccupied,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isRoomAvailable ? styles.dotAvailable : styles.dotOccupied,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  isRoomAvailable ? styles.textAvailable : styles.textOccupied,
                ]}
              >
                {isRoomAvailable ? 'Available Now' : 'Occupied'}
              </Text>
            </View>
          </View>

          {/* Vị trí & Sức chứa */}
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>
              📍 Tòa {room.building}, Tầng {room.floor}
            </Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaItem}>👥 Sức chứa: {room.capacity} chỗ</Text>
          </View>

          {/* Danh sách trang thiết bị */}
          <Text style={styles.subSectionTitle}>Trang thiết bị sẵn có:</Text>
          <View style={styles.equipmentWrap}>
            {room.equipment.map(item => (
              <View key={item} style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>✓ {item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Chọn ngày học (DateSelector) */}
        <View style={styles.bookingBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.boxTitle}>📅 Chọn ngày mượn phòng</Text>
          </View>
          <DateSelector selectedDate={selectedDate} onSelectDate={handleSelectDate} />

          {/* 5. Chọn khung giờ học (TimeSlotGrid) */}
          <TimeSlotGrid
            roomId={room.id}
            selectedDate={selectedDate}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
          />
        </View>
      </ScrollView>

      {/* 6. Nút Đặt phòng cố định ở chân màn hình */}
      <View
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}
      >
        <View style={styles.bottomSummary}>
          <Text style={styles.bottomSummaryLabel}>Khung giờ đã chọn:</Text>
          <Text style={styles.bottomSummaryValue}>
            {currentSlot
              ? `${currentSlot.startTime} - ${currentSlot.endTime}`
              : 'Chưa chọn ca học'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSlotId || isSubmitting) && styles.bookButtonDisabled,
          ]}
          disabled={!selectedSlotId || isSubmitting}
          activeOpacity={0.85}
          onPress={() => setIsConfirmModalVisible(true)}
        >
          <Text style={styles.bookButtonText}>
            {selectedSlotId ? 'Đặt phòng ngay' : 'Chọn ca để tiếp tục'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 7. Modal xác nhận đặt phòng */}
      <BookingConfirmModal
        visible={isConfirmModalVisible}
        room={room}
        date={selectedDate}
        timeSlot={currentSlot}
        currentUser={currentUser}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmBooking}
        onCancel={() => setIsConfirmModalVisible(false)}
      />

      {/* 8. Modal vé điện tử QR Check-in */}
      <QRBookingModal
        visible={isQRModalVisible}
        booking={createdBooking}
        room={room}
        onClose={() => {
          setIsQRModalVisible(false);
          setCreatedBooking(null);
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
  placeholderBox: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: COLORS.divider,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  imageBadgesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  buildingTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  buildingTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  floorTag: {
    backgroundColor: 'rgba(29, 78, 216, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  floorTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: COLORS.card,
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
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
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: COLORS.availableSoft,
  },
  statusOccupied: {
    backgroundColor: COLORS.occupiedSoft,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  dotAvailable: {
    backgroundColor: COLORS.available,
  },
  dotOccupied: {
    backgroundColor: COLORS.occupied,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textAvailable: {
    color: COLORS.available,
  },
  textOccupied: {
    color: COLORS.occupied,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  metaDivider: {
    marginHorizontal: 8,
    color: COLORS.border,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  equipmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentTag: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  equipmentTagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  bookingBox: {
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderRow: {
    marginBottom: 6,
  },
  boxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomSummary: {
    flex: 1,
    marginRight: 12,
  },
  bottomSummaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bottomSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
