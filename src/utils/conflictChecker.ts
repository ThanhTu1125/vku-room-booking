import { Booking, Room, TimeSlot } from '../types';
import { isSlotInPast } from './dateHelpers';

/**
 * Kiểm tra xem một ca học cụ thể của một phòng trong một ngày đã có người đặt chưa
 */
export const isSlotBooked = (
  roomId: string,
  date: string,
  timeSlotId: string,
  bookings: Booking[]
): boolean => {
  return bookings.some(
    b =>
      b.roomId === roomId &&
      b.date === date &&
      b.timeSlotId === timeSlotId &&
      (b.status === 'upcoming' || b.status === 'checked-in')
  );
};

/**
 * Lấy danh sách ID các ca học đã bị đặt của một phòng trong một ngày
 */
export const getBookedSlotIdsForRoom = (
  roomId: string,
  date: string,
  bookings: Booking[]
): string[] => {
  return bookings
    .filter(
      b =>
        b.roomId === roomId &&
        b.date === date &&
        (b.status === 'upcoming' || b.status === 'checked-in')
    )
    .map(b => b.timeSlotId);
};

export type SlotAvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'PAST';

/**
 * Lấy trạng thái khả dụng của từng ca học cho phòng trong ngày chọn
 */
export const getSlotAvailability = (
  room: Room,
  date: string,
  slot: TimeSlot,
  bookings: Booking[]
): SlotAvailabilityStatus => {
  if (isSlotInPast(date, slot.endTime)) {
    return 'PAST';
  }

  if (isSlotBooked(room.id, date, slot.id, bookings)) {
    return 'BOOKED';
  }

  return 'AVAILABLE';
};

/**
 * Kiểm tra xem sinh viên có bị trùng lịch học cá nhân trong cùng khung giờ không
 */
export const hasUserConflict = (
  userId: string,
  date: string,
  timeSlotId: string,
  bookings: Booking[]
): boolean => {
  return bookings.some(
    b =>
      b.userId === userId &&
      b.date === date &&
      b.timeSlotId === timeSlotId &&
      (b.status === 'upcoming' || b.status === 'checked-in')
  );
};
