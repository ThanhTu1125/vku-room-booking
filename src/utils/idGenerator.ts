/**
 * Sinh mã đặt phòng duy nhất dạng BK-VKU-XXXXXX
 */
export const generateBookingId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
};

/**
 * Sinh payload cho mã QR Check-in phòng học
 */
export const generateQrPayload = (params: {
  bookingId: string;
  roomId: string;
  date: string;
  timeSlotId: string;
  studentId: string;
}): string => {
  return JSON.stringify({
    app: 'VKU_ROOM_BOOKING',
    id: params.bookingId,
    room: params.roomId,
    date: params.date,
    slot: params.timeSlotId,
    student: params.studentId,
    v: '1.0',
  });
};
