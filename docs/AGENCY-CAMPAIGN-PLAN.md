# Óc Eo Townwalk — kế hoạch sản phẩm và chiến dịch

Ngày lập: 06/11/2026, giờ Việt Nam. Bản đề xuất từ vòng phản biện của năm vai trò agency mô phỏng bằng AI; không phải cuộc họp với nhân sự bên ngoài hay kết quả nghiên cứu khách thật. Nền mã lúc lập kế hoạch được đối chiếu tại commit `19374e0`. Tình trạng triển khai và phần còn cần kiểm chứng được cập nhật riêng tại [CAMPAIGN-IMPLEMENTATION.md](CAMPAIGN-IMPLEMENTATION.md).

**Quyết định điều hành.** Tập trung tạo một chuyến đi khả thi, một phát hiện văn hoá có thật và một sản phẩm chia sẻ có dấu ấn cá nhân. Tên sản phẩm giữ **Óc Eo Townwalk**; hướng chiến dịch đề xuất là **“Óc Eo, có dấu tôi.”** Việc một người tự muốn kể lại điều họ vừa hiểu sẽ là giả thuyết trung tâm cần kiểm chứng.

## 1. Năm vai trò và kết luận phản biện

| Vai trò | Nhận định chính | Quyết định đưa vào kế hoạch |
| --- | --- | --- |
| Strategy Director | Danh sách tính năng chưa trả lời đủ vì sao nên đi và điều gì đáng kể lại | Một hành trình ngắn có câu chuyện riêng về Óc Eo; ưu tiên nhóm 18–26 tuổi cho pilot |
| Creative Director | Poster đang thể hiện bộ sưu tập của ứng dụng nhiều hơn con người sở hữu chuyến đi | Ảnh cá nhân làm trung tâm cảm xúc; tên Óc Eo và hình tượng hiện vật giữ vị trí nhận diện cố định |
| Product/UX Lead | Có bản đồ, tem, thẻ nhưng còn thiếu một vòng trải nghiệm liền mạch | Hoàn thiện đường đi từ story đến hành trình, check-in, tạo ảnh và rủ bạn trên web hiện có |
| Heritage/Local Experience Lead | Cần giúp khách nhận ra một chi tiết ngoài đời và phân biệt nơi tìm thấy với nơi trưng bày | Chuẩn nội dung cho ba điểm pilot, nhiệm vụ quan sát có nguồn và xác minh tuyến thực tế |
| Growth & Measurement Lead | Tải ảnh và mở bảng chia sẻ chưa chứng minh người dùng đã đăng hoặc có người mới đi | Pilot quan sát tự nguyện trước; chưa cài tracking mới; tách rõ từng loại tín hiệu |

Các bất đồng đã xử lý: story cá nhân và poster đủ bộ là hai đầu ra riêng; tuyến ba điểm có tiến độ riêng với bộ tem 15 điểm; MVP cần hoàn thiện ba hồ sơ thuộc tuyến thử trước, đồng thời giữ đúng mức độ xác minh của toàn danh mục; kiểm chứng ngoài thực địa đi trước lời hứa về thời lượng.

## 2. Mục tiêu, đối tượng và điểm khác biệt

**Mục tiêu sản phẩm:** người lần đầu biết Óc Eo có thể tự chọn chuyến, tìm đúng điểm, hiểu và kể lại đúng ít nhất một chi tiết văn hoá. **Mục tiêu chiến dịch:** những chia sẻ tự nguyện khiến người xem muốn tìm hiểu và bắt đầu một chuyến đi thực tế. Chưa đặt doanh số hoặc số lượt tiếp cận vì chưa có dữ liệu nền, ngân sách và cơ chế quy đổi đáng tin cậy.

Đối tượng pilot đề xuất: người 18–26 tuổi tại An Giang và khu vực lân cận, đi cùng 1–3 người bạn, có thể dành thời gian cho chuyến đi ngắn. Tuyển cả người chưa quan tâm khảo cổ và người đã tò mò về di sản. Đây là tiêu chí tuyển thử, chưa phải chân dung đã được nghiên cứu. Gen Alpha và nhóm nhỏ tuổi hơn phát triển ở vòng sau theo bối cảnh gia đình/trường học, không dùng chung toàn bộ thông điệp và luồng công khai ảnh với pilot.

