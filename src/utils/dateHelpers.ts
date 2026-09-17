import { format, parse, addDays, isBefore, subMinutes } from 'date-fns';
import { TimeSlot } from '../types';

export interface NextDayItem {
  date: string; // ISO yyyy-MM-dd
  label: string; // ví dụ "Hôm nay 17/09", "T6 18/09"
}

/**
 * Trả về mảng 7 ngày kể từ hôm nay (dùng date-fns)
 * Mỗi phần tử gồm { date: string ISO, label: string }
 */
export const getNext7Days = (): NextDayItem[] => {
  const result: NextDayItem[] = [];
  const today = new Date();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  for (let i = 0; i < 7; i++) {
    const current = addDays(today, i);
    const date = format(current, 'yyyy-MM-dd');
    const dayOfWeek = dayNames[current.getDay()];
    const dayMonth = format(current, 'dd/MM');
    const label = i === 0 ? `Hôm nay ${dayMonth}` : `${dayOfWeek} ${dayMonth}`;

    result.push({
      date,
      label,
    });
  }

  return result;
};

/**
 * Format nhãn hiển thị cho một TimeSlot (ví dụ "07:30 - 09:30")
 */
export const formatSlotLabel = (slot: TimeSlot): string => {
  return `${slot.startTime} - ${slot.endTime}`;
};

/**
 * Lấy ngày hôm nay dưới dạng YYYY-MM-DD
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Định dạng chuỗi ngày YYYY-MM-DD sang hiển thị tiếng Việt (VD: Thứ Năm, 17/09/2026)
 */
export const formatDisplayDate = (dateStr: string): string => {
  try {
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    const dayOfWeekIndex = parsedDate.getDay();
    const dayNames = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];
    return `${dayNames[dayOfWeekIndex]}, ${format(parsedDate, 'dd/MM/yyyy')}`;
  } catch {
    return dateStr;
  }
};

/**
 * Kiểm tra một ca học trong ngày đã trôi qua so với giờ hiện tại chưa
 */
export const isSlotInPast = (dateStr: string, endTimeStr: string): boolean => {
  try {
    const slotEndTime = parse(`${dateStr} ${endTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    return isBefore(slotEndTime, new Date());
  } catch {
    return false;
  }
};

/**
 * Tính toán thời điểm trước 15 phút so với giờ bắt đầu ca học
 */
export const get15MinutesBeforeSlot = (dateStr: string, startTimeStr: string): Date => {
  try {
    const slotStartTime = parse(
      `${dateStr} ${startTimeStr}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );
    return subMinutes(slotStartTime, 15);
  } catch {
    return new Date();
  }
};
