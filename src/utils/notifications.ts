import { Platform } from 'react-native';
import { Booking, Room } from '../types';
import { get15MinutesBeforeSlot } from './dateUtils';

// Modular imports từ expo-notifications/build để tránh nạp DevicePushTokenAutoRegistration.fx
// Điều này ngăn chặn triệt để lỗi "Android Push notifications was removed from Expo Go with the release of SDK 53"
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import {
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
} from 'expo-notifications/build/Notifications.types';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';

/**
 * ======================================================================================
 * 🛡️ GIẢI PHÁP CHỐNG CRASH CHO EXPO GO (SDK 53 - 57+):
 * ======================================================================================
 * - Bằng cách import trực tiếp các module con phục vụ Local Notifications thay vì import
 *   từ gốc 'expo-notifications', Metro Bundler sẽ KHÔNG nạp file side-effect
 *   'DevicePushTokenAutoRegistration.fx' và không gọi 'addPushTokenListener'.
 * - Nhờ đó, hàm 'warnOfExpoGoPushUsage' không bị kích hoạt -> Không bao giờ bị crash
 *   màn hình đỏ khi khởi động ứng dụng trên Expo Go Android!
 * ======================================================================================
 */

// 1. Cấu hình hành vi hiển thị thông báo khi ứng dụng đang mở (Foreground)
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: AndroidNotificationPriority.HIGH,
  }),
});

/**
 * 2. Xin quyền hiển thị thông báo cục bộ và thiết lập Android Channel
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    // Cấu hình Android Notification Channel với mức ưu tiên cao cho Android 8.0+
    if (Platform.OS === 'android') {
      await setNotificationChannelAsync('study-room-alerts', {
        name: 'Nhắc nhở Đặt phòng học VKU',
        description: 'Kênh thông báo nhắc trước 15 phút cho lịch đặt phòng học VKU',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Lỗi khi xin quyền thông báo cục bộ:', error);
    return false;
  }
};

/**
 * 3. Lập lịch thông báo cục bộ (Local Notification) trước ca học 15 phút
 */
export const scheduleBookingReminder = async (
  booking: Booking,
  room: Room
): Promise<string | undefined> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Quyền thông báo chưa được cấp, bỏ qua lập lịch nhắc nhở.');
      return undefined;
    }

    const triggerDate = get15MinutesBeforeSlot(booking.date, booking.timeSlot.startTime);
    const now = Date.now();
    const triggerTime = triggerDate.getTime();

    const title = `⏰ Nhắc nhở: Phiên học tại ${room.name} (${room.code})`;
    const body = `Khung giờ ${booking.timeSlot.label} của bạn sẽ bắt đầu trong 15 phút nữa tại Tòa ${room.building}, Tầng ${room.floor}. Hãy chuẩn bị check-in!`;

    // Trường hợp 1: Ca học diễn ra trong tương lai (cách hiện tại > 30 giây)
    if (triggerTime > now + 30 * 1000) {
      const notificationId = await scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { bookingId: booking.id, roomId: room.id },
          sound: 'default',
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: Platform.OS === 'android' ? 'study-room-alerts' : undefined,
        },
      });
      console.log(`Đã lên lịch thông báo thành công cho vé ${booking.id} lúc ${triggerDate.toLocaleString()}`);
      return notificationId;
    } else {
      // Trường hợp 2: Ca học sắp bắt đầu (dưới 15 phút) -> Kích hoạt thông báo tức thì sau 3 giây
      const notificationId = await scheduleNotificationAsync({
        content: {
          title: `🔔 Đặt phòng thành công: ${room.name}`,
          body: `Lịch đặt của bạn lúc ${booking.timeSlot.label} sắp bắt đầu! Mã QR check-in đã sẵn sàng trong thẻ phòng.`,
          data: { bookingId: booking.id, roomId: room.id },
          sound: 'default',
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
          channelId: Platform.OS === 'android' ? 'study-room-alerts' : undefined,
        },
      });
      return notificationId;
    }
  } catch (error) {
    console.warn('Lỗi khi lập lịch thông báo nhắc nhở:', error);
    return undefined;
  }
};

/**
 * 4. Hủy thông báo đã lập lịch khi sinh viên hủy lịch đặt phòng
 */
export const cancelScheduledNotification = async (notificationId?: string): Promise<void> => {
  if (!notificationId) return;
  try {
    await cancelScheduledNotificationAsync(notificationId);
    console.log(`Đã hủy thông báo đã lên lịch: ${notificationId}`);
  } catch (error) {
    console.warn('Lỗi khi hủy thông báo:', error);
  }
};