**Điểm khác biệt cụ thể: nối hiện vật với nơi tìm thấy.** Khách có thể xem ảnh nguồn của phù điêu Phật Linh Sơn Bắc, nhận ra một chi tiết, đối chiếu nơi phát hiện với hồ sơ nhà trưng bày, rồi mang về một câu chuyện do chính mình chọn kể. Với nhẫn Nandin, khách tìm hiểu mối liên hệ với Giồng Cát mà không được hứa sẽ thấy bản gốc tại gò. Các mối nối này phụ thuộc vào tư liệu Óc Eo, không thể chỉ thay tên địa danh để dùng cho mọi điểm du lịch.

Hướng sáng tạo: **“Óc Eo, có dấu tôi.”** Lời hứa: *mang về một phát hiện, một khoảnh khắc và những dấu đã thực sự nhận được.* Thử khả năng nhớ tên và phản ứng với thông điệp trước khi xem đây là khẩu hiệu chiến dịch chính thức. Bỏ yêu cầu gom đủ 15 tem khỏi lời mời đầu tiên; vẫn giữ bộ sưu tập dài hạn.

## 3. Hiện trạng và phạm vi giữ lại

Đối chiếu mã nguồn hiện tại:

- 16 hồ sơ di sản gồm 15 điểm trong bộ sưu tập và một hidden gem tự chọn; 7 điểm trong bộ sưu tập có vị trí đủ nguồn để mở check-in.
- Tem chỉ xuất hiện sau thao tác check-in thành công theo cơ chế hiện tại. GPS phía trình duyệt không phải bằng chứng chống giả mạo; các nhiệm vụ đọc ảnh không cấp tem có mặt.
- Năm tab, bản đồ vector riêng có nguồn OSM, chế độ khách, nội dung ba ngôn ngữ và xuất PNG hiện có được kế thừa.
- Mẫu Elio 10/15 là dữ liệu minh hoạ riêng. Tem hidden gem trong mẫu không thay đổi điều kiện nhận tem của sản phẩm.
- Cấu hình mặc định trong repo chưa có đơn vị vận hành/email liên hệ. Trạng thái cấu hình Firebase production cần được xác nhận riêng. Các luồng đăng nhập/đăng bài đang có điều kiện kiểm tra thông tin này.
- Chính sách hiện hành ghi không có analytics hoặc trình theo dõi tiếp thị. Mọi đề xuất đo tự động sau này cần cập nhật chính sách và thiết kế lựa chọn riêng tư tương ứng.

Không làm lại toàn bộ nền mã. Ưu tiên hoàn thiện các luồng còn thiếu và giữ các sửa lỗi giao diện, nguồn dữ liệu, kiểm tra GPS, quyền truy cập đã có.

## 4. Hành trình sản phẩm mục tiêu

| Chặng | Điều người dùng cần | Thay đổi đề xuất |
| --- | --- | --- |
| Thấy story | Biết đây là Óc Eo và có điều gì thú vị | Story có ảnh chủ nhân, tên Óc Eo, một tem nổi bật và một phát hiện ngắn |
| Mở liên kết | Hiểu mình đang xem chuyến nào | Trang đích mở đúng hành trình; không ép đăng nhập; cho xem điều kiện tiếp cận và thời lượng khi đã xác minh |
| Chọn chuyến | Biết có thể đi được không | Một tuyến pilot ba điểm di sản và một lựa chọn nghỉ; có phương án thay thế |
| Đến điểm | Tìm đúng lối và biết nên quan sát gì | Bản đồ, thẻ tiếp cận, ảnh thực địa và một gợi ý quan sát trong cùng ngữ cảnh |
| Nhận tem | Hiểu mình vừa nhận gì và tiếp theo làm gì | Xin GPS khi chủ động check-in; xác nhận tem rõ ràng; gợi ý chặng tiếp hoặc tạo story ngay |
| Tạo ảnh | Có một ảnh mình thực sự muốn đăng | Chọn ảnh cá nhân, tên, một câu và tem đã nhận; xem trước đúng bản tải về |
| Chia sẻ | Có thể rủ bạn theo cách quen thuộc | Web Share khi hỗ trợ, tải PNG, sao chép link; người dùng tự đặt link sticker nếu nền tảng hỗ trợ |
| Bạn bè mở | Tìm được chuyến tương ứng | Trang hành trình công khai không lộ tên, ảnh, UID hoặc vị trí trực tiếp của người gửi |

