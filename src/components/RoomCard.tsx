import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Room } from '../types';
import {
  Users,
  Building2,
  Layers,
  ChevronRight,
  Tv,
  Projector,
  Wifi,
  Wind,
  CheckCircle2,
} from 'lucide-react-native';

interface RoomCardProps {
  room: Room;
  onPress: (roomId: string) => void;
}

const getBuildingTheme = (building: string) => {
  switch (building) {
    case 'A':
      return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' };
    case 'B':
      return { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
    case 'C':
      return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    case 'V':
      return { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' };
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

const renderEquipmentIcon = (item: string) => {
  switch (item) {
    case 'Projector':
      return <Projector key={item} size={14} color="#475569" />;
    case 'Smart TV':
      return <Tv key={item} size={14} color="#475569" />;
    case 'High-Speed LAN':
      return <Wifi key={item} size={14} color="#475569" />;
    case 'Air Conditioner':
      return <Wind key={item} size={14} color="#475569" />;
    default:
      return null;
  }
};

export const RoomCard: React.FC<RoomCardProps> = React.memo(
  ({ room, onPress }) => {
    const buildingTheme = getBuildingTheme(room.building);

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => onPress(room.id)}
        activeOpacity={0.88}
      >
        {/* Room Photo */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: room.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Building Badge overlay */}
          <View
            style={[
              styles.buildingBadge,
              {
                backgroundColor: buildingTheme.bg,
                borderColor: buildingTheme.border,
              },
            ]}
          >
            <Building2 size={12} color={buildingTheme.text} />
            <Text style={[styles.buildingText, { color: buildingTheme.text }]}>
              Tòa {room.building} • Tầng {room.floor}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <CheckCircle2 size={12} color="#10B981" />
            <Text style={styles.statusText}>Sẵn sàng</Text>
          </View>
        </View>

        {/* Card Body Info */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.codeContainer}>
              <Text style={styles.roomCode}>{room.code}</Text>
              <Text style={styles.roomName} numberOfLines={1}>
                {room.name}
              </Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>

          {/* Stats Bar */}
          <View style={styles.footerRow}>
            <View style={styles.specItem}>
              <Users size={15} color="#2563EB" />
              <Text style={styles.specText}>{room.capacity} Chỗ ngồi</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.specItem}>
              <Layers size={15} color="#64748B" />
              <Text style={styles.specText}>Phòng {room.code}</Text>
            </View>

            <View style={styles.equipmentIcons}>
              {room.equipment.slice(0, 3).map((eq) => (
                <View key={eq} style={styles.iconCircle}>
                  {renderEquipmentIcon(eq)}
                </View>
              ))}
              {room.equipment.length > 3 && (
                <Text style={styles.moreEquip}>+{room.equipment.length - 3}</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.room.id === next.room.id && prev.room.status === next.room.status
);

export const ROOM_CARD_HEIGHT = 295; // Used for FlatList getItemLayout optimization

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageWrapper: {
    width: '100%',
    height: 155,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buildingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  buildingText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeContainer: {
    flex: 1,
    marginRight: 8,
  },
  roomCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  equipmentIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 6,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moreEquip: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 2,
  },
});

