import { Platform } from 'react-native';
import { Booking, Room, TimeSlot } from '../types';
import { get15MinutesBeforeSlot } from './dateHelpers';

/**
 * ============================================================================
 * LƯU Ý KỸ THUẬT VỀ EXPO GO & EXPO MANAGED WORKFLOW (SDK 53+ / SDK 57):
 * ----------------------------------------------------------------------------
 * 1. Từ Expo SDK 51+, Expo Go trên Android đã gỡ bỏ hoàn toàn module Push (FCM),
 *    bao gồm cả 'ExpoTopicSubscriptionModule'.
 * 2. Để tránh lỗi Red Screen "[runtime not ready]: Error: Cannot find native module
 *    'ExpoTopicSubscriptionModule'" khi chạy trên Expo Go / Expo Snack, module này
 *    SỬ DỤNG DYNAMIC REQUIRE TRONG TRY/CATCH thay vì static import ở cấp cao nhất.
 * 3. GRACEFUL DEGRADATION: Nếu native module không tồn tại trong môi trường hiện tại,
 *    các hàm sẽ bắt lỗi an toàn (catch), ghi log cảnh báo và vô hiệu hóa riêng phần
 *    thông báo nhắc nhở — ĐẢM BẢO toàn bộ ứng dụng (đặt phòng, QR, danh sách vé)
 *    VẪN HOẠT ĐỘNG HOÀN TOÀN BÌNH THƯỜNG, KHÔNG BAO GIỜ CRASH APP.
 * ============================================================================
 */

const ANDROID_CHANNEL_ID = 'study-room-alerts';

let NotificationsModule: typeof import('expo-notifications') | null = null;
let hasAttemptedLoad = false;

/**
 * Nạp module expo-notifications an toàn bằng dynamic require trong try/catch
 */
function getNotifications(): typeof import('expo-notifications') | null {
  if (hasAttemptedLoad) {
    return NotificationsModule;
  }
  hasAttemptedLoad = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('expo-notifications');
    NotificationsModule = mod;
    return NotificationsModule;
  } catch (error: any) {
    console.warn(
      '[NotificationHelper] Thiết bị/môi trường này (Expo Go/Snack Android) không hỗ trợ notification native module.',
      'Tính năng nhắc lịch 15 phút sẽ bị vô hiệu hóa an toàn (graceful fallback):',
      error?.message || error
    );
    NotificationsModule = null;
    return null;
  }
}

/**
 * Cấu hình handler hiển thị thông báo khi app đang ở foreground
 */
export const setupNotificationHandler = (): void => {
  try {
    const Notifications = getNotifications();
    if (!Notifications || typeof Notifications.setNotificationHandler !== 'function') {
      return;
    }
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error: any) {
    console.warn(
      '[NotificationHelper] Bỏ qua setupNotificationHandler:',
      error?.message || error
    );
  }
};

/**
 * Thiết lập Android Notification Channel (cần thiết cho Android 8.0+)
 */
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  try {
    const Notifications = getNotifications();
    if (
      !Notifications ||
      typeof Notifications.setNotificationChannelAsync !== 'function'
    ) {
      return;
    }
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Nhắc nhở nhận phòng học VKU',
      description: 'Kênh gửi thông báo nhắc nhở 15 phút trước khi bắt đầu ca học tại VKU',
      importance: Notifications.AndroidImportance?.HIGH ?? 4,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1D4ED8',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  } catch (error: any) {
    console.warn(
      '[NotificationHelper] Bỏ qua setupNotificationChannel:',
      error?.message || error
    );
  }
};

