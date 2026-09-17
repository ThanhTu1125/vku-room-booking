import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingStore } from '../store/useBookingStore';
import { MOCK_USER } from '../data/mockUser';
import { COLORS } from '../constants/colors';
import { User } from '../types';

export const LoginScreen: React.FC = () => {
  const login = useBookingStore(state => state.login);

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleLogin = () => {
    const cleanName = name.trim();
    const cleanId = studentId.trim().toUpperCase();

    if (!cleanName || !cleanId) {
      Alert.alert(
        'Thông tin chưa đầy đủ',
        'Vui lòng nhập cả họ tên và mã số sinh viên (MSSV) để tiếp tục.'
      );
      return;
    }

    const newUser: User = {
      id: `user-${cleanId.toLowerCase()}`,
      name: cleanName,
      studentId: cleanId,
      email: `${cleanId.toLowerCase()}@vku.udn.vn`,
    };

    login(newUser);
  };

  const handleQuickLoginMock = () => {
    login(MOCK_USER);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>VKU</Text>
            </View>
            <Text style={styles.appTitle}>VKU Study Space</Text>
            <Text style={styles.appSubtitle}>
              Hệ thống đặt phòng tự học & phòng Lab thông minh
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng Nhập Sinh Viên</Text>
            <Text style={styles.cardDesc}>
              Nhập thông tin sinh viên VKU để đặt phòng và mở khóa cửa bằng QR pass
            </Text>

            {/* Input Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên sinh viên</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Nguyễn Văn A"
                placeholderTextColor={COLORS.textSubtle}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Input Student ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã số sinh viên (MSSV)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 23IT296"
                placeholderTextColor={COLORS.textSubtle}
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <Text style={styles.loginBtnText}>Đăng Nhập Ngay</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1-Tap Mock User Button for Testing Convenience */}
            <TouchableOpacity
              style={styles.quickLoginBtn}
              activeOpacity={0.8}
              onPress={handleQuickLoginMock}
            >
              <Text style={styles.quickLoginBtnText}>
                ⚡ Đăng nhập tài khoản mẫu ({MOCK_USER.studentId})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Trường Đại học CNTT & Truyền thông Việt - Hàn (VKU)
            </Text>
            <Text style={styles.footerSubText}>
              Dành riêng cho sinh viên & giảng viên trường
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSubtle,
  },
  quickLoginBtn: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickLoginBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSubtle,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 11,
    color: COLORS.textSubtle,
    marginTop: 2,
    textAlign: 'center',
  },
});
