# 🎓 VKU Study Room Booking - Ứng Dụng Đặt Phòng Học Thời Gian Thực

Ứng dụng di động đặt phòng học & không gian nghiên cứu thời gian thực dành cho sinh viên và giảng viên Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU - Đại học Đà Nẵng). Được xây dựng với **React Native**, **Expo SDK**, **TypeScript**, **Zustand**, **AsyncStorage**, và **Expo Notifications**.

---

## 🚀 Tính Năng Nổi Bật (Core Features)

### 1. ⚡ Giao Diện Hiệu Năng Cao (60 FPS Scrolling)
- **FlatList Tối Ưu Tận Cùng**: Tinh chỉnh `initialNumToRender={5}`, `maxToRenderPerBatch={5}`, `windowSize={7}`, `removeClippedSubviews`, cùng hàm `getItemLayout` tính trước kích thước cố định (`ROOM_CARD_HEIGHT = 295px`), loại bỏ hoàn toàn hiện tượng giật lag (frame drops) khi cuộn danh sách phòng.
- **Memoized RoomCard**: Component hiển thị thẻ phòng được bọc bằng `React.memo` với hàm so sánh tùy biến, ngăn re-render không cần thiết khi các trạng thái khác thay đổi.
- **Bộ Lọc Đa Chiều (FilterChips)**: Lọc tức thời theo Tòa nhà (Tòa A, B, C, V), Sức chứa (<6 chỗ, 6-10 chỗ, >10 chỗ), và danh mục Trang thiết bị (Máy chiếu, Smart TV, Mạng LAN, Điều hòa, Bảng trắng...).

### 2. 📅 Bộ Chọn Lịch 7 Ngày & Khung Giờ 2 Tiếng Cố Định
- Thanh chọn ngày cuộn ngang trong 7 ngày kế tiếp với giao diện trực quan, tự động đánh dấu "Hôm nay".
- Lưới các ca học rời rạc chuẩn 2 giờ:
  - `07:30 – 09:30` (Ca 1)
  - `09:30 – 11:30` (Ca 2)
  - `12:30 – 14:30` (Ca 3)
  - `14:30 – 16:30` (Ca 4)
  - `16:30 – 18:30` (Ca 5)
  - `18:30 – 20:30` (Ca 6)
- Tự động kiểm tra trạng thái và **vô hiệu hóa trực quan (Disabled & Locked)** đối với các khung giờ đã có người đặt trước hoặc ca học đã trôi qua trong ngày.

### 3. 🛡️ Bộ Máy Chống Xung Đột Lịch (Conflict Prevention Engine)
- Được tích hợp trực tiếp trong Zustand store (`useBookingStore.ts`).
- Thực hiện kiểm tra nguyên tử (atomic validation) trên cặp khóa `[roomId + date + timeSlot.startTime]`.
- Ngăn chặn triệt để tình trạng đặt trùng phòng (double booking).
- Lưu trữ trạng thái bền vững trên thiết bị bằng `@react-native-async-storage/async-storage`.

### 4. 🎫 Thẻ Check-in Điện Tử & Mã QR Tự Động
- Khi đặt phòng thành công, ứng dụng sinh ra thẻ phòng dạng vé điện tử sang trọng.
- Tích hợp mã QR (`react-native-qrcode-svg`) mã hóa dữ liệu xác thực (Mã vé, Phòng, Tòa, Ca học, Tên SV, MSSV, Dấu thời gian).
- Sinh viên có thể quét mã tại cổng kiểm soát hoặc xuất trình cho giám thị phòng lab.

### 5. 🔔 Thông Báo Cục Bộ Nhắc Lịch Trước 15 Phút
- Sử dụng `expo-notifications` để lên lịch thông báo cục bộ chính xác trước **15 phút** so với thời điểm bắt đầu ca học.
- Đã cấu hình notification channel riêng cho Android (`study-room-alerts`) với độ ưu tiên cao (`AndroidImportance.HIGH`).
- Tự động hủy thông báo đã hẹn giờ nếu người dùng bấm "Hủy lịch đặt phòng".

---

## 📁 Cấu Trúc Dự Án (Architecture Overview)

