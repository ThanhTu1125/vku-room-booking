/**
 * Date and Time utilities for VKU Study Room Booking
 */

export interface DayOption {
  dateString: string; // YYYY-MM-DD
  dayName: string;   // e.g. "T2", "Hôm nay"
  dayNumber: number; // e.g. 10
  monthNumber: number; // e.g. 9
  isToday: boolean;
  fullDateLabel: string;
}

const VIETNAMESE_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Generate an array of the next 7 days starting from today
 */
export const generateNext7Days = (): DayOption[] => {
  const days: DayOption[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const current = new Date();
    current.setDate(today.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const isToday = i === 0;
    const dayName = isToday ? 'Hôm nay' : VIETNAMESE_DAYS[current.getDay()];

    days.push({
      dateString,
      dayName,
      dayNumber: current.getDate(),
      monthNumber: current.getMonth() + 1,
      isToday,
      fullDateLabel: `${dayName}, ${day}/${month}/${year}`,
    });
  }

  return days;
};

/**
 * Format a YYYY-MM-DD date into friendly Vietnamese text
 */
export const formatDisplayDate = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = VIETNAMESE_DAYS[date.getDay()];
    return `${dayOfWeek}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  } catch {
    return dateString;
  }
};

/**
 * Parses date string (YYYY-MM-DD) and time string (HH:mm) into a local Date object
 */
export const parseDateTime = (dateString: string, timeString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Calculates Date object for 15 minutes prior to slot start
 */
export const get15MinutesBeforeSlot = (dateString: string, startTime: string): Date => {
  const slotDate = parseDateTime(dateString, startTime);
  return new Date(slotDate.getTime() - 15 * 60 * 1000);
};

/**
 * Checks if a slot time on a given date has already passed
 */
export const isSlotInPast = (dateString: string, startTime: string): boolean => {
  const slotDate = parseDateTime(dateString, startTime);
  return slotDate.getTime() <= Date.now();
};

