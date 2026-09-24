import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

/**
 * Ánh xạ mã lỗi từ Firebase Auth sang thông báo tiếng Việt thân thiện với người dùng
 */
export const mapAuthError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Sai email hoặc mật khẩu';
    case 'auth/weak-password':
      return 'Mật khẩu cần ít nhất 6 ký tự';
    case 'auth/invalid-email':
      return 'Email không hợp lệ';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần, vui lòng thử lại sau';
    case 'auth/configuration-not-found':
      return 'Dịch vụ xác thực chưa sẵn sàng trên Firebase Console (Cần bật Email/Password trong Authentication > Sign-in method)';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng, vui lòng kiểm tra kết nối internet';
    default:
      return 'Đã xảy ra lỗi, vui lòng thử lại';
  }
};

/**
 * Đăng ký tài khoản mới bằng Email/Password
 * Đồng thời lưu thông tin mở rộng (displayName, studentId) vào Firestore collection "users"
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  studentId: string
): Promise<User> => {
  try {
    console.log('[Register] Bắt đầu đăng ký với email:', email);
    console.log('[Register] Đang gọi createUserWithEmailAndPassword...');
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    console.log(
      '[Register] Tạo tài khoản Auth thành công, uid =',
      userCredential.user.uid
    );
    const firebaseUser = userCredential.user;

    // Cập nhật displayName trên Firebase Auth profile
    try {
      await updateProfile(firebaseUser, { displayName: displayName.trim() });
    } catch (err) {
      console.warn('[authService] Không thể cập nhật Auth displayName:', err);
    }

    const nowIso = new Date().toISOString();
    const profileData = {
      displayName: displayName.trim(),
      studentId: studentId.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      createdAt: nowIso,
    };

    // Lưu thông tin sinh viên mở rộng vào Firestore collection "users" với doc ID = uid
    console.log('[Register] Đang ghi thông tin user vào Firestore...');
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, profileData);
    console.log('[Register] Ghi Firestore thành công, hoàn tất đăng ký');

    const fullUser: User = {
      uid: firebaseUser.uid,
      id: firebaseUser.uid,
      email: firebaseUser.email || email.trim(),
      displayName: displayName.trim(),
      name: displayName.trim(),
      studentId: studentId.trim().toUpperCase(),
      createdAt: nowIso,
    };

    return fullUser;
  } catch (error: any) {
    console.log('[Register] LỖI:', error?.code, error?.message);
    throw error;
  }
};

/**
 * Đăng nhập bằng Email và Mật khẩu
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email.trim(), password);
};

/**
 * Đăng xuất tài khoản khỏi thiết bị
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Lấy thông tin bổ sung của sinh viên từ Firestore theo UID
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid,
        id: uid,
        email: data.email || '',
        displayName: data.displayName || '',
        name: data.displayName || '',
        studentId: data.studentId || '',
        createdAt: data.createdAt,
      };
    }
  } catch (err) {
    console.warn('[authService] Không thể lấy profile từ Firestore:', err);
  }
  return null;
};

export const authService = {
  registerWithEmail,
  loginWithEmail,
  logout,
  getUserProfile,
  mapAuthError,
};