Ảnh cá nhân được xử lý trên thiết bị theo mặc định; việc tạo poster không tự đăng lên Góc kể. Nếu muốn đăng đánh giá, người dùng đi qua luồng công khai riêng, đăng nhập và đồng ý phù hợp với chính sách hiện có.

**Hai bộ đếm phải tách biệt:** “Chuyến này: 1/3 điểm” và “Óc Eo Pass: 1/15 tem”. Hoàn thành chuyến 3/3 mở bố cục tổng kết chuyến; không phát thêm tem hoặc biến thành đã hoàn thành 15/15. Tiến độ chuyến dựa trên những điểm thuộc phiên bản hành trình đó đã nhận tem; thay tuyến đang đi không âm thầm đổi tiêu chí. Tem đã có trước vẫn có thể được dùng trong ảnh bộ sưu tập, nhưng ảnh không tự khẳng định tất cả điểm được đi trong cùng ngày.

## 5. Cấu trúc web và màn hình ưu tiên

Giữ năm tab: **Khám phá — Bản đồ — Chuyến đi — Óc Eo Pass — Góc kể**. “Chuyến đi” là tên đề xuất cho tab lịch trình; kiểm tra khả năng đọc trên thanh pill nhỏ trước khi đổi nhãn.

**Khám phá:** một hình/câu chuyện chính, một CTA vào tuyến pilot, một CTA xem mẫu ảnh chia sẻ. Gợi ý hook để thử: “Chiếc nhẫn nhỏ này được tìm thấy ở Giồng Cát.” Đi kèm một chi tiết có nguồn, không tự thêm địa vị của người từng đeo nhẫn. Khi khách đang đi, ưu tiên chuyến đang lưu và điểm tiếp theo.

**Bản đồ:** phục vụ hành động tại chỗ: xem điểm theo tuyến, lối tiếp cận đã xác minh, thẻ nhanh, khoảng cách và mở chỉ đường khi đủ căn cứ. Giữ trích dẫn dữ liệu mở gọn, dễ tìm. Không gọi khoảng cách đường chim bay là quãng đường đi bộ; không tự dựng đường kết nối các pin thành tuyến dẫn đường chính xác.

**Chuyến đi:** bản tóm tắt các chặng, cách di chuyển, thời lượng sau khảo sát, điểm nghỉ, điều kiện tiếp cận và lựa chọn bỏ/đổi điểm. Có bước tải tư liệu công khai trước khi đi. Thời lượng do khách lựa chọn phải phù hợp tuyến; không hứa cả danh mục có thể đi bộ trong một ngày.

**Óc Eo Pass:** tem thực đã nhận, tiến độ bộ sưu tập và nút tạo story nổi bật. Giữ poster đầy đủ làm lựa chọn thứ hai. Thể hiện rõ điểm chờ vị trí; không bày tem chưa nhận như thành tích của khách.

**Góc kể:** bài thật có ảnh, thông tin địa điểm liên quan, công khai rồi xử lý báo cáo như yêu cầu đã có. Không tạo bài/đánh giá giả để lấp chỗ trống. Không để đăng đánh giá trở thành điều kiện được xuất ảnh cá nhân.

Các màn thử đầu tiên: trang vào từ story → chi tiết chuyến → thẻ tại điểm → nhận tem → chọn ảnh/câu → xem trước story. Nút trở về giữ ngữ cảnh, vùng chạm tối thiểu 44 px, tránh che nội dung bởi thanh cố định, thử màn 320–430 px và Safari/iPhone thật.

## 6. Hệ chia sẻ và art direction

| Đầu ra | Nội dung | Vai trò |
| --- | --- | --- |
| Story một dấu | Một ảnh cá nhân, một tem, tên Óc Eo, tên khách và một câu ngắn | Cho chia sẻ từ lần check-in đầu tiên |
| Story chuyến ba điểm | Một ảnh, tối đa ba tem, phát hiện yêu thích, tiến độ chuyến | Kết quả đủ rõ sau hành trình pilot |
| Poster bộ sưu tập | Tem đã nhận, tổng tiến độ, tên; QR nhỏ có thể bật | Tiếp tục dùng mẫu tổng kết dài hạn, kể cả 10/15 |

