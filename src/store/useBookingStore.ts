import { create } from 'zustand';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  runTransaction,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Room, Booking, Building, Equipment, TimeSlot } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { scheduleCheckInReminder, cancelReminder } from '../utils/notificationHelper';
import { authService } from '../services/authService';

export interface BookingFilters {
  searchText: string;
  buildings: Building[];
  capacityRange: [number, number] | null;
  equipment: Equipment[];
}

export interface BookingState {
  // STATE
  currentUser: User | null;
  isAuthChecking: boolean;
  rooms: Room[];
  bookings: Booking[];
  filters: BookingFilters;
  _hasHydrated: boolean;

  // ACTIONS
  setHasHydrated: (hasHydrated: boolean) => void;
  setIsAuthChecking: (isChecking: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;

  // REAL-TIME FIRESTORE LISTENERS
  subscribeToRooms: () => () => void;
  subscribeToBookings: () => () => void;

  // FILTER ACTIONS
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

export const useBookingStore = create<BookingState>((set, get) => ({
  // 1. STATE (Rooms & Bookings được đồng bộ từ Firestore thay vì mock data)
  currentUser: null,
  isAuthChecking: true,
  rooms: [],
  bookings: [],
  filters: INITIAL_FILTERS,
  _hasHydrated: true,

  // 2. AUTH ACTIONS
  setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
  setIsAuthChecking: (isChecking: boolean) => set({ isAuthChecking: isChecking }),
  setCurrentUser: (user: User | null) => set({ currentUser: user }),
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('[useBookingStore] Đăng xuất thất bại:', err);
    }
    set({ currentUser: null });
  },

  // 3. REAL-TIME FIRESTORE LISTENERS
  subscribeToRooms: () => {
    const roomsCol = collection(db, 'rooms');
    return onSnapshot(
      roomsCol,
      snapshot => {
        const roomsList: Room[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || '',
            building: data.building || 'A',
            floor: data.floor || 1,
            capacity: data.capacity || 0,
            equipment: data.equipment || [],
            photoUrl: data.photoUrl || `https://picsum.photos/seed/${docSnap.id}/400/300`,
            status: data.status || 'available',
          };
        });
        set({ rooms: roomsList });
      },
      error => {
        console.warn('[useBookingStore] Lỗi lắng nghe collection "rooms":', error);
      }
    );
  },

