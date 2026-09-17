export interface TimeSlot {
  id: string; // 'slot_1', 'slot_2', ...
  label: string; // 'Ca 1 (07:00 - 09:00)'
  startTime: string; // '07:00'
  endTime: string; // '09:00'
}

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'EXPIRED';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  studentId?: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  purpose: string;
  status: BookingStatus;
  qrCode: string; // Chuỗi token hoặc JSON để quét check-in
  notificationId?: string;
  createdAt: string;
  checkedInAt?: string;
}
