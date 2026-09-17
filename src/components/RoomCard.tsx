import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Room } from '../types';
import { COLORS } from '../constants/colors';

interface RoomCardProps {
  room: Room;
  availableSlotsCount: number;
  totalSlotsCount: number;
  onPress: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  availableSlotsCount,
  totalSlotsCount: _totalSlotsCount,
  onPress,
}) => {
  const hasSlots = availableSlotsCount > 0;
  const isRoomAvailable = room.status === 'available';

  const equipmentSummary = room.equipment.slice(0, 3).join(' • ');

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.photoUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.buildingBadge}>
          <Text style={styles.buildingBadgeText}>Tòa {room.building}</Text>
        </View>
        <View style={styles.capacityBadge}>
          <Text style={styles.capacityText}>{room.capacity} chỗ</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.roomStatusPill,
              {
                backgroundColor: isRoomAvailable
                  ? COLORS.availableSoft
                  : COLORS.occupiedSoft,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isRoomAvailable ? COLORS.available : COLORS.occupied,
                },
              ]}
            />
            <Text
              style={[
                styles.roomStatusText,
                {
                  color: isRoomAvailable ? COLORS.available : COLORS.occupied,
                },
              ]}
            >
              {isRoomAvailable ? 'Available' : 'Occupied'}
            </Text>
          </View>

          <View
            style={[
              styles.slotStatusPill,
              {
                backgroundColor: hasSlots ? COLORS.successSoft : COLORS.dangerSoft,
              },
            ]}
          >
            <Text
              style={[
                styles.slotStatusText,
                { color: hasSlots ? COLORS.success : COLORS.danger },
              ]}
            >
              {hasSlots ? `Còn ${availableSlotsCount} ca` : 'Đã kín ca'}
            </Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {room.name}
        </Text>

        <Text style={styles.locationText}>
          📍 Tòa {room.building} • Tầng {room.floor}
        </Text>

        {equipmentSummary ? (
          <Text style={styles.equipmentText} numberOfLines={1}>
            ⚡ {equipmentSummary}
            {room.equipment.length > 3 ? ` +${room.equipment.length - 3}` : ''}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.divider,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buildingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buildingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  capacityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(29, 78, 216, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  capacityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  roomStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  slotStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  equipmentText: {
    fontSize: 12,
    color: COLORS.textSubtle,
  },
});
