import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { requestNotificationPermission } from '../utils/notificationHelper';
import { COLORS } from '../constants/colors';

export const ProfileScreen: React.FC = () => {
  const currentUser = useBookingStore(state => state.currentUser);
  const bookings = useBookingStore(state => state.bookings);
  const getUserBookings = useBookingStore(state => state.getUserBookings);
  const logout = useBookingStore(state => state.logout);
  const resetToMockData = useBookingStore(state => state.resetToMockData);

  // Lọc chỉ tính lượt đặt của riêng user hiện tại
  const userBookings = useMemo(() => {
    return getUserBookings();
  }, [bookings, getUserBookings]);

  const upcomingCount = useMemo(() => {
    return userBookings.filter(b => b.status === 'upcoming' || b.status === 'checked-in')
      .length;
  }, [userBookings]);

  const completedCount = useMemo(() => {
    return userBookings.filter(b => b.status === 'completed').length;
  }, [userBookings]);

  // Test kích hoạt Local Notification
  const handleTestNotification = async () => {
    try {
      const hasPerm = await requestNotificationPermission();
      if (!hasPerm) {
        Alert.alert(
          'Chưa cấp quyền',
          'Vui lòng bật quyền thông báo trong Cài đặt thiết bị để nhận nhắc nhở ca học.'
        );
        return;
      }

      Alert.alert(
        'Đã kiểm tra quyền!',
        'Quyền thông báo cục bộ đã được kích hoạt thành công trên thiết bị.'
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể kích hoạt kiểm tra thông báo.');
    }
  };

  // Đặt lại dữ liệu ban đầu
  const handleResetData = () => {
    Alert.alert(
      'Khôi phục dữ liệu mẫu',
      'Bạn có chắc chắn muốn đặt lại dữ liệu phòng và lịch mượn phòng về mặc định?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: () => {
            resetToMockData();
            Alert.alert('Thành công', 'Đã khôi phục dữ liệu mẫu thành công.');
          },
        },
      ]
    );
  };

  // Đăng xuất tài khoản
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất tài khoản',
      'Bạn có chắc chắn muốn đăng xuất? Dữ liệu đặt phòng đã lưu vẫn được bảo lưu an toàn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Hồ Sơ Sinh Viên</Text>
          <Text style={styles.subtitle}>VKU Smart Campus Account</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser
                ? (currentUser.displayName || currentUser.name || 'SV')
                    .trim()
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .join('')
                    .slice(-2)
                    .toUpperCase()
                : 'SV'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {currentUser ? currentUser.displayName || currentUser.name : 'Khách vãng lai'}
          </Text>
          {currentUser ? (
            <>
              <View style={styles.badgeWrapper}>
                <Text style={styles.studentIdBadge}>MSSV: {currentUser.studentId}</Text>
              </View>
              <Text style={styles.emailText}>✉ {currentUser.email}</Text>
            </>
          ) : (
            <Text style={styles.emailText}>Chưa đăng nhập tài khoản</Text>
          )}
        </View>

        {/* Statistics Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{userBookings.length}</Text>
            <Text style={styles.statLabel}>Tổng lượt đặt</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {upcomingCount}
            </Text>
            <Text style={styles.statLabel}>Sắp tới</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: COLORS.available }]}>
              {completedCount}
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>

        {/* Regulations / Quy định mượn phòng */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📌 Quy định mượn phòng học VKU</Text>
          <Text style={styles.ruleItem}>
            1. Mỗi sinh viên/nhóm được đặt tối đa 2 ca học trong cùng một ngày.
          </Text>
          <Text style={styles.ruleItem}>
            2. Vui lòng check-in bằng mã QR tại cửa phòng trong vòng 15 phút đầu của ca.
          </Text>
          <Text style={styles.ruleItem}>
            3. Nếu không đến sau 20 phút, lượt đặt sẽ tự động bị hủy để nhường cho sinh
            viên khác.
          </Text>
          <Text style={styles.ruleItem}>
            4. Giữ gìn tài sản chung, tắt máy điều hòa và đèn trước khi rời phòng.
          </Text>
        </View>

        {/* App Utility Actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚙️ Tiện ích & Cài đặt</Text>

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={handleTestNotification}
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Kiểm tra quyền Thông báo</Text>
              <Text style={styles.actionDesc}>
                Xác nhận quyền nhận thông báo nhắc lịch học trước 15 phút
              </Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={handleResetData}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: COLORS.occupied }]}>
                Đặt lại dữ liệu ban đầu
              </Text>
              <Text style={styles.actionDesc}>
                Khôi phục mock data phòng và lịch đặt mặc định
              </Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutBtnText}>🚪 Đăng Xuất Tài Khoản</Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>VKU Study Room Booking • v1.0.0</Text>
          <Text style={styles.footerSubText}>
            Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
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
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  badgeWrapper: {
    marginBottom: 6,
  },
  studentIdBadge: {
    backgroundColor: COLORS.primarySoft,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textSubtle,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    height: '70%',
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  ruleItem: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionChevron: {
    fontSize: 20,
    color: COLORS.textSubtle,
    marginLeft: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 6,
  },
  logoutWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  logoutBtn: {
    backgroundColor: COLORS.occupiedSoft,
    borderWidth: 1,
    borderColor: COLORS.occupiedSoft,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: COLORS.occupied,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSubtle,
  },
  footerSubText: {
    fontSize: 11,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
});