Ảnh cá nhân dự kiến chiếm khoảng 55–60% diện tích story, cần thử bằng ảnh ngang/dọc/chân dung/cảnh vật thực. Cho chọn cách đặt ảnh hoặc chỉnh vùng cắt để không mất mặt. Người không muốn dùng chân dung có thể dùng ảnh cảnh mình chụp hoặc chọn mẫu tập trung vào tem. Tên Óc Eo, vị trí nhận diện và vùng chữ đọc rõ là thành phần cố định. Không bắt khuôn mẫu chỉ phù hợp ảnh selfie.

Giữ viền tem khuyết bán nguyệt, hình hiện vật có nguồn, chất giấy/mực và bảng màu đã phát triển. Ảnh tư liệu thật, hình diễn giải và minh hoạ AI phải có nhãn và nguồn thích hợp. Mọi hình tôn giáo cần thể hiện trang trọng. Dấu chữ ở điểm thiếu hiện vật riêng không được gọi là con dấu khảo cổ.

Story không chứa cả QR, 15 tem, lịch trình và nhiều CTA. Link chia sẻ là đường chính; QR là lựa chọn cho poster/ấn phẩm có thể quét bằng thiết bị khác. Một ảnh PNG xuất ra không tự có liên kết bấm được. Không hứa tự thêm link sticker hoặc tự đăng story khi nền tảng không cung cấp khả năng đó. QR nếu dùng phải được thử sau khi ảnh bị nền tảng nén.

Animation tập trung vào nhận tem, chuyển thẻ và lộ ảnh đã tạo; chuyển động ngắn, tôn trọng giảm chuyển động. Âm thanh ngắn, mặc định tắt. Không thêm hiệu ứng vào mọi widget để tạo cảm giác “Gen Z”.

Nghiệm thu sáng tạo: ở thumbnail, người xem nhận ra Óc Eo; trên điện thoại, thấy được người/chuyến đi và một chi tiết hiện vật; chữ không chạm vùng giao diện story thường che phủ; ảnh tải về khớp preview. Che tên tài khoản người đăng khi thử nhận diện để tránh người xem đoán dựa trên tài khoản.

## 7. Nội dung pilot và kiểm chứng thực địa

Tuyến ứng viên: **Nhà trưng bày Văn hoá Óc Eo → Linh Sơn Bắc → Gò Giồng Cát**, có lựa chọn nghỉ phù hợp đường đi. Đây là danh sách ứng viên, chưa xác nhận thứ tự, thời lượng hoặc lối tiếp cận. Nếu một điểm không phù hợp, chọn điểm thay thế từ nhóm GPS đủ nguồn sau khi khảo sát; không cố giữ tuyến vì đã thiết kế xong ảnh.

Ba hồ sơ thuộc tuyến pilot phải có: ảnh đúng điểm, nguồn hiện vật, nơi phát hiện/nơi trưng bày tách rõ, lối vào, quyền tiếp cận, giờ hoạt động, thời gian di chuyển thực tế, ngày kiểm tra và phương án thay thế. Mười hai điểm còn lại giữ chuẩn tên/phạm vi/nguồn và ghi rõ thông tin chưa xác nhận; không cần viết thêm câu chuyện dài cho đủ trước pilot. Hidden gem là hồ sơ thứ 16, nằm ngoài bộ 15 tem.

Nội dung đầu mỗi điểm đọc trong khoảng 20–30 giây: một câu tò mò, một việc nên nhìn, một thông tin nên nhớ. Tư liệu chi tiết, nguồn và giới hạn mở thêm bên dưới. Tại gò, hướng dẫn quan sát dấu tích/bối cảnh; dùng ảnh nguồn để nhận diện cổ vật nếu bản gốc không ở đó. Tại nhà trưng bày, xác nhận hiện vật đang giới thiệu trong ngày, không coi bài nguồn cũ là cam kết trưng bày hôm nay.

Ba nhiệm vụ mẫu để biên tập:

