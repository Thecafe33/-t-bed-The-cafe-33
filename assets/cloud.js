import { SITE_ID, ADMIN_EMAIL } from "./model.js";
let sdk, auth, db, storage, functions, boot, pendingReview;
export const state = { user: null, ready: false, error: null, admin: false };
const emit = () =>
  window.dispatchEvent(new CustomEvent("cloud-state", { detail: state }));
export function connect() {
  if (boot) return boot;
  boot = (async () => {
    sdk = await import("./vendor/firebase.js");
    const app = sdk.initializeApp({
      apiKey: "AIzaSyD367iejwFyLn89MdyIWEd0WRzt8RfQGRw",
      authDomain: "chitieucanhan-33.firebaseapp.com",
      projectId: "chitieucanhan-33",
      storageBucket: "chitieucanhan-33.firebasestorage.app",
      messagingSenderId: "139103955870",
      appId: "1:139103955870:web:b4532a7b467abccfa7448f",
    });
    auth = sdk.getAuth(app);
    db = sdk.getFirestore(app);
    storage = sdk.getStorage(app);
    functions = sdk.getFunctions(app, "asia-southeast1");
    await new Promise((resolve) =>
      sdk.onAuthStateChanged(auth, (u) => {
        state.user = u;
        state.admin = !!u && u.emailVerified && u.email === ADMIN_EMAIL;
        state.ready = true;
        emit();
        resolve();
      }),
    );
    return state;
  })().catch((e) => {
    state.error = e;
    emit();
    throw e;
  });
  return boot;
}
function requireUser() {
  if (!state.user)
    throw Error("Bạn cần đăng nhập Google để thực hiện thao tác này.");
  return state.user;
}
export async function login() {
  await connect();
  return sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
}
export async function logout() {
  await connect();
  await sdk.signOut(auth);
}
export async function watchSite(callback, error) {
  await connect();
  return sdk.onSnapshot(
    sdk.doc(db, "sites", SITE_ID),
    (snap) => callback(snap.exists() ? snap.data() : null),
    error,
  );
}
export async function saveSite(data) {
  await connect();
  if (!state.admin) throw Error("Tài khoản không có quyền quản trị.");
  await sdk.setDoc(sdk.doc(db, "sites", SITE_ID), {
    ...data,
    updatedAt: sdk.serverTimestamp(),
  });
}
export async function loadProfile() {
  await connect();
  const u = requireUser();
  const s = await sdk.getDoc(sdk.doc(db, "townwalkProfiles", u.uid));
  return s.exists() ? s.data() : null;
}
export async function saveProfile(profile, expectedUid=state.user?.uid) {
  await connect();
  const u = requireUser();
  if(!expectedUid||u.uid!==expectedUid)throw Error('Tài khoản đã thay đổi. Thử lưu lại.');
  await sdk.setDoc(sdk.doc(db, "townwalkProfiles", u.uid), {
    name: profile.name,
    badges: profile.badges,
    policyVersion: profile.policyVersion,
    updatedAt: sdk.serverTimestamp(),
  });
}
let reviewCursor = null,
  adminCursor = null;
