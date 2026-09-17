import { format, addDays } from 'date-fns';
import { Booking } from '../types';

const now = new Date();
const today = format(now, 'yyyy-MM-dd');
const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd');
const yesterday = format(addDays(now, -1), 'yyyy-MM-dd');

export const MOCK_BOOKINGS: Booking[] = [
  // 1. Hôm nay - Slot 1 tại Phòng A.101 (Trạng thái upcoming) -> test conflict slot-1
  {
    id: 'BK-2026-001',
    roomId: 'room-a101',
    userId: 'user-vku-01',
    date: today,
    timeSlotId: 'slot-1',
    status: 'upcoming',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-001',
      roomId: 'room-a101',
      date: today,
      slot: 'slot-1',
      user: 'user-vku-01',
    }),
    createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
  },

  // 2. Hôm nay - Slot 2 tại Phòng A.101 (Trạng thái checked-in) -> test conflict slot-2
  {
    id: 'BK-2026-002',
    roomId: 'room-a101',
    userId: 'user-vku-02',
    date: today,
    timeSlotId: 'slot-2',
    status: 'checked-in',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-002',
      roomId: 'room-a101',
      date: today,
      slot: 'slot-2',
      user: 'user-vku-02',
    }),
    createdAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
  },

  // 3. Hôm nay - Slot 3 tại Phòng Lab B.202 (Trạng thái upcoming)
  {
    id: 'BK-2026-003',
    roomId: 'room-b202',
    userId: 'user-vku-01',
    date: today,
    timeSlotId: 'slot-3',
    status: 'upcoming',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-003',
      roomId: 'room-b202',
      date: today,
      slot: 'slot-3',
      user: 'user-vku-01',
    }),
    createdAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
  },

  // 4. Hôm nay - Slot 4 tại Phòng Lab V.102 (Trạng thái upcoming)
  {
    id: 'BK-2026-004',
    roomId: 'room-v102',
    userId: 'user-vku-03',
    date: today,
    timeSlotId: 'slot-4',
    status: 'upcoming',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-004',
      roomId: 'room-v102',
      date: today,
      slot: 'slot-4',
      user: 'user-vku-03',
    }),
    createdAt: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
  },

  // 5. Ngày mai - Slot 1 tại Phòng A.101 (Trạng thái upcoming) -> test conflict ngày mai
  {
    id: 'BK-2026-005',
    roomId: 'room-a101',
    userId: 'user-vku-04',
    date: tomorrow,
    timeSlotId: 'slot-1',
    status: 'upcoming',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-005',
      roomId: 'room-a101',
      date: tomorrow,
      slot: 'slot-1',
      user: 'user-vku-04',
    }),
    createdAt: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
  },

  // 6. Ngày mai - Slot 2 tại Phòng C.102 (Trạng thái upcoming)
  {
    id: 'BK-2026-006',
    roomId: 'room-c102',
    userId: 'user-vku-01',
    date: tomorrow,
    timeSlotId: 'slot-2',
    status: 'upcoming',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-006',
      roomId: 'room-c102',
      date: tomorrow,
      slot: 'slot-2',
      user: 'user-vku-01',
    }),
    createdAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
  },

  // 7. Hôm qua - Đã hoàn thành (completed)
  {
    id: 'BK-2026-007',
    roomId: 'room-v202',
    userId: 'user-vku-01',
    date: yesterday,
    timeSlotId: 'slot-1',
    status: 'completed',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-007',
      roomId: 'room-v202',
      date: yesterday,
      slot: 'slot-1',
      user: 'user-vku-01',
    }),
    createdAt: new Date(now.getTime() - 30 * 3600 * 1000).toISOString(),
  },

  // 8. Hôm qua - Đã hủy (cancelled)
  {
    id: 'BK-2026-008',
    roomId: 'room-b101',
    userId: 'user-vku-01',
    date: yesterday,
    timeSlotId: 'slot-3',
    status: 'cancelled',
    qrPayload: JSON.stringify({
      bookingId: 'BK-2026-008',
      roomId: 'room-b101',
      date: yesterday,
      slot: 'slot-3',
      user: 'user-vku-01',
    }),
    createdAt: new Date(now.getTime() - 32 * 3600 * 1000).toISOString(),
  },
];
