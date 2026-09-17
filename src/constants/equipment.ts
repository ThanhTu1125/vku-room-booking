import { Equipment } from '../types';

export interface EquipmentItem {
  id: Equipment;
  label: string;
  iconName: string;
}

export const EQUIPMENT_LIST: EquipmentItem[] = [
  { id: 'projector', label: 'Máy chiếu / Tivi', iconName: 'tv' },
  { id: 'air_conditioner', label: 'Điều hòa 2 chiều', iconName: 'wind' },
  { id: 'whiteboard', label: 'Bảng trắng & Bút', iconName: 'edit-3' },
  { id: 'pc_i7', label: 'Dàn PC Core i7', iconName: 'monitor' },
  { id: 'pc_mac', label: 'Máy tính Mac Studio', iconName: 'cpu' },
  { id: 'mic_speaker', label: 'Micro & Loa âm trần', iconName: 'volume-2' },
  { id: 'high_speed_wifi', label: 'Wi-Fi 6 tốc độ cao', iconName: 'wifi' },
];
