import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Room } from '../types';
import { COLORS } from '../constants/colors';

export interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

// Chiều cao cố định chuẩn xác để phục vụ FlatList getItemLayout
export const ROOM_CARD_HEIGHT = 302;
export const ROOM_CARD_MARGIN_BOTTOM = 16;
export const ROOM_CARD_TOTAL_ITEM_HEIGHT = ROOM_CARD_HEIGHT + ROOM_CARD_MARGIN_BOTTOM;

const RoomCardComponent: React.FC<RoomCardProps> = ({ room, onPress }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const isAvailable = room.status === 'available';

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      {/* 1. Ảnh phòng học kèm trạng thái loading & placeholder */}
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingPlaceholder}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
        <Image
          source={{ uri: room.photoUrl }}
          style={styles.image}
          resizeMode="cover"
          onLoadEnd={() => setImageLoading(false)}
        />

        {/* Badge Vị trí Tòa nhà & Tầng */}
        <View style={styles.buildingBadge}>
          <Text style={styles.buildingBadgeText}>
            Building {room.building} - Tầng {room.floor}
          </Text>
        </View>

        {/* Badge Sức chứa */}
        <View style={styles.capacityBadge}>
          <Text style={styles.capacityText}>👤 {room.capacity} chỗ</Text>
        </View>
      </View>

      {/* 2. Phần nội dung thông tin phòng */}
      <View style={styles.body}>
        {/* Hàng trạng thái phòng nổi bật */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              isAvailable ? styles.statusAvailable : styles.statusOccupied,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isAvailable ? styles.dotAvailable : styles.dotOccupied,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isAvailable ? styles.textAvailable : styles.textOccupied,
              ]}
            >
              {isAvailable ? 'Available Now' : 'Occupied'}
            </Text>
          </View>

          <Text style={styles.roomTypeTag}>Phòng học VKU</Text>
        </View>

        {/* Tên phòng */}
        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>

        {/* Vị trí */}
        <Text style={styles.locationText} numberOfLines={1}>
          📍 Tòa {room.building} • Tầng {room.floor} • Sức chứa tối đa {room.capacity}{' '}
          sinh viên
        </Text>

        {/* Danh sách trang thiết bị */}
        <View style={styles.equipmentContainer}>
          {room.equipment.map(item => (
            <View key={item} style={styles.equipmentChip}>
              <Text style={styles.equipmentText}>⚡ {item}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Bọc bằng React.memo với hàm so sánh tùy biến để triệt tiêu re-render thừa
export const RoomCard = React.memo<RoomCardProps>(
  RoomCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.room.id === nextProps.room.id &&
      prevProps.room.status === nextProps.room.status &&
      prevProps.room.name === nextProps.room.name &&
      prevProps.room.photoUrl === nextProps.room.photoUrl &&
      prevProps.onPress === nextProps.onPress
    );
  }
);

RoomCard.displayName = 'RoomCard';

const styles = StyleSheet.create({
  card: {
    height: ROOM_CARD_HEIGHT,
    marginBottom: ROOM_CARD_MARGIN_BOTTOM,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.divider,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.divider,
  },
  buildingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
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
    backgroundColor: 'rgba(29, 78, 216, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capacityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: COLORS.availableSoft,
  },
  statusOccupied: {
    backgroundColor: COLORS.occupiedSoft,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  dotAvailable: {
    backgroundColor: COLORS.available,
  },
  dotOccupied: {
    backgroundColor: COLORS.occupied,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textAvailable: {
    color: COLORS.available,
  },
  textOccupied: {
    color: COLORS.occupied,
  },
  roomTypeTag: {
    fontSize: 11,
    color: COLORS.textSubtle,
    fontWeight: '500',
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  equipmentChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  equipmentText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