/**
 * 1. Yêu cầu cấp quyền thông báo từ người dùng.
 * Xử lý an toàn: nếu người dùng từ chối hoặc môi trường không hỗ trợ, trả về false, không crash.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const Notifications = getNotifications();
    if (
      !Notifications ||
      typeof Notifications.getPermissionsAsync !== 'function' ||
      typeof Notifications.requestPermissionsAsync !== 'function'
    ) {
      console.warn(
        '[NotificationHelper] Notification native module không khả dụng trên môi trường này.'
      );
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      await setupNotificationChannel();
      return true;
    }

    return false;
  } catch (error: any) {
    console.warn(
      '[NotificationHelper] Lỗi khi xin quyền thông báo:',
      error?.message || error
    );
    return false;
  }
};

/**
 * 2. Lập lịch thông báo cục bộ nhắc trước 15 phút giờ bắt đầu ca học.
 *
 * - Tính thời điểm trigger = (ngày + giờ bắt đầu slot) trừ đi 15 phút.
 * - Nếu thời điểm đó đã ở QUÁ KHỨ hoặc môi trường không hỗ trợ notification:
 *   KHÔNG lên lịch, trả về null và ghi log lý do rõ ràng.
 *
 * @returns notificationId (string) nếu lên lịch thành công, hoặc null nếu bỏ qua/lỗi.
 */
export const scheduleCheckInReminder = async (
  booking: Booking,
  room: Room,
  timeSlot: TimeSlot
): Promise<string | null> => {
  try {
    const Notifications = getNotifications();
    if (!Notifications || typeof Notifications.scheduleNotificationAsync !== 'function') {
      console.warn(
        '[NotificationHelper] Notification native module không khả dụng, bỏ qua lập lịch nhắc nhở.'
      );
      return null;
    }

    // 1. Kiểm tra quyền thông báo trước khi lên lịch
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log(
        '[NotificationHelper] Quyền thông báo chưa được cấp hoặc môi trường không hỗ trợ. Bỏ qua lập lịch nhắc nhở.'
      );
      return null;
    }

    // 2. Tính thời điểm kích hoạt thông báo (trước ca học 15 phút)
    const triggerDate = get15MinutesBeforeSlot(booking.date, timeSlot.startTime);
    const now = new Date();

    // 3. Kiểm tra nếu thời điểm đó đã ở QUÁ KHỨ
    if (triggerDate.getTime() <= now.getTime()) {
      console.log(
        `[NotificationHelper] Thời điểm nhắc nhở (${triggerDate.toLocaleString('vi-VN')}) ` +
          `đã ở QUÁ KHỨ so với hiện tại (${now.toLocaleString('vi-VN')}). ` +
          `Lý do: Ca học ${timeSlot.startTime} ngày ${booking.date} bắt đầu trong vòng ít hơn 15 phút nữa hoặc đang diễn ra. Bỏ qua lên lịch.`
      );
      return null;
    }

    const slotLabel = `${timeSlot.startTime} - ${timeSlot.endTime}`;
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sắp đến giờ nhận phòng!',
        body: `Phòng ${room.name} - ${slotLabel} sẽ bắt đầu sau 15 phút. Hãy đến check-in đúng giờ.`,
        sound: true,
        data: {
          bookingId: booking.id,
          roomId: room.id,
          date: booking.date,
          timeSlotId: timeSlot.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date',
        date: triggerDate,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      } as any,
    });

    console.log(
      `[NotificationHelper] Đã lên lịch nhắc nhở thành công. Notification ID: ${notificationId}, thời điểm báo: ${triggerDate.toLocaleString('vi-VN')}`
    );
    return notificationId;
  } catch (error: any) {
    console.warn(
      '[NotificationHelper] Lỗi khi lập lịch thông báo nhắc nhở:',
      error?.message || error
    );
    return null;
  }
};

/**
 * 3. Hủy thông báo nhắc nhở theo notificationId đã lưu.
 */
export const cancelReminder = async (notificationId: string): Promise<void> => {
  if (!notificationId) return;

  try {
    const Notifications = getNotifications();
    if (
      !Notifications ||
      typeof Notifications.cancelScheduledNotificationAsync !== 'function'
    ) {
      return;
    }
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[NotificationHelper] Đã hủy thông báo ID: ${notificationId}`);
  } catch (error: any) {
    console.warn(
      `[NotificationHelper] Lỗi khi hủy thông báo ID ${notificationId}:`,
      error?.message || error
    );
  }
};
