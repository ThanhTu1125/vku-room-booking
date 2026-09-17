import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Room, Booking, Building, Equipment, TimeSlot } from '../types';
import { MOCK_ROOMS } from '../data/rooms';
import { MOCK_BOOKINGS } from '../data/bookings';
import { MOCK_USER } from '../data/mockUser';
import { TIME_SLOTS } from '../constants/timeSlots';
import { generateBookingId } from '../utils/idGenerator';
import { scheduleCheckInReminder, cancelReminder } from '../utils/notificationHelper';
import { isSlotConflicting, hasUserConflict } from '../utils/conflictChecker';

export interface BookingFilters {
  searchText: string;
  buildings: Building[];
  capacityRange: [number, number] | null;
  equipment: Equipment[];
}

export interface BookingState {
  // STATE
  currentUser: User | null;
  rooms: Room[];
  bookings: Booking[];
  filters: BookingFilters;
  _hasHydrated: boolean;

  // ACTIONS
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  setSearchText: (text: string) => void;
  toggleBuildingFilter: (building: Building) => void;
  toggleEquipmentFilter: (equipment: Equipment) => void;
  setCapacityRange: (range: [number, number] | null) => void;
  resetFilters: () => void;

  getAvailableSlotsForRoom: (
    roomId: string,
    date: string
  ) => { slot: TimeSlot; isBooked: boolean }[];

  createBooking: (
    roomId: string,
    date: string,
    timeSlotId: string
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

  cancelBooking: (bookingId: string) => Promise<void>;
  getUserBookings: () => Booking[];
  getFilteredRooms: () => Room[];

  // Helper actions phục vụ UI
  getRoomById: (roomId: string) => Room | undefined;
  checkInBooking: (bookingId: string) => boolean;
  resetToMockData: () => void;
}

const INITIAL_FILTERS: BookingFilters = {
  searchText: '',
  buildings: [],
  capacityRange: null,
  equipment: [],
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // 1. STATE
      currentUser: null,
      rooms: MOCK_ROOMS,
      bookings: MOCK_BOOKINGS,
      filters: INITIAL_FILTERS,
      _hasHydrated: false,

      // 2. AUTH & HYDRATION ACTIONS
      setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
      login: (user: User) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      // 3. FILTER ACTIONS
      setSearchText: (searchText: string) =>
        set(state => ({
          filters: { ...state.filters, searchText },
        })),

      toggleBuildingFilter: (building: Building) =>
        set(state => {
          const current = state.filters.buildings;
          const exists = current.includes(building);
          return {
            filters: {
              ...state.filters,
              buildings: exists
                ? current.filter(b => b !== building)
                : [...current, building],
            },
          };
        }),

      toggleEquipmentFilter: (equipment: Equipment) =>
        set(state => {
          const current = state.filters.equipment;
          const exists = current.includes(equipment);
          return {
            filters: {
              ...state.filters,
              equipment: exists
                ? current.filter(e => e !== equipment)
                : [...current, equipment],
            },
          };
        }),

      setCapacityRange: (capacityRange: [number, number] | null) =>
        set(state => ({
          filters: { ...state.filters, capacityRange },
        })),

      resetFilters: () => set({ filters: INITIAL_FILTERS }),

      // 4. SLOT AVAILABILITY QUERY
      getAvailableSlotsForRoom: (roomId: string, date: string) => {
        const { bookings } = get();

        return TIME_SLOTS.map(slot => ({
          slot,
          isBooked: isSlotConflicting(bookings, roomId, date, slot.id),
        }));
      },

      // 5. BOOKING CREATION WITH CONFLICT PREVENTION
      createBooking: async (roomId: string, date: string, timeSlotId: string) => {
        const { rooms, bookings, currentUser } = get();

        // Kiểm tra phiên đăng nhập
        if (!currentUser) {
          return {
            success: false,
            error: 'Vui lòng đăng nhập tài khoản sinh viên trước khi đặt phòng.',
          };
        }

        // Kiểm tra phòng học tồn tại
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
          return {
            success: false,
            error: 'Phòng học không tồn tại trong hệ thống.',
          };
        }

        // Kiểm tra timeSlot hợp lệ
        const slot = TIME_SLOTS.find(s => s.id === timeSlotId);
        if (!slot) {
          return {
            success: false,
            error: 'Khung giờ đặt phòng không hợp lệ.',
          };
        }

        // 🛡️ DOUBLE-CHECK: Kiểm tra trùng lịch phòng học (chống race condition & UI bypass)
        if (isSlotConflicting(bookings, roomId, date, timeSlotId)) {
          return {
            success: false,
            error: `Khung giờ ${slot.startTime} - ${slot.endTime} ngày ${date} tại ${room.name} đã được đặt bởi người khác. Vui lòng chọn ca hoặc phòng khác!`,
          };
        }

        // 🛡️ DOUBLE-CHECK: Kiểm tra sinh viên có bị trùng lịch học cá nhân không
        if (hasUserConflict(bookings, currentUser.id, date, timeSlotId)) {
          return {
            success: false,
            error: `Bạn đã có một lịch đặt phòng khác trong khung giờ ${slot.startTime} - ${slot.endTime} ngày ${date}. Không thể đặt 2 phòng cùng lúc.`,
          };
        }

        // Khởi tạo vé đặt phòng mới
        const newBookingId = generateBookingId();
        const qrPayload = JSON.stringify({
          bookingId: newBookingId,
          roomId,
          date,
          timeSlotId,
          userId: currentUser.id,
          studentId: currentUser.studentId,
          timestamp: Date.now(),
        });

        const newBooking: Booking = {
          id: newBookingId,
          roomId,
          userId: currentUser.id,
          date,
          timeSlotId,
          status: 'upcoming',
          qrPayload,
          createdAt: new Date().toISOString(),
          notificationId: null,
        };

        // Lập lịch Local Notification nhắc trước 15 phút và lưu notificationId vào booking object trước khi thêm vào state
        try {
          const notificationId = await scheduleCheckInReminder(newBooking, room, slot);
          newBooking.notificationId = notificationId;
        } catch (err) {
          console.warn('[useBookingStore] Lập lịch thông báo thất bại:', err);
        }

        // Cập nhật State toàn cục
        set({
          bookings: [newBooking, ...bookings],
        });

        return {
          success: true,
          booking: newBooking,
        };
      },

