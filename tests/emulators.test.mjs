import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getBytes, deleteObject } from "firebase/storage";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { createRequire } from "node:module";
const sharp = createRequire(
  new URL("../functions/package.json", import.meta.url),
)("sharp");
const project = "demo-oceo-townwalk";
if (
  !process.env.FIRESTORE_EMULATOR_HOST ||
  !process.env.FIREBASE_STORAGE_EMULATOR_HOST ||
  !process.env.FIREBASE_AUTH_EMULATOR_HOST
)
  throw Error(
    "Emulator-only tests refuse to run without all local emulator environment variables.",
  );
const env = await initializeTestEnvironment({
  projectId: project,
  firestore: {
    host: "127.0.0.1",
    port: 8085,
    rules: await readFile("firestore.rules", "utf8"),
  },
  storage: {
    host: "127.0.0.1",
    port: 9199,
    rules: await readFile("storage.rules", "utf8"),
  },
});
const owner = env.authenticatedContext("owner", {
    email: "owner@example.test",
    email_verified: true,
  }),
  other = env.authenticatedContext("other", {
    email: "other@example.test",
    email_verified: true,
  }),
  admin = env.authenticatedContext("admin", {
    email: "vulpoz.com@gmail.com",
    email_verified: true,
  }),
  anon = env.unauthenticatedContext();
const ownerDb = owner.firestore(),
  otherDb = other.firestore(),
  adminDb = admin.firestore(),
  anonDb = anon.firestore();
const ownerStorage = owner.storage(),
  otherStorage = other.storage(),
  anonStorage = anon.storage();
