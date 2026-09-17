import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Room, TimeSlot, User } from '../types';
import { MOCK_ROOMS } from '../data/rooms';
import { MOCK_BOOKINGS } from '../data/bookings';
import { MOCK_USER } from '../data/mockUser';
import { generateBookingId, generateQrPayload } from '../utils/idGenerator';
import { isSlotBooked, hasUserConflict } from '../utils/conflictChecker';
import {
  scheduleBookingReminder,
  cancelScheduledNotification,
} from '../utils/notifications';

interface BookingState {
  rooms: Room[];
  bookings: Booking[];
  currentUser: User;

  // Actions
  createBooking: (params: {
    roomId: string;
    date: string;
    timeSlot: TimeSlot;
  }) => Promise<{ success: boolean; error?: string; booking?: Booking }>;

  cancelBooking: (bookingId: string) => Promise<boolean>;
  checkInBooking: (bookingId: string) => boolean;
  getRoomById: (roomId: string) => Room | undefined;
  resetToMockData: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      rooms: MOCK_ROOMS,
      bookings: MOCK_BOOKINGS,
      currentUser: MOCK_USER,

      getRoomById: (roomId: string) => {
        return get().rooms.find(r => r.id === roomId);
      },

      createBooking: async ({ roomId, date, timeSlot }) => {
        const { rooms, bookings, currentUser } = get();
        const room = rooms.find(r => r.id === roomId);

        if (!room) {
          return { success: false, error: 'Phòng học không tồn tại.' };
        }

        // 1. Kiểm tra phòng đã có người đặt khung giờ này chưa
        if (isSlotBooked(roomId, date, timeSlot.id, bookings)) {
          return {
            success: false,
            error: `Khung giờ ${timeSlot.startTime} - ${timeSlot.endTime} của ${room.name} đã được đặt bởi sinh viên khác!`,
          };
        }

        // 2. Kiểm tra sinh viên có bị trùng lịch cá nhân không
        if (hasUserConflict(currentUser.id, date, timeSlot.id, bookings)) {
          return {
            success: false,
            error: `Bạn đã có lịch đặt phòng khác trong khung giờ này vào ngày ${date}.`,
          };
        }

        const newBookingId = generateBookingId();
        const qrPayload = generateQrPayload({
          bookingId: newBookingId,
          roomId,
          date,
          timeSlotId: timeSlot.id,
          studentId: currentUser.studentId,
        });

        const newBooking: Booking = {
          id: newBookingId,
          roomId,
          userId: currentUser.id,
          date,
          timeSlotId: timeSlot.id,
          status: 'upcoming',
          qrPayload,
          createdAt: new Date().toISOString(),
        };

        // Lập lịch nhắc nhở Local Notification trước 15 phút
        try {
          await scheduleBookingReminder(newBooking, room, timeSlot);
        } catch (e) {
          console.warn('Không thể lên lịch notification:', e);
        }

        set({
          bookings: [newBooking, ...bookings],
        });

        return { success: true, booking: newBooking };
      },

      cancelBooking: async (bookingId: string) => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return false;

        try {
          await cancelScheduledNotification(booking.id);
        } catch (e) {
          console.warn('Lỗi khi hủy notification:', e);
        }

        set({
          bookings: bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        });
        return true;
      },

      checkInBooking: (bookingId: string) => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking || booking.status !== 'upcoming') return false;

        set({
          bookings: bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'checked-in' as const } : b
          ),
        });
        return true;
      },

      resetToMockData: () => {
        set({
          rooms: MOCK_ROOMS,
          bookings: MOCK_BOOKINGS,
          currentUser: MOCK_USER,
        });
      },
    }),
    {
      name: 'vku_study_room_booking_storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        bookings: state.bookings,
      }),
    }
  )
);
