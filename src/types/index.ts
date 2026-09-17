/**
 * Core TypeScript Interfaces & Types for VKU Room Booking App
 */

export type BuildingCode = 'All' | 'A' | 'B' | 'C' | 'V';

export type RoomStatus = 'available' | 'maintenance' | 'full';

export type EquipmentType =
  | 'Projector'
  | 'Whiteboard'
  | 'Smart TV'
  | 'High-Speed LAN'
  | 'Air Conditioner'
  | 'Sound System'
  | 'Power Outlets'
  | 'Conference Mic';

export interface Room {
  id: string;
  name: string;
  code: string;
  building: 'A' | 'B' | 'C' | 'V';
  floor: number;
  capacity: number;
  equipment: EquipmentType[];
  status: RoomStatus;
  image: string;
  description: string;
  lightingType?: 'Natural' | 'Studio' | 'Standard';
  hasEthernet?: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "09:30"
  label: string;     // e.g. "07:30 - 09:30"
  isBooked?: boolean;
}

export type BookingStatus = 'confirmed' | 'checked-in' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  floor: number;
  userId: string;
  userName: string;
  userStudentId: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  qrCode: string; // Payload string encoded in QR code
  createdAt: string; // ISO 8601 string
  status: BookingStatus;
  notificationId?: string;
}

export interface UserSession {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  avatarUrl?: string;
  role: 'student' | 'lecturer' | 'researcher';
}

export interface FilterState {
  building: BuildingCode;
  capacityCategory: 'all' | 'small' | 'medium' | 'large'; // all, <6, 6-10, >10
  equipment: EquipmentType[];
  searchQuery: string;
}

export type RootStackParamList = {
  Home: undefined;
  RoomDetail: { roomId: string };
  BookingPass: { bookingId: string };
  MyBookings: undefined;
};

