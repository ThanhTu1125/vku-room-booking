import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Room,
  TimeSlot,
  Booking,
  UserSession,
  FilterState,
  EquipmentType,
  BuildingCode,
} from '../types';
import { CURRENT_USER, INITIAL_ROOMS, INITIAL_BOOKINGS } from '../utils/mockData';
import { scheduleBookingReminder, cancelScheduledNotification } from '../utils/notifications';

interface BookingStoreState {
  // State
  userSession: UserSession;
  rooms: Room[];
  bookings: Booking[];
  filters: FilterState;

  // Actions
  setFilter: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleEquipmentFilter: (item: EquipmentType) => void;

  // Conflict Engine & Booking Actions
  isSlotBooked: (roomId: string, date: string, startTime: string) => boolean;
  bookRoom: (
    roomId: string,
    date: string,
    timeSlot: TimeSlot
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;

  // Getters & Selectors
  getFilteredRooms: () => Room[];
  getRoomById: (roomId: string) => Room | undefined;
  getBookingById: (bookingId: string) => Booking | undefined;
  getUserBookings: () => Booking[];
}

const DEFAULT_FILTERS: FilterState = {
  building: 'All',
  capacityCategory: 'all',
  equipment: [],
  searchQuery: '',
};

export const useBookingStore = create<BookingStoreState>()(
  persist(
    (set, get) => ({
      userSession: CURRENT_USER,
      rooms: INITIAL_ROOMS,
      bookings: INITIAL_BOOKINGS,
      filters: DEFAULT_FILTERS,

      setFilter: (partial) =>
        set((state) => ({
          filters: { ...state.filters, ...partial },
        })),

      resetFilters: () =>
        set(() => ({
          filters: DEFAULT_FILTERS,
        })),

      toggleEquipmentFilter: (item: EquipmentType) =>
        set((state) => {
          const exists = state.filters.equipment.includes(item);
          return {
            filters: {
              ...state.filters,
              equipment: exists
                ? state.filters.equipment.filter((e) => e !== item)
                : [...state.filters.equipment, item],
            },
          };
        }),

      /**
       * CONFLICT PREVENTION ENGINE:
       * Checks if the 2-hour slot for a specific room and date is already taken by a confirmed booking.
       */
      isSlotBooked: (roomId: string, date: string, startTime: string): boolean => {
        const { bookings } = get();
        return bookings.some(
          (b) =>
            b.roomId === roomId &&
            b.date === date &&
            b.timeSlot.startTime === startTime &&
            b.status === 'confirmed'
        );
      },

      /**
       * Atomic booking transaction with conflict prevention
       */
      bookRoom: async (roomId: string, date: string, timeSlot: TimeSlot) => {
        const state = get();
        const room = state.rooms.find((r) => r.id === roomId);

        if (!room) {
          return { success: false, error: 'Không tìm thấy thông tin phòng học.' };
        }

        // 1. Conflict Prevention Check
        const conflict = state.isSlotBooked(roomId, date, timeSlot.startTime);
        if (conflict) {
          return {
            success: false,
            error: `Khung giờ ${timeSlot.label} ngày ${date} tại ${room.name} đã được đặt trước bởi người khác!`,
          };
        }

        // 2. Generate Unique Booking details & QR payload
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
        const bookingId = `bkg_${timestamp}_${randomHash}`;

        // QR Code payload containing verification JSON
        const qrPayload = JSON.stringify({
          ticketId: bookingId,
          roomCode: room.code,
          building: room.building,
          floor: room.floor,
          date,
          slot: timeSlot.label,
          studentId: state.userSession.studentId,
          studentName: state.userSession.name,
          issuedAt: new Date().toISOString(),
        });

        const newBooking: Booking = {
          id: bookingId,
          roomId: room.id,
          roomName: room.name,
          building: room.building,
          floor: room.floor,
          userId: state.userSession.id,
          userName: state.userSession.name,
          userStudentId: state.userSession.studentId,
          date,
          timeSlot,
          qrCode: qrPayload,
          createdAt: new Date().toISOString(),
          status: 'confirmed',
        };

        // 3. Schedule 15-minute alert notification
        try {
          const notificationId = await scheduleBookingReminder(newBooking, room);
          if (notificationId) {
            newBooking.notificationId = notificationId;
          }
        } catch (notifErr) {
          console.warn('Failed to schedule reminder:', notifErr);
        }

        // 4. Commit to Zustand state (persists into AsyncStorage)
        set((prevState) => ({
          bookings: [newBooking, ...prevState.bookings],
        }));

        return { success: true, booking: newBooking };
      },

      /**
       * Cancel an active booking and cancel the scheduled notification
       */
      cancelBooking: async (bookingId: string) => {
        const state = get();
        const targetBooking = state.bookings.find((b) => b.id === bookingId);

        if (!targetBooking) {
          return { success: false, message: 'Không tìm thấy lịch đặt phòng.' };
        }

        // Cancel scheduled notification if attached
        if (targetBooking.notificationId) {
          await cancelScheduledNotification(targetBooking.notificationId);
        }

        // Update booking status to cancelled to free up the slot
        set((prevState) => ({
          bookings: prevState.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        }));

        return { success: true, message: 'Đã hủy lịch đặt phòng thành công.' };
      },

      /**
       * High-performance filtered rooms selector
       */
      getFilteredRooms: (): Room[] => {
        const { rooms, filters } = get();

        return rooms.filter((room) => {
          // Building filter
          if (filters.building !== 'All' && room.building !== filters.building) {
            return false;
          }

          // Capacity filter
          if (filters.capacityCategory === 'small' && room.capacity >= 6) {
            return false; // <6 seats
          }
          if (
            filters.capacityCategory === 'medium' &&
            (room.capacity < 6 || room.capacity > 10)
          ) {
            return false; // 6-10 seats
          }
          if (filters.capacityCategory === 'large' && room.capacity <= 10) {
            return false; // >10 seats
          }

          // Equipment filter (must have all selected equipment)
          if (
            filters.equipment.length > 0 &&
            !filters.equipment.every((eq) => room.equipment.includes(eq))
          ) {
            return false;
          }

          // Search query filter (search by room name, code, or description)
          if (filters.searchQuery.trim() !== '') {
            const query = filters.searchQuery.toLowerCase().trim();
            const matchesName = room.name.toLowerCase().includes(query);
            const matchesCode = room.code.toLowerCase().includes(query);
            const matchesDesc = room.description.toLowerCase().includes(query);
            if (!matchesName && !matchesCode && !matchesDesc) {
              return false;
            }
          }

          return true;
        });
      },

      getRoomById: (roomId: string) => {
        return get().rooms.find((r) => r.id === roomId);
      },

      getBookingById: (bookingId: string) => {
        return get().bookings.find((b) => b.id === bookingId);
      },

      getUserBookings: () => {
        const { bookings, userSession } = get();
        return bookings.filter((b) => b.userId === userSession.id);
      },
    }),
    {
      name: 'vku-booking-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bookings: state.bookings,
        userSession: state.userSession,
      }),
    }
  )
);