export async function loadReviews({ reset = false, admin = false } = {}) {
  await connect();
  if (admin && !state.admin) throw Error("Không có quyền.");
  if (reset) {
    if (admin) adminCursor = null;
    else reviewCursor = null;
  }
  const filters = admin ? [] : [sdk.where("status", "==", "published")];
  filters.push(sdk.orderBy("createdAt", "desc"));
  const cursor = admin ? adminCursor : reviewCursor;
  if (cursor) filters.push(sdk.startAfter(cursor));
  filters.push(sdk.limit(12));
  const snap = await sdk.getDocs(
    sdk.query(sdk.collection(db, "townwalkReviews"), ...filters),
  );
  if(snap.metadata.fromCache)throw Error("Chưa kết nối được dữ liệu đánh giá mới.");
  if (admin) adminCursor = snap.docs.at(-1) || null;
  else reviewCursor = snap.docs.at(-1) || null;
  return {
    items: snap.docs.map((s) => ({ id: s.id, ...s.data() })),
    more: snap.docs.length === 12,
  };
}
export async function preparePhoto(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("Chọn ảnh JPG, PNG hoặc WebP.");
  if (file.size > 8 * 1024 * 1024) throw Error("Ảnh cần nhỏ hơn 8 MB.");
  const bmp = await createImageBitmap(file);
  if (!bmp.width || !bmp.height) {
    bmp.close();
    throw Error("Không đọc được ảnh.");
  }
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  // Re-encoding strips original EXIF metadata, including embedded GPS.
  const blob = await new Promise((resolve) =>
    c.toBlob(resolve, "image/jpeg", 0.82),
  );
  if (!blob || blob.size > 2 * 1024 * 1024)
    throw Error("Ảnh sau xử lý vẫn quá lớn, hãy chọn ảnh khác.");
  return blob;
}
export async function postReview({ name, text, rating, photo, policyVersion }) {
  await connect();
  const u = requireUser();
  if (
    !photo ||
    !text.trim() ||
    text.length > 1200 ||
    !name.trim() ||
    name.length > 60 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  )
    throw Error("Kiểm tra tên, cảm nhận, số sao và ảnh.");
  const key = JSON.stringify([u.uid, name, text, rating, policyVersion]);
  if (
    !pendingReview ||
    pendingReview.key !== key ||
    pendingReview.photo !== photo
  )
    pendingReview = {
      key,
      photo,
      id: sdk.doc(sdk.collection(db, "townwalkReviews")).id,
      uploaded: false,
    };
  const draft = pendingReview;
  const path = `townwalkReviews/${u.uid}/${draft.id}/photo.jpg`;
  if (!draft.uploaded) {
    await sdk.uploadBytes(sdk.ref(storage, path), photo, {
      contentType: "image/jpeg",
      customMetadata: { owner: u.uid },
    });
    draft.uploaded = true;
  }
  // The trusted function checks the actual image object exists before publishing.
  // Keep the same draft ID after ambiguous failures, so retries cannot duplicate a post.
  await sdk.httpsCallable(
    functions,
    "publishReview",
  )({ id: draft.id, name, text, rating, policyVersion });
  pendingReview = null;
}
export async function reportReview(id, reason) {
  await connect();
  const u = requireUser();
  await sdk.setDoc(sdk.doc(db, "townwalkReports", `${id}_${u.uid}`), {
    uid: u.uid,
    reviewId: id,
    reason,
    createdAt: sdk.serverTimestamp(),
  });
}
export async function moderateReview(id, status) {
  await connect();
  if (!state.admin) throw Error("Không có quyền.");
  await sdk.updateDoc(sdk.doc(db, "townwalkReviews", id), {
    status,
    moderatedAt: sdk.serverTimestamp(),
  });
}
export async function loadReports() {
  await connect();
  if (!state.admin) throw Error("Không có quyền.");
  const s = await sdk.getDocs(
    sdk.query(
      sdk.collection(db, "townwalkReports"),
      sdk.orderBy("createdAt", "desc"),
      sdk.limit(100),
    ),
  );
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function resolveReport(id) {
  await connect();
  if (!state.admin) throw Error("Không có quyền.");
  await sdk.deleteDoc(sdk.doc(db, "townwalkReports", id));
}
export async function myReviews() {
  await connect();
  const u = requireUser();
  const s = await sdk.getDocs(
    sdk.query(
      sdk.collection(db, "townwalkReviews"),
      sdk.where("uid", "==", u.uid),
    ),
  );
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function deleteReview(r) {
  await connect();
  const u = requireUser();
  if (r.uid !== u.uid && !state.admin) throw Error("Không có quyền.");
  try {
    await sdk.deleteObject(sdk.ref(storage, r.photoPath));
  } catch (e) {
    if (e.code !== "storage/object-not-found") throw e;
  }
  await sdk.deleteDoc(sdk.doc(db, "townwalkReviews", r.id));
}
export async function myReports() {
  await connect();
  const u = requireUser();
  const s = await sdk.getDocs(
    sdk.query(
      sdk.collection(db, "townwalkReports"),
      sdk.where("uid", "==", u.uid),
    ),
  );
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function deleteAccount() {
  await connect();
  const u = requireUser();
  await sdk.reauthenticateWithPopup(u, new sdk.GoogleAuthProvider());
  await sdk.httpsCallable(functions, "deleteMyAccount")({});
  pendingReview = null;
  await sdk.signOut(auth);
}
export function friendlyError(e) {
  const c = e?.code || "";
  if (c === "functions/resource-exhausted")
    return "Bạn vừa đăng một bài. Chờ một phút rồi thử lại.";
  if (c === "functions/not-found")
    return "Chức năng máy chủ chưa được triển khai. Chủ trang cần triển khai Firebase Functions.";
  if (c.includes("popup-closed")) return "Bạn đã đóng cửa sổ đăng nhập.";
  if (c.includes("popup-blocked"))
    return "Trình duyệt đang chặn cửa sổ đăng nhập. Hãy cho phép popup rồi thử lại.";
  if (c.includes("unauthorized-domain"))
    return "Tên miền này chưa được thêm vào Firebase Authentication. Chủ trang cần cấu hình tên miền được phép.";
  if (c.includes("permission-denied") || c.includes("unauthorized"))
    return "Chưa có quyền truy cập dữ liệu. Kiểm tra tài khoản và Firebase Rules.";
  if (c.includes("failed-precondition"))
    return "Dữ liệu cần chỉ mục Firestore. Chủ trang hãy triển khai firestore.indexes.json.";
  if (c.includes("network") || c.includes("unavailable"))
    return "Chưa kết nối được Firebase. Kiểm tra mạng rồi thử lại.";
  return e?.message || "Chưa thực hiện được thao tác. Vui lòng thử lại.";
}
