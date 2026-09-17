/**
 * Tương thích ngược: Re-export các hàm từ notificationHelper.
 * Tuyệt đối không import tĩnh expo-notifications tại đây để tránh crash trên Expo Go / Snack.
 */
export {
  requestNotificationPermission as requestNotificationPermissions,
  scheduleCheckInReminder as scheduleBookingReminder,
  setupNotificationChannel,
  setupNotificationHandler,
  cancelReminder,
} from './notificationHelper';
