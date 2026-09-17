import { format, parse, addDays, isBefore, subMinutes } from 'date-fns';

export interface DateItem {
  fullDate: string; // YYYY-MM-DD
  dayOfWeek: string; // T2, T3, T4...
  dayOfMonth: string; // 17, 18...
  isToday: boolean;
}

/**
 * Lấy ngày hôm nay dưới dạng YYYY-MM-DD
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Lấy danh sách n ngày tiếp theo tính từ hôm nay để làm DateSelector
 */
export const getUpcomingDates = (daysCount: number = 7): DateItem[] => {
  const dates: DateItem[] = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const current = addDays(today, i);
    const dayOfWeekIndex = current.getDay();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    dates.push({
      fullDate: format(current, 'yyyy-MM-dd'),
      dayOfWeek: i === 0 ? 'Hôm nay' : dayNames[dayOfWeekIndex],
      dayOfMonth: format(current, 'dd/MM'),
      isToday: i === 0,
    });
  }

  return dates;
};

/**
 * Định dạng chuỗi ngày YYYY-MM-DD sang định dạng hiển thị tiếng Việt (VD: Thứ Năm, 17/09/2026)
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
