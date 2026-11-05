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

## Cập nhật 05/11/2026 — GitHub Pages và bản đa ngôn ngữ

- Sửa URL tài nguyên và phạm vi Service Worker cho đường dẫn GitHub Pages của dự án; kiểm tra trực tiếp CSS, ảnh, font và JavaScript trên link công khai.
- Điều chỉnh danh sách điểm nghỉ theo yêu cầu chủ trang.
- Thêm Việt/Anh/Trung giản thể cho phần công khai, hướng dẫn, chính sách và ảnh Pass; giữ nguyên tên riêng và nội dung khách viết. Bổ sung font CJK lưu tại dự án, giấy phép và công cụ dựng lại.
- Hiệu ứng chuyển tab ngắn, mở Pass và tem nhẹ; tôn trọng giảm chuyển động. Âm thanh tùy chọn, mặc định tắt, không phát nền hoặc truy cập micro.
- Bổ sung kiểm tra ngôn ngữ, 25 hồ sơ, ảnh xuất, bảo toàn dữ liệu nhập, âm thanh, giảm chuyển động và ngoại tuyến. Không ghi dữ liệu Firebase production.

## Cập nhật Home và bản đồ — 05/11/2026

- Home thành postcard Óc Eo xanh đậm, ảnh Ba Thê thật, ba thẻ gợi mở câu chuyện và nút bốc điểm không lặp liên tiếp.
- Bản đồ ưu tiên không gian xem: tìm/lọc trên nền bản đồ, cụm số cho các pin sát nhau, thẻ điểm đến ngắn, danh sách đầy đủ thu gọn và nút xem toàn bộ pin. Giữ lựa chọn/zoom khi đổi tab.
- Tìm điểm gần là thao tác tự nguyện: GPS chỉ giữ trong bộ nhớ phiên, khoảng cách ghi rõ là đường chim bay, không phát tem. Chính sách ba ngôn ngữ đã được cập nhật tương ứng.
- Kiểm tra lại ảnh nền OSM thật và các pin Linh Sơn ở mức phóng to. Kiểm tra tự động dùng tiles/GPS giả lập tách biệt; không ghi dữ liệu Firebase production.

## Bản đồ riêng Óc Eo — 05/11/2026

- Dựng 379 đối tượng địa lý thành SVG từ dữ liệu OSM cắt trong phạm vi tham khảo Óc Eo, không tải raster tiles hay cần API bản đồ. Palette giấy/xanh/kênh, texture và hình minh hoạ núi do dự án thiết kế.
- Giữ attribution OSM gọn một góc và giấy phép ODbL trong tệp dữ liệu; nhãn Google Maps bỏ thuật ngữ Plus Code ở luồng chính, giữ provenance trong chi tiết thu gọn.
- Kiểm tra geometry nằm trong polygon, không gọi máy chủ tiles, lỗi dữ liệu/thử lại, bản đồ ngoại tuyến, giữ pin/GPS/tem, ba ngôn ngữ và đường dẫn GitHub Pages. Chính sách được cập nhật để phản ánh bản đồ lưu tại ứng dụng.

## Sửa lớp nút bản đồ và tìm kiếm — 05/11/2026

- Giới hạn stacking context của nội dung và canvas Leaflet, header có nền đặc; điều khiển bản đồ không thể vẽ đè header hoặc popup tìm kiếm khi cuộn.
- Thay ô tìm kiếm luôn nổi bằng nút “Tìm điểm” cạnh tiêu đề. Popup dùng ô nhập gạch dưới, kết quả chọn trực tiếp, xóa lọc, Escape và bấm ngoài để đóng; giữ truy vấn khi đổi tab.
- Kiểm tra hit-testing tại các nút header ở năm kích thước màn hình và bốn vị trí cuộn, bao gồm màn hình ngang thấp; kiểm tra riêng nút zoom không phủ popup tìm kiếm.

## Bổ sung hiện vật theo di tích — 05/11/2026

- Tiếp tục từ commit thiết kế của chủ dự án `6612b12` trên nhánh riêng `feat/oc-eo-artifact-trails`; không sửa `genz.css` hoặc tự merge vào main.
- Đọc lại tư liệu Ban Quản lý, bổ sung chín thẻ hiện vật/nhóm gắn tám nơi phát hiện; nguồn và giới hạn ở ARTIFACT-SOURCES.md.
- Thêm hai bối cảnh quan sát, câu hỏi phản hồi tại trình duyệt, tìm theo tên hiện vật, liên kết hồ sơ và bản đồ hiện có. Không tạo tọa độ mới, không đổi tem GPS và không ghi Firebase.
- Kiểm tra nguồn/liên kết, ngôn ngữ, điện thoại, quiz không ghi tem, offline và tiền tố GitHub Pages.

## Chồng thẻ cổ vật có quẹt — 05/11/2026

- Đổi bộ thẻ từ danh sách mặc định sang ba lớp thẻ, quẹt chuột/cảm ứng, ngẫu nhiên, xáo lại, xem thẻ trước và danh sách thay thế. Giữ bộ lọc/thứ tự/vị trí khi quay về từ chi tiết.
- Một lượt đi hết bộ không lặp và có điểm kết thúc; không thêm tem, điểm thưởng hoặc ghi hồ sơ. Tôn trọng giảm chuyển động và âm thanh tự bật/tắt đã có.
- Kiểm tra chuột và sự kiện cảm ứng trong Chromium, cuộn dọc/kéo ngắn/hủy, phím điều hướng, thẻ đơn, hết bộ, ba ngôn ngữ, nội dung không tràn ở màn hình nhỏ và đọc ngoại tuyến.