1. Nhẫn Nandin: nhận ra bò nằm xếp chân và bướu vai qua ảnh nguồn; nguồn xác định phát hiện tại Giồng Cát. Không suy ra danh tính người đeo.
2. Phù điêu Linh Sơn Bắc: nhận diện tư thế ngồi hoặc ba ký tự bên dưới qua ảnh nguồn; không tự dịch ký tự. Đối chiếu hồ sơ nơi phát hiện và nhà trưng bày.
3. Hai mộ vò: nhận biết khác biệt giữa nắp riêng Gò Cây Trâm và bát bồng bỏ chân ở Linh Sơn Nam. Chọn bối cảnh ảnh tư liệu khi không có hiện vật tương ứng tại điểm đang đứng.

Trả lời nhiệm vụ mở một nội dung khám phá, chẳng hạn “Mình vừa nhận ra bò thần Nandin”; người dùng chọn có đưa dòng đó vào story hay không. Nhiệm vụ và GPS là hai cơ chế riêng. Nội dung này không thể hiện người dùng đã đến nếu chỉ đọc ảnh từ xa.

The cafe 33: đặt Cafe in bed qua `https://the-cafe-33.web.app`, nêu điều kiện đặt trước và khả năng phát sinh phí khi chưa đặt như thông tin đã có; cần xác nhận lại khi đưa vào tuyến. XOFA: Sữa Gạo Phù Nam là gợi ý trải nghiệm, giá từ 25K là tham khảo cần cập nhật. Không coi hai cơ sở là đối tác đã ký hoặc đã đồng ý đặt QR. Chỗ nghỉ/đồ ăn khác tiếp tục có trong bản đồ/danh mục.

Nhà trưng bày cũ trên Ba Thê không thuộc điều kiện hoàn thành pilot. Giữ lưu ý đường khó, tránh ngày mưa, cân nhắc xe ôm địa phương, đội mũ và chỉ quan sát nơi được phép; không biến công trình bỏ hoang thành điểm thử thách bắt buộc.

Admin cần đề xuất bổ sung người phụ trách, ngày kiểm tra, trạng thái tiếp cận và tình trạng quyền ảnh cho từng điểm/tuyến. Phân biệt nguồn lịch sử, nguồn tọa độ và ghi nhận thực địa. Khi điểm đóng, quản trị viên có thể tạm rút khỏi tuyến hiện hành mà vẫn giữ hồ sơ và tem lịch sử của khách.

## 8. MVP, ưu tiên và việc để sau

| Mức | Đầu ra | Người chịu trách nhiệm chuyên môn | Điều kiện hoàn thành |
| --- | --- | --- | --- |
| P0 | Bản đồ hành trình người dùng và prototype sáu màn chính | Product + Strategy | Khách mới hiểu mình đi đâu, nhận gì và chia sẻ thế nào |
| P0 | Hai story template và poster bộ sưu tập kế thừa | Creative + Product | Preview/tải khớp, ảnh người dùng không bị tải công khai ngoài ý muốn |
| P0 | Tuyến ba điểm, hồ sơ và nhiệm vụ pilot | Heritage + Product | Có khảo sát tiếp cận/GPS, nội dung đúng nguồn, tuyến thay thế |
| P0 | Link mở đúng chuyến và hướng dẫn chia sẻ | Product + Growth | Mở được bằng khách trên thiết bị khác, URL không chứa hồ sơ riêng |
| P0 | Pilot quan sát và biên bản quyết định | Strategy + Growth + Heritage | Có dữ liệu tổng hợp về khả năng dùng, hiểu văn hoá và lựa chọn chia sẻ |
| P1 | Cải thiện admin nội dung, bản dịch mới, trạng thái tuyến/điểm | Heritage + Product | Nội dung mới được kiểm tra ở ba ngôn ngữ; vận hành có thể cập nhật |
| P1 | Góc kể production, nếu thông tin vận hành và backend sẵn sàng | Product + Growth | Có kiểm tra luồng đăng/ảnh/báo cáo/xóa trên cấu hình thật |
| P1 | QR tại các điểm nghỉ, nếu đơn vị đồng ý | Growth + Heritage | Có vị trí/ấn phẩm thử, liên kết đúng, nội dung giới thiệu minh bạch |
| P2 | Mở rộng tuyến, nhóm nhỏ tuổi theo bối cảnh, đo tự động và quảng bá có trả phí | Cả năm vai trò | Chỉ sau các điều kiện thử nghiệm và vận hành bên dưới |