      // 6. CANCEL BOOKING
      cancelBooking: async (bookingId: string) => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // Nếu booking có notificationId, gọi cancelReminder trước khi đổi status
        if (booking.notificationId) {
          try {
            await cancelReminder(booking.notificationId);
          } catch (err) {
            console.warn('[useBookingStore] Hủy thông báo thất bại:', err);
          }
        }

        set({
          bookings: bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        });
      },

      // 7. GET USER BOOKINGS (Sắp xếp mới nhất lên đầu)
      getUserBookings: () => {
        const { bookings, currentUser } = get();
        if (!currentUser) return [];

        return bookings
          .filter(b => b.userId === currentUser.id)
          .sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.timeSlotId.localeCompare(a.timeSlotId);
          });
      },

      // 8. GET FILTERED ROOMS (Tìm kiếm + Bộ lọc)
      getFilteredRooms: () => {
        const { rooms, filters } = get();
        const { searchText, buildings, capacityRange, equipment } = filters;

        return rooms.filter(room => {
          // Lọc theo từ khóa tìm kiếm (tên phòng, không phân biệt hoa thường)
          if (searchText.trim()) {
            const query = searchText.toLowerCase().trim();
            const matchName = room.name.toLowerCase().includes(query);
            const matchBuilding =
              `tòa ${room.building}`.toLowerCase().includes(query) ||
              room.building.toLowerCase() === query;
            if (!matchName && !matchBuilding) return false;
          }

          // Lọc theo tòa nhà
          if (buildings.length > 0 && !buildings.includes(room.building)) {
            return false;
          }

          // Lọc theo khoảng sức chứa [min, max]
          if (capacityRange) {
            const [min, max] = capacityRange;
            if (room.capacity < min || room.capacity > max) {
              return false;
            }
          }

          // Lọc theo thiết bị (phải sở hữu tất cả thiết bị yêu cầu)
          if (equipment.length > 0) {
            const hasAllEquipment = equipment.every(eq => room.equipment.includes(eq));
            if (!hasAllEquipment) return false;
          }

          return true;
        });
      },

      // 9. HELPER ACTIONS
      getRoomById: (roomId: string) => {
        return get().rooms.find(r => r.id === roomId);
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
          currentUser: MOCK_USER,
          rooms: MOCK_ROOMS,
          bookings: MOCK_BOOKINGS,
          filters: INITIAL_FILTERS,
        });
      },
    }),
    {
      name: 'study-room-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        currentUser: state.currentUser,
        bookings: state.bookings,
      }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    }
  )
);
