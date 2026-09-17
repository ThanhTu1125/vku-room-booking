import { create } from 'zustand';
import { Equipment, RoomType } from '../types';
import { getTodayString } from '../utils/dateHelpers';

interface FilterState {
  selectedDate: string; // YYYY-MM-DD
  selectedBuilding: string; // 'ALL' hoặc 'Khu K', 'Khu V'...
  selectedType?: RoomType;
  minCapacity: number;
  selectedEquipments: Equipment[];
  searchQuery: string;

  // Actions
  setDate: (date: string) => void;
  setBuilding: (building: string) => void;
  setType: (type?: RoomType) => void;
  setMinCapacity: (capacity: number) => void;
  toggleEquipment: (eq: Equipment) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>(set => ({
  selectedDate: getTodayString(),
  selectedBuilding: 'ALL',
  selectedType: undefined,
  minCapacity: 1,
  selectedEquipments: [],
  searchQuery: '',

  setDate: (date: string) => set({ selectedDate: date }),
  setBuilding: (building: string) => set({ selectedBuilding: building }),
  setType: (type?: RoomType) => set({ selectedType: type }),
  setMinCapacity: (capacity: number) => set({ minCapacity: capacity }),
  toggleEquipment: (eq: Equipment) =>
    set(state => ({
      selectedEquipments: state.selectedEquipments.includes(eq)
        ? state.selectedEquipments.filter(item => item !== eq)
        : [...state.selectedEquipments, eq],
    })),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  resetFilters: () =>
    set({
      selectedDate: getTodayString(),
      selectedBuilding: 'ALL',
      selectedType: undefined,
      minCapacity: 1,
      selectedEquipments: [],
      searchQuery: '',
    }),
}));
