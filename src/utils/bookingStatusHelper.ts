import { Booking, BookingDisplayStatus } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';

/**
 * Tính toán động trạng thái hiển thị của một lượt đặt phòng dựa trên thời gian thực tế:
 * - 'cancelled': Người dùng đã hủy đặt phòng
 * - 'past': Giờ kết thúc ca học đã trôi qua so với hiện tại
 * - 'upcoming': Ca học sắp diễn ra hoặc đang trong giờ
 */
export const getBookingDisplayStatus = (booking: Booking): BookingDisplayStatus => {
  if (booking.status === 'cancelled') {
    return 'cancelled';
  }

  // 1. Dùng timeSlotEndISO nếu có
  if (booking.timeSlotEndISO) {
    const endDatetime = new Date(booking.timeSlotEndISO);
    if (!isNaN(endDatetime.getTime())) {
      return endDatetime < new Date() ? 'past' : 'upcoming';
    }
  }

  // 2. Dự phòng an toàn nếu không có timeSlotEndISO (tính từ date + timeSlotId)
  if (booking.date) {
    const slot = TIME_SLOTS.find(s => s.id === booking.timeSlotId);
    const endTime = slot?.endTime || '23:59';
    const fallbackEndStr = `${booking.date}T${endTime}:00`;
    const fallbackDate = new Date(fallbackEndStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate < new Date() ? 'past' : 'upcoming';
    }
  }

  return 'upcoming';
};
