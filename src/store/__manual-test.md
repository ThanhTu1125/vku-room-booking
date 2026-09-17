# Kịch bản kiểm thử thủ công (Manual Test Verification) - `useBookingStore`

Tài liệu mô tả các trường hợp kiểm thử cho `useBookingStore`, đặc biệt tập trung vào cơ chế **Double-Check chống trùng lịch** và **Zustand Persistence**.

---

## 1. Test Case: Ngăn chặn trùng lịch phòng học (Room Conflict)

### Mục tiêu:

Xác minh rằng `createBooking` từ chối tạo mới khi một khung giờ của phòng học đã có người đặt trong cùng một ngày.

### Các bước thực hiện:

1. Lấy dữ liệu mock ban đầu:
   - Phòng `room-a101` (Phòng Thảo Luận Nhỏ A.101).
   - Ngày: `Hôm nay` (ví dụ `2026-09-17`).
   - Khung giờ: `slot-1` (07:30 - 09:30).
   - Trong `MOCK_BOOKINGS`, ca này đã được đặt bởi `user-vku-01` với status `upcoming`.
2. Gọi hàm:
   ```typescript
   const result = useBookingStore
     .getState()
     .createBooking('room-a101', todayString, 'slot-1');
   ```
3. **Kết quả mong đợi**:
   - `result.success` là `false`.
   - `result.booking` là `undefined`.
   - `result.error` trả về thông báo lỗi:
     `"Khung giờ 07:30 - 09:30 ngày 2026-09-17 tại Phòng Thảo Luận Nhỏ A.101 đã được đặt bởi người khác. Vui lòng chọn ca hoặc phòng khác!"`

---

## 2. Test Case: Ngăn chặn sinh viên tự trùng lịch cá nhân (User Conflict)

### Mục tiêu:

Một sinh viên không thể đặt cùng lúc 2 phòng khác nhau trong cùng một khung giờ của cùng một ngày.

### Các bước thực hiện:

1. Giả sử sinh viên `user-vku-01` đã có lịch đặt tại phòng `room-b202` vào `slot-3` (13:00 - 15:00) ngày hôm nay.
2. Sinh viên cố gắng đặt thêm phòng `room-v101` cũng vào `slot-3` (13:00 - 15:00) ngày hôm nay:
   ```typescript
   const result = useBookingStore
     .getState()
     .createBooking('room-v101', todayString, 'slot-3');
   ```
3. **Kết quả mong đợi**:
   - `result.success` là `false`.
   - `result.error` trả về: `"Bạn đã có một lịch đặt phòng khác trong cùng khung giờ 13:00 - 15:00 ngày 2026-09-17. Không thể đặt 2 phòng cùng lúc."`

---

## 3. Test Case: Đặt thành công ca còn trống

### Các bước thực hiện:

1. Chọn phòng `room-a101`, ngày hôm nay, ca `slot-4` (15:00 - 17:00) (chưa có ai đặt).
2. Gọi hàm:
   ```typescript
   const result = useBookingStore
     .getState()
     .createBooking('room-a101', todayString, 'slot-4');
   ```
3. **Kết quả mong đợi**:
   - `result.success` là `true`.
   - `result.booking` chứa:
     - `id`: dạng `BK-XXXX-XXXX`
     - `status`: `'upcoming'`
     - `qrPayload`: chuỗi JSON chứa `{ bookingId, roomId, date, timeSlotId, userId, studentId, timestamp }`
   - Store `bookings` tăng thêm 1 phần tử mới ở đầu mảng.

---

## 4. Test Case: Ca học sau khi hủy (Cancelled) được giải phóng

### Các bước thực hiện:

1. Người dùng gọi `cancelBooking(bookingId)` cho một vé đang `upcoming`.
2. Trạng thái của vé đổi thành `status: 'cancelled'`.
3. Một sinh viên khác đặt lại chính phòng đó, ngày đó, ca đó.
4. **Kết quả mong đợi**:
   - `getAvailableSlotsForRoom` trả về ca đó với `isBooked: false` (vì booking bị hủy không được tính là đang chiếm chỗ).
   - `createBooking` thành công `success: true`.

---

## 5. Test Case: Kiểm tra Zustand Persist với AsyncStorage

### Mục tiêu:

Đảm bảo thông tin `currentUser` và danh sách `bookings` được lưu vào bộ nhớ cục bộ thiết bị, không bị mất khi reload ứng dụng.

### Cơ chế hoạt động:

1. Middleware `persist` lắng nghe mọi thay đổi của store.
2. Khi `createBooking`, `cancelBooking`, `checkInBooking`, hoặc `login` diễn ra, `partialize` chỉ lấy 2 trường:
   ```typescript
   {
     currentUser: state.currentUser,
     bookings: state.bookings
   }
   ```
   và serialize thành chuỗi JSON lưu vào `AsyncStorage` dưới key `"study-room-booking-storage"`.
3. Bộ lọc `filters` (searchText, buildings, capacityRange, equipment) KHÔNG bị persist, giúp giao diện luôn bắt đầu ở trạng thái sạch sẽ mỗi khi mở lại app.
4. Khi app khởi động lại, middleware tự động đọc key `"study-room-booking-storage"` từ `AsyncStorage`, parse JSON và hydrate vào memory state của Zustand trước khi màn hình render.
