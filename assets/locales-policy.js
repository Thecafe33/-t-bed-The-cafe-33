export const POLICY_MESSAGES = [
  [
    "Phiên bản 2026-11-04 · Áp dụng cho Óc Eo townwalk. Bạn có thể khám phá mà không đăng nhập.",
    "Version 2026-11-04 · Applies to Óc Eo Townwalk. You can explore without signing in.",
    "版本2026-11-04 · 适用于Óc Eo Townwalk。你可以不登录直接浏览。"
  ],
  [
    "Chưa cấu hình đơn vị vận hành. · Chưa có địa chỉ liên hệ về dữ liệu cá nhân.",
    "Operator not configured. · No personal-data contact has been provided yet.",
    "尚未设置运营方。 · 尚未提供个人数据联系地址。"
  ],
  [
    "Không đăng nhập: xem địa điểm, bản đồ và lịch trình. Khi mở Óc Eo Pass, tên tự chọn, danh sách điểm muốn ghé và tem được lưu trên trình duyệt của thiết bị này; bạn có thể xóa bất cứ lúc nào. Chế độ khách không đăng đánh giá và không đồng bộ qua thiết bị. Trình duyệt có thể lưu bản ứng dụng và tư liệu công khai để xem khi mất mạng; không lưu phản hồi API tài khoản hoặc bản đồ nền vào bộ nhớ đệm này.",
    "Without an account, you can browse destinations, maps and the day plan. Your chosen Pass name, saved stops and stamps stay in this device’s browser and can be cleared at any time. Guest mode cannot publish reviews or sync across devices. The browser may cache public app files and stories for offline reading; account API responses and basemap tiles are not included in that cache.",
    "无需账户即可浏览地点、地图与行程。自选Pass名字、收藏地点及印章保存在本机浏览器，可随时清除。访客模式不能发评论或跨设备同步。浏览器可缓存公开应用文件与资料供离线阅读，但不缓存账户API响应或地图底图瓦片。"
  ],
  [
    "Đăng nhập Google: Firebase Authentication xử lý việc xác thực. Ứng dụng nhận mã tài khoản, tên hiển thị, email và ảnh đại diện do Google cung cấp. Không nhận mật khẩu Google. Email dùng để kiểm tra quyền quản trị, không hiển thị trong đánh giá công khai.",
    "Google sign-in is handled by Firebase Authentication. The app receives the account ID, display name, email and profile picture Google provides, never your Google password. Email is used for admin checks and is not shown in public reviews.",
    "Google登录由Firebase Authentication处理。应用接收Google提供的账户标识、显示名称、邮箱与头像，不会接收Google密码。邮箱用于检查管理权限，不在公开评论中显示。"
  ],
  [
    "Ngôn ngữ và lựa chọn âm thanh được lưu trên trình duyệt để giữ tùy chọn của bạn. Âm thanh mặc định tắt, chỉ phát khi bạn bật và tương tác; không ghi âm hoặc truy cập micro.",
    "Language and sound preferences are saved in your browser. Sound is off by default and plays only after you enable it and interact. The app does not record audio or access the microphone.",
    "语言与音效偏好保存在浏览器。音效默认关闭，仅在你开启并互动后播放；应用不会录音，也不访问麦克风。"
  ],
  [
    "Óc Eo Pass: tên bạn tự đặt, mã các điểm đã check-in và phiên bản chính sách; dùng để đồng bộ kỷ niệm.",
    "Óc Eo Pass stores your chosen name, checked-in destination IDs and policy version to synchronise your collection.",
    "Óc Eo Pass保存自选名字、已签到地点标识与政策版本，用于同步印章收藏。"
  ],
  [
    "Đánh giá: tên công khai bạn chọn, nội dung, số sao, ít nhất một ảnh và thời điểm đăng. Những dữ liệu này hiển thị công khai ngay sau khi đăng thành công.",
    "Reviews contain your chosen public name, text, star rating, at least one photo and publication time. These become public immediately after a successful post.",
    "评论包含自选公开名字、文字、星级、至少一张照片及发布时间，发布成功后立即公开。"
  ],
  [
    "Báo cáo: mã tài khoản, mã bài viết và lý do báo cáo; chỉ người gửi và quản trị viên có quyền truy cập.",
    "Reports contain your account ID, the reported post ID and your reason. Only you and administrators can access them.",
    "举报包含你的账户标识、被举报内容标识及原因，仅你本人和管理员可访问。"
  ],
  [
    "Chống gửi liên tiếp: lưu thời điểm bài gần nhất theo mã tài khoản để giới hạn một bài mỗi phút; không dùng để quảng cáo.",
    "Rate limiting stores the most recent post time under your account ID to allow one post per minute; it is not used for advertising.",
    "频率限制以账户标识记录最近发帖时间，每分钟最多一条，不用于广告。"
  ],
  [
    "Vị trí: chỉ yêu cầu khi bạn bấm check-in. Tọa độ được đối chiếu ngay trong trình duyệt, không ghi vào hồ sơ hay bài đánh giá, không theo dõi liên tục.",
    "Location is requested only when you tap check-in. Coordinates are compared inside the browser, not saved in profiles or reviews, and are not tracked continuously.",
    "仅在点击签到时请求位置。坐标只在浏览器内进行比对，不写入个人档案或评论，也不持续跟踪。"
  ],
  [
    "Chỉ đăng ảnh bạn có quyền sử dụng. Không đăng giấy tờ, số điện thoại, ảnh trẻ em hoặc người khác khi chưa có sự đồng ý phù hợp. Ứng dụng chuyển ảnh thành JPEG trước khi tải lên để loại bỏ metadata EXIF, gồm vị trí GPS. Hình ảnh vẫn có thể để lộ thông tin qua nội dung nhìn thấy.",
    "Upload only photos you have permission to use. Do not post documents, phone numbers, or images of children or others without appropriate consent. Images are converted to JPEG to remove EXIF metadata, including GPS, before upload. Visible image content may still reveal information.",
    "只上传有权使用的照片。未经适当同意，不要发布证件、电话号码、儿童或他人的影像。上传前会转为JPEG并移除含GPS在内的EXIF元数据，但画面本身仍可能透露信息。"
  ],
  [
    "Google Firebase cung cấp Hosting, Authentication, Firestore, Storage và Cloud Functions để kiểm tra ảnh thật trước khi công khai bài viết. Chức năng máy chủ được cấu hình tại Singapore; vị trí Firestore và Storage tùy cấu hình dự án. Dữ liệu có thể được xử lý ngoài Việt Nam theo hạ tầng và cấu hình của chủ dự án. Chủ trang phải rà soát nơi lưu dữ liệu và các nghĩa vụ bảo vệ, chuyển dữ liệu liên quan trước khi vận hành chính thức.",
    "Google Firebase supplies Hosting, Authentication, Firestore, Storage and Cloud Functions, including server-side image validation before publication. Functions are configured in Singapore; Firestore and Storage locations depend on the project. Data may be processed outside Vietnam. Before operating publicly, the operator must review storage locations and relevant data-protection and transfer obligations.",
    "Google Firebase提供Hosting、Authentication、Firestore、Storage与Cloud Functions，并在发布前于服务器检查图片。函数配置于新加坡，Firestore和Storage位置取决于项目设置，数据可能在越南境外处理。正式运营前，运营方须审核存储地点及相关数据保护、跨境传输义务。"
  ],
  [
    "Bản đồ OpenStreetMap chỉ tải khi bạn mở tab “Bản đồ”; máy chủ bản đồ có thể nhận IP và vùng bản đồ đang xem. Không gửi vị trí GPS của bạn cho bản đồ. Một số liên kết nguồn cơ sở mở Google Maps trong trang riêng; dịch vụ đó có chính sách riêng và có thể nhận IP khi bạn mở liên kết. Liên kết đặt Cafe in bed mở website của quán; việc đặt lịch tại đó theo chính sách của quán, app không tự gửi hồ sơ hay GPS của bạn sang trang đặt lịch. Không tích hợp quảng cáo, Google Analytics hoặc trình theo dõi tiếp thị trong phiên bản này.",
    "OpenStreetMap loads when you open Map; its servers may receive your IP address and viewed area. Your GPS coordinates are not sent to the basemap. Some source links open Google Maps under its own privacy policy. Cafe in bed bookings open the café’s website and follow its policy; the app does not automatically send your profile or GPS there. This version contains no advertising, Google Analytics or marketing trackers.",
    "打开地图页时才加载OpenStreetMap，其服务器可能收到IP地址及所查看区域；不会向底图发送GPS坐标。部分来源链接打开Google Maps并适用其隐私政策。Cafe in bed预约在店家网站进行并适用店家政策，应用不会自动发送你的档案或GPS。本版本不含广告、Google Analytics或营销追踪器。"
  ],
  [
    "Hồ sơ và bài đăng được giữ đến khi bạn xóa hoặc yêu cầu xóa. Trong “Tài khoản”, bạn có thể xóa từng đánh giá, xuất dữ liệu của mình hoặc xóa tài khoản cùng hồ sơ, bài viết, ảnh và báo cáo. Có thể cần xác thực lại bằng Google. Bản sao lưu và nhật ký kỹ thuật của nhà cung cấp được xử lý theo chính sách của nhà cung cấp; nội dung người khác đã tải về có thể không thu hồi được.",
    "Profiles and posts are retained until you delete them or request deletion. Account lets you remove individual reviews, export your data, or delete your account along with its profile, posts, photos and reports. Google reauthentication may be required. Provider backups and technical logs follow the provider’s policies; copies other people downloaded may not be recoverable.",
    "档案与帖子保存至你删除或提出删除请求。在账户中可逐条删除评论、导出数据，或删除账户及其档案、帖子、照片和举报记录，可能需要再次通过Google验证。服务商备份与技术日志遵循其政策；他人已下载的副本可能无法收回。"
  ],
  [
    "Đánh giá không phải duyệt trước. Quản trị viên có thể ẩn bài có nội dung xâm phạm quyền riêng tư, quấy rối, sai lệch, quảng cáo hoặc không phù hợp với di sản. Ảnh của bài bị ẩn có thể vẫn truy cập được bằng đường dẫn cũ cho đến khi ảnh được xóa. Bạn có thể báo cáo từng bài; hãy dùng địa chỉ liên hệ bên trên để yêu cầu hỗ trợ quyền dữ liệu.",
    "Reviews are published without advance approval. Administrators may hide content that invades privacy, harasses, misleads, advertises or is unsuitable for the heritage setting. A hidden post’s photo may remain accessible through its old URL until the image is deleted. You can report each post; use the contact above for data-rights support.",
    "评论无需预审即公开。管理员可隐藏侵犯隐私、骚扰、误导、广告或不适合遗产环境的内容。帖子隐藏后，照片在被删除前仍可能通过原链接访问。你可以举报帖子，数据权利请求请使用上方联系方式。"
  ],
  [
    "Phần tạo tài khoản và đăng đánh giá của phiên bản này dành cho người từ đủ 16 tuổi. Người nhỏ tuổi hơn có thể dùng chế độ khách; không nên tự đăng thông tin hoặc ảnh cá nhân. Luồng xác minh sự đồng ý của người giám hộ chưa được cung cấp.",
    "Account creation and public reviews in this version are for people aged 16 or older. Younger visitors can use guest mode and should not publish personal information or photos themselves. A guardian-consent verification process is not provided.",
    "本版本的账户创建与公开评论面向年满16周岁的用户。更年幼的访客可使用访客模式，不应自行公开个人信息或照片；目前未提供监护人同意验证流程。"
  ],
  [
    "Đăng nhập và đăng bài là lựa chọn tự nguyện, có ô đồng ý riêng; không coi việc tiếp tục duyệt trang là đồng ý. Bạn có thể rút lại bằng đăng xuất, xóa dữ liệu hoặc liên hệ đơn vị vận hành. Khi chính sách thay đổi, phiên bản mới sẽ được công bố tại đây.",
    "Sign-in and posting are voluntary, each with a separate consent checkbox. Browsing alone is not treated as consent. You can withdraw by signing out, deleting data or contacting the operator. Updated policy versions will be published here.",
    "登录与发帖均为自愿选择，各有独立同意勾选框，单纯浏览不视为同意。你可以退出登录、删除数据或联系运营方撤回同意。政策更新将在此公布。"
  ]
];
