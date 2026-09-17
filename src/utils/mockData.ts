import { Room, TimeSlot, UserSession, Booking } from '../types';

export const CURRENT_USER: UserSession = {
  id: 'usr_vku_2026_01',
  name: 'Nguyễn Văn An',
  studentId: '22IT108',
  email: 'annv.22it@vku.udn.vn',
  department: 'Khoa Công nghệ Thông tin & Kinh tế số (VKU)',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  role: 'student',
};

export const STANDARD_TIME_SLOTS: TimeSlot[] = [
  { id: 'slot_1', startTime: '07:30', endTime: '09:30', label: '07:30 - 09:30' },
  { id: 'slot_2', startTime: '09:30', endTime: '11:30', label: '09:30 - 11:30' },
  { id: 'slot_3', startTime: '12:30', endTime: '14:30', label: '12:30 - 14:30' },
  { id: 'slot_4', startTime: '14:30', endTime: '16:30', label: '14:30 - 16:30' },
  { id: 'slot_5', startTime: '16:30', endTime: '18:30', label: '16:30 - 18:30' },
  { id: 'slot_6', startTime: '18:30', endTime: '20:30', label: '18:30 - 20:30' },
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room_a101',
    code: 'A.101',
    name: 'Smart Innovation Lab',
    building: 'A',
    floor: 1,
    capacity: 12,
    equipment: ['Projector', 'Smart TV', 'Air Conditioner', 'High-Speed LAN', 'Power Outlets'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng thực hành đổi mới sáng tạo trang bị màn hình tương tác thông minh, bàn nhóm cơ động và kết nối cáp quang Gigabit, lý tưởng cho hackathon và thảo luận dự án.',
    lightingType: 'Studio',
    hasEthernet: true,
  },
  {
    id: 'room_b204',
    code: 'B.204',
    name: 'Group Collaboration Hub',
    building: 'B',
    floor: 2,
    capacity: 6,
    equipment: ['Whiteboard', 'Air Conditioner', 'Power Outlets'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian họp nhóm nhỏ ấm cúng với bảng kính 360 độ, ghế công thái học, hệ thống cách âm cao cấp phục vụ ôn thi nhóm và brainstorm.',
    lightingType: 'Natural',
    hasEthernet: false,
  },
  {
    id: 'room_c302',
    code: 'C.302',
    name: 'Focus Quiet Study Zone',
    building: 'C',
    floor: 3,
    capacity: 4,
    equipment: ['Whiteboard', 'Air Conditioner', 'Power Outlets'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng yên tĩnh tuyệt đối dành cho nghiên cứu chuyên sâu, viết bài báo khoa học hoặc ôn luyện các chứng chỉ quốc tế.',
    lightingType: 'Natural',
    hasEthernet: true,
  },
  {
    id: 'room_v105',
    code: 'V.105',
    name: 'Multimedia Presentation Suite',
    building: 'V',
    floor: 1,
    capacity: 18,
    equipment: ['Projector', 'Sound System', 'Conference Mic', 'Smart TV', 'Air Conditioner'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    description: 'Hội trường nghiên cứu mini trang bị máy chiếu siêu nét 4K, hệ thống âm thanh vòm và micro hội thảo không dây phục vụ báo cáo seminar.',
    lightingType: 'Studio',
    hasEthernet: true,
  },
  {
    id: 'room_v401',
    code: 'V.401',
    name: 'Thesis & Research Workshop',
    building: 'V',
    floor: 4,
    capacity: 8,
    equipment: ['Projector', 'Whiteboard', 'High-Speed LAN', 'Air Conditioner', 'Power Outlets'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng hội thảo chuyên đề dành riêng cho sinh viên làm đồ án tốt nghiệp và nhóm nghiên cứu lab khoa CNTT.',
    lightingType: 'Standard',
    hasEthernet: true,
  },
  {
    id: 'room_a305',
    code: 'A.305',
    name: 'AI & Data Science Workspace',
    building: 'A',
    floor: 3,
    capacity: 10,
    equipment: ['Smart TV', 'High-Speed LAN', 'Air Conditioner', 'Power Outlets', 'Whiteboard'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian tích hợp máy trạm hiệu năng cao và đường truyền mạng độc lập phục vụ huấn luyện mô hình AI & Big Data.',
    lightingType: 'Natural',
    hasEthernet: true,
  },
];

// Helper to get formatted date string for relative days (0 = today, 1 = tomorrow, etc.)
export const getFormattedDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Initial mock bookings to demonstrate conflict prevention & pass generation immediately
export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg_sample_101',
    roomId: 'room_a101',
    roomName: 'Smart Innovation Lab',
    building: 'A',
    floor: 1,
    userId: 'usr_other_student',
    userName: 'Trần Thị Bích',
    userStudentId: '22IT045',
    date: getFormattedDate(0), // Today
    timeSlot: STANDARD_TIME_SLOTS[1], // 09:30 - 11:30
    qrCode: 'VKU-PASS-A101-SLOT2-22IT045',
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  },
  {
    id: 'bkg_sample_102',
    roomId: 'room_b204',
    roomName: 'Group Collaboration Hub',
    building: 'B',
    floor: 2,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    userStudentId: CURRENT_USER.studentId,
    date: getFormattedDate(1), // Tomorrow
    timeSlot: STANDARD_TIME_SLOTS[3], // 14:30 - 16:30
    qrCode: `VKU-PASS-B204-SLOT4-${CURRENT_USER.studentId}`,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  },
];

