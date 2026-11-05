# Óc Eo Townwalk

A phone-first Vietnamese heritage guide with five separate screens, source-backed archaeology stories, real OpenStreetMap locations and an animated **Óc Eo Pass**.

## Run and rebuild

```sh
python3 tools/dev_server.py
```

The static browser build, fonts, open-license photos, Leaflet and Firebase SDK are included. `/admin` and `/privacy` work through the helper. Root tooling/tests require Node 24.12+; deployed Cloud Functions target Node 22. To reproduce dependencies and rebuild:

```sh
npm ci
npm ci --prefix functions
npm run build:sdk
npm test
npm run test:functions
npm run test:firebase
```

`test:firebase` uses only the `demo-oceo-townwalk` local emulators (Auth, Firestore, Storage, Functions). Tests refuse to run without the local emulator variables. No production Firebase write or deployment is performed. See [Firebase deployment guide](docs/FIREBASE.md) before any deployment; shared project rules must be merged, not blindly replaced.

## GitHub Pages / subdirectory preview

The same files work at the domain root (Firebase) or under a project directory such as `https://thecafe33.github.io/-t-bed-The-cafe-33/index.html`. HTML assets are relative, local images are resolved from the app directory, and the manifest/Service Worker keep the project scope. Open `admin.html` and `privacy.html` on GitHub Pages; the extensionless aliases require Firebase or the development helper.

To reproduce a project-prefix preview locally:

```sh
python3 tools/dev_server.py --port 8001 --base-path /-t-bed-The-cafe-33
```

Open `http://localhost:8001/-t-bed-The-cafe-33/index.html`. `python3 tests/subdirectory_preview.py` starts its own isolated prefixed server and checks styles, scripts, images, fonts, PNG export, secondary pages and offline reload. Do not open the HTML via `file://`; ES modules and service workers require HTTP(S).

## What is implemented

