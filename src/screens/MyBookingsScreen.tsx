import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { Booking, Room } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { QRModal } from '../components/QRModal';
import { formatDisplayDate, formatSlotLabel } from '../utils/dateHelpers';
import { COLORS } from '../constants/colors';

type BookingTab = 'UPCOMING' | 'HISTORY';

export const MyBookingsScreen: React.FC = () => {
  const bookings = useBookingStore(state => state.bookings);
  const rooms = useBookingStore(state => state.rooms);
  const cancelBooking = useBookingStore(state => state.cancelBooking);
  const checkInBooking = useBookingStore(state => state.checkInBooking);

  const [activeTab, setActiveTab] = useState<BookingTab>('UPCOMING');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  const upcomingBookings = bookings.filter(
    b => b.status === 'upcoming' || b.status === 'checked-in'
  );

  const historyBookings = bookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled'
  );

  const displayedBookings = activeTab === 'UPCOMING' ? upcomingBookings : historyBookings;

  const handleOpenQR = (booking: Booking) => {
    const room = rooms.find(r => r.id === booking.roomId) || null;
    setSelectedBooking(booking);
    setSelectedRoom(room);
    setShowQRModal(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    const slot = TIME_SLOTS.find(s => s.id === booking.timeSlotId);
    const slotLabel = slot ? formatSlotLabel(slot) : booking.timeSlotId;

    Alert.alert(
      'Xác nhận hủy đặt phòng',
      `Bạn có chắc chắn muốn hủy ca học ${slotLabel} vào ngày ${booking.date}?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: async () => {
            await cancelBooking(booking.id);
            Alert.alert('Đã hủy', 'Lịch đặt phòng đã được hủy thành công.');
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const room = rooms.find(r => r.id === item.roomId);
    const slot = TIME_SLOTS.find(s => s.id === item.timeSlotId);
    const isUpcoming = item.status === 'upcoming';
    const isCheckedIn = item.status === 'checked-in';
    const isCancelled = item.status === 'cancelled';
    const isCompleted = item.status === 'completed';

    let statusText = 'Upcoming';
    let statusColor: string = COLORS.primary;
    let statusBg: string = COLORS.primarySoft;

    if (isCheckedIn) {
      statusText = 'Checked-in';
      statusColor = COLORS.available;
      statusBg = COLORS.availableSoft;
    } else if (isCompleted) {
      statusText = 'Completed';
      statusColor = COLORS.textMuted;
      statusBg = COLORS.divider;
    } else if (isCancelled) {
      statusText = 'Cancelled';
      statusColor = COLORS.occupied;
      statusBg = COLORS.occupiedSoft;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.buildingBadge}>
            <Text style={styles.buildingBadgeText}>Tòa {room?.building || 'VKU'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <Text style={styles.roomName}>{room?.name || 'Phòng học VKU'}</Text>
        <Text style={styles.locationText}>
          📍 Tầng {room?.floor || 1} • Sức chứa: {room?.capacity || 0} người
        </Text>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Ngày:</Text>
          <Text style={styles.detailValue}>{formatDisplayDate(item.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⏰ Ca học:</Text>
          <Text style={styles.detailValue}>
            {slot ? formatSlotLabel(slot) : item.timeSlotId}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.qrBtn}
            activeOpacity={0.8}
            onPress={() => handleOpenQR(item)}
          >
            <Text style={styles.qrBtnText}>📱 Xem mã QR Pass</Text>
          </TouchableOpacity>

          {isUpcoming && (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={() => handleCancelBooking(item)}
            >
              <Text style={styles.cancelBtnText}>Hủy lịch</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Vé Đặt Phòng Của Tôi</Text>
        <Text style={styles.subtitle}>Quản lý lịch học và mã QR check-in phòng học</Text>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'UPCOMING' && styles.tabActive]}
          onPress={() => setActiveTab('UPCOMING')}
        >
          <Text
            style={[styles.tabText, activeTab === 'UPCOMING' && styles.tabTextActive]}
          >
            Sắp tới ({upcomingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'HISTORY' && styles.tabActive]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.tabTextActive]}>
            Lịch sử ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={displayedBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderBookingItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'UPCOMING'
                ? 'Bạn chưa có lịch đặt phòng nào sắp tới'
                : 'Chưa có lịch sử đặt phòng nào'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Khám phá danh sách phòng học tại VKU và đặt lịch cho nhóm của bạn.
            </Text>
          </View>
        }
      />

      {/* QR Modal */}
      <QRModal
        visible={showQRModal}
        booking={selectedBooking}
        room={selectedRoom}
        onClose={() => setShowQRModal(false)}
        onCheckIn={id => {
          checkInBooking(id);
          if (selectedBooking) {
            setSelectedBooking({ ...selectedBooking, status: 'checked-in' });
          }
          Alert.alert('Thành công', 'Đã mô phỏng check-in phòng học!');
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  buildingBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  buildingBadgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: '70%',
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  qrBtn: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.dangerSoft,
    backgroundColor: COLORS.dangerSoft,
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
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
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
