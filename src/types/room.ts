export type Building = 'A' | 'B' | 'C' | 'V';

export type Equipment = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  name: string;
  building: Building;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  photoUrl: string;
  status: RoomStatus;
}
