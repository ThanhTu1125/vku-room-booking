import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Room } from '../types';
import { COLORS } from '../constants/colors';
import { EQUIPMENT_LIST } from '../constants/equipment';

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
  const isAvailable = availableSlotsCount > 0;

  // Lấy nhãn thiết bị hiển thị tóm tắt (tối đa 2 món)
  const equipmentSummary = room.equipments
    .slice(0, 2)
    .map(eq => {
      const found = EQUIPMENT_LIST.find(item => item.id === eq);
      return found ? found.label.split('/')[0].trim() : eq;
    })
    .join(' • ');

  const typeLabels: Record<string, string> = {
    STUDY: 'Tự học',
    LAB: 'Phòng Lab',
    MEETING: 'Thảo luận',
    WORKSHOP: 'Workshop',
  };

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{typeLabels[room.type] || room.type}</Text>
        </View>
        <View style={styles.capacityBadge}>
          <Text style={styles.capacityText}>{room.capacity} chỗ</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{room.code}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isAvailable ? COLORS.successSoft : COLORS.dangerSoft },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAvailable ? COLORS.success : COLORS.danger },
              ]}
            />
            <Text
              style={[
                styles.statusPillText,
                { color: isAvailable ? COLORS.success : COLORS.danger },
              ]}
            >
              {isAvailable ? `Còn ${availableSlotsCount} ca trống` : 'Đã kín lịch'}
            </Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {room.name}
        </Text>

        <Text style={styles.locationText}>
          📍 {room.building} • Tầng {room.floor}
        </Text>

        {equipmentSummary ? (
          <Text style={styles.equipmentText} numberOfLines={1}>
            ⚡ {equipmentSummary}
            {room.equipments.length > 2 ? ` +${room.equipments.length - 2}` : ''}
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
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  capacityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(29, 78, 216, 0.85)',
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
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  statusPill: {
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
  statusPillText: {
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
