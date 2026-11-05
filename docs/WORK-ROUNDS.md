# Các vòng hoàn thiện

Không có tác vụ nền tự khởi động lại sau khi kết thúc chat. Các mốc dưới đây ghi công việc thực hiện trong phiên hiện tại; giờ Việt Nam.

## Vòng 1 — bắt đầu 22:20, rà soát mốc 22:51 ngày 04/11/2026

- Đọc nguồn Ban Quản lý: danh mục khu A/B, tổng quan, khảo sát, bài về Linh Sơn, nhẫn Nandin và kênh cổ.
- Biên tập 14 hồ sơ; chuẩn hóa Gò Út Trạnh, giữ bí danh; không đưa Nền Chùa/Giồng Xoài vào tuyến xã Óc Eo.
- Đối chiếu 5 vị trí khảo cổ trên OSM, phân biệt tâm vùng với cổng vào. Bổ sung đường nét đứt OSM, ghi rõ giới hạn pháp lý.
- Lấy ảnh Commons có giấy phép mở và ghi công; thay ảnh minh họa bằng ảnh Ba Thê thật.
- Hoàn thiện nguồn trong chi tiết, gợi ý quan sát, lưu điểm muốn ghé và hướng dẫn chuẩn bị.
- Chạy emulator: đã xác nhận phân quyền, ảnh bắt buộc, tạo bài, chống gửi trùng và xóa tài khoản với bộ SDK ban đầu; phát hiện và sửa điều kiện chống ghi đè ảnh.
- Cập nhật thư viện và giải mã ảnh ở máy chủ, kiểm tra lại sau cập nhật ở vòng tiếp.

## Vòng 2 — rà soát mốc 23:23 ngày 04/11/2026

- Kiểm tra nhiều góc nhìn trên điện thoại; năm tình huống có kết quả thao tác tự động, không mạo nhận khảo sát người thật.
- Lưu điểm muốn ghé, chia sẻ liên kết vào đúng hồ sơ, kiểm tra chế độ khách và đọc nguồn khi mất mạng bằng Service Worker thật.
- Đối chiếu thêm bốn trang danh bạ có địa chỉ Óc Eo; tổng năm mục ăn nghỉ gồm một điểm OSM. Không lấy tọa độ Google đặt lên OSM hay chép đánh giá của nền tảng khác.
- Tải bản đồ OSM thật thành công, sáu pin có nguồn: năm vùng khảo cổ và một lưu trú.
- Nâng Firebase SDK/CLI và giải mã lại ảnh bằng Sharp phía máy chủ; kiểm tra emulator sau cập nhật qua cả năm bài tích hợp. Tám bài mô hình, bốn bài Functions và các luồng trình duyệt cũng qua.
- Bổ sung trường liên hệ/giờ phục vụ/giá và nguồn danh bạ trong admin; thống nhất nhãn để không biến tọa độ tham khảo thành xác nhận cơ sở còn hoạt động.
- Ghi giới hạn còn lại trong GENZ-REVIEW.md và hướng dẫn kích hoạt Firebase. Không triển khai Hosting, không ghi dữ liệu production.

Mốc ghi là công việc thực hiện trong phiên, không phải lịch chạy nền. Phiên chat kết thúc sẽ không tự khởi động vòng mới sau 30 phút.
