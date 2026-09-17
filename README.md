# VKU Study Room Booking (StudyRoomBooking) 🎓📱

> Ứng dụng di động quản lý & đặt phòng học/phòng lab thời gian thực dành cho sinh viên Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU).
>
> 🔗 **GitHub Repository**: [https://github.com/ThanhTu1125/vku-room-booking](https://github.com/ThanhTu1125/vku-room-booking)

---

## 🌟 Tính năng chính

- 🏛️ **Khám phá & Tìm kiếm phòng học**: Danh mục các phòng tự học, phòng họp nhóm, Lab AI, Lab IoT, Lab Mac Studio tại các khu giảng đường VKU (Khu K, Khu V, Thư viện, Tòa Đa Năng).
- 🔍 **Bộ lọc đa tiêu chí linh hoạt**: Lọc theo ngày, tòa nhà, sức chứa, loại phòng và trang thiết bị (máy chiếu, điều hòa, dàn PC i7...).
- ⏰ **Chọn ca học & Chống trùng lịch**: 6 ca học tiêu chuẩn mỗi ngày; thuật toán tự động nhận diện và khóa các ca đã có người đặt hoặc đã quá giờ.
- 📱 **Vé Check-in mã QR**: Tự động sinh mã QR Pass bằng SVG chuẩn xác để quét mở cửa phòng học.
- ⚡ **Quản lý State toàn cục bằng Zustand**: Kết hợp lưu trữ offline qua `@react-native-async-storage/async-storage`.
- 🔔 **Local Notifications thông minh**: Lập lịch thông báo nhắc nhở sinh viên trước giờ học 15 phút, tương thích 100% Expo Go và Expo Snack.

---

## 🛠️ Công nghệ sử dụng

| Thư viện / Công nghệ | Vai trò & Lý do lựa chọn |
| :--- | :--- |
| **Expo SDK (Managed Workflow)** | Hỗ trợ phát triển nhanh, tương thích hoàn toàn Expo Go và triển khai trực tiếp lên Expo Snack mà không cần cấu hình Native Build phức tạp. |
| **TypeScript** | Định kiểu chặt chẽ (strict typing), kiểm soát lỗi tại thời điểm compile, tăng độ tin cậy và tự tin tái cấu trúc. |
| **Zustand** | State management siêu nhẹ (< 2KB), API tối giản dạng hook, không boilerplate, dễ persist với AsyncStorage. |
| **React Navigation v7** | Hệ thống điều hướng tiêu chuẩn công nghiệp (Native Stack + Bottom Tabs) tối ưu hóa trải nghiệm native mượt mà. |
| **react-native-screens & safe-area-context** | Tối ưu hóa hiệu năng render màn hình và xử lý tai thỏ / notch trên mọi thiết bị iOS & Android. |
| **@react-native-async-storage/async-storage** | Lưu trữ dữ liệu lịch đặt phòng cục bộ trên thiết bị, duy trì trạng thái khi khởi động lại app. |
| **expo-notifications** | Quản lý kênh thông báo Android (Channel) và lập lịch Local Notification nhắc trước 15 phút. |
| **react-native-qrcode-svg + react-native-svg** | Tạo mã QR check-in phòng học bằng đồ họa vector SVG sắc nét, không bị vỡ hình. |
| **date-fns** | Xử lý định dạng thời gian, tính toán ca học theo chuẩn modular, tree-shaking tối ưu dung lượng bundle. |

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Clone project:
```bash
git clone https://github.com/ThanhTu1125/vku-room-booking.git
cd vku-room-booking
```

### 2. Cài đặt thư viện phụ thuộc:
```bash
npm install
```

### 3. Khởi chạy Metro Bundler:
```bash
npx expo start
```
- Quét mã QR bằng ứng dụng **Expo Go** trên Android/iOS để trải nghiệm.
- Nhấn `a` để mở trên Android Emulator.
- Nhấn `w` để mở trên Web browser.

### 4. Kiểm tra mã nguồn:
```bash
# Kiểm tra định kiểu TypeScript:
npm run typecheck

# Định dạng code với Prettier:
npm run format

# Kiểm tra linter với ESLint:
npm run lint
```

---

## 📁 Cấu trúc thư mục Modular

Chi tiết xem tại tài liệu nội bộ [/src/README.md](./src/README.md).

```
├── App.tsx                     # Root application component
├── index.ts                    # Expo entry point
├── app.json                    # Cấu hình Expo & Notifications
├── package.json                # Dependencies & scripts
├── tsconfig.json               # Cấu hình TypeScript
├── .eslintrc.js                # Cấu hình ESLint
├── .prettierrc                 # Cấu hình Prettier
├── .gitignore                  # Git ignore standard
└── src/
    ├── README.md               # Tài liệu nội bộ kiến trúc modular
    ├── components/             # Reusable UI components
    ├── constants/              # Hằng số, màu sắc, ca học, tòa nhà
    ├── data/                   # Mock data phòng học & lịch đặt
    ├── hooks/                  # Custom React hooks
    ├── navigation/             # Bottom Tabs & Native Stack
    ├── screens/                # Các màn hình chính
    ├── store/                  # Zustand global stores
    ├── types/                  # TypeScript interfaces & types
    └── utils/                  # Thuật toán chống trùng, date, id, notifications
```

