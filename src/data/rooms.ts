import { Room } from '../types';

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room_k302',
    code: 'K.302',
    name: 'Phòng Tự Học Nhóm K.302',
    building: 'Khu K',
    floor: 3,
    capacity: 20,
    type: 'STUDY',
    description:
      'Không gian yên tĩnh, bàn ghế linh hoạt phù hợp làm việc nhóm 10-20 bạn. Hệ thống máy chiếu và ánh sáng chuẩn giảng đường.',
    equipments: ['projector', 'air_conditioner', 'whiteboard', 'high_speed_wifi'],
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_k405',
    code: 'K.405',
    name: 'Phòng Thảo Luận Sáng Tạo K.405',
    building: 'Khu K',
    floor: 4,
    capacity: 8,
    type: 'MEETING',
    description:
      'Phòng kính cách âm, bảng từ trắng kích thước lớn. Thích hợp cho các nhóm họp đồ án tốt nghiệp hoặc ôn thi.',
    equipments: ['air_conditioner', 'whiteboard', 'high_speed_wifi'],
    imageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_v102',
    code: 'V.102',
    name: 'Phòng Lab AI & Deep Learning',
    building: 'Khu V',
    floor: 1,
    capacity: 35,
    type: 'LAB',
    description:
      'Phòng thực hành trang bị 35 bộ máy tính Core i7, GPU RTX hỗ trợ huấn luyện mô hình trí tuệ nhân tạo và xử lý ảnh.',
    equipments: ['pc_i7', 'projector', 'air_conditioner', 'high_speed_wifi'],
    imageUrl:
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_v204',
    code: 'V.204',
    name: 'Phòng Lab IoT & Vi Điều Khiển',
    building: 'Khu V',
    floor: 2,
    capacity: 30,
    type: 'LAB',
    description:
      'Trang bị máy tính cá nhân, nguồn xung, máy hàn và kit vi điều khiển ESP32, STM32 phục vụ môn học phần cứng.',
    equipments: [
      'pc_i7',
      'projector',
      'air_conditioner',
      'whiteboard',
      'high_speed_wifi',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_v301',
    code: 'V.301',
    name: 'Phòng Lab Mac Studio Đồ Họa & Di Động',
    building: 'Khu V',
    floor: 3,
    capacity: 25,
    type: 'LAB',
    description:
      'Dàn máy Apple Mac trang bị chip M-series chuyên dụng phát triển ứng dụng iOS, Android Flutter/React Native và UI/UX.',
    equipments: ['pc_mac', 'projector', 'air_conditioner', 'high_speed_wifi'],
    imageUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_lib01',
    code: 'LIB.01',
    name: 'Phòng Hội Thảo Chuyên Đề Thư Viện',
    building: 'Thư viện',
    floor: 2,
    capacity: 15,
    type: 'MEETING',
    description:
      'Nằm trong khuôn viên thư viện số VKU, tra cứu tài liệu chuyên khảo nhanh chóng, tivi màn hình lớn trình chiếu slide.',
    equipments: ['projector', 'air_conditioner', 'whiteboard', 'high_speed_wifi'],
    imageUrl:
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_lib02',
    code: 'LIB.02',
    name: 'Không Gian Nghiên Cứu Mở Thư Viện',
    building: 'Thư viện',
    floor: 3,
    capacity: 40,
    type: 'STUDY',
    description:
      'Không gian học tập rộng rãi, view nhìn ra sân trường, trang bị ổ cắm điện tại từng bàn học.',
    equipments: ['air_conditioner', 'high_speed_wifi'],
    imageUrl:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
  {
    id: 'room_dn201',
    code: 'DN.201',
    name: 'Hội Trường Workshop Đa Năng',
    building: 'Tòa Đa Năng',
    floor: 2,
    capacity: 60,
    type: 'WORKSHOP',
    description:
      'Hội trường lớn có hệ thống âm thanh, micro không dây, máy chiếu công suất cao dành cho workshop CLB và sinh hoạt tập thể.',
    equipments: [
      'mic_speaker',
      'projector',
      'air_conditioner',
      'whiteboard',
      'high_speed_wifi',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    isActive: true,
  },
];
