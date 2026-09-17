export interface BuildingInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
}

export const BUILDINGS: BuildingInfo[] = [
  {
    id: 'ALL',
    name: 'Tất cả các khu',
    shortName: 'Tất cả',
    description: 'Toàn bộ phòng học trong khuôn viên VKU',
  },
  {
    id: 'Khu K',
    name: 'Khu K - Giảng đường trung tâm',
    shortName: 'Khu K',
    description: 'Tòa nhà khu K với nhiều phòng tự học và hội thảo',
  },
  {
    id: 'Khu V',
    name: 'Khu V - Tòa nhà công nghệ cao',
    shortName: 'Khu V',
    description: 'Khu phức hợp phòng Lab AI, IoT và trung tâm máy tính',
  },
  {
    id: 'Thư viện',
    name: 'Thư viện số VKU',
    shortName: 'Thư viện',
    description: 'Không gian yên tĩnh, phòng thảo luận nhóm & multimedia',
  },
  {
    id: 'Tòa Đa Năng',
    name: 'Tòa nhà Đa Năng',
    shortName: 'Đa Năng',
    description: 'Phòng hội nghị, không gian sáng tạo đổi mới khởi nghiệp',
  },
];
