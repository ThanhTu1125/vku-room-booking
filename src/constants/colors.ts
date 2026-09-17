export const COLORS = {
  primary: '#1D4ED8', // VKU Blue chủ đạo
  primaryLight: '#3B82F6',
  primarySoft: '#EFF6FF',
  accent: '#F97316', // Cam điểm nhấn

  // Trạng thái phòng & lịch đặt
  available: '#10B981', // Xanh lá biểu thị trạng thái "Available"
  availableSoft: '#ECFDF5',
  occupied: '#EF4444', // Đỏ biểu thị trạng thái "Occupied"
  occupiedSoft: '#FEF2F2',
  occupiedWarning: '#F59E0B', // Vàng cam cảnh báo
  occupiedWarningSoft: '#FFFBEB',

  // Semantic
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  info: '#06B6D4',

  // Grayscale & Layout
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Interactive
  disabled: '#CBD5E1',
  disabledBackground: '#F1F5F9',
  overlay: 'rgba(15, 23, 42, 0.6)',
} as const;
