import { CURATED } from "./content.js";
import { appURL } from "./app-paths.js";
export const HERITAGE_REFERENCE_URL = "https://vanhoaoceo.angiang.gov.vn/";
export const ADMIN_EMAIL = "vulpoz.com@gmail.com";
export const SITE_ID = "oceotownwalk-v2";
export const POLICY_VERSION = "2026-11-04";
export const DEFAULT_SITE = {
  schemaVersion: 2,
  title: "Óc Eo townwalk",
  contactEmail: "",
  operator: "",
  radius: 150,
  places: CURATED.places,
  stops: CURATED.stops,
  itinerary: CURATED.itinerary,
};
export const SOURCE_CATALOG = CURATED.sources;
function validSource(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !!u.hostname;
  } catch {
    return false;
  }
}
export function contentSourced(p) {
  return (
    (p.contentVerified === true || p.verified === true) &&
    validSource(p.sourceUrl)
  );
}
export function visibleStop(p) {
  return ["food", "rest", "stay"].includes(p.category) &&
    p.scopeConfirmed === true && (contentSourced(p) || p.localRecommendation === true);
}
export function escapeHTML(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
export function safeURL(value, { image = false } = {}) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const localImage = image && /^(?:\.\/|\/)?assets\//.test(value);
    const u = new URL(localImage ? appURL(value) : value, location.origin);
    const assets = new URL(appURL("assets/"));
    return u.protocol === "https:" ||
      (image &&
        u.origin === assets.origin &&
        u.pathname.startsWith(assets.pathname))
      ? u.href
      : "";
  } catch {
    return "";
  }
}
export function eligible(p) {
  return (
    p.verified === true &&
    p.scopeConfirmed === true &&
    validSource(p.sourceUrl) &&
    validSource(p.coordinateSource) &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}
export function isAccessClosed(p) {
  return p?.closed === true || ['closed','temporarily-closed','restricted','no-access'].includes(p?.accessStatus);
}
export function canCollectStamp(p) {
  return p.category === "heritage" && p.collectible !== false && eligible(p) && !isAccessClosed(p);
}
export function passProgress(places, badges = []) {
  const collection = places.filter(p => p.category === "heritage" && p.collectible !== false && p.scopeConfirmed === true && contentSourced(p));
  const ids = new Set(Array.isArray(badges) ? badges : []);
  const earned = collection.filter(p => ids.has(p.id));
  return {collection, earned, ready: collection.filter(canCollectStamp),
    total: collection.length, count: earned.length,
    complete: collection.length > 0 && earned.length === collection.length};
}
export function distanceMeters(a, b) {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r,
    dLng = (b.lng - a.lng) * r;
  const v =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}
export function validateSite(data) {
  if (
    !data ||
    data.schemaVersion !== 2 ||
    !Array.isArray(data.places) ||
    !Array.isArray(data.stops) ||
    !Array.isArray(data.itinerary)
  )
    throw Error("Cấu trúc nội dung không hợp lệ.");
  if (
    data.places.length > 40 ||
    data.stops.length > 60 ||
    data.itinerary.length > 20
  )
    throw Error("Quá nhiều mục trong một cấu hình.");
  if (!Number.isFinite(data.radius) || data.radius < 50 || data.radius > 500)
    throw Error("Bán kính phải từ 50 đến 500 m.");
  for (const key of ["operator", "contactEmail"])
    if (typeof data[key] !== "string" || data[key].length > 180)
      throw Error("Kiểm tra tên đơn vị và email liên hệ.");
  if (
    data.contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)
  )
    throw Error("Email liên hệ không hợp lệ.");
  const ids = new Set();
  for (const p of [...data.places, ...data.stops]) {
    if (
      !p ||
      typeof p !== "object" ||
      typeof p.id !== "string" ||
      !/^[a-z0-9-]{1,60}$/.test(p.id) ||
      ids.has(p.id)
    )
      throw Error(
        "Mã địa điểm phải duy nhất, chỉ gồm chữ thường, số và dấu gạch ngang.",
      );
    ids.add(p.id);
    if (p.collectible !== undefined && typeof p.collectible !== "boolean")
      throw Error("Trạng thái tham gia bộ tem phải là đúng hoặc sai.");
    if (p.checkInRadius !== undefined && (!Number.isFinite(p.checkInRadius) || p.checkInRadius < 25 || p.checkInRadius > 500))
      throw Error("Bán kính tại điểm phải từ 25 đến 500 m.");
    for (const key of ["localRecommendation", "featured"])
      if (p[key] !== undefined && typeof p[key] !== "boolean")
        throw Error("Trạng thái gợi ý địa phương không hợp lệ.");
    for (const [key, max] of [["bookingNotice", 1200], ["bookingUrl", 2000], ["bookingLabel", 100], ["signature", 180]])
      if (p[key] !== undefined && (typeof p[key] !== "string" || p[key].length > max))
        throw Error("Kiểm tra thông tin đặt lịch hoặc món đặc trưng.");
    if (p.bookingUrl && !validSource(p.bookingUrl))
      throw Error("Website đặt trước cần dùng HTTPS.");
    for (const key of ["accessWarning", "accessWarningShort"])
      if (p[key] !== undefined && (typeof p[key] !== "string" || p[key].length > 1200))
        throw Error("Lưu ý đường đi phải là văn bản tối đa 1200 ký tự.");
    if (
      typeof p.name !== "string" ||
      !p.name.trim() ||
      p.name.length > 120 ||
      typeof p.description !== "string" ||
      p.description.length > 3000
    )
      throw Error("Kiểm tra tên và mô tả địa điểm.");
    for (const [key, max] of [
      ["label", 100],
      ["note", 1800],
      ["sourceUrl", 2000],
      ["image", 2000],
    ])
      if (typeof p[key] !== "string" || p[key].length > max)
        throw Error("Thông tin nhãn, lưu ý, nguồn hoặc ảnh không hợp lệ.");
    if (
      !["heritage", "food", "rest", "stay"].includes(p.category) ||
      typeof p.verified !== "boolean" ||
      typeof p.scopeConfirmed !== "boolean"
    )
      throw Error("Loại địa điểm hoặc trạng thái xác minh không hợp lệ.");
    if (!Number.isFinite(p.duration) || p.duration < 5 || p.duration > 480)
      throw Error("Thời lượng cần từ 5 đến 480 phút.");
    if (p.verified && !eligible(p))
      throw Error(
        `${p.name}: cần nguồn HTTPS cho nội dung và tọa độ, xác nhận phạm vi xã và tọa độ hợp lệ trước khi bật xác minh.`,
      );
    if (
      p.image &&
      !/^https:\/\//.test(p.image) &&
      !p.image.startsWith("/assets/photos/")
    )
      throw Error("Ảnh địa điểm phải dùng HTTPS.");
  }
  for (const s of data.itinerary) {
    if (
      !s ||
      typeof s.time !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time) ||
      typeof s.title !== "string" ||
      !s.title.trim() ||
      s.title.length > 160 ||
      typeof s.description !== "string" ||
      s.description.length > 1000 ||
      typeof s.placeId !== "string"
    )
      throw Error("Mỗi mốc lịch trình cần giờ HH:MM, tiêu đề và mô tả hợp lệ.");
    if (s.placeId && !ids.has(s.placeId))
      throw Error("Lịch trình tham chiếu địa điểm không tồn tại.");
  }
  return data;
}
export const cloneDefault = () => structuredClone(DEFAULT_SITE);
