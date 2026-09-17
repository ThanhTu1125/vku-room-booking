export interface CapacityRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const CAPACITY_RANGES: readonly CapacityRange[] = [
  { id: 'all', label: 'Tất cả', min: 1, max: 100 },
  { id: '2-5', label: '2-5 người', min: 2, max: 5 },
  { id: '6-10', label: '6-10 người', min: 6, max: 10 },
  { id: '11-20', label: '11-20 người', min: 11, max: 20 },
] as const;
