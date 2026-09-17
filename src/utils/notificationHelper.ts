import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Booking, Room, TimeSlot } from '../types';
import { get15MinutesBeforeSlot } from './dateHelpers';

/**
 * ============================================================================
 * LƯU Ý KỸ THUẬT VỀ EXPO GO & EXPO MANAGED WORKFLOW (SDK 57+):
 * ----------------------------------------------------------------------------
 * 1. Từ Expo SDK 51 trở đi, Expo Go đã ngừng hỗ trợ Remote Push Notifications
 *    (thông báo đẩy từ xa qua FCM/APNs - yêu cầu tạo Expo Development Build).
 * 2. TUY NHIÊN, LOCAL NOTIFICATIONS (thông báo cục bộ theo thời gian đặt trước)
 *    như `scheduleNotificationAsync`, `cancelScheduledNotificationAsync`,
 *    và `setNotificationHandler` VẪN HOẠT ĐỘNG HOÀN TOÀN BÌNH THƯỜNG trong Expo Go
 *    và Expo Snack trong môi trường Managed Workflow.
 * 3. Mô-đun này CHỈ sử dụng API Local Notification, không phụ thuộc vào bất kỳ
 *    native config nâng cao nào đòi hỏi custom dev client.
 * ============================================================================
 */

const ANDROID_CHANNEL_ID = 'study-room-alerts';

/**
 * Thiết lập Android Notification Channel (cần thiết cho Android 8.0+ để phát âm thanh và hiển thị pop-up)
 */
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Nhắc nhở nhận phòng học VKU',
        description:
          'Kênh gửi thông báo nhắc nhở 15 phút trước khi bắt đầu ca học tại VKU',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1D4ED8',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    } catch (error) {
      console.warn('[NotificationHelper] Không thể tạo Android Channel:', error);
    }
  }
};

/**
 * 1. Yêu cầu cấp quyền thông báo từ người dùng.
 * Xử lý an toàn: nếu người dùng từ chối, trả về false chứ không throw exception / crash app.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
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
  } catch (error) {
    console.warn('[NotificationHelper] Lỗi khi xin quyền thông báo:', error);
    return false;
  }
};

/**
 * 2. Lập lịch thông báo cục bộ nhắc trước 15 phút giờ bắt đầu ca học.
 *
 * - Tính thời điểm trigger = (ngày + giờ bắt đầu slot) trừ đi 15 phút.
 * - Nếu thời điểm đó đã ở QUÁ KHỨ (ví dụ: người dùng đặt ca học đang diễn ra hoặc slot bắt đầu < 15 phút),
 *   KHÔNG lên lịch, trả về null và ghi log lý do rõ ràng.
 * - Nội dung thông báo:
 *     Title: "Sắp đến giờ nhận phòng!"
 *     Body: "Phòng {room.name} - {slot} sẽ bắt đầu sau 15 phút. Hãy đến check-in đúng giờ."
 *
 * @returns notificationId (string) nếu lên lịch thành công, hoặc null nếu bỏ qua/lỗi.
 */
export const scheduleCheckInReminder = async (
  booking: Booking,
  room: Room,
  timeSlot: TimeSlot
): Promise<string | null> => {
  try {
    // 1. Kiểm tra quyền thông báo trước khi lên lịch
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log(
        '[NotificationHelper] Quyền thông báo chưa được cấp. Bỏ qua lập lịch nhắc nhở.'
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
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      },
    });

    console.log(
      `[NotificationHelper] Đã lên lịch nhắc nhở thành công. Notification ID: ${notificationId}, thời điểm báo: ${triggerDate.toLocaleString('vi-VN')}`
    );
    return notificationId;
  } catch (error) {
    console.warn('[NotificationHelper] Lỗi khi lập lịch thông báo nhắc nhở:', error);
    return null;
  }
};

/**
 * 3. Hủy thông báo nhắc nhở theo notificationId đã lưu.
 */
export const cancelReminder = async (notificationId: string): Promise<void> => {
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[NotificationHelper] Đã hủy thông báo ID: ${notificationId}`);
  } catch (error) {
    console.warn(
      `[NotificationHelper] Lỗi khi hủy thông báo ID ${notificationId}:`,
      error
    );
  }
};
