import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getNext7Days } from '../utils/dateHelpers';
import { COLORS } from '../constants/colors';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const days = getNext7Days();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map(item => {
        const isSelected = item.date === selectedDate;
        const [dayPart, datePart] = item.label.split(' ');

        return (
          <TouchableOpacity
            key={item.date}
            activeOpacity={0.7}
            onPress={() => onSelectDate(item.date)}
            style={[styles.dateCard, isSelected && styles.dateCardSelected]}
          >
            <Text style={[styles.dayOfWeek, isSelected && styles.textSelected]}>
              {dayPart}
            </Text>
            <Text style={[styles.dayOfMonth, isSelected && styles.textSelected]}>
              {datePart || dayPart}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateCard: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dateCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  dayOfMonth: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
