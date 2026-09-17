import { Booking, Room, TimeSlot } from '../types';
import { isSlotInPast } from './dateHelpers';

/**
 * Pure function kiểm tra xem một ca học cụ thể của một phòng trong một ngày có bị xung đột (đã đặt) hay không.
 * Chỉ tính các booking có status khác 'cancelled'.
 */
export const isSlotConflicting = (
  bookings: Booking[],
  roomId: string,
  date: string,
  timeSlotId: string
): boolean => {
  return bookings.some(
    b =>
      b.roomId === roomId &&
      b.date === date &&
      b.timeSlotId === timeSlotId &&
      b.status !== 'cancelled'
  );
};

/**
 * Kiểm tra xem sinh viên có bị trùng lịch học cá nhân trong cùng khung giờ không
 */
export const hasUserConflict = (
  bookings: Booking[],
  userId: string,
  date: string,
  timeSlotId: string
): boolean => {
  return bookings.some(
    b =>
      b.userId === userId &&
      b.date === date &&
      b.timeSlotId === timeSlotId &&
      b.status !== 'cancelled'
  );
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

  if (isSlotConflicting(bookings, room.id, date, slot.id)) {
    return 'BOOKED';
  }

  return 'AVAILABLE';
};