- Vietnamese, English and Simplified Chinese for the public app, source/access guidance, privacy page and downloaded Pass; native place names and visitor-written text stay unchanged. Language choice is stored on this device. Local Chinese font subsets ship with their source licence and rebuild script.
- Short tab reveals, a restrained Pass-cover transition and earned-stamp motion respect reduced-motion preferences. Optional quiet paper/check-in tones use local Web Audio, start muted and only play after interaction; no audio request, microphone or ambient playback.
- A bold Óc Eo postcard cover, three source-linked curiosity cards and a non-repeating surprise destination encourage discovery. The map uses on-canvas search/category controls, numbered clusters (Leaflet.markercluster 1.5.3, MIT), pin preview cards, a collapsible full directory, fit-all and explicit opt-in nearby search. Returning to the map preserves its chosen point and zoom. Nearby distances are straight-line, GPS stays in memory and never grants a stamp by itself.
- Separate Explore, Map, Day Plan, Pass and Community views; persistent readable pill navigation; browser history, deep links and retained search/map/draft state. Larger screens retain a narrow app layout.
- Sixteen destination records: fourteen heritage records, the Óc Eo culture exhibition house and an optional former exhibition building on Ba Thê. Each has source links, a short story and an observation prompt; the summit entry separates published architectural background from the owner-supplied condition report. Five archaeological OSM area positions plus the OSM exhibition-house point and Linh Sơn Bắc from a publicly displayed Plus Code; unresolved records have no invented pin. [Source register](docs/SOURCES.md) explains selection, names, grouping and geographic limits.
- Real photos with open-license credit for Gò Cây Thị, Linh Sơn Nam, chùa Linh Sơn and Ba Thê; locally hosted fonts and SDK. Neither the flower mark nor illustration is an official heritage logo.
- Search with Vietnamese accent normalization and aliases; filters by Ba Thê/ancient-city group; a local list of places to visit; direct place sharing.
- Practical preparation, visitor contact, a suggested day plan and sourced map links. Time windows are editorial estimates; current opening/access conditions, food businesses and transport schedules have not been field-verified.
- Nine stop/food entries, including featured The cafe 33 (Cafe in bed with advance website booking), XOFA (Sữa Gạo Phù Nam from 25K), Phượng Sang and Út Mập stays, and three local food tips. Three business pins derive from public Plus Codes displayed on their Google Maps listings, decoded with Open Location Code; OSM sources stay attributed separately. Ratings, reviews and photographs from Google Maps are not copied. Relative food landmarks are listed without invented pins.
- Guest Pass stored locally, optional mountain detours excluded from stamp completion, a full collection of fifteen heritage stamps independent of coordinate readiness, opt-in GPS stamps at the seven currently located heritage destinations, one-tap named 1080×1920 story PNG download at any progress and native sharing once a stamp has been earned. Unvisited destinations appear in a separate text inventory, never as pretend stamps. The bold poster uses perforated stickers, individual destination icons, embedded local fonts, an original Ba Thê illustration and the message “Chạm di sản. Chia sẻ Óc Eo.” GPS-ready and completed-collection counts are distinct; the nearby Linh Sơn sites use smaller per-point radii. No continuous location tracking or coordinate storage. GPS is client-checked and spoofable; the Pass is a personal souvenir, not official certification or proof for prizes.
- Google login, profile sync, photo-required reviews published immediately, post-publication reports/moderation, exports, owner review deletion and account deletion. Visitor sign-in/posting remain closed until the real operator and privacy email are configured in admin. Younger visitors can browse as guests; no guardian-consent workflow is implemented.
- A trusted callable verifies actual image existence, ownership and successful decoding, then re-encodes it to remove metadata before publication. Direct review creation is denied by rules. It supports idempotent retries and one post per minute.
- Account deletion requires fresh authentication and removes uploads (including orphaned uploads), reviews, reports, profile, rate-limit record and finally Auth. Per-document deletion failures are propagated so the Auth account remains available for retry.
- Admin preview, structured content/coordinate/image-credit editing, itinerary reordering, configuration import/export, late moderation and privacy settings. New data uses `sites/oceotownwalk-v2`; the legacy document is not auto-migrated or overwritten.
- Installable app manifest and public app-shell caching. Previously loaded public text/assets can be read offline; account/API responses and OSM tiles are not cached. Offline state and fallback navigation are explicit.

## Validation and review

```sh
python3 tests/browser_smoke.py
python3 tests/browser_journeys.py
python3 tests/mobile_personas.py
python3 tests/extra_destinations.py
python3 tests/pass_and_stops.py
python3 tests/pass_checkins.py
python3 tests/languages_and_effects.py
python3 tests/discover_and_map.py
```

These need the local server on port 8000, Python Playwright and `/usr/bin/chromium`. The first tests mobile navigation, layout, source/search behavior and admin validation with external requests blocked; the second substitutes only the cloud transport for deterministic GPS, Pass PNG, photo-required review and report journeys. Neither is a real Google OAuth test.

The local Firebase emulator suite exercises rules and callable behavior: unauthorized configuration writes, private profiles/reports, public vs hidden reviews, immutable/type/size-limited images, rejected missing/invalid photos, immediate legitimate publication, duplicate/rate behavior and account deletion. These checks demonstrate local backend behavior, not production deployment.

See [multi-perspective review](docs/GENZ-REVIEW.md) and [work rounds](docs/WORK-ROUNDS.md). They are heuristic walkthroughs with explicit test scenarios, not interviews with real Gen Z participants. No background task is scheduled after chat completion.

## Remaining activation steps

The real operator identity/privacy contact, Firebase billing/provider/domain setup, merge of shared production rules/indexes and an explicitly authorized deployment still require owner action. Current site opening hours, entrances and business operations need field confirmation. The repository is not the official site of Ban Quản lý and the privacy draft is not legal certification. The static app is published on GitHub Pages. No production Firebase deployment has been performed by this task.