const profile = {
  name: "Bạn Óc Eo",
  badges: [],
  policyVersion: "2026-11-04",
  updatedAt: serverTimestamp(),
};
const config = {
  schemaVersion: 2,
  places: [],
  stops: [],
  itinerary: [],
  radius: 150,
  operator: "Emulator fixture",
  contactEmail: "privacy@example.test",
};
let client;
test("configuration and private profiles enforce roles and ownership", async () => {
  await assertFails(setDoc(doc(anonDb, "sites/oceotownwalk-v2"), config));
  await assertFails(setDoc(doc(ownerDb, "sites/oceotownwalk-v2"), config));
  await assertSucceeds(setDoc(doc(adminDb, "sites/oceotownwalk-v2"), config));
  await assertSucceeds(getDoc(doc(anonDb, "sites/oceotownwalk-v2")));
  await assertSucceeds(setDoc(doc(ownerDb, "townwalkProfiles/owner"), profile));
  await assertFails(getDoc(doc(otherDb, "townwalkProfiles/owner")));
  await assertFails(setDoc(doc(ownerDb, "townwalkProfiles/other"), profile));
  await assertFails(
    setDoc(doc(ownerDb, "townwalkProfiles/owner"), {
      ...profile,
      role: "admin",
    }),
  );
});
test("public readers see only published reviews, direct creation and owner moderation are blocked", async () => {
  await env.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), "townwalkReviews/fixture"), {
      uid: "owner",
      status: "published",
      name: "Fixture",
      text: "Test",
      rating: 5,
      photoPath: "townwalkReviews/owner/fixture/photo.jpg",
    });
  });
  await assertSucceeds(getDoc(doc(anonDb, "townwalkReviews/fixture")));
  await assertFails(
    setDoc(doc(ownerDb, "townwalkReviews/direct"), {
      uid: "owner",
      status: "published",
    }),
  );
  await assertFails(
    updateDoc(doc(ownerDb, "townwalkReviews/fixture"), {
      status: "hidden",
      moderatedAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(
    updateDoc(doc(adminDb, "townwalkReviews/fixture"), {
      status: "hidden",
      moderatedAt: serverTimestamp(),
    }),
  );
  await assertFails(getDoc(doc(anonDb, "townwalkReviews/fixture")));
  await assertSucceeds(getDoc(doc(ownerDb, "townwalkReviews/fixture")));
  await assertSucceeds(
    getDocs(
      query(
        collection(anonDb, "townwalkReviews"),
        where("status", "==", "published"),
      ),
    ),
  );
});
test("reports are bounded and private to sender/admin", async () => {
  const r = {
    uid: "owner",
    reviewId: "fixture",
    reason: "Kiểm thử",
    createdAt: serverTimestamp(),
  };
  await assertSucceeds(
    setDoc(doc(ownerDb, "townwalkReports/fixture_owner"), r),
  );
  await assertFails(getDoc(doc(otherDb, "townwalkReports/fixture_owner")));
  await assertSucceeds(getDoc(doc(adminDb, "townwalkReports/fixture_owner")));
  await assertFails(setDoc(doc(otherDb, "townwalkReports/fixture_owner"), r));
});
test("image rules enforce owner path, immutable uploads, JPEG type and size", async () => {
  const bytes = new Uint8Array([255, 216, 255, 217]);
  await assertFails(
    uploadBytes(ref(anonStorage, "townwalkReviews/owner/a/photo.jpg"), bytes, {
      contentType: "image/jpeg",
    }),
  );
  await assertFails(
    uploadBytes(ref(otherStorage, "townwalkReviews/owner/a/photo.jpg"), bytes, {
      contentType: "image/jpeg",
    }),
  );
  await assertFails(
    uploadBytes(ref(ownerStorage, "townwalkReviews/owner/a/photo.jpg"), bytes, {
      contentType: "image/png",
    }),
  );
  await assertSucceeds(
    uploadBytes(ref(ownerStorage, "townwalkReviews/owner/a/photo.jpg"), bytes, {
      contentType: "image/jpeg",
    }),
  );
  await assertFails(
    uploadBytes(
      ref(ownerStorage, "townwalkReviews/owner/a/photo.jpg"),
      new Uint8Array([255, 216, 255, 218, 217]),
      { contentType: "image/jpeg" },
    ),
  );
  await assertFails(
    uploadBytes(
      ref(ownerStorage, "townwalkReviews/owner/big/photo.jpg"),
      new Uint8Array(2 * 1024 * 1024),
      { contentType: "image/jpeg" },
    ),
  );
  await assertSucceeds(
    deleteObject(ref(ownerStorage, "townwalkReviews/owner/a/photo.jpg")),
  );
});
test("trusted review function verifies actual images, publishes immediately, is idempotent and rate-limited", async () => {
  client = initializeApp(
    {
      apiKey: "fake-api-key",
      projectId: project,
      storageBucket: "chitieucanhan-33.firebasestorage.app",
    },
    "callable-test",
  );
  const auth = getAuth(client);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  await createUserWithEmailAndPassword(
    auth,
    "visitor@example.test",
    "only-a-local-fixture-password",
  );
  const db = getFirestore(client);
  connectFirestoreEmulator(db, "127.0.0.1", 8085);
  const storage = getStorage(client);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  const functions = getFunctions(client, "asia-southeast1");
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  const publish = httpsCallable(functions, "publishReview", { timeout: 15000 }),
    uid = auth.currentUser.uid;
  const payload = {
    id: "abcdefghijklmnopqrst",
    name: "Bạn Óc Eo",
    text: "Bài kiểm thử emulator, không ghi lên dự án thật.",
    rating: 5,
    policyVersion: "2026-11-04",
  };
  await assert.rejects(
    publish(payload),
    (e) => e.code === "functions/failed-precondition",
  );
  await uploadBytes(
    ref(storage, `townwalkReviews/${uid}/${payload.id}/photo.jpg`),
    new Uint8Array([255, 216, 255, 217]),
    { contentType: "image/jpeg", customMetadata: { owner: uid } },
  );
  await assert.rejects(
    publish(payload),
    (e) => e.code === "functions/invalid-argument",
  );
  await deleteObject(
    ref(storage, `townwalkReviews/${uid}/${payload.id}/photo.jpg`),
  );
  const jpeg = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#c9dca0" },
  })
    .jpeg()
    .toBuffer();
  await uploadBytes(
    ref(storage, `townwalkReviews/${uid}/${payload.id}/photo.jpg`),
    jpeg,
    { contentType: "image/jpeg", customMetadata: { owner: uid } },
  );
  const first = await publish(payload);
  assert.equal(first.data.id, payload.id);
  const saved = await getDoc(doc(db, "townwalkReviews", payload.id));
  assert.equal(saved.data().status, "published");
  const second = await publish(payload);
  assert.equal(second.data.id, payload.id);
  const next = { ...payload, id: "bcdefghijklmnopqrstu" };
  await uploadBytes(
    ref(storage, `townwalkReviews/${uid}/${next.id}/photo.jpg`),
    jpeg,
    { contentType: "image/jpeg", customMetadata: { owner: uid } },
  );
  await assert.rejects(
    publish(next),
    (e) => e.code === "functions/resource-exhausted",
  );
  await setDoc(doc(db, "townwalkProfiles", uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  });
  await httpsCallable(functions, "deleteMyAccount", { timeout: 20000 })({});
  await assert.rejects(
    signInWithEmailAndPassword(
      auth,
      "visitor@example.test",
      "only-a-local-fixture-password",
    ),
  );
  await env.withSecurityRulesDisabled(async (c) => {
    const adb = c.firestore();
    assert.equal(
      (await getDoc(doc(adb, "townwalkReviews", payload.id))).exists(),
      false,
    );
    assert.equal(
      (await getDoc(doc(adb, "townwalkProfiles", uid))).exists(),
      false,
    );
  });
});
test.after(async () => {
  if (client) await deleteApp(client);
  await env.cleanup();
});