```
vku-room-booking/
├── App.tsx                      # Root App, SafeAreaProvider & Notification Init
├── app.json                     # Cấu hình Expo, Android package, Notification plugins
├── package.json                 # Khai báo dependencies chuẩn
├── tsconfig.json                # TypeScript strict config
└── src/
    ├── types/                   # Định nghĩa TypeScript Interfaces & Types
    │   └── index.ts             # Room, TimeSlot, Booking, UserSession, FilterState...
    ├── utils/                   # Dữ liệu & Tiện ích
    │   ├── mockData.ts          # Cơ sở dữ liệu mẫu 6 phòng học (A, B, C, V), ca học, SV
    │   ├── dateUtils.ts         # Tính toán 7 ngày, định dạng ngày tiếng Việt, tính mốc 15 phút
    │   └── notifications.ts     # Cấu hình expo-notifications & lập lịch nhắc nhở
    ├── store/                   # Quản lý State toàn cục
    │   └── useBookingStore.ts   # Zustand Store + AsyncStorage + Conflict Engine
    ├── components/              # Các UI Components hiệu năng cao
    │   ├── FilterChips.tsx      # Bộ lọc ngang Tòa, Sức chứa, Tiện ích
    │   ├── RoomCard.tsx         # Thẻ phòng học bọc React.memo, kích thước cố định 295px
    │   ├── DateSelector.tsx     # Bộ chọn 7 ngày ngang trực quan
    │   ├── TimeSlotPicker.tsx   # Lưới ca học 2 giờ kèm khóa xung đột
    │   └── BookingPassModal.tsx # Thẻ Check-in tích hợp QR Code
    ├── screens/                 # Các màn hình chính
    │   ├── HomeScreen.tsx       # Khám phá phòng với FlatList 60fps
    │   ├── RoomDetailScreen.tsx # Chi tiết phòng, chọn ngày, ca học & đặt phòng
    │   └── MyBookingsScreen.tsx # Quản lý lịch đã đặt & xem lại vé QR
    └── navigation/
        └── AppNavigator.tsx     # Cấu hình NativeStack React Navigation
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **Expo SDK** | `~57.0` | Nền tảng phát triển ứng dụng React Native |
| **React & React Native** | `19.2 / 0.86` | Thư viện UI nền tảng |
| **TypeScript** | `~6.0` | Đảm bảo an toàn kiểu dữ liệu (Strict Mode) |
| **Zustand** | `^5.0` | State management siêu nhẹ và linh hoạt |
| **AsyncStorage** | `2.2.0` | Lưu trữ dữ liệu lịch đặt phòng trên máy |
| **React Navigation** | `^7.3` | Điều hướng màn hình mượt mà |
| **Expo Notifications**| `~57.0` | Lập lịch thông báo cục bộ trước 15 phút |
| **react-native-qrcode-svg** | `^6.3` | Sinh mã QR xác thực vé check-in |
| **lucide-react-native** | `^1.43` | Bộ biểu tượng đồ họa hiện đại |

---

## 💻 Hướng Dẫn Chạy Ứng Dụng (Getting Started)

Khi bạn sẵn sàng kiểm thử trên thiết bị:

1. **Mở terminal và di chuyển vào thư mục dự án:**
   ```bash
   cd C:\MyProject\profilefortus\vku-room-booking
   ```

2. **Khởi chạy Metro Bundler:**
   ```bash
   npx expo start
   ```

3. **Mở ứng dụng:**
   - **Expo Go (Điện thoại thật)**: Quét mã QR hiển thị trong terminal bằng ứng dụng Expo Go trên Android hoặc camera trên iOS.
   - **Android Emulator**: Nhấn phím `a`.
   - **iOS Simulator**: Nhấn phím `i` (yêu cầu macOS).
   - **Web Browser**: Nhấn phím `w`.

---

## 🧪 Kịch Bản Kiểm Thử (Testing Scenarios)

1. **Kiểm tra Conflict Prevention (Chống trùng giờ)**:
   - Thử đặt phòng `A.101` vào ca `09:30 – 11:30` hôm nay.
   - Hệ thống sẽ hiển thị biểu tượng ổ khóa màu đỏ với nhãn **"Đã đặt"** và không cho phép chọn (do đã có trong mock booking sẵn).
2. **Kiểm tra Đặt phòng & Sinh mã QR**:
   - Chọn một ca còn trống (màu xanh lá), nhấn **"Xác nhận đặt"**.
   - Thẻ check-in sẽ lập tức bật lên kèm mã QR sắc nét chứa thông tin vé.
3. **Kiểm tra Lưu trữ & Đồng bộ**:
   - Vào tab **"Lịch Đặt Phòng Của Tôi"** để xem ca học vừa đặt.
   - Dữ liệu được lưu trữ tự động trong `AsyncStorage`, giữ nguyên kể cả khi tải lại ứng dụng.
4. **Kiểm tra Lập lịch Thông báo**:
   - Khi đặt phòng, thông báo được tự động hẹn giờ đúng trước 15 phút so với giờ bắt đầu ca học. Nếu ca học cách dưới 15 phút, một thông báo xác nhận sẽ kích hoạt tức thì.

