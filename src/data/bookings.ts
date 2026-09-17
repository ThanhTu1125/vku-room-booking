import { Booking } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { getTodayString } from '../utils/dateHelpers';
import { generateQrPayload } from '../utils/idGenerator';

const today = getTodayString();

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-VKU-DEMO1',
    roomId: 'room_k302',
    userId: 'user_vku_01',
    userName: 'Nguyễn Thanh Tú',
    studentId: '23IT296',
    date: today,
    timeSlot: TIME_SLOTS[0], // Ca 1: 07:00 - 09:00
    purpose: 'Học nhóm ôn thi lập trình di động React Native',
    status: 'CONFIRMED',
    qrCode: generateQrPayload({
      bookingId: 'BK-VKU-DEMO1',
      roomId: 'room_k302',
      date: today,
      timeSlotId: TIME_SLOTS[0].id,
      studentId: '23IT296',
    }),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'BK-VKU-DEMO2',
    roomId: 'room_v102',
    userId: 'user_vku_02',
    userName: 'Lê Văn An',
    studentId: '23IT001',
    date: today,
    timeSlot: TIME_SLOTS[2], // Ca 3: 13:00 - 15:00
    purpose: 'Thực hành huấn luyện mô hình YOLOv8 nhận diện biển báo',
    status: 'CONFIRMED',
    qrCode: generateQrPayload({
      bookingId: 'BK-VKU-DEMO2',
      roomId: 'room_v102',
      date: today,
      timeSlotId: TIME_SLOTS[2].id,
      studentId: '23IT001',
    }),
    createdAt: new Date().toISOString(),
  },
];
