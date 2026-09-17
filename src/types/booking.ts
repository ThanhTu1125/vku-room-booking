export interface TimeSlot {
  id: string;
  startTime: string; // ví dụ "07:30"
  endTime: string; // ví dụ "09:30"
}

export type BookingStatus = 'upcoming' | 'checked-in' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  date: string; // ISO yyyy-MM-dd
  timeSlotId: string;
  status: BookingStatus;
  qrPayload: string;
  createdAt: string;
  notificationId?: string | null;
}
