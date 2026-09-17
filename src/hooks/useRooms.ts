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
  const selectedType = useFilterStore(state => state.selectedType);
  const minCapacity = useFilterStore(state => state.minCapacity);
  const selectedEquipments = useFilterStore(state => state.selectedEquipments);
  const searchQuery = useFilterStore(state => state.searchQuery);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBuilding !== 'ALL') count++;
    if (selectedType) count++;
    if (minCapacity > 1) count++;
    if (selectedEquipments.length > 0) count += selectedEquipments.length;
    return count;
  }, [selectedBuilding, selectedType, minCapacity, selectedEquipments]);

  const filteredRooms: RoomWithAvailability[] = useMemo(() => {
    return rooms
      .filter(room => {
        if (!room.isActive) return false;

        // 1. Tòa nhà
        if (selectedBuilding !== 'ALL' && room.building !== selectedBuilding) {
          return false;
        }

        // 2. Loại phòng
        if (selectedType && room.type !== selectedType) {
          return false;
        }

        // 3. Sức chứa tối thiểu
        if (room.capacity < minCapacity) {
          return false;
        }

        // 4. Trang thiết bị
        if (selectedEquipments.length > 0) {
          const hasAllEquipments = selectedEquipments.every(eq =>
            room.equipments.includes(eq)
          );
          if (!hasAllEquipments) return false;
        }

        // 5. Tìm kiếm từ khóa
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchCode = room.code.toLowerCase().includes(query);
          const matchName = room.name.toLowerCase().includes(query);
          const matchBuilding = room.building.toLowerCase().includes(query);
          const matchDesc = room.description.toLowerCase().includes(query);
          if (!matchCode && !matchName && !matchBuilding && !matchDesc) {
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
    selectedType,
    minCapacity,
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
