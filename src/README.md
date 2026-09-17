# Cấu trúc mã nguồn Modular - VKU Study Room Booking (`/src`)

Thư mục `/src` được tổ chức theo kiến trúc **Modular Architecture**, phân tách rõ ràng trách nhiệm giữa UI, State, Logic và Dữ liệu, tuân thủ các nguyên lý clean code trong React Native.

---

## Danh mục & Vai trò các thư mục

### 1. `/src/types`

- **Vai trò**: Chứa toàn bộ các TypeScript interfaces, types và enums dùng chung cho toàn bộ ứng dụng.
- **Quy tắc**: Tuyệt đối không viết logic trong thư mục này. Chỉ chứa type definitions.
- **Các file chính**:
  - `room.ts`: Định nghĩa cấu trúc phòng (`Room`, `RoomType`, `Equipment`, `RoomFilter`).
  - `booking.ts`: Định nghĩa lịch đặt (`Booking`, `TimeSlot`, `BookingStatus`).
  - `user.ts`: Định nghĩa thông tin sinh viên VKU (`User`, `StudentProfile`).
  - `index.ts`: Barrel export toàn bộ types để import thuận tiện `from '../types'`.

### 2. `/src/constants`

- **Vai trò**: Lưu trữ các giá trị hằng số, cấu hình tĩnh bất biến trong suốt vòng đời app.
- **Các file chính**:
  - `colors.ts`: Bảng màu thiết kế thương hiệu VKU (Xanh dương chủ đạo, màu phụ, background, text, status).
  - `timeSlots.ts`: Danh sách các ca học tiêu chuẩn tại trường (Ca 1 đến Ca 6 kèm thời gian bắt đầu/kết thúc).
  - `buildings.ts`: Danh mục các khu giảng đường VKU (Khu K, Khu V, Tòa Hành chính, Thư viện).
  - `equipment.ts`: Danh mục trang thiết bị phòng (Máy chiếu, PC Core i7, Bảng trắng, Micro...).
  - `index.ts`: Barrel export.

### 3. `/src/data`

- **Vai trò**: Chứa dữ liệu mẫu (Mock data) ban đầu phục vụ phát triển, thử nghiệm offline và chạy trên Expo Snack.
- **Các file chính**:
  - `rooms.ts`: Danh sách các phòng học cá nhân, phòng lab AI, phòng hội thảo mô phỏng thực tế tại VKU.
  - `bookings.ts`: Các lịch đặt mẫu ban đầu để kiểm thử thuật toán chống trùng lịch và hiển thị mã QR.
  - `index.ts`: Barrel export.

### 4. `/src/utils`

- **Vai trò**: Các hàm thuần túy (pure functions), tính toán logic độc lập, không phụ thuộc vào React Component lifecycle.
- **Các file chính**:
  - `conflictChecker.ts`: Thuật toán kiểm tra xung đột lịch đặt (chống trùng phòng theo ngày và khung giờ).
  - `dateHelpers.ts`: Các tiện ích xử lý định dạng ngày tháng, tính toán thời gian sử dụng thư viện `date-fns`.
  - `idGenerator.ts`: Tiện ích tạo ID đặt phòng ngẫu nhiên và mã QR pass duy nhất.
  - `notifications.ts`: Tích hợp `expo-notifications`, tạo Android Channel và lập lịch Local Notification nhắc trước 15 phút.
  - `index.ts`: Barrel export.

### 5. `/src/store`

- **Vai trò**: Quản lý State toàn cục của ứng dụng bằng **Zustand**, kết hợp lưu trữ cục bộ với `@react-native-async-storage/async-storage`.
- **Các file chính**:
  - `useBookingStore.ts`: Quản lý danh sách phòng, danh sách vé đã đặt, hành động đặt phòng, hủy phòng, check-in QR.
  - `useFilterStore.ts`: Quản lý bộ lọc tìm kiếm (ngày chọn, tòa nhà, sức chứa tối thiểu, thiết bị yêu cầu).
  - `index.ts`: Barrel export.

### 6. `/src/hooks`

- **Vai trò**: Chứa các Custom React Hooks tái sử dụng logic có liên quan đến lifecycle hoặc state.
- **Các file chính**:
  - `useRooms.ts`: Hook tự động kết hợp danh sách phòng từ store và bộ lọc từ `useFilterStore` để trả về danh sách phòng phù hợp.
  - `index.ts`: Barrel export.

### 7. `/src/components`

- **Vai trò**: Chứa các UI Components tái sử dụng (Dumb/Presentational components), nhận dữ liệu qua `props`.
- **Các file chính**:
  - `RoomCard.tsx`: Thẻ hiển thị thông tin phòng, trạng thái, sức chứa và ảnh minh họa.
  - `FilterChip.tsx`: Nút lọc dạng chip, hỗ trợ chọn đơn hoặc đa lựa chọn (tòa nhà, trang bị).
  - `TimeSlotButton.tsx`: Nút chọn ca học với 3 trạng thái trực quan: Còn trống (xanh/trắng), Đang chọn (xanh đậm), Đã có người đặt (xám disabled).
  - `DateSelector.tsx`: Thanh cuộn ngang chọn ngày đặt phòng (Hôm nay, ngày mai, các ngày trong tuần).
  - `QRModal.tsx`: Hộp thoại modal hiển thị mã QR check-in phòng học bằng `react-native-qrcode-svg`.
  - `index.ts`: Barrel export.

### 8. `/src/navigation`

- **Vai trò**: Cấu hình hệ thống điều hướng toàn app với `@react-navigation`.
- **Các file chính**:
  - `types.ts`: TypeScript definitions cho tham số truyền giữa các màn hình (`RootStackParamList`, `MainTabParamList`).
  - `TabNavigator.tsx`: Bottom Tab Navigator cho các màn hình gốc (Khám phá, Vé của tôi, Hồ sơ cá nhân).
  - `RootNavigator.tsx`: Stack Navigator chính chứa TabNavigator và các màn hình Modal/Chi tiết (`RoomDetailScreen`).
  - `index.ts`: Barrel export.

### 9. `/src/screens`

- **Vai trò**: Các màn hình chính (Page/Container components) gắn với route điều hướng.
- **Các file chính**:
  - `HomeScreen.tsx`: Màn hình tìm kiếm, lọc phòng, xem danh sách phòng khả dụng theo ngày.
  - `RoomDetailScreen.tsx`: Màn hình chi tiết thông số phòng, thiết bị, chọn ca học và xác nhận đặt chỗ.
  - `MyBookingsScreen.tsx`: Màn hình quản lý danh sách vé đặt của sinh viên, xem mã QR check-in, hủy phòng.
  - `ProfileScreen.tsx`: Màn hình thông tin tài khoản sinh viên VKU, lịch sử sử dụng, hướng dẫn quy định mượn phòng.
  - `index.ts`: Barrel export.
