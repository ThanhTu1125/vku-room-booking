import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Booking } from '../types';
import { useBookingStore } from '../store/useBookingStore';
import { BookingPassModal } from '../components/BookingPassModal';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  Inbox,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

type MyBookingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MyBookings'
>;

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  navigation,
}) => {
  const bookings = useBookingStore((state) => state.bookings);
  const user = useBookingStore((state) => state.userSession);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);

  // Selected tab: upcoming or history
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  // Modal pass preview
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [passModalVisible, setPassModalVisible] = useState<boolean>(false);

  // Filter student's bookings
  const userBookings = useMemo(
    () => bookings.filter((b) => b.userId === user.id),
    [bookings, user.id]
  );

  const displayedBookings = useMemo(() => {
    if (activeTab === 'upcoming') {
      return userBookings.filter((b) => b.status === 'confirmed');
    }
    return userBookings.filter((b) => b.status !== 'confirmed');
  }, [userBookings, activeTab]);

  const handleOpenPass = (booking: Booking) => {
    setSelectedPass(booking);
    setPassModalVisible(true);
  };

  const handleCancel = (booking: Booking) => {
    Alert.alert(
      'Hủy lịch đặt phòng',
      `Bạn có chắc muốn hủy lịch tại ${booking.roomName} (${booking.timeSlot.label})?`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelBooking(booking.id);
            if (res.success) {
              Alert.alert('Thành công', 'Đã hủy lịch đặt phòng và giải phóng ca học.');
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isUpcoming = item.status === 'confirmed';

    return (
      <View style={styles.bookingCard}>
        {/* Top Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.roomInfoCol}>
            <Text style={styles.cardRoomName}>{item.roomName}</Text>
            <View style={styles.locationTag}>
              <MapPin size={13} color="#2563EB" />
              <Text style={styles.locationTagText}>
                Tòa {item.building} • Tầng {item.floor}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              isUpcoming ? styles.statusConfirmed : styles.statusCancelled,
            ]}
          >
            {isUpcoming ? (
              <>
                <CheckCircle2 size={12} color="#059669" />
                <Text style={styles.statusConfirmedText}>Đã xác nhận</Text>
              </>
            ) : (
              <>
                <XCircle size={12} color="#DC2626" />
                <Text style={styles.statusCancelledText}>Đã hủy</Text>
              </>
            )}
          </View>
        </View>

        {/* Date & Time Slot Block */}
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleCol}>
            <View style={styles.scheduleItem}>
              <Calendar size={14} color="#64748B" />
              <Text style={styles.scheduleText}>{formatDisplayDate(item.date)}</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Clock size={14} color="#2563EB" />
              <Text style={[styles.scheduleText, styles.slotHighlight]}>
                {item.timeSlot.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Footer Actions */}
        <View style={styles.cardFooter}>
          {isUpcoming ? (
            <>
              <TouchableOpacity
                style={styles.qrPassBtn}
                onPress={() => handleOpenPass(item)}
                activeOpacity={0.8}
              >
                <QrCode size={16} color="#FFFFFF" />
                <Text style={styles.qrPassBtnText}>Mở thẻ QR Check-in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item)}
                activeOpacity={0.7}
              >
                <AlertTriangle size={15} color="#EF4444" />
                <Text style={styles.cancelBtnText}>Hủy lịch</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.cancelledNote}>
              Lịch đặt này đã bị hủy và khung giờ đã được hoàn lại.
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Lịch Đặt Phòng Của Tôi</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Sắp tới ({userBookings.filter((b) => b.status === 'confirmed').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            Lịch sử ({userBookings.filter((b) => b.status !== 'confirmed').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={displayedBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Inbox size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming'
                ? 'Bạn chưa có lịch đặt phòng nào sắp tới'
                : 'Chưa có lịch sử đặt phòng nào'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Tìm phòng học lý tưởng và đặt trước ca học 2 tiếng ngay bây giờ.'
                : 'Các ca học đã hoàn thành hoặc hủy sẽ xuất hiện tại đây.'}
            </Text>

            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Tìm phòng ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* QR Modal */}
      <BookingPassModal
        visible={passModalVisible}
        booking={selectedPass}
        onClose={() => setPassModalVisible(false)}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  cardRoomName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusConfirmed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusConfirmedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusCancelledText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  scheduleRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  scheduleCol: {
    gap: 6,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  slotHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  qrPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  qrPassBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  cancelledNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

