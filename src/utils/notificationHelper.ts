import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Booking, Room, TimeSlot } from '../types';
import { get15MinutesBeforeSlot } from './dateHelpers';

/**
 * ============================================================================
 * LƯU Ý KỸ THUẬT VỀ EXPO GO & EXPO MANAGED WORKFLOW (SDK 53+ / SDK 57):
 * ----------------------------------------------------------------------------
 * 1. Từ Expo SDK 51+, Expo Go trên Android đã gỡ bỏ hoàn toàn module Push (FCM),
 *    bao gồm cả 'ExpoTopicSubscriptionModule' và 'NotificationsChannelsProvider'.
 * 2. Để tránh lỗi Red Screen "[runtime not ready]: Error: Cannot find native module
 *    'ExpoTopicSubscriptionModule'" khi chạy trên Expo Go / Expo Snack, module này
 *    SỬ DỤNG DYNAMIC REQUIRE TRONG TRY/CATCH thay vì static import ở cấp cao nhất.
 * 3. GRACEFUL DEGRADATION: Nếu native module không tồn tại trong môi trường hiện tại
 *    hoặc đang chạy trên Expo Go Client, các hàm native channel sẽ được bypass an toàn,
 *    bắt lỗi bằng try/catch — ĐẢM BẢO app không bao giờ bị văng do NullPointerException.
 * ============================================================================
 */

const ANDROID_CHANNEL_ID = 'study-room-alerts';

let NotificationsModule: typeof import('expo-notifications') | null = null;
let hasAttemptedLoad = false;
let isChannelSetup = false;
let isSettingUpChannel = false;

/**
 * Kiểm tra xem ứng dụng có đang chạy trên môi trường Expo Go client hay không.
 * Trên Expo Go Android (từ SDK 51/53/57), các native module liên quan đến NotificationsChannelsProvider
 * đã bị lược bỏ, dẫn đến crash NullPointerException nếu gọi channel API.
 */
export const isRunningInExpoGo = (): boolean => {
  try {
    return (
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as any)?.appOwnership === 'expo'
    );
  } catch {
    return false;
  }
};

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
    console.log(
      '[NotificationHelper] Môi trường này (Expo Go/Snack Android) không hỗ trợ notification native module.',
      'Tính năng nhắc lịch 15 phút sẽ được vô hiệu hóa an toàn (graceful fallback):',
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
    console.log(
      '[NotificationHelper] Bỏ qua setupNotificationHandler:',
      error?.message || error
    );
  }
};

/**
 * Thiết lập Android Notification Channel (cần thiết cho Android 8.0+)
 * Có cờ kiểm tra chỉ chạy đúng 1 lần duy nhất trong toàn bộ phiên ứng dụng
 */
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  if (isChannelSetup || isSettingUpChannel) return;

  // 1. Bypass hoàn toàn khi chạy trên Expo Go Android để triệt tiêu lỗi NullPointerException:
  // "null cannot be cast to non-null type NotificationsChannelsProvider"
  if (isRunningInExpoGo()) {
    console.log(
      '[NotificationHelper] Phát hiện môi trường Expo Go Android: Tự động bypass setupNotificationChannel (tránh NullPointerException do thiếu NotificationsChannelsProvider).'
    );
    isChannelSetup = true;
    return;
  }

  isSettingUpChannel = true;
  try {
    const Notifications = getNotifications();
    if (
      !Notifications ||
      typeof Notifications.setNotificationChannelAsync !== 'function'
    ) {
      isChannelSetup = true;
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
    isChannelSetup = true;
  } catch (error: any) {
    console.log(
      '[NotificationHelper] Bỏ qua setupNotificationChannel (môi trường không hỗ trợ):',
      error?.message || error
    );
    isChannelSetup = true;
  } finally {
    isSettingUpChannel = false;
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
      console.log(
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
      if (!isRunningInExpoGo()) {
        await setupNotificationChannel();
      }
      return true;
    }

    return false;
  } catch (error: any) {
    console.log(
      '[NotificationHelper] Bỏ qua xin quyền thông báo:',
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
      console.log(
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
        ...(Platform.OS === 'android' && !isRunningInExpoGo()
          ? { channelId: ANDROID_CHANNEL_ID }
          : {}),
      } as any,
    });

    console.log(
      `[NotificationHelper] Đã lên lịch nhắc nhở thành công. Notification ID: ${notificationId}, thời điểm báo: ${triggerDate.toLocaleString('vi-VN')}`
    );
    return notificationId;
  } catch (error: any) {
    console.log(
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
    console.log(
      `[NotificationHelper] Lỗi khi hủy thông báo ID ${notificationId}:`,
      error?.message || error
    );
  }
};
