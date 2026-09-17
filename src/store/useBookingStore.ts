import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Room, TimeSlot, User } from '../types';
import { MOCK_ROOMS } from '../data/rooms';
import { MOCK_BOOKINGS } from '../data/bookings';
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
    purpose: string;
  }) => Promise<{ success: boolean; error?: string; booking?: Booking }>;

  cancelBooking: (bookingId: string) => Promise<boolean>;
  checkInBooking: (bookingId: string) => boolean;
  getRoomById: (roomId: string) => Room | undefined;
  resetToMockData: () => void;
}

const DEFAULT_USER: User = {
  id: 'user_vku_23it296',
  studentId: '23IT296',
  fullName: 'Nguyễn Thanh Tú',
  email: 'tunt.23it@vku.udn.vn',
  major: 'Kỹ thuật Phần mềm (VKU)',
  phone: '0905 123 456',
  department: 'Khoa Khoa học Máy tính',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      rooms: MOCK_ROOMS,
      bookings: MOCK_BOOKINGS,
      currentUser: DEFAULT_USER,

      getRoomById: (roomId: string) => {
        return get().rooms.find(r => r.id === roomId);
      },

      createBooking: async ({ roomId, date, timeSlot, purpose }) => {
        const { rooms, bookings, currentUser } = get();
        const room = rooms.find(r => r.id === roomId);

        if (!room) {
          return { success: false, error: 'Phòng học không tồn tại.' };
        }

        // 1. Kiểm tra phòng đã có người đặt khung giờ này chưa
        if (isSlotBooked(roomId, date, timeSlot.id, bookings)) {
          return {
            success: false,
            error: `Khung giờ ${timeSlot.label} của ${room.name} đã được đặt bởi sinh viên khác!`,
          };
        }

        // 2. Kiểm tra sinh viên có bị trùng lịch cá nhân không
        if (hasUserConflict(currentUser.id, date, timeSlot.id, bookings)) {
          return {
            success: false,
            error: `Bạn đã có lịch đặt phòng khác trong ${timeSlot.label} vào ngày này.`,
          };
        }

        const newBookingId = generateBookingId();
        const qrCode = generateQrPayload({
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
          userName: currentUser.fullName,
          studentId: currentUser.studentId,
          date,
          timeSlot,
          purpose: purpose.trim() || 'Học tập / Nghiên cứu tự do',
          status: 'CONFIRMED',
          qrCode,
          createdAt: new Date().toISOString(),
        };

        // Lập lịch nhắc nhở Local Notification trước 15 phút
        try {
          const notificationId = await scheduleBookingReminder(newBooking, room);
          if (notificationId) {
            newBooking.notificationId = notificationId;
          }
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

        // Hủy notification đã lên lịch
        if (booking.notificationId) {
          await cancelScheduledNotification(booking.notificationId);
        }

        set({
          bookings: bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
          ),
        });
        return true;
      },

      checkInBooking: (bookingId: string) => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking || booking.status !== 'CONFIRMED') return false;

        set({
          bookings: bookings.map(b =>
            b.id === bookingId
              ? {
                  ...b,
                  status: 'CHECKED_IN' as const,
                  checkedInAt: new Date().toISOString(),
                }
              : b
          ),
        });
        return true;
      },

      resetToMockData: () => {
        set({
          rooms: MOCK_ROOMS,
          bookings: MOCK_BOOKINGS,
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
