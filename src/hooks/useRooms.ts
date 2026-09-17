import { useMemo } from 'react';
import { useBookingStore } from '../store/useBookingStore';
import { useFilterStore } from '../store/useFilterStore';
import { Room } from '../types';
import { TIME_SLOTS } from '../constants/timeSlots';
import { getSlotAvailability } from '../utils/conflictChecker';

export interface RoomWithAvailability extends Room {
  availableSlotsCount: number;
  totalSlotsCount: number;
}

export const useRooms = () => {
  const rooms = useBookingStore(state => state.rooms);
  const bookings = useBookingStore(state => state.bookings);

  const selectedDate = useFilterStore(state => state.selectedDate);
  const selectedBuilding = useFilterStore(state => state.selectedBuilding);
  const selectedCapacityRangeId = useFilterStore(state => state.selectedCapacityRangeId);
  const minCapacity = useFilterStore(state => state.minCapacity);
  const maxCapacity = useFilterStore(state => state.maxCapacity);
  const selectedEquipments = useFilterStore(state => state.selectedEquipments);
  const searchQuery = useFilterStore(state => state.searchQuery);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBuilding !== 'ALL') count++;
    if (selectedCapacityRangeId !== 'all') count++;
    if (selectedEquipments.length > 0) count += selectedEquipments.length;
    return count;
  }, [selectedBuilding, selectedCapacityRangeId, selectedEquipments]);

  const filteredRooms: RoomWithAvailability[] = useMemo(() => {
    return rooms
      .filter(room => {
        // 1. Tòa nhà (A, B, C, V)
        if (selectedBuilding !== 'ALL' && room.building !== selectedBuilding) {
          return false;
        }

        // 2. Sức chứa
        if (room.capacity < minCapacity || room.capacity > maxCapacity) {
          return false;
        }

        // 3. Trang thiết bị
        if (selectedEquipments.length > 0) {
          const hasAllEquipments = selectedEquipments.every(eq =>
            room.equipment.includes(eq)
          );
          if (!hasAllEquipments) return false;
        }

        // 4. Tìm kiếm từ khóa theo tên phòng hoặc tòa nhà
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = room.name.toLowerCase().includes(query);
          const matchBuilding =
            `tòa ${room.building}`.toLowerCase().includes(query) ||
            room.building.toLowerCase() === query;
          if (!matchName && !matchBuilding) {
            return false;
          }
        }

        return true;
      })
      .map(room => {
        // Tính số ca học còn trống trong ngày đã chọn
        let availableCount = 0;
        TIME_SLOTS.forEach(slot => {
          const status = getSlotAvailability(room, selectedDate, slot, bookings);
          if (status === 'AVAILABLE') {
            availableCount++;
          }
        });

        return {
          ...room,
          availableSlotsCount: availableCount,
          totalSlotsCount: TIME_SLOTS.length,
        };
      });
  }, [
    rooms,
    bookings,
    selectedDate,
    selectedBuilding,
    minCapacity,
    maxCapacity,
    selectedEquipments,
    searchQuery,
  ]);

  return {
    filteredRooms,
    totalRooms: rooms.length,
    activeFilterCount,
    selectedDate,
  };
};
