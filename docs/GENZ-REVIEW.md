# Rà soát trải nghiệm Óc Eo Townwalk trên điện thoại

Cập nhật 05/11/2026. Đây là đánh giá theo các tình huống sử dụng và kiểm tra trình duyệt, không phải phỏng vấn người dùng thật hay các đánh giá công khai giả. Báo cáo này thay số liệu của bản trước.

## Các góc nhìn

| Người dùng / nhu cầu | Kết quả hiện tại | Giới hạn cần biết |
| --- | --- | --- |
| Lần đầu nghe về Óc Eo | Postcard Óc Eo xanh đậm, ảnh Ba Thê thật, ba thẻ gợi tò mò và nút bốc điểm không lặp liên tiếp; nhập môn ngắn, 16 hồ sơ, tìm không dấu và bí danh Gò 6 Thuận/Út Trạch. | Danh mục vẫn chưa bao quát mọi di tích; hồ sơ UNESCO đang được đề cử, không ghi là đã được công nhận. |
| Bạn trẻ thích khảo cổ | Mỗi hồ sơ có nguồn, câu chuyện và câu hỏi quan sát; phân biệt nhà trưng bày, nơi phát hiện hiện vật và công trình cũ trên núi. | Giờ đón khách và các lối tiếp cận cần hỏi Ban Quản lý. Không đoán tọa độ cho đủ pin. |
| Nhóm bạn đi một ngày | Tab lịch trình riêng, lưu điểm, chia sẻ đúng hồ sơ, 9 gợi ý ăn/nghỉ; The cafe 33 đặt Cafe in bed qua website, XOFA có Sữa Gạo Phù Nam. | Lịch là khung tham khảo, chưa tính đường đi tối ưu; giá từ 25K và hoạt động của cơ sở cần xác nhận lại. |
| Người thích đăng story | Bộ Óc Eo Pass gồm 15 điểm, chỉ vẽ tem thực sự đã nhận; 4 điểm đã đến cho kết quả 4/15. Ảnh PNG 1080×1920 có tên, tem viền khuyết tròn, nút lưu ngay cả khi chưa đủ bộ. | 7 điểm di sản hiện có vị trí đủ nguồn để mở check-in; những điểm khác vẫn nằm trong tổng nhưng chưa phát tem mới. GPS phía trình duyệt có thể bị giả, Pass không phải chứng nhận chính thức. |
| Khách không muốn đăng nhập | Tra cứu, bản đồ, lịch và Pass lưu tại máy dùng được với chế độ khách. | Xóa dữ liệu trình duyệt sẽ mất Pass khách; đăng bài cần Google và ảnh. Đăng nhập/đăng bài còn chờ cấu hình đơn vị vận hành và liên hệ bảo mật. |
| Khách đọc tiếng Anh / Trung | Chuyển Việt, Anh, Trung giản thể; hướng dẫn, cảnh báo, chính sách và ảnh Pass đều có bản dịch. Tên địa điểm, tên người và bài viết do khách tự nhập giữ nguyên. | Nội dung quản trị nội bộ vẫn dùng tiếng Việt; đoạn nội dung mới do quản trị viên viết cần được bổ sung bản dịch. |
| Người đi ngoài đường / mạng yếu | Bản đồ chiếm phần lớn màn hình, cụm số tách pin sát nhau khi phóng to, thẻ xem nhanh và danh sách thu gọn; điểm/zoom được giữ khi đổi tab. Tìm điểm gần cần bấm nút và cấp quyền; chỉ tính khoảng cách đường chim bay, không tự phát tem. Điều hướng pill, vùng bấm tab ≥44px, không tràn ngang từ 320px; tài liệu đã cache đọc được khi mất mạng. Hiệu ứng ngắn, tôn trọng giảm chuyển động; âm thanh mặc định tắt và chỉ phát khi bật rồi tương tác. | Nền OSM và đồng bộ cần mạng. Không cache phản hồi tài khoản hay bản đồ tiles. |
| Người muốn thử hidden gem | Nhà trưng bày cũ trên Ba Thê là nhánh tùy chọn, tách khỏi tuyến chính và không phát tem. | Đường núi khó đi, tránh mưa/đường trơn, cân nhắc xe ôm địa phương và đội mũ; chỉ vào khu vực được phép, không vào công trình bỏ hoang. |

## Bằng chứng kiểm tra

- Trình duyệt Chromium: năm tab, tìm/lọc, nguồn, bản đồ 11 pin có nguồn, admin preview và không tràn ngang ở 320/360/390/430/768/1440px.
- Kiểm tra lại chính GitHub Pages: stylesheet, script, font và ảnh tải được dưới thư mục dự án. Bộ kiểm tra riêng phục vụ URL có tiền tố bắt lỗi đường dẫn gốc và cache sai phạm vi.
- Cloud transport giả lập: GPS xa/thiếu chính xác bị từ chối; bốn check-in hợp lệ cho đúng 4/15, không nhân đôi, không tự hiện tem tương lai; PNG đúng kích thước và đúng tem.
- Luồng đánh giá: bắt buộc ảnh, hiển thị sau khi gửi và báo cáo. Tên/nội dung không bị đổi khi chuyển ngôn ngữ; nhãn lý do được dịch nhưng giá trị lưu giữ ổn định.
- Việt/Anh/Trung: năm màn hình và 25 hồ sơ/điểm dừng, chính sách riêng, PNG có font cục bộ, chọn ngôn ngữ được nhớ khi tải lại; tiếng Trung và xuất PNG hoạt động với Service Worker thật khi ngoại tuyến.
- Web Audio: không tạo AudioContext khi vừa mở trang; chỉ tạo sau khi bật, có âm khi tương tác, ngừng tạo âm mới sau khi tắt. Chế độ giảm chuyển động bỏ hiệu ứng chuyển tab.
- Các kiểm tra giao diện không ghi dữ liệu Firebase thật và không chứng minh Google OAuth production. Kiểm tra emulator trước đó xác nhận quy tắc và callable bằng dự án demo; không thay thế việc kích hoạt production.

## Ưu tiên tiếp theo

Xác nhận thực địa các cổng vào, giờ tham quan và cơ sở ăn/nghỉ; bổ sung tọa độ cho các hồ sơ còn chờ; thử trên Safari/iPhone thật với nhóm bạn đi Óc Eo; hoàn thiện cấu hình pháp lý/liên hệ và triển khai Firebase có kiểm soát. Không tự tạo đánh giá hay điểm sao để lấp chỗ trống.
