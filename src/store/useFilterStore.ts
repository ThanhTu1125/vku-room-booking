import { create } from 'zustand';
import { Building, Equipment } from '../types';
import { getTodayString } from '../utils/dateHelpers';

interface FilterState {
  selectedDate: string; // YYYY-MM-DD
  selectedBuilding: 'ALL' | Building;
  selectedCapacityRangeId: string; // 'all', '2-5', '6-10', '11-20'
  minCapacity: number;
  maxCapacity: number;
  selectedEquipments: Equipment[];
  searchQuery: string;

  // Actions
  setDate: (date: string) => void;
  setBuilding: (building: 'ALL' | Building) => void;
  setCapacityRange: (rangeId: string, min: number, max: number) => void;
  toggleEquipment: (eq: Equipment) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>(set => ({
  selectedDate: getTodayString(),
  selectedBuilding: 'ALL',
  selectedCapacityRangeId: 'all',
  minCapacity: 1,
  maxCapacity: 100,
  selectedEquipments: [],
  searchQuery: '',

  setDate: (date: string) => set({ selectedDate: date }),
  setBuilding: (building: 'ALL' | Building) => set({ selectedBuilding: building }),
  setCapacityRange: (rangeId: string, min: number, max: number) =>
    set({
      selectedCapacityRangeId: rangeId,
      minCapacity: min,
      maxCapacity: max,
    }),
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
      selectedCapacityRangeId: 'all',
      minCapacity: 1,
      maxCapacity: 100,
      selectedEquipments: [],
      searchQuery: '',
    }),
}));
