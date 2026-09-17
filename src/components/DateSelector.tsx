import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { generateNext7Days, DayOption } from '../utils/dateUtils';
import { Calendar } from 'lucide-react-native';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const next7Days = React.useMemo(() => generateNext7Days(), []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Calendar size={18} color="#2563EB" />
          <Text style={styles.title}>Chọn ngày đặt phòng</Text>
        </View>
        <Text style={styles.subtitle}>7 ngày tới</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {next7Days.map((item: DayOption) => {
          const isSelected = item.dateString === selectedDate;
          return (
            <TouchableOpacity
              key={item.dateString}
              onPress={() => onSelectDate(item.dateString)}
              activeOpacity={0.75}
              style={[
                styles.dayCard,
                isSelected && styles.dayCardSelected,
                item.isToday && !isSelected && styles.dayCardToday,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected,
                  item.isToday && !isSelected && styles.dayNameToday,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {item.dayNumber}
              </Text>
              <Text
                style={[
                  styles.monthText,
                  isSelected && styles.monthTextSelected,
                ]}
              >
                Tháng {item.monthNumber}
              </Text>

              {item.isToday && (
                <View
                  style={[
                    styles.todayDot,
                    isSelected && styles.todayDotSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dayCard: {
    width: 68,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  dayCardToday: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  dayCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  dayNameToday: {
    color: '#2563EB',
    fontWeight: '700',
  },
  dayNameSelected: {
    color: '#DBEAFE',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  monthText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  monthTextSelected: {
    color: '#BFDBFE',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
    position: 'absolute',
    bottom: 6,
  },
  todayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
});

