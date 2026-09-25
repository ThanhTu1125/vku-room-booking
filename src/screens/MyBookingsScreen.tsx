import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useBookingStore } from '../store/useBookingStore';
import { Booking, Room } from '../types';
import { BookingListItem } from '../components/BookingListItem';
import { QRBookingModal } from '../components/QRBookingModal';
import { TIME_SLOTS } from '../constants/timeSlots';
import { COLORS } from '../constants/colors';
import { getBookingDisplayStatus } from '../utils/bookingStatusHelper';

type TabFilter = 'ALL' | 'UPCOMING' | 'HISTORY';

interface BookingSection {
  title: string;
  type: 'upcoming' | 'history';
  data: Booking[];
}

export const MyBookingsScreen: React.FC = () => {
  // Đăng ký trực tiếp với Zustand store
  const bookings = useBookingStore(state => state.bookings);
  const rooms = useBookingStore(state => state.rooms);
  const getUserBookings = useBookingStore(state => state.getUserBookings);
  const cancelBooking = useBookingStore(state => state.cancelBooking);

  const navigation = useNavigation<any>();

  // State cục bộ
  const [selectedTab, setSelectedTab] = useState<TabFilter>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  // Bộ đếm thời gian tự động re-render mỗi 30 giây để cập nhật trạng thái động khi qua giờ ca học
  const [currentTick, setCurrentTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTick(prev => prev + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Tra cứu phòng nhanh bằng Map
  const roomMap = useMemo(() => {
    return new Map<string, Room>(rooms.map(r => [r.id, r]));
  }, [rooms]);

  // Lấy toàn bộ bookings của currentUser từ store (tự động kích hoạt re-render khi bookings thay đổi)
  const userBookings = useMemo(() => {
    return getUserBookings();
  }, [bookings, getUserBookings]);

  // Nhóm 1: "Sắp tới" — chỉ những booking có trạng thái hiển thị động là 'upcoming'
  const upcomingBookings = useMemo(() => {
    return userBookings
      .filter(b => getBookingDisplayStatus(b) === 'upcoming')
      .sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date);
        if (dateComp !== 0) return dateComp;
        return a.timeSlotId.localeCompare(b.timeSlotId);
      });
  }, [userBookings, currentTick]);

  // Nhóm 2: "Lịch sử" — bao gồm cả 'past' (đã qua giờ) VÀ 'cancelled' (đã hủy)
  const historyBookings = useMemo(() => {
    return userBookings
      .filter(b => {
        const displayStatus = getBookingDisplayStatus(b);
        return displayStatus === 'past' || displayStatus === 'cancelled';
      })
      .sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return b.timeSlotId.localeCompare(a.timeSlotId);
      });
  }, [userBookings, currentTick]);

  // Chia danh sách theo SectionList dựa vào TabFilter
  const sections: BookingSection[] = useMemo(() => {
    const result: BookingSection[] = [];

    if (selectedTab === 'ALL' || selectedTab === 'UPCOMING') {
      result.push({
        title: `⏰ Lịch Đặt Sắp Tới (${upcomingBookings.length})`,
        type: 'upcoming',
        data: upcomingBookings,
      });
    }

    if (selectedTab === 'ALL' || selectedTab === 'HISTORY') {
      result.push({
        title: `📜 Lịch Sử Đặt Phòng (${historyBookings.length})`,
        type: 'history',
        data: historyBookings,
      });
    }

    return result;
  }, [selectedTab, upcomingBookings, historyBookings]);

  // Mở QRBookingModal để quét mã
  const handleOpenQR = useCallback(
    (booking: Booking, room?: Room) => {
      setSelectedBooking(booking);
      setSelectedRoom(room || roomMap.get(booking.roomId) || null);
      setIsQRModalVisible(true);
    },
    [roomMap]
  );

  // Hủy đặt phòng kèm xác nhận Alert
  const handleCancelBooking = useCallback(
    (booking: Booking) => {
      const room = roomMap.get(booking.roomId);
      const slot = TIME_SLOTS.find(s => s.id === booking.timeSlotId);
      const slotLabel =
        booking.timeSlotLabel ||
        (slot ? `${slot.startTime} - ${slot.endTime}` : booking.timeSlotId);
      const roomName = room?.name || booking.roomName || 'phòng';

      Alert.alert(
        'Xác nhận hủy đặt phòng',
        `Bạn có chắc muốn hủy lịch đặt ${roomName} (${slotLabel}, ngày ${booking.date})? Khung giờ này sẽ được giải phóng cho sinh viên khác.`,
        [
          { text: 'Không, giữ lại', style: 'cancel' },
          {
            text: 'Hủy đặt phòng',
            style: 'destructive',
            onPress: () => {
              cancelBooking(booking.id);
              Alert.alert(
                'Đã hủy thành công',
                'Lịch đặt phòng đã được hủy. Khung giờ này đã sẵn sàng cho lượt đặt mới.'
              );
            },
          },
        ]
      );
    },
    [cancelBooking, roomMap]
  );

  // Render header từng Section
  const renderSectionHeader = ({ section }: { section: BookingSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  // Render từng booking item qua BookingListItem memoized component
  const renderItem = ({ item, section }: { item: Booking; section: BookingSection }) => {
    const room = roomMap.get(item.roomId);

    return (
      <BookingListItem
        booking={item}
        room={room}
        onPressQR={handleOpenQR}
        onCancel={section.type === 'upcoming' ? handleCancelBooking : undefined}
      />
    );
  };

  const isListCompletelyEmpty =
    upcomingBookings.length === 0 && historyBookings.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header màn hình */}
      <View style={styles.topHeader}>
        <Text style={styles.title}>Đặt Phòng Của Tôi</Text>
        <Text style={styles.subtitle}>
          Quản lý lịch học, mở vé QR check-in và hủy lịch đặt phòng
        </Text>
      </View>

      {/* Tabs điều hướng nhanh */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.segmentBtn, selectedTab === 'ALL' && styles.segmentBtnActive]}
          onPress={() => setSelectedTab('ALL')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === 'ALL' && styles.segmentTextActive,
            ]}
          >
            Tất cả ({userBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.segmentBtn,
            selectedTab === 'UPCOMING' && styles.segmentBtnActive,
          ]}
          onPress={() => setSelectedTab('UPCOMING')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === 'UPCOMING' && styles.segmentTextActive,
            ]}
          >
            Sắp tới ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.segmentBtn,
            selectedTab === 'HISTORY' && styles.segmentBtnActive,
          ]}
          onPress={() => setSelectedTab('HISTORY')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === 'HISTORY' && styles.segmentTextActive,
            ]}
          >
            Lịch sử ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SectionList hiển thị 2 nhóm Sắp tới và Lịch sử */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyTitle}>
              {isListCompletelyEmpty
                ? 'Bạn chưa có lượt đặt phòng nào'
                : selectedTab === 'UPCOMING'
                  ? 'Không có lịch đặt phòng nào sắp tới'
                  : 'Không có lịch sử đặt phòng'}
            </Text>
            <Text style={styles.emptyDesc}>
              Khám phá danh sách phòng học tại VKU và đặt phòng thực hành cho nhóm của
              bạn.
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.exploreButtonText}>🏛️ Khám phá phòng học</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal hiển thị vé QR Pass */}
      <QRBookingModal
        visible={isQRModalVisible}
        booking={selectedBooking}
        room={selectedRoom}
        onClose={() => {
          setIsQRModalVisible(false);
          setSelectedBooking(null);
          setSelectedRoom(null);
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
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