  subscribeToBookings: () => {
    const bookingsCol = collection(db, 'bookings');
    return onSnapshot(
      bookingsCol,
      snapshot => {
        const bookingsList: Booking[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt?.toDate) {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = data.createdAt;
          }

          return {
            id: docSnap.id,
            roomId: data.roomId,
            roomName: data.roomName || '',
            building: data.building || '',
            floor: data.floor || 1,
            userId: data.userId,
            userDisplayName: data.userDisplayName || '',
            date: data.date,
            timeSlotId: data.timeSlotId,
            timeSlotLabel: data.timeSlotLabel || '',
            timeSlotStartISO: data.timeSlotStartISO || '',
            timeSlotEndISO: data.timeSlotEndISO || '',
            status: data.status,
            qrPayload: data.qrPayload || '',
            notificationId: data.notificationId || null,
            createdAt: createdAtStr,
          };
        });
        set({ bookings: bookingsList });
      },
      error => {
        console.warn('[useBookingStore] Lỗi lắng nghe collection "bookings":', error);
      }
    );
  },

  // 4. FILTER ACTIONS
  setSearchText: (searchText: string) =>
    set(state => ({
      filters: { ...state.filters, searchText },
    })),

  toggleBuildingFilter: (building: Building) =>
    set(state => {
      const current = state.filters.buildings;
      const exists = current.includes(building);
      const newBuildings = exists
        ? current.filter(b => b !== building)
        : [...current, building];

      return {
        filters: { ...state.filters, buildings: newBuildings },
      };
    }),

  toggleEquipmentFilter: (equipment: Equipment) =>
    set(state => {
      const current = state.filters.equipment;
      const exists = current.includes(equipment);
      const newEquipment = exists
        ? current.filter(e => e !== equipment)
        : [...current, equipment];

      return {
        filters: { ...state.filters, equipment: newEquipment },
      };
    }),

  setCapacityRange: (range: [number, number] | null) =>
    set(state => ({
      filters: { ...state.filters, capacityRange: range },
    })),

  resetFilters: () =>
    set({
      filters: INITIAL_FILTERS,
    }),

  // 5. GET AVAILABLE SLOTS (Đọc từ state bookings real-time)
  getAvailableSlotsForRoom: (roomId: string, date: string) => {
    const { bookings } = get();

    return TIME_SLOTS.map(slot => {
      const isBooked = bookings.some(
        b =>
          b.roomId === roomId &&
          b.date === date &&
          b.timeSlotId === slot.id &&
          b.status !== 'cancelled'
      );
      return {
        slot,
        isBooked,
      };
    });
  },

  // 6. BOOKING CREATION WITH FIRESTORE TRANSACTION & LOCK
  createBooking: async (roomId: string, date: string, timeSlotId: string) => {
    const { rooms, currentUser } = get();

    if (!currentUser) {
      return {
        success: false,
        error: 'Vui lòng đăng nhập tài khoản sinh viên trước khi đặt phòng.',
      };
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      return {
        success: false,
        error: 'Phòng học không tồn tại trong hệ thống.',
      };
    }

    const slot = TIME_SLOTS.find(s => s.id === timeSlotId);
    if (!slot) {
      return {
        success: false,
        error: 'Khung giờ đặt phòng không hợp lệ.',
      };
    }

    const currentUserId = currentUser.uid || currentUser.id || '';
    const currentUserName =
      currentUser.displayName || currentUser.name || 'Sinh viên VKU';
    const timeSlotLabel = `${slot.startTime} - ${slot.endTime}`;
    const startDateTime = new Date(`${date}T${slot.startTime}:00`);
    const endDateTime = new Date(`${date}T${slot.endTime}:00`);
    const timeSlotStartISO = startDateTime.toISOString();
    const timeSlotEndISO = endDateTime.toISOString();

    // Kiểm tra thời gian: nếu ca học đã ở quá khứ
    if (endDateTime < new Date()) {
      return {
        success: false,
        error: 'Không thể đặt ca học đã trôi qua trong quá khứ.',
      };
    }

    const slotLockRef = doc(db, 'slot_locks', `${roomId}_${date}_${timeSlotId}`);
    const newBookingDocRef = doc(collection(db, 'bookings'));
    const newBookingId = newBookingDocRef.id;

    const qrPayload = JSON.stringify({
      bookingId: newBookingId,
      roomId,
      roomName: room.name,
      date,
      timeSlotId,
      timeSlotLabel,
      userId: currentUserId,
      studentId: currentUser.studentId,
      timestamp: Date.now(),
    });

    const bookingDocData = {
      roomId,
      roomName: room.name,
      building: room.building,
      floor: room.floor,
      userId: currentUserId,
      userDisplayName: currentUserName,
      date,
      timeSlotId,
      timeSlotLabel,
      timeSlotStartISO,
      timeSlotEndISO,
      status: 'upcoming' as const,
      qrPayload,
      notificationId: null as string | null,
      createdAt: serverTimestamp(),
    };

    try {
      await runTransaction(db, async transaction => {
        // 1. Transaction read: kiểm tra slot lock document
        const slotLockDoc = await transaction.get(slotLockRef);
        if (slotLockDoc.exists()) {
          const lockData = slotLockDoc.data();
          if (lockData.status !== 'cancelled') {
            throw new Error('Khung giờ này vừa được người khác đặt');
          }
        }

        // 2. Query kiểm tra trùng slot phòng học
        const roomSlotQ = query(
          collection(db, 'bookings'),
          where('roomId', '==', roomId),
          where('date', '==', date),
          where('timeSlotId', '==', timeSlotId),
          where('status', '==', 'upcoming')
        );
        const roomSlotSnap = await getDocs(roomSlotQ);
        if (!roomSlotSnap.empty) {
          throw new Error('Khung giờ này vừa được người khác đặt');
        }

        // 3. Query kiểm tra sinh viên có bị trùng lịch học cá nhân không
        const userSlotQ = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUserId),
          where('date', '==', date),
          where('timeSlotId', '==', timeSlotId),
          where('status', '==', 'upcoming')
        );
        const userSlotSnap = await getDocs(userSlotQ);
        if (!userSlotSnap.empty) {
          throw new Error(
            `Bạn đã có một lịch đặt phòng khác trong khung giờ ${timeSlotLabel} ngày ${date}. Không thể đặt 2 phòng cùng lúc.`
          );
        }

        // 4. Ghi transaction: cập nhật lock và tạo booking document mới
        transaction.set(slotLockRef, {
          bookingId: newBookingId,
          roomId,
          date,
          timeSlotId,
          status: 'upcoming',
          userId: currentUserId,
          updatedAt: serverTimestamp(),
        });

        transaction.set(newBookingDocRef, bookingDocData);
      });

      const newBooking: Booking = {
        id: newBookingId,
        roomId,
        roomName: room.name,
        building: room.building,
        floor: room.floor,
        userId: currentUserId,
        userDisplayName: currentUserName,
        date,
        timeSlotId,
        timeSlotLabel,
        timeSlotStartISO,
        timeSlotEndISO,
        status: 'upcoming',
        qrPayload,
        notificationId: null,
        createdAt: new Date().toISOString(),
      };

      // Lập lịch notification cục bộ nhắc trước 15 phút
      try {
        const notificationId = await scheduleCheckInReminder(newBooking, room, slot);
        if (notificationId) {
          newBooking.notificationId = notificationId;
          await updateDoc(newBookingDocRef, { notificationId });
        }
      } catch (err) {
        console.warn('[useBookingStore] Lập lịch thông báo thất bại:', err);
      }

      return {
        success: true,
        booking: newBooking,
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Đã xảy ra lỗi khi đặt phòng, vui lòng thử lại';
      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  // 7. CANCEL BOOKING (Cập nhật Firestore status='cancelled' & hủy notification)
  cancelBooking: async (bookingId: string) => {
    const { bookings } = get();
    const booking = bookings.find(b => b.id === bookingId);

    if (booking?.notificationId) {
      try {
        await cancelReminder(booking.notificationId);
      } catch (err) {
        console.warn('[useBookingStore] Hủy thông báo thất bại:', err);
      }
    }

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'cancelled' });

      if (booking) {
        const slotLockRef = doc(
          db,
          'slot_locks',
          `${booking.roomId}_${booking.date}_${booking.timeSlotId}`
        );
        await updateDoc(slotLockRef, { status: 'cancelled' }).catch(() => {});
      }
    } catch (err) {
      console.error('[useBookingStore] Lỗi hủy booking trên Firestore:', err);
    }
  },

  // 8. GET USER BOOKINGS
  getUserBookings: () => {
    const { bookings, currentUser } = get();
    if (!currentUser) return [];

    const currentUserId = currentUser.uid || currentUser.id || '';

    return bookings
      .filter(b => b.userId === currentUserId)
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.timeSlotId.localeCompare(a.timeSlotId);
      });
  },

  // 9. GET FILTERED ROOMS
  getFilteredRooms: () => {
    const { rooms, filters } = get();
    const { searchText, buildings, capacityRange, equipment } = filters;

    return rooms.filter(room => {
      if (searchText.trim()) {
        const query = searchText.toLowerCase().trim();
        const matchName = room.name.toLowerCase().includes(query);
        const matchBuilding =
          `tòa ${room.building}`.toLowerCase().includes(query) ||
          room.building.toLowerCase() === query;
        if (!matchName && !matchBuilding) return false;
      }

      if (buildings.length > 0 && !buildings.includes(room.building)) {
        return false;
      }

      if (capacityRange) {
        const [min, max] = capacityRange;
        if (room.capacity < min || room.capacity > max) {
          return false;
        }
      }

      if (equipment.length > 0) {
        const hasAllEquipment = equipment.every(eq => room.equipment.includes(eq));
        if (!hasAllEquipment) return false;
      }

      return true;
    });
  },

  // 10. HELPER ACTIONS
  getRoomById: (roomId: string) => {
    return get().rooms.find(r => r.id === roomId);
  },

  checkInBooking: (_bookingId: string) => {
    return true;
  },

  resetToMockData: () => {
    set({
      filters: INITIAL_FILTERS,
    });
  },
}));
