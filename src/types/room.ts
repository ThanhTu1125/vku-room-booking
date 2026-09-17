export type RoomType = 'STUDY' | 'LAB' | 'MEETING' | 'WORKSHOP';

export type Equipment =
  | 'projector'
  | 'air_conditioner'
  | 'whiteboard'
  | 'pc_i7'
  | 'pc_mac'
  | 'mic_speaker'
  | 'high_speed_wifi';

export interface Room {
  id: string;
  code: string; // VD: K.302, V.201, LAB-AI
  name: string;
  building: string; // Tòa K, Tòa V, Thư viện...
  floor: number;
  capacity: number;
  type: RoomType;
  description: string;
  equipments: Equipment[];
  imageUrl: string;
  isActive: boolean;
}

export interface RoomFilter {
  date: string; // YYYY-MM-DD
  building?: string;
  type?: RoomType;
  minCapacity?: number;
  equipments?: Equipment[];
  searchQuery?: string;
}
