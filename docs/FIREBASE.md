# Firebase activation and operations

The existing project is `chitieucanhan-33`, Hosting target `oceo` maps to `oceotownwalk`, and Storage bucket is `chitieucanhan-33.firebasestorage.app`. These identifiers and the web API key are public client configuration, not server credentials. Use existing authenticated Firebase CLI/Google Cloud access; never paste service-account credentials into the HTML.

## What must be configured

1. Enable Google as a sign-in provider in Firebase Authentication. Add the actual Hosting/custom domains, and add localhost explicitly if local OAuth is needed. OAuth popups require a user gesture and an authorized domain.
2. Inspect the existing Firestore/Storage rules and indexes in the Firebase console or existing deployment sources. **Merge** the new collection/path rules and index with unrelated existing project rules. The repository's rule files are intentionally closed by default and would otherwise deny legacy `sites/oceotownwalk` and `oceotownwalk/` paths. Do not overwrite other apps' rules or indexes blindly.
3. Both the client and rule files use the previously configured admin email `vulpoz.com@gmail.com`, requiring a verified email. Confirm it is the intended owner. Changing ownership requires updating the protected rules and client constant together. Client checks alone never authorize a write. Consider custom claims for a larger admin team.
4. Cloud Functions use Node 22 in `asia-southeast1`. Functions deployment and the project's Storage plan require suitable billing (typically Blaze) and enabled Google Cloud APIs. Confirm cost/budget settings; hosting this code alone does not activate the backend. Callable endpoints are `publishReview` and `deleteMyAccount`. Do not replace them with public unauthenticated HTTP write endpoints.
5. Set up Firestore and Storage only in regions approved by the operator. Existing data location cannot be inferred from the source. Review international data-transfer requirements and the privacy notice with the actual operator; the policy text is a functional starting point, not legal certification.
6. Start admin, sign in, verify source URLs and exact coordinates against official post-merger boundaries, and enter the real operator name/contact email. The first explicit save creates `sites/oceotownwalk-v2`; no automatic migration of old or unverified content occurs.

## Deployment commands (not executed in this task)

Use a current supported Firebase CLI and existing authenticated access. After merging rules/indexes and reviewing the deployment diff:

```sh
npm ci
npm run build:sdk
npm ci --prefix functions
firebase deploy --project chitieucanhan-33 --only firestore:rules,firestore:indexes,storage,functions:townwalk
firebase deploy --project chitieucanhan-33 --only hosting:oceo
```

Review the current CLI's `--only` syntax for codebase selection; `functions:townwalk` is the configured codebase. Do not deploy until the rules merge and tests are complete. Publishing Hosting replaces the current public pages; the old tracked versions can be retrieved from Git history.

`firebase.json` excludes docs, tests, tooling, dependency manifests, server functions, rule files, the legacy standalone `Thecafe33` file and build-entry sources from Hosting. Vendor bundles, fonts and their licenses are public assets. Security headers disable third-party framing and restrict geolocation to the site itself. TLS and provider checks must remain enabled.

## Collections and permissions

| Path                                           | Read                                    | Write                                                                                |
| ---------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| `sites/oceotownwalk-v2`                        | public                                  | verified admin only                                                                  |
| `townwalkProfiles/{uid}`                       | owner only                              | owner only, bounded name and stamp list                                              |
| `townwalkReviews/{id}`                         | published: public; hidden: author/admin | create only by trusted function; admin changes visibility only; author/admin deletes |
| `townwalkReports/{reviewId_uid}`               | sender/admin                            | sender creates once; sender/admin deletes                                            |
| `townwalkLimits/{uid}`                         | server only                             | server only                                                                          |
| Storage `townwalkReviews/{uid}/{id}/photo.jpg` | public, consent required                | owner uploads JPEG <2 MB, cannot overwrite; owner/admin deletes                      |

Download-token image URLs can remain usable after a review is hidden. Delete the image to remove access; people may already have downloaded copies. The account-deletion function deletes original objects too. Reviews/exports do not expose account email. Profile/limits data is not publicly readable.

Location stamps are visitor souvenirs, verified on-device, and can be manipulated by a technical user or spoofed GPS. They must not be marketed as tamper-proof proof of attendance, official certificates, or used for prizes with value. Adding server-signed issuance and a physical QR/host validation process would be a separate feature.

## Verification before public release

- Run Firestore and Storage emulator rule tests: anonymous writes denied; non-admin configuration writes denied; published reviews readable; hidden reviews not publicly readable; owners cannot change visibility or directly create reviews; profiles/reports isolated by UID; image type/size/path limits hold.
- Test the callable function with a missing photo, an invalid JPEG, another user's photo path, one legitimate photo, repeated same ID, posting-rate limit and expired auth. Only the legitimate, verified image flow should publish. The Admin SDK bypasses rules; function tests are essential.
- Test a real Google login on the intended domain, profile synchronization across two devices, actual Storage upload/download, immediate review visibility, report/late moderation, owner deletion and full account deletion.
- Confirm rules don't break other apps in this shared project and indexes have finished building.
- Verify all production location sources, post-merger inclusion, exact pin entrances, opening hours, safety/access instructions and photo permissions with the local heritage authority. Admin UI confirmation does not replace that work.
- Confirm privacy contact works, retention/backups and international transfers are documented, and the operator's legal review is complete.

Network access and official source research now work. `npm run test:firebase` runs local Auth/Firestore/Storage/Functions emulators and verifies rules plus callable behavior, including real image decoding, publication and deletion. UI fixture tests and emulator tests use no live writes. Production deployment, Google OAuth on the intended domain and production end-to-end verification remain outstanding.

## Network destinations

The browser needs `tile.openstreetmap.org`, the project's `*.firebaseapp.com` auth handler, `accounts.google.com`, `apis.google.com`, Firebase Auth/Firestore/Storage Google APIs and `asia-southeast1-chitieucanhan-33.cloudfunctions.net`. The SDK and fonts themselves are local. Cloud research/emulator destinations were saved in the environment draft; a saved draft is not proof that the running policy was updated.
