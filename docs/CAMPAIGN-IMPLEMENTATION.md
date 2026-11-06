# Óc Eo, có dấu tôi — bản triển khai đầu

Cập nhật 06/11/2026. Triển khai phần sản phẩm P0 trong [kế hoạch agency](AGENCY-CAMPAIGN-PLAN.md); đây chưa phải kết quả đi thử với khách hoặc xác nhận tuyến thực địa.

## Đã có trong web

- Home mới: nhẫn Nandin Giồng Cát, lời mời chọn chuyến ba điểm, tiếp tục chuyến đã lưu, tạo story hoặc xem mẫu khi chưa có tem. Giữ danh mục, tư liệu và ảnh Ba Thê trong mục mở thêm.
- Tab **Chuyến đi**: Nhà trưng bày Văn hóa Óc Eo, Linh Sơn Bắc, Gò Giồng Cát; nguồn và gợi ý quan sát, trạng thái tiếp cận, hai lựa chọn nghỉ, liên kết đặt trước The cafe 33, chuẩn bị tư liệu ngoại tuyến. Thứ tự kể chuyện chưa được quảng bá là tuyến đi bộ hoặc đường tối ưu đã kiểm chứng.
- Hai tiến độ riêng: các điểm của chuyến đã có tem /3 và bộ sưu tập Óc Eo Pass /15. Tem lịch sử vẫn được tính; không suy ra đã đi cùng ngày. Cafe và hidden gem không thành điều kiện hoàn thành.
- Bản đồ lọc riêng ba chặng hoặc trở lại toàn bộ địa điểm. Không tạo đường dẫn giả nối pin; nguồn OSM và tọa độ vẫn giữ.
- Tạo story từ một tem hợp lệ: ảnh tự chọn hoặc bố cục chữ/tem, chọn điểm nổi bật, tối đa ba tem đã nhận, tên, câu riêng và chi tiết có nguồn. Có chỉnh phủ khung/giữ trọn ảnh và tâm cắt. Preview và PNG dùng cùng renderer 1080×1920.
- Ảnh cá nhân chỉ xử lý trong phiên trên thiết bị, giới hạn 20 MB và khả năng giải mã của trình duyệt; re-encode canvas trước khi xuất, không tự tải lên Firebase hay đăng vào Góc kể. Đóng editor hủy ảnh nháp và object URLs. HEIC cần trình duyệt hỗ trợ; có hướng dẫn đổi JPEG/PNG khi không đọc được.
- Lưu PNG, mở chức năng chia sẻ khi thiết bị hỗ trợ, sao chép đường dẫn hành trình. Thông báo phân biệt mở bảng chia sẻ với đã đăng bài. URL chỉ chứa mã chuyến công khai, không chứa UID/tên/ảnh/câu/GPS.
- Mẫu story VI/EN/ZH ghi rõ **ẢNH MẪU**, dùng ảnh Ba Thê có ghi tác giả/CC BY-SA 3.0; không thay hồ sơ hay cấp tem. Mẫu WebP khoảng 230 KB/ảnh; story thực tế xuất PNG.
- Chuyến đang chọn lưu riêng theo UID hoặc guest trên máy; không tự chuyển lựa chọn giữa tài khoản. Xóa tài khoản dọn cả khóa lựa chọn chuyến tương ứng. Không thêm analytics/tracking mới.
- Bộ nạp chờ worker cũ hoàn tất cập nhật trước khi import các module mới, giảm lỗi trộn cache hai phiên bản. Có trạng thái tải/thử lại. Không xóa dữ liệu cá nhân để cập nhật giao diện.

## Kiểm tra kỹ thuật

Kiểm tra bằng Chromium, viewport điện thoại và các transport giả lập không ghi Firebase production: luồng khách → chọn chuyến → bản đồ → tạo ảnh/link; tiến độ 3/3 tách 4/15; ảnh cá nhân PNG; giữ nguyên tên/câu qua ngôn ngữ; chỉ dùng tem hợp lệ; giới hạn/giải mã file; hủy giữa decode; native share giữ user activation; không lưu ảnh/nội dung cá nhân ngoài phiên.

Kiểm tra cả GPS sai/xa, đổi tài khoản khi chờ GPS, điểm đóng/bán kính thay đổi trong lúc định vị, xuất Pass cũ hoàn tất chậm không mở đè editor mới. Bổ sung revalidation điểm hiện hành và guard chủ tài khoản. Các tem hợp lệ đã có không bị xóa vì điểm tạm đóng.

Kiểm tra Service Worker thật: bản cũ cache module không tương thích nâng lên bản mới trước khi mở app; reload ngoại tuyến; story cá nhân xuất ngoại tuyến sau khi tải tài nguyên; đường dẫn project GitHub Pages, font, ảnh, admin/privacy; ba ngôn ngữ và các tính năng cũ liên quan.

Các lệnh chuyên biệt (mở `python3 tools/dev_server.py --port 8000` trước):

```sh
node --test tests/model.test.mjs tests/journey.test.mjs tests/heritage_symbols.test.mjs
python3 tests/campaign_journey.py
python3 tests/campaign_async.py
python3 tests/campaign_upgrade.py
python3 tests/story_creator.py
python3 tests/story_text_and_races.py
python3 tests/subdirectory_preview.py
```

`tools/export_story_samples.py` dựng lại ba mẫu bằng renderer của ứng dụng; tên Elio/tem trong mẫu chỉ là dữ liệu minh hoạ. Mã consent của backend hiện hữu được giữ; phần hướng dẫn xử lý story trên thiết bị được bổ sung trong chính sách.

## Bước vận hành còn cần thực hiện

1. Dùng [phiếu xác minh](PILOT-FIELD-CHECK.md) kiểm tra giờ đón khách, quyền tiếp cận, lối vào, GPS và thời gian đi của ba ứng viên, rồi chốt tuyến/phương án thay thế.
2. Thử trên Safari/iPhone và Android thật; kiểm tra album ảnh, chia sẻ và cách nền tảng nén ảnh. Chưa có kiểm chứng trên điện thoại vật lý trong lượt triển khai này.
3. Thử với người dùng thật theo [kịch bản pilot](PILOT-TEST-SCRIPT.md). Chưa tuyển khách hoặc ghi nhận số liệu về đăng bài/lan truyền; không lấy bài test trình duyệt làm nghiên cứu Gen Z.
4. Xác nhận thông tin đơn vị vận hành, liên hệ, cấu hình Firebase production và dịch vụ thực tế trước khi mở đầy đủ tài khoản/đánh giá hay quảng bá có trả phí. Không triển khai rules/functions hoặc ghi dữ liệu Firebase production trong thay đổi này.

Chưa bổ sung AR/3D, chat, bảng xếp hạng, quà ngẫu nhiên, tự đăng lên mạng xã hội hoặc thưởng giới thiệu bằng tem GPS. QR riêng cho poster là tùy chọn vòng sau; MVP ưu tiên link hành trình.
