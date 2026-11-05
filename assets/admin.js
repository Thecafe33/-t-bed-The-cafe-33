import {
  cloneDefault,
  validateSite,
  escapeHTML as e,
  eligible,
  canCollectStamp,
  safeURL,
  ADMIN_EMAIL,
} from "./model.js";
import { icon, mark } from "./icons.js";
import * as cloud from "./cloud.js";
let site = cloneDefault(),
  tab = "overview",
  dirty = false,
  connected = false,
  reviewItems = [],
  reviewMore = false;
const $ = (s) => document.querySelector(s),
  panel = $("#admin-panel"),
  modal = $("#modal");
function hydrate(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  root.querySelectorAll("[data-mark]").forEach((el) => (el.innerHTML = mark));
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => $("#toast").classList.remove("show"), 6000);
}
function showModal(html) {
  $("#modal-body").innerHTML = html;
  hydrate(modal);
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
}
$("#close-modal").onclick = () => modal.close();
function markDirty() {
  dirty = true;
  $("#save-status").textContent = "Có thay đổi cục bộ · chưa lưu lên Firebase";
  $("#publish").disabled = !connected;
}
window.addEventListener("beforeunload", (ev) => {
  if (dirty) {
    ev.preventDefault();
    ev.returnValue = "";
  }
});
function heading(kicker, title, action = "") {
  return `<div class="section-heading"><div><div class="eyebrow">${kicker}</div><h2>${title}</h2></div>${action}</div>`;
}
function render() {
  document
    .querySelectorAll("[data-tab]")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "overview") {
    panel.innerHTML =
      heading(
        "HELLO, NGƯỜI GIỮ CHUYỆN ÓC EO",
        'Chăm chút một<br><span class="serif">chuyến đi.</span>',
      ) +
      `<p class="admin-help">Một nơi để giữ nội dung đúng, bản đồ rõ và những câu chuyện thật.</p><div class="admin-summary"><div class="admin-stat"><b>${site.places.length}</b><span>Hồ sơ di sản và khám phá</span></div><div class="admin-stat"><b>${site.places.filter(canCollectStamp).length}</b><span>Di tích có nguồn vị trí · mở tem</span></div><div class="admin-stat"><b>${site.stops.length}</b><span>Hồ sơ ăn uống / nghỉ tham khảo</span></div></div><div class="admin-card"><h3>Chăm sóc dữ liệu trước mỗi chuyến đi</h3><div class="admin-list-item"><span>01 / Kiểm chứng ranh giới xã sau sáp nhập</span><button class="text-button" data-go="places">Biên tập ${icon("arrow")}</button></div><div class="admin-list-item"><span>02 / Bổ sung nguồn và tọa độ từng điểm</span><button class="text-button" data-go="places">Xem điểm ${icon("arrow")}</button></div><div class="admin-list-item"><span>03 / Điền đơn vị vận hành và liên hệ bảo mật</span><button class="text-button" data-go="settings">Cài đặt ${icon("arrow")}</button></div><div class="admin-list-item"><span>04 / Triển khai Rules, chỉ mục và kiểm thử Firebase</span><a href="https://console.firebase.google.com/project/chitieucanhan-33/overview" target="_blank" rel="noopener noreferrer" class="text-button">Firebase ${icon("arrowup")}</a></div></div><div class="notice">Huy hiệu chỉ là kỷ niệm chuyến đi, không phải xác nhận chính thức. GPS được đối chiếu trên thiết bị nên không dùng cơ chế này để trao phần thưởng có giá trị.</div>`;
  } else if (tab === "places" || tab === "stops") {
    const key = tab === "places" ? "places" : "stops";
    panel.innerHTML =
      heading(
        "BIÊN TẬP / TRONG PHẠM VI XÃ ÓC EO",
        tab === "places"
          ? 'Những mảnh <span class="serif">di sản.</span>'
          : 'Ăn ngon. <span class="serif">Nghỉ khỏe.</span>',
        `<button class="button outline" id="add-place">Thêm địa điểm ${icon("plus")}</button>`,
      ) +
      `<p class="admin-help">Chỉ xác minh khi nguồn chứng minh địa điểm thuộc xã Óc Eo sau sáp nhập, có tọa độ đúng và có thể tiếp cận phù hợp. Điểm chưa xác minh không được nhận tem. Danh bạ ăn nghỉ có thể hiển thị khi đã đọc nguồn và kiểm tra phạm vi; luôn ghi rõ tình trạng hoạt động chưa được xác nhận. Chỉ pin có nguồn tọa độ mới xuất hiện trên bản đồ.</p>` +
      (site[key].length
        ? site[key]
            .map(
              (p) =>
                `<article class="admin-list-item"><div><h3>${e(p.name)}</h3><p>${eligible(p) ? "✓ Có nguồn tọa độ tham khảo" : "○ Chưa có tọa độ · nội dung có thể đã đối chiếu nguồn"} · ${e(p.id)}</p></div><div class="actions"><button class="text-button" data-edit="${e(p.id)}">Chỉnh sửa ${icon("arrowup")}</button><button class="text-button danger" data-remove="${e(p.id)}">Xóa</button></div></article>`,
            )
            .join("")
        : '<div class="admin-empty">Chưa có cơ sở nào. Hãy thêm dữ liệu thực tế thay vì tên hoặc địa chỉ minh họa.</div>');
    $("#add-place").onclick = () => editPlace(key);
    panel
      .querySelectorAll("[data-edit]")
      .forEach((b) => (b.onclick = () => editPlace(key, b.dataset.edit)));
    panel.querySelectorAll("[data-remove]").forEach(
      (b) =>
        (b.onclick = () => {
          const p = site[key].find((x) => x.id === b.dataset.remove);
          if (
            !confirm(
              `Xóa ${p.name}? Tem đã lưu của khách không tự xóa nhưng không còn tính vào tiến độ.`,
            )
          )
            return;
          site[key] = site[key].filter((x) => x.id !== p.id);
          site.itinerary.forEach((s) => {
            if (s.placeId === p.id) s.placeId = "";
          });
          markDirty();
          render();
        }),
    );
  } else if (tab === "itinerary") {
    panel.innerHTML =
      heading(
        "MỘT NGÀY, NHIỀU ĐIỀU NHỚ",
        'Xếp một <span class="serif">chuyến đi.</span>',
        `<button class="button outline" id="add-step">Thêm mốc ${icon("plus")}</button>`,
      ) +
      `<p class="admin-help">Thời gian là gợi ý, không phải giờ mở cửa. Liên kết điểm đã xác minh và khảo sát thời gian di chuyển trước khi mô tả đây là tuyến tham quan thực tế.</p>` +
      site.itinerary
        .map(
          (s, i) =>
            `<div class="admin-card"><div class="admin-toolbar"><span class="pill">${e(s.time)} / ${i + 1}</span><div><button class="text-button" data-step-up="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button class="text-button" data-step-down="${i}" ${i === site.itinerary.length - 1 ? "disabled" : ""}>↓</button> <button class="text-button danger" data-delete-step="${i}">Xóa</button></div></div><label class="field">Giờ<input type="time" data-step="${i}" data-prop="time" value="${e(s.time)}" required></label><label class="field">Tiêu đề<input data-step="${i}" data-prop="title" value="${e(s.title)}" maxlength="160"></label><label class="field">Mô tả<textarea data-step="${i}" data-prop="description" maxlength="1000">${e(s.description)}</textarea></label><label class="field">Liên kết điểm dừng<select data-step="${i}" data-prop="placeId"><option value="">Khung trải nghiệm, không liên kết</option>${[
              ...site.places,
              ...site.stops,
            ]
              .filter(eligible)
              .map(
                (p) =>
                  `<option value="${e(p.id)}" ${s.placeId === p.id ? "selected" : ""}>${e(p.name)}</option>`,
              )
              .join("")}</select></label></div>`,
        )
        .join("");
    $("#add-step").onclick = () => {
      site.itinerary.push({
        time: "09:00",
        title: "Mốc trải nghiệm mới",
        description: "",
        placeId: "",
      });
      markDirty();
      render();
    };
    panel.querySelectorAll("[data-step]").forEach(
      (el) =>
        (el.onchange = () => {
          site.itinerary[Number(el.dataset.step)][el.dataset.prop] = el.value;
          markDirty();
        }),
    );
    panel.querySelectorAll("[data-delete-step]").forEach(
      (b) =>
        (b.onclick = () => {
          site.itinerary.splice(Number(b.dataset.deleteStep), 1);
          markDirty();
          render();
        }),
    );
    for (const dir of ["up", "down"])
      panel.querySelectorAll(`[data-step-${dir}]`).forEach(
        (b) =>
          (b.onclick = () => {
            const i = Number(b.dataset[dir === "up" ? "stepUp" : "stepDown"]),
              j = i + (dir === "up" ? -1 : 1);
            [site.itinerary[i], site.itinerary[j]] = [
              site.itinerary[j],
              site.itinerary[i],
            ];
            markDirty();
            render();
          }),
      );
  } else if (tab === "settings") {
    panel.innerHTML =
      heading(
        "CÀI ĐẶT / MINH BẠCH & QUYỀN RIÊNG TƯ",
        'Những điều <span class="serif">cần rõ.</span>',
      ) +
      `<div class="admin-card"><h3>Đơn vị chịu trách nhiệm</h3><p class="admin-help">Điền thông tin thực tế để hiển thị trong chính sách bảo mật. Đăng nhập và đăng đánh giá cho khách chỉ mở khi hai trường này được cấu hình.</p><label class="field">Tên cá nhân / đơn vị vận hành<input id="operator" maxlength="180" value="${e(site.operator)}" placeholder="Tên đơn vị vận hành thực tế"></label><label class="field">Email tiếp nhận yêu cầu quyền dữ liệu<input id="contact-email" type="email" maxlength="180" value="${e(site.contactEmail)}" placeholder="Địa chỉ liên hệ đang hoạt động"></label><label class="field">Bán kính check-in (mét, 50–500)<input id="radius" type="number" min="50" max="500" value="${site.radius}"></label><p class="admin-help">GPS có độ chính xác yêu cầu ≤ 100 m. Vị trí được kiểm tra ở trình duyệt và không lưu trên Firebase. Không phải cơ chế chống giả mạo.</p></div><div class="admin-card"><h3>Dữ liệu & sao lưu</h3><p class="admin-help">Xuất cấu hình trước khi chỉnh sửa lớn. Nhập JSON chỉ thay đổi bản biên tập; bấm lưu riêng để đưa lên Firebase.</p><div class="detail-actions"><button class="button outline" id="export-config">Xuất cấu hình ${icon("download")}</button><label class="button outline" style="cursor:pointer">Nhập cấu hình<input type="file" id="import-config" accept="application/json,.json" hidden></label></div></div><div class="notice warning">Chính sách được triển khai là bản chức năng cần chủ vận hành rà soát pháp lý, thông tin chuyển dữ liệu, lưu trữ và quy trình hỗ trợ người dùng trước khi mở dịch vụ. Không có tuyên bố bảo đảm tuân thủ pháp luật tự động.</div>`;
    for (const [id, key] of [
      ["operator", "operator"],
      ["contact-email", "contactEmail"],
      ["radius", "radius"],
    ])
      $("#" + id).onchange = (ev) => {
        site[key] =
          key === "radius" ? Number(ev.target.value) : ev.target.value.trim();
        markDirty();
      };
    $("#export-config").onclick = () => {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(site, null, 2)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "oc-eo-townwalk-config.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    $("#import-config").onchange = async (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      if (f.size > 800000) {
        toast("Cấu hình quá lớn.");
        return;
      }
      try {
        const data = validateSite(JSON.parse(await f.text()));
        if (
          !confirm(
            "Thay thế bản biên tập bằng cấu hình vừa nhập? Chưa lưu lên máy chủ.",
          )
        )
          return;
        site = data;
        markDirty();
        render();
        toast("Đã nhập bản biên tập, chưa xuất bản.");
      } catch (err) {
        toast(err.message);
      }
    };
  } else if (tab === "reviews") {
    renderReviewPanel();
    return;
  }
  hydrate(panel);
  panel.querySelectorAll("[data-go]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.go;
        render();
      }),
  );
}
function field(name, label, value = "", type = "text", extra = "") {
  return `<label class="field">${label}<input name="${name}" type="${type}" value="${e(value ?? "")}" ${extra}></label>`;
}
function editPlace(key, id) {
  const old = site[key].find((p) => p.id === id),
    p = old || {
      id: "",
      name: "",
      category: key === "places" ? "heritage" : "food",
      description: "",
      label: "",
      note: "",
      duration: 45,
      lat: null,
      lng: null,
      scopeConfirmed: false,
      verified: false,
      sourceUrl: "",
      image: "",
      address: "",
      color: "butter",
      symbol: key === "places" ? "temple" : "coffee",
    };
  showModal(
    `<h2>${old ? "Sửa" : "Thêm"} <span class="serif">địa điểm.</span></h2><form id="place-form"><div class="form-row">${field("name", "Tên điểm", p.name, "text", 'required maxlength="120"')}${field("id", "Mã duy nhất, không đổi sau khi phát tem", p.id, "text", `${old ? "readonly" : ""} required pattern="[a-z0-9-]{1,60}" maxlength="60"`)}</div>${
      key === "stops"
        ? `<label class="field">Loại điểm<select name="category">${[
            ["food", "Ăn uống"],
            ["rest", "Nghỉ chân / cà phê"],
            ["stay", "Lưu trú"],
          ]
            .map(
              ([v, n]) =>
                `<option value="${v}" ${p.category === v ? "selected" : ""}>${n}</option>`,
            )
            .join("")}</select></label>`
        : ""
    }${field("label", "Nhãn ngắn", p.label, "text", 'maxlength="100"')}<label class="field">Mô tả<textarea name="description" maxlength="3000" required>${e(p.description)}</textarea></label><label class="field">Lưu ý đón khách / giờ mở cửa / điều kiện tham quan<textarea name="note" maxlength="1800">${e(p.note)}</textarea></label>${field("address", "Địa chỉ sau sáp nhập", p.address, "text", 'maxlength="200"')}${field("sourceUrl", "Nguồn nội dung (HTTPS)", p.sourceUrl, "url", 'placeholder="https://…"')}${key === "stops" ? `${field("sourceLabel", "Tên nguồn danh bạ", p.sourceLabel || "", "text", 'maxlength="100"')}${field("phone", "Số liên hệ công khai", p.phone || "", "tel", 'maxlength="16" pattern="[+]?[0-9]{9,15}"')}${field("price", "Giá / lưu ý hỏi giá", p.price || "", "text", 'maxlength="150"')}${field("signature", "Món đặc trưng", p.signature || "", "text", 'maxlength="180"')}${field("bookingUrl", "Website đặt trước (HTTPS)", p.bookingUrl || "", "url")}${field("bookingLabel", "Nhãn nút đặt trước", p.bookingLabel || "", "text", 'maxlength="100"')}<label class="field">Lưu ý đặt trước / phụ phí<textarea name="bookingNotice" maxlength="1200">${e(p.bookingNotice || "")}</textarea></label><label class="check-field"><input name="localRecommendation" type="checkbox" ${p.localRecommendation ? "checked" : ""}><span>Gợi ý địa phương được duyệt biên tập. Có thể hiện mô tả theo mốc dù chưa có tọa độ; không tự tạo pin.</span></label><label class="check-field"><input name="featured" type="checkbox" ${p.featured ? "checked" : ""}><span>Điểm dừng chân được đề xuất.</span></label>` : ""}${field("hours", "Giờ phục vụ / cách xác nhận", p.hours || "", "text", 'maxlength="200"')}${field("hook", "Câu mở đầu cho người trẻ", p.hook || "", "text", 'maxlength="160"')}<label class="field">Lưu ý đường đi nổi bật<textarea name="accessWarning" maxlength="1200">${e(p.accessWarning || "")}</textarea></label>${field("accessWarningShort", "Lưu ý ngắn trên thẻ địa điểm", p.accessWarningShort || "", "text", 'maxlength="200"')}${key === "places" ? `<label class="check-field"><input name="collectible" type="checkbox" ${p.collectible !== false ? "checked" : ""}><span>Cho điểm này tham gia bộ tem khi đủ nguồn tọa độ. Bỏ chọn để giữ là điểm khám phá tùy chọn, không yêu cầu ghé để hoàn thành Pass.</span></label>` : ""}<label class="field">Gợi ý quan sát<textarea name="lookFor" maxlength="1500">${e(p.lookFor || "")}</textarea></label><label class="check-field"><input name="contentVerified" type="checkbox" ${p.contentVerified ? "checked" : ""}><span>Đã đọc và đối chiếu nguồn nội dung; không đồng nghĩa có tọa độ hoặc đang mở cửa.</span></label>${field("coordinateSource", "Nguồn tọa độ (bản đồ hoặc đo đạc)", p.coordinateSource || "", "url")}${field("coordinateNote", "Độ chính xác / lối tiếp cận", p.coordinateNote || "", "text", 'maxlength="400"')}${key === "places" ? field("checkInRadius", "Bán kính nhận tem riêng tại điểm (m, để trống dùng mặc định)", p.checkInRadius ?? "", "number", 'min="25" max="500"') : ""}${field("image", "Ảnh có quyền sử dụng (HTTPS hoặc /assets/photos/…)", p.image, "text")}${field("imageCredit", "Tác giả và giấy phép ảnh", p.imageCredit || "", "text", 'maxlength="300"')}${field("imageSource", "Trang nguồn ảnh", p.imageSource || "", "url")}<div class="form-row">${field("lat", "Vĩ độ", p.lat, "number", 'min="-90" max="90" step="any"')}${field("lng", "Kinh độ", p.lng, "number", 'min="-180" max="180" step="any"')}</div><label class="check-field"><input name="scopeConfirmed" type="checkbox" ${p.scopeConfirmed ? "checked" : ""}><span>Tôi đã kiểm tra nguồn: địa điểm này thuộc xã Óc Eo theo địa giới sau sáp nhập, không chỉ dựa vào địa chỉ huyện/xã cũ.</span></label><label class="check-field"><input name="verified" type="checkbox" ${p.verified ? "checked" : ""}><span>Nguồn tọa độ đã được đối chiếu. Cho hiển thị vị trí tham khảo${key === "places" && p.collectible !== false ? " và nhận tem khi tham gia bộ tem" : ""}.</span></label><div class="form-row">${field("duration", "Thời lượng gợi ý (phút)", p.duration, "number", 'required min="5" max="480"')}<label class="field">Màu thẻ<select name="color">${["butter", "lavender", "peach", "lime"].map((v) => `<option value="${v}" ${p.color === v ? "selected" : ""}>${v}</option>`).join("")}</select></label></div><p class="error-text" id="place-error" role="alert"></p><button class="button dark" type="submit">Giữ trong bản biên tập ${icon("check")}</button></form>`,
  );
  $("#place-form").onsubmit = (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target);
    const n = {
      ...p,
      id: String(f.get("id")).trim(),
      name: String(f.get("name")).trim(),
      label: String(f.get("label")).trim(),
      description: String(f.get("description")).trim(),
      hook: String(f.get("hook") || "").trim(),
      lookFor: String(f.get("lookFor") || "").trim(),
      accessWarning: String(f.get("accessWarning") || "").trim(),
      accessWarningShort: String(f.get("accessWarningShort") || "").trim(),
      ...(key === "places" ? {collectible: !!f.get("collectible")} : {}),
      contentVerified: !!f.get("contentVerified"),
      coordinateSource: String(f.get("coordinateSource") || "").trim(),
      coordinateNote: String(f.get("coordinateNote") || "").trim(),
      ...(key === "places" ? {checkInRadius: f.get("checkInRadius") === "" ? undefined : Number(f.get("checkInRadius"))} : {}),
      note: String(f.get("note")).trim(),
      address: String(f.get("address")).trim(),
      sourceUrl: String(f.get("sourceUrl")).trim(),
      hours: String(f.get("hours") || "").trim(),
      ...(key === "stops" ? {sourceLabel: String(f.get("sourceLabel") || "").trim(),phone: String(f.get("phone") || "").trim(),price: String(f.get("price") || "").trim(),signature:String(f.get("signature") || "").trim(),bookingUrl:String(f.get("bookingUrl") || "").trim(),bookingLabel:String(f.get("bookingLabel") || "").trim(),bookingNotice:String(f.get("bookingNotice") || "").trim(),localRecommendation:!!f.get("localRecommendation"),featured:!!f.get("featured")} : {}),
      image: String(f.get("image")).trim(),
      imageCredit: String(f.get("imageCredit") || "").trim(),
      imageSource: String(f.get("imageSource") || "").trim(),
      category: key === "places" ? "heritage" : f.get("category"),
      color: f.get("color"),
      symbol:
        key === "places"
          ? p.symbol
          : { food: "food", rest: "coffee", stay: "bed" }[f.get("category")],
      lat: f.get("lat") === "" ? null : Number(f.get("lat")),
      lng: f.get("lng") === "" ? null : Number(f.get("lng")),
      scopeConfirmed: !!f.get("scopeConfirmed"),
      verified: !!f.get("verified"),
      duration: Number(f.get("duration")),
    };
    if (n.checkInRadius === undefined) delete n.checkInRadius;
    const next = structuredClone(site);
    if (old) next[key][next[key].findIndex((x) => x.id === id)] = n;
    else next[key].push(n);
    try {
      validateSite(next);
      site = next;
      markDirty();
      modal.close();
      render();
    } catch (err) {
      $("#place-error").textContent = err.message;
    }
  };
}
async function renderReviewPanel() {
  panel.innerHTML =
    heading(
      "CÔNG KHAI TRƯỚC / CHĂM SÓC SAU",
      'Giữ góc này <span class="serif">tử tế.</span>',
    ) +
    `<p class="admin-help">Đánh giá có ảnh được công khai ngay khi người dùng đăng. Bạn có thể ẩn/hiện bài sau khi đọc báo cáo. Không sửa lời người dùng.</p><div id="reports-list"></div><div id="admin-reviews"><div class="notice">${connected ? "Đang tải đánh giá thật…" : "Đăng nhập quản trị để xem dữ liệu. Không hiển thị đánh giá giả trong bản xem trước."}</div></div><button id="load-more-reviews" class="text-button" hidden>Xem thêm đánh giá</button>`;
  if (!connected) return;
  const captured = tab;
  try {
    const [result, reports] = await Promise.all([
      cloud.loadReviews({ reset: true, admin: true }),
      cloud.loadReports(),
    ]);
    if (tab !== captured) return;
    reviewItems = result.items;
    reviewMore = result.more;
    renderAdminReviews();
    $("#reports-list").innerHTML = reports.length
      ? `<div class="admin-card"><h3>${reports.length} báo cáo gần nhất</h3>${reports.map((r) => `<div class="admin-list-item"><div><p>${e(r.reason)}</p><small>Mã bài: ${e(r.reviewId)}</small></div><button class="text-button" data-resolve="${e(r.id)}">Đã xử lý ${icon("check")}</button></div>`).join("")}</div>`
      : '<div class="notice">Không có báo cáo nào trong dữ liệu đã tải.</div>';
    panel.querySelectorAll("[data-resolve]").forEach(
      (b) =>
        (b.onclick = async () => {
          b.disabled = true;
          try {
            await cloud.resolveReport(b.dataset.resolve);
            renderReviewPanel();
          } catch (err) {
            toast(cloud.friendlyError(err));
            b.disabled = false;
          }
        }),
    );
  } catch (err) {
    if ($("#admin-reviews"))
      $("#admin-reviews").innerHTML =
        `<div class="notice warning">${e(cloud.friendlyError(err))}</div>`;
  }
}
function renderAdminReviews() {
  $("#admin-reviews").innerHTML = reviewItems.length
    ? reviewItems
        .map(
          (r) =>
            `<article class="admin-card admin-review"><div class="admin-toolbar"><h3>${e(r.name)} · ${Number(r.rating)} ★</h3><span class="review-status">${r.status === "hidden" ? "Đang ẩn" : "Công khai"}</span></div>${safeURL(r.photoURL) ? `<a href="${e(safeURL(r.photoURL))}" target="_blank" rel="noopener noreferrer"><img src="${e(safeURL(r.photoURL))}" alt="Ảnh đánh giá" loading="lazy"></a>` : ""}<p>${e(r.text)}</p><small>Mã bài: ${e(r.id)}</small><div class="detail-actions"><button class="button outline" data-moderate="${e(r.id)}" data-status="${r.status === "hidden" ? "published" : "hidden"}">${r.status === "hidden" ? "Hiện lại bài" : "Ẩn bài viết"} ${icon("shield")}</button></div></article>`,
        )
        .join("")
    : '<div class="admin-empty">Chưa có đánh giá.</div>';
  $("#load-more-reviews").hidden = !reviewMore;
  $("#load-more-reviews").onclick = async () => {
    const b = $("#load-more-reviews");
    b.disabled = true;
    try {
      const r = await cloud.loadReviews({ admin: true });
      reviewItems.push(...r.items);
      reviewMore = r.more;
      renderAdminReviews();
    } catch (err) {
      toast(cloud.friendlyError(err));
    } finally {
      b.disabled = false;
    }
  };
  panel.querySelectorAll("[data-moderate]").forEach(
    (b) =>
      (b.onclick = async () => {
        b.disabled = true;
        try {
          await cloud.moderateReview(b.dataset.moderate, b.dataset.status);
          const item = reviewItems.find((r) => r.id === b.dataset.moderate);
          item.status = b.dataset.status;
          renderAdminReviews();
          toast("Đã cập nhật trạng thái bài viết.");
        } catch (err) {
          toast(cloud.friendlyError(err));
          b.disabled = false;
        }
      }),
  );
}
$("#publish").onclick = async () => {
  if (!connected) return;
  try {
    validateSite(site);
    if (
      site.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail)
    )
      throw Error("Email liên hệ không hợp lệ.");
  } catch (err) {
    toast(err.message);
    return;
  }
  const btn = $("#publish");
  btn.disabled = true;
  $("#save-status").textContent = "Đang lưu lên Firebase…";
  try {
    await cloud.saveSite(site);
    dirty = false;
    $("#save-status").textContent = "Đã lưu lên Firebase · nội dung v2";
    toast("Đã xuất bản nội dung mới. Trang khách sẽ cập nhật trực tiếp.");
  } catch (err) {
    $("#save-status").textContent =
      "Chưa lưu thành công · bản biên tập vẫn trên trang";
    toast(cloud.friendlyError(err));
  } finally {
    btn.disabled = !connected;
  }
};
let loadingUid;
window.addEventListener("cloud-state", async () => {
  const s = cloud.state;
  connected = false;
  $("#publish").disabled = true;
  $("#admin-auth").textContent = s.user ? "Đăng xuất" : "Đăng nhập Google";
  if (!s.user) {
    $("#admin-notice").textContent =
      "Bạn đang xem trước studio. Đăng nhập quản trị để tải dữ liệu thật và xuất bản.";
    $("#save-status").textContent = "Bản xem trước · chưa kết nối quản trị";
    loadingUid = null;
    return;
  }
  if (!s.admin) {
    $("#admin-notice").textContent =
      "Tài khoản này không có quyền quản trị. Dữ liệu riêng tư không được tải.";
    return;
  }
  if (loadingUid === s.user.uid) return;
  loadingUid = s.user.uid;
  $("#admin-notice").textContent = "Đang tải nội dung Firebase v2…";
  try {
    const stop = await cloud.watchSite(
      (data) => {
        connected = cloud.state.admin;
        $("#publish").disabled = !connected;
        if (!dirty) {
          if (data) {
            try {
              site = validateSite(data);
            } catch (err) {
              connected = false;
              $("#publish").disabled = true;
              $("#admin-notice").textContent =
                "Dữ liệu trên máy chủ không hợp lệ: " + err.message;
              return;
            }
          } else site = cloneDefault();
          render();
        }
        $("#admin-notice").textContent = data
          ? "Đang biên tập dữ liệu Firebase v2. Chỉ thay đổi sau khi bạn bấm lưu."
          : "Chưa có nội dung v2 trên Firebase. Bản khởi tạo đã sẵn sàng để biên tập; nội dung cũ không bị ghi đè.";
        $("#save-status").textContent = dirty
          ? "Có thay đổi chưa lưu"
          : "Đã kết nối tài khoản quản trị";
      },
      (err) => {
        connected = false;
        $("#publish").disabled = true;
        $("#admin-notice").textContent = cloud.friendlyError(err);
      },
    );
    const uid = s.user.uid;
    window.addEventListener("cloud-state", () => {
      if (cloud.state.user?.uid !== uid) stop();
    });
  } catch (err) {
    $("#admin-notice").textContent = cloud.friendlyError(err);
  }
});
$("#admin-auth").onclick = async () => {
  try {
    if (cloud.state.user) {
      if (dirty && !confirm("Đăng xuất khi còn thay đổi chưa lưu?")) return;
      await cloud.logout();
      site = cloneDefault();
      dirty = false;
      render();
    } else {
      showModal(
        `<h2>Chào <span class="serif">người giữ chuyện.</span></h2><p class="admin-help">Đăng nhập tài khoản quản trị đã cấu hình trong Firebase Rules. Email không được đưa vào nội dung công khai.</p><div class="notice">Firebase sẽ xác thực Google; không cung cấp mật khẩu cho ứng dụng. Chỉ tài khoản có email đã xác minh thuộc danh sách quản trị mới được sửa dữ liệu.</div><button class="button dark" id="confirm-admin-login">Tiếp tục với Google ${icon("arrowup")}</button><p id="admin-login-error" class="error-text" role="alert"></p>`,
      );
      $("#confirm-admin-login").onclick = async () => {
        const b = $("#confirm-admin-login");
        b.disabled = true;
        try {
          await cloud.login();
          modal.close();
        } catch (err) {
          $("#admin-login-error").textContent = cloud.friendlyError(err);
          b.disabled = false;
        }
      };
    }
  } catch (err) {
    toast(cloud.friendlyError(err));
  }
};
document.querySelectorAll("[data-tab]").forEach(
  (b) =>
    (b.onclick = () => {
      tab = b.dataset.tab;
      render();
    }),
);
hydrate();
render();
cloud.connect().catch(() => {
  $("#admin-notice").textContent =
    "Chưa kết nối được Firebase. Bạn vẫn có thể xem và xuất bản biên tập; chưa thể lưu lên máy chủ.";
});
