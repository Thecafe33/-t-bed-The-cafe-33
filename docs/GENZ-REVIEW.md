# Đánh giá trải nghiệm Óc Eo Townwalk trên điện thoại

Rà soát ngày 04/11/2026, vòng hai kết thúc khoảng 23:23 giờ Việt Nam. Đây là các tình huống mô phỏng nhiều nhu cầu của người trẻ; không có người tham gia khảo sát thật và không tạo đánh giá công khai giả.

Báo cáo này thay đánh giá vòng đầu lúc 21:53: mạng hiện truy cập được website Ban Quản lý, nguồn ảnh và bản đồ. Những kết luận cũ về nguồn bị chặn, danh mục ít và chưa có tọa độ không còn mô tả bản hiện tại.

## Năm góc nhìn và việc đã kiểm tra

| Góc nhìn | Việc cần làm | Kết quả kiểm tra và thay đổi |
| --- | --- | --- |
| Lần đầu biết Óc Eo | Hiểu nơi này có gì đáng đi mà không đọc một bài dài | Phần nhập môn thu gọn, tìm kiếm nằm gần đầu màn hình, ảnh Ba Thê thật; ghi đúng hồ sơ đang đề cử UNESCO. Tìm không dấu và bí danh Gò 6 Thuận/Út Trạch hoạt động. |
| Đã quan tâm khảo cổ | Học thêm điều cụ thể và kiểm tra nguồn | Đọc Giồng Cát, câu chuyện nhẫn Nandin phát hiện năm 2018, câu hỏi quan sát và liên kết bài gốc. Có 14 hồ sơ từ nhóm A/B, tách nguồn nội dung với nguồn vị trí; ảnh có giấy phép và ghi công. |
| Nhóm bạn tự lên kế hoạch | Lưu điểm, gửi bạn bè, cân nhắc ăn nghỉ | Lưu điểm ở máy, tải lại vẫn còn; chia sẻ liên kết mở đúng hồ sơ. Lịch một ngày tách thành tab riêng, có liên hệ quản lý và chuẩn bị. Danh bạ có năm mục ăn uống/cà phê/lưu trú tham khảo, chưa cam kết giá hoặc hoạt động. |
| Khách trẻ không đăng nhập | Duyệt tự do và hiểu bộ tem | Mở Óc Eo Pass, đổi tên, xem hiệu ứng và các trang. Năm điểm có vị trí mở nhận tem được xếp trước, chín hồ sơ chờ tọa độ ở các trang sau. Không bắt đăng nhập khi tìm hiểu; chưa đủ tem thì khóa xuất chứng nhận hoàn thành. |
| Đi ngoài đường, mạng yếu | Mở lại và đọc tư liệu đã tải | Kiểm tra Service Worker thật: mất mạng vẫn mở app và đọc Gò Sáu Thuận. Chỉ cache tài liệu công khai, không cache phản hồi tài khoản hoặc OSM tiles. Bản đồ lỗi có nút thử lại và chuyển tới danh sách. |

## Kiểm tra bổ sung

- Chromium ở 320, 360, 390, 430, 768 và 1440 px: năm tab tách biệt, không tràn ngang, thanh điều hướng có vùng bấm ít nhất 44 px và nhãn 12 px. Màn hình lớn vẫn giữ bố cục ứng dụng hẹp.
- Tải tiles OSM qua mạng thật nhận HTTP 200: năm vùng khảo cổ và một cơ sở lưu trú từ OSM; không dùng sơ đồ tự vẽ thay nền địa lý. Ranh giới OSM là tham khảo, không phải bản đồ hành chính pháp lý.
- Luồng trình duyệt với cloud transport thay thế: GPS gần nhận tem, GPS xa bị từ chối, mở/đóng Pass, xuất PNG có tên, bắt buộc ảnh, hiển thị bài ngay và gửi báo cáo. Thay thế transport không chứng minh Google OAuth thật.
- Tám kiểm tra mô hình dữ liệu, bốn kiểm tra đầu vào Functions và năm kiểm tra tích hợp trên Firebase emulator đã qua. Emulator chạy Auth/Firestore/Storage/Functions cục bộ: kiểm tra phân quyền, ảnh thật được giải mã lại, công khai ngay, chống trùng/giới hạn tốc độ, xóa dữ liệu và tài khoản.
- Admin xem trước chỉnh nội dung, nguồn, tọa độ, ghi công ảnh, danh bạ, lịch trình và chính sách. Chưa đăng nhập thì không xuất bản dữ liệu.

Kết quả máy đọc được: `tests/mobile_personas.py`, `tests/browser_smoke.py`, `tests/browser_journeys.py`; ảnh chụp và kết quả trong `/workspace/outputs`. Không dùng số sao mô phỏng hay gán điểm hài lòng của người dùng thật.

## Các điểm còn hạn chế khi quyết định đi thực tế

1. Chín hồ sơ chưa có tọa độ đủ căn cứ nên chưa đặt pin/nhận tem. Năm vùng OSM hiện có là tâm vùng, không phải cổng vào đo tại hiện trường. Cần xác nhận lối tiếp cận, giờ đón khách và địa giới với đơn vị quản lý.
2. Lịch là khung biên tập một ngày, chưa tính tuyến bằng máy định tuyến, chưa có giao thông trực tiếp và không phải cam kết đi hết các điểm bằng chân. Cần phương tiện giữa các cụm và xác nhận tiếp cận trước chuyến đi.
3. Các cơ sở ăn nghỉ có nguồn công khai nhưng chưa gọi xác minh hoạt động, giá, thực đơn hoặc phòng trống. Các kết quả khách sạn ở Tri Tôn/Long Xuyên không được đưa vào để lấp danh sách.
4. GPS phía trình duyệt có thể giả mạo. Óc Eo Pass là kỷ niệm tự ghi nhận, không dùng như bằng chứng chính thức hoặc trao thưởng có giá trị.
5. Chưa triển khai Firebase/Hosting trong lượt này. Cần đơn vị vận hành và email bảo mật thật, cấu hình Google Auth/tên miền, rà soát rules dùng chung rồi kiểm tra trên môi trường triển khai. Người dưới 16 tuổi dùng chế độ khách; chưa có luồng đồng ý của người giám hộ.

Ưu tiên kiểm nghiệm tiếp theo với người dùng thật: quan sát một nhóm bạn dùng ngoài trời, độ dễ đọc trong nắng, tìm được lối vào, hiểu trạng thái pin/tem và mức hữu ích của lịch trình. Năm góc nhìn mô phỏng hiện tại giúp tìm lỗi thao tác, chưa thay thế được chuyến khảo sát này.
