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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService, mapAuthError } from '../services/authService';
import { COLORS } from '../constants/colors';

type AuthMode = 'login' | 'register';

export const LoginScreen: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerStudentId, setRegisterStudentId] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Xử lý Đăng Nhập
  const handleLogin = async () => {
    const cleanEmail = loginEmail.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanEmail || !cleanPass) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      await authService.loginWithEmail(cleanEmail, cleanPass);
      // Khi thành công, onAuthStateChanged tại App.tsx sẽ tự động cập nhật store và điều hướng
    } catch (error: any) {
      const errorCode = error?.code || '';
      const message = mapAuthError(errorCode);
      Alert.alert('Đăng nhập thất bại', message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng Ký
  const handleRegister = async () => {
    const cleanName = registerName.trim();
    const cleanStudentId = registerStudentId.trim().toUpperCase();
    const cleanEmail = registerEmail.trim();
    const cleanPass = registerPassword;
    const cleanConfirm = confirmPassword;

    // 1. Kiểm tra không để trống trường nào
    if (!cleanName || !cleanStudentId || !cleanEmail || !cleanPass || !cleanConfirm) {
      Alert.alert(
        'Thông tin chưa đầy đủ',
        'Vui lòng điền đầy đủ tất cả các trường để đăng ký tài khoản.'
      );
      return;
    }

    // 2. Validate định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        'Email không hợp lệ',
        'Vui lòng nhập đúng định dạng email (VD: sinhvien@vku.udn.vn).'
      );
      return;
    }

    // 3. Validate mật khẩu tối thiểu 6 ký tự
    if (cleanPass.length < 6) {
      Alert.alert(
        'Mật khẩu quá ngắn',
        'Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.'
      );
      return;
    }

    // 4. Validate mật khẩu xác nhận khớp nhau
    if (cleanPass !== cleanConfirm) {
      Alert.alert(
        'Mật khẩu không khớp',
        'Mật khẩu xác nhận không trùng khớp với mật khẩu đã nhập.'
      );
      return;
    }

    setLoading(true);
    try {
      await authService.registerWithEmail(
        cleanEmail,
        cleanPass,
        cleanName,
        cleanStudentId
      );
      // Khi thành công, onAuthStateChanged tại App.tsx sẽ tự động cập nhật store và điều hướng
    } catch (error: any) {
      const errorCode = error?.code || '';
      const message = mapAuthError(errorCode);
      Alert.alert('Đăng ký thất bại', message);
    } finally {
      setLoading(false);
    }
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

          {/* Card Container */}
          <View style={styles.card}>
            {/* Segmented Tab Bar */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, authMode === 'login' && styles.tabButtonActive]}
                activeOpacity={0.8}
                onPress={() => setAuthMode('login')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    authMode === 'login' && styles.tabButtonTextActive,
                  ]}
                >
                  Đăng Nhập
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  authMode === 'register' && styles.tabButtonActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setAuthMode('register')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    authMode === 'register' && styles.tabButtonTextActive,
                  ]}
                >
                  Đăng Ký
                </Text>
              </TouchableOpacity>
            </View>

            {authMode === 'login' ? (
              /* FORM ĐĂNG NHẬP */
              <View>
                <Text style={styles.cardTitle}>Đăng Nhập Sinh Viên</Text>
                <Text style={styles.cardDesc}>
                  Đăng nhập bằng tài khoản email để quản lý đặt phòng và mở khóa cửa
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email sinh viên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: tunt.23it@vku.udn.vn"
                    placeholderTextColor={COLORS.textSubtle}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    placeholderTextColor={COLORS.textSubtle}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Đăng Nhập</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* FORM ĐĂNG KÝ */
              <View>
                <Text style={styles.cardTitle}>Tạo Tài Khoản Mới</Text>
                <Text style={styles.cardDesc}>
                  Đăng ký thông tin sinh viên VKU để bắt đầu sử dụng phòng học & lab
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Họ và tên sinh viên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Nguyễn Văn A"
                    placeholderTextColor={COLORS.textSubtle}
                    value={registerName}
                    onChangeText={setRegisterName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mã số sinh viên (MSSV)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 23IT296"
                    placeholderTextColor={COLORS.textSubtle}
                    value={registerStudentId}
                    onChangeText={setRegisterStudentId}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email sinh viên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: sinhvien@vku.udn.vn"
                    placeholderTextColor={COLORS.textSubtle}
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tối thiểu 6 ký tự"
                    placeholderTextColor={COLORS.textSubtle}
                    value={registerPassword}
                    onChangeText={setRegisterPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu phía trên"
                    placeholderTextColor={COLORS.textSubtle}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Đăng Ký Tài Khoản</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
    marginBottom: 20,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
    marginBottom: 14,
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
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
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
