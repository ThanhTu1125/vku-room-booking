import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const FilterChip = React.memo<FilterChipProps>(
  ({ label, isActive, onPress }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
        onPress={onPress}
      >
        <Text
          style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.label === nextProps.label &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.onPress === nextProps.onPress
);

FilterChip.displayName = 'FilterChip';

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  chipInactive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: COLORS.textMuted,
  },
});
