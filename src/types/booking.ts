import { Building } from './room';

export interface TimeSlot {
  id: string;
  startTime: string; // ví dụ "07:30"
  endTime: string; // ví dụ "09:30"
}

export type BookingStatus = 'upcoming' | 'cancelled';
export type BookingDisplayStatus = 'upcoming' | 'past' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  building: Building | string;
  floor: number;
  userId: string;
  userDisplayName: string;
  date: string; // "yyyy-MM-dd"
  timeSlotId: string;
  timeSlotLabel: string; // "13:00 - 15:00"
  timeSlotStartISO: string; // ISO datetime đầy đủ (ngày + giờ bắt đầu)
  timeSlotEndISO: string; // ISO datetime đầy đủ (ngày + giờ kết thúc)
  status: BookingStatus;
  qrPayload: string;
  notificationId: string | null;
  createdAt: string;
}