Chưa làm cho MVP: AR/3D, chat, nhóm bạn đồng bộ thời gian thực, bảng xếp hạng, quà ngẫu nhiên, chuỗi ngày liên tiếp, đăng bài tự động, ép mời bạn để nhận tem, đổi toàn bộ framework hay viết lại bản đồ. Cơ chế sưu tập còn mở rộng được mà không thêm các hạng mục này.

## 9. Kế hoạch thử và tiêu chí ra quyết định

**Vòng A — thử trên điện thoại:** đề xuất 5–6 người thuộc nhóm mục tiêu. Giao một nhiệm vụ cụ thể, không giải thích trước cách bấm. Kiểm tra họ có hiểu lời mời, tìm được chuyến, hiểu 3/3 và 3/15, chọn ảnh và tìm đường dẫn để chia sẻ. Nếu một lỗi cản luồng hoặc hiểu nhầm lặp lại ở hai người, sửa trước khi mở vòng tiếp. Mẫu nhỏ chỉ dùng phát hiện lỗi, không suy rộng tỷ lệ cho toàn bộ Gen Z.

**Vòng B — đi thử:** đề xuất khoảng 20 người tự nguyện, chia thành các nhóm nhỏ. Xác nhận điều kiện tiếp cận tuyến trước buổi thử. Không yêu cầu hoặc thưởng cho việc đăng bài. Quan sát thời gian/lỗi GPS/tìm lối; hỏi cuối chuyến họ nhớ điều gì, có phân biệt được nơi phát hiện với nơi trưng bày, tự chọn giữ hay chia sẻ ảnh nào. Chỉ ghi “đã đăng” khi người tham gia tự nguyện cho xem; không thu bản sao tài khoản/bài đăng làm điều kiện tham gia.

Mốc thảo luận ban đầu: 10/20 người tự tạo được ảnh và 5/20 tự nguyện đăng là tín hiệu để xem xét vòng tiếp, **không phải benchmark ngành hoặc cam kết viral**. Bắt buộc ghi cả lý do không muốn đăng. Một lý do lặp lại có thể đáng xử lý hơn việc đạt đủ số.

**Vòng C — người đến từ chia sẻ:** quan sát một nhóm độc lập biết đến qua chia sẻ tự nguyện, ưu tiên họ tự tìm/chọn chuyến. Có thể hỏi nguồn biết đến theo lựa chọn của họ. Không ép nhóm đầu đi tuyển đủ người hay hứa phần thưởng theo lượt mời.

| Tín hiệu | Đo vòng đầu | Cách diễn giải |
| --- | --- | --- |
| Tìm/chọn chuyến không cần hướng dẫn | Quan sát và ghi tổng hợp | Mức độ rõ của sản phẩm |
| Hoàn thành tuyến thử | Quan sát tự nguyện, đối chiếu thao tác ứng dụng | Tính khả thi ngoài thực địa; không tuyên bố GPS chống gian lận |
| Kể đúng một phát hiện | Hỏi mở, chấm theo thông tin nguồn đã chọn | Giá trị văn hoá thực sự |
| Tạo/tải ảnh | Quan sát thao tác | Khả năng dùng công cụ, chưa phải lượt đăng |
| Mở bảng chia sẻ | Quan sát thao tác | Ý định/thao tác chia sẻ, chưa phải đăng thành công |
| Đăng bài tự nguyện | Tự khai hoặc tự nguyện cho xem | Tín hiệu giới hạn theo mẫu thử, không coi là thống kê toàn bộ |
| Biết đến từ bài chia sẻ và chọn chuyến | Hỏi tự nguyện, quan sát nhóm mới | Tín hiệu giới thiệu; chưa suy ra hệ số viral |

Không cài tracking mới trong vòng đầu. Sau này nếu cần đo tự động, các sự kiện đề xuất gồm mở hành trình, bắt đầu chuyến, check-in được ứng dụng chấp nhận, tạo/tải ảnh, bắt đầu chia sẻ và phiên vào từ link. Trước khi triển khai cần chọn mục đích/dữ liệu/thời gian lưu, cập nhật thông báo và quyền lựa chọn. Không lưu GPS thô, fingerprinting hoặc ảnh cá nhân để cố xác minh lượt giới thiệu. Một phiên từ link không chứng minh là một người bạn khác; không dùng nó để công bố “người dùng mới được xác thực”.

