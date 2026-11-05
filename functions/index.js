import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
initializeApp({ storageBucket: "chitieucanhan-33.firebasestorage.app" });
const db = getFirestore(),
  bucket = getStorage().bucket();
const options = {
  region: "asia-southeast1",
  maxInstances: 10,
  timeoutSeconds: 120,
  memory: "256MiB",
};
const policyVersion = "2026-11-04";
export const publishReview = onCall(options, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Cần đăng nhập.");
  const { id, name, text, rating, policyVersion: consent } = request.data || {},
    uid = request.auth.uid;
  if (
    typeof id !== "string" ||
    !/^[a-zA-Z0-9]{20}$/.test(id) ||
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 60 ||
    typeof text !== "string" ||
    !text.trim() ||
    text.length > 1200 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    consent !== policyVersion
  )
    throw new HttpsError(
      "invalid-argument",
      "Kiểm tra nội dung, ảnh và phiên bản đồng ý.",
    );
  const config = await db.doc("sites/oceotownwalk-v2").get();
  if (!config.exists || !config.data().operator || !config.data().contactEmail)
    throw new HttpsError(
      "failed-precondition",
      "Đơn vị vận hành chưa hoàn thiện chính sách bảo mật.",
    );
  const reviewRef = db.doc(`townwalkReviews/${id}`),
    existing = await reviewRef.get();
  if (existing.exists) {
    if (existing.data().uid !== uid)
      throw new HttpsError("permission-denied", "Mã bài đã được sử dụng.");
    return { id };
  }
  const path = `townwalkReviews/${uid}/${id}/photo.jpg`,
    file = bucket.file(path);
  let metadata;
  try {
    [metadata] = await file.getMetadata();
  } catch {
    throw new HttpsError(
      "failed-precondition",
      "Cần tải lên ít nhất một ảnh trước khi đăng đánh giá.",
    );
  }
  if (
    metadata.contentType !== "image/jpeg" ||
    Number(metadata.size) <= 0 ||
    Number(metadata.size) >= 2 * 1024 * 1024 ||
    metadata.metadata?.owner !== uid
  )
    throw new HttpsError("invalid-argument", "Ảnh tải lên không hợp lệ.");
  let clean;
  try {
    const [raw] = await file.download();
    clean = await sharp(raw, { limitInputPixels: 25000000 })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 82 })
      .toBuffer();
  } catch {
    throw new HttpsError(
      "invalid-argument",
      "Ảnh không giải mã được hoặc quá nhiều điểm ảnh.",
    );
  }
  const token =
    metadata.metadata?.firebaseStorageDownloadTokens?.split(",")[0] ||
    randomUUID();
  // Decode/re-encode on the trusted server too; client-side EXIF stripping alone is not a guarantee.
  await file.save(clean, {
    metadata: {
      contentType: "image/jpeg",
      metadata: { owner: uid, firebaseStorageDownloadTokens: token },
    },
  });
  const photoURL = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket.name)}/o/${encodeURIComponent(path)}?alt=media&token=${encodeURIComponent(token)}`;
  const limitRef = db.doc(`townwalkLimits/${uid}`);
  await db.runTransaction(async (tx) => {
    const [review, rate] = await Promise.all([
      tx.get(reviewRef),
      tx.get(limitRef),
    ]);
    if (review.exists) {
      if (review.data().uid !== uid)
        throw new HttpsError("permission-denied", "Mã bài đã được sử dụng.");
      return;
    }
    const last = rate.data()?.lastReviewAt;
    if (last && Date.now() - last.toMillis() < 60000)
      throw new HttpsError(
        "resource-exhausted",
        "Bạn vừa đăng một bài. Chờ một phút trước khi chia sẻ tiếp nhé.",
      );
    tx.create(reviewRef, {
      uid,
      name: name.trim(),
      text: text.trim(),
      rating,
      photoPath: path,
      photoURL,
      status: "published",
      policyVersion,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.set(limitRef, { lastReviewAt: Timestamp.now() });
  });
  return { id };
});
export const deleteMyAccount = onCall(
  { ...options, timeoutSeconds: 300 },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "Cần đăng nhập.");
    const uid = request.auth.uid;
    const authenticatedAt = Number(request.auth.token?.auth_time);
    if (
      !Number.isFinite(authenticatedAt) ||
      Date.now() / 1000 - authenticatedAt > 300
    )
      throw new HttpsError(
        "failed-precondition",
        "Cần xác thực Google lại trước khi xóa tài khoản.",
      );
    // Remove orphan uploads too. Keep the Auth account until the data operations finish,
    // so a partial failure can be retried by the same owner.
    await bucket.deleteFiles({
      prefix: `townwalkReviews/${uid}/`,
      force: true,
    });
    for (const collection of ["townwalkReviews", "townwalkReports"]) {
      const snap = await db
        .collection(collection)
        .where("uid", "==", uid)
        .get();
      const writer = db.bulkWriter();
      const deletions = snap.docs.map((doc) => writer.delete(doc.ref));
      await Promise.all([writer.close(), ...deletions]);
    }
    await Promise.all([
      db.doc(`townwalkProfiles/${uid}`).delete(),
      db.doc(`townwalkLimits/${uid}`).delete(),
    ]);
    await getAuth().deleteUser(uid);
    return { deleted: true };
  },
);