**Điều kiện mở rộng:** tuyến tiếp cận được; không có hiểu nhầm văn hoá nghiêm trọng lặp lại chưa sửa; luồng chính chạy được trên iPhone và Android thật; ảnh tạo ra có người tự muốn đăng; nhóm mới có thể tự vào và chọn chuyến. Chưa đạt thì sửa đúng bước đang yếu, không thêm hiệu ứng hoặc mua traffic để che vấn đề.

Ads nhỏ chỉ là bước thử sau hai vòng độc lập có tín hiệu tích cực, tuyến đã xác minh và thông tin vận hành/quyền riêng tư phù hợp với phần thực sự mở cho khách. Không đưa tính năng đăng nhập/đăng bài hoặc tracking chưa sẵn sàng thành lời hứa quảng cáo.

## 10. Lộ trình đề xuất và nguồn lực

Khung **2–3 tuần làm việc** dưới đây là ước lượng lập kế hoạch, không phải lịch tự động hay cam kết giao việc của một đội người thật. Thời gian khảo sát, cấp ảnh, xác nhận điểm và tuyển khách thử có thể làm thay đổi lịch. Có thể prototype trước trong khi chờ thực địa, nhưng không công bố giờ đi/khả năng tiếp cận chưa kiểm tra.

| Giai đoạn | Đầu ra chính | Điều kiện chuyển tiếp |
| --- | --- | --- |
| Ngày làm việc 1–2 | Brief chốt phạm vi, bản đồ nội dung, kịch bản khảo sát, phác sáu màn và story | Có một tuyến ứng viên, một lời mời chính, tiêu chí thử rõ |
| Ngày 3–5 | Prototype mobile, hệ story, nội dung ba điểm; thử vòng A | Khách hiểu và đi qua luồng; xử lý lỗi cản trở |
| Ngày 6–9 | Triển khai phần P0 trên nền mã hiện có, ảnh xử lý trên máy, link chuyến, trạng thái lỗi | Preview/tải đúng, không mất tiến độ, kiểm tra ba ngôn ngữ và ngoại tuyến |
| Ngày 10–12 | Khảo sát/đi thử vòng B theo lịch thực địa, chỉnh tuyến và nội dung | Có bằng chứng tuyến khả thi, khách hiểu được phát hiện và lựa chọn chia sẻ |
| Ngày 13–15 | Sửa điểm yếu, thử nhóm độc lập vòng C, tổng kết mở rộng hay thu hẹp | Quyết định dựa trên kết quả quan sát; danh sách P1 được sắp lại |

Năm vai trò là đầu mối chuyên môn, không đồng nghĩa năm người đã được thuê. Cần bố trí năng lực phát triển frontend/Firebase và QA thực tế cho phần triển khai. Các nguồn lực chưa chốt: đầu mối thực địa, quyền sử dụng ảnh, người thử, thiết bị iPhone/Android, người duyệt nội dung ba ngôn ngữ, công sức phát triển và ngân sách vận hành. Không đặt ngân sách agency/ads giả khi chưa có báo giá; ưu tiên chi cho khảo sát, tư liệu và thử trải nghiệm trước.

## 11. Gói bàn giao và thứ tự bắt đầu

Gói kế hoạch gồm: brief chiến dịch; sitemap và hành trình; prototype sáu màn; hai story template và poster tổng kết; ma trận hiện vật–địa điểm; ba hồ sơ/nhiệm vụ pilot; tuyến đã xác minh cùng phương án thay thế; tiêu chí QA; kịch bản thử, bảng kết quả và quyết định vòng sau.

**Bắt đầu bằng ba đầu ra có thể làm ngay:** (1) màn Khám phá dẫn vào một chuyến cụ thể, (2) màn Chuyến đi phân biệt 3/3 với 3/15, (3) màn tạo story từ ảnh khách. Song song lập phiếu xác minh tuyến, không đoán giờ mở cửa hay lối vào để hoàn thành thiết kế.

Các điểm cần chốt trong quá trình thực hiện, không chặn việc lập prototype: ba điểm nào thực tế mở/tiếp cận được; ai xác nhận nội dung địa phương; có ảnh thật nào được dùng; thời điểm/nguồn lực đi thử; thông tin vận hành production; chi phí và người phụ trách từng gói. Các sự kiện, phần thưởng, tài trợ và hợp tác với cơ sở địa phương chỉ bổ sung khi có xác nhận cụ thể.
