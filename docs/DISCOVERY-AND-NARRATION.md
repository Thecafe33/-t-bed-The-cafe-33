# Discovery Lab and audio narration

Implemented 2026-11-09. Open `index.html#discovery` from the home discovery card or the artifact collection page.

## Excavation field (10/11/2026 revision)

`index.html#discovery` is now a wide simulated trench instead of one object per screen. It still runs entirely in the browser, writes nothing to Firebase and never awards Pass stamps.

**Sites** (`assets/excavation-sites.js`):

| Site | Size | Finds |
| --- | --- | --- |
| Đô thị cổ Óc Eo | 7 × 9 m | Nandin ring, Gò Cây Trâm jar burial, glass beads from Gò Óc Eo, Lung Lớn and Gò Giồng Trôm |
| Núi Ba Thê – Linh Sơn | 7 × 9 m | Linh Sơn Bắc relief, terracotta Buddha head, Linh Sơn Nam jar burial, Linh Sơn Linga–Yoni |
| Bãi luyện tập tổng hợp | 10 × 12 m | All nine finds; labelled as a practice trench, not a real location |

Every find is one of the nine sourced cards in `artifacts.js`. Positions, depths, sizes and soil layers are simulated and random per run. Nothing on screen marks where a find is: there are no grid strings, coordinates or silhouettes. Players search freely. The field notebook keeps a square reference as a field-note detail only.

**Digging feel:** strokes follow the hand. Each stamp's edge wobbles with ground noise and per-stroke jitter, and removal is lumpy, so no two marks look alike. The renderer lights the height field from a direction that leans toward the finger. Pebbles, dark cavities at the foot of cuts and bright crumbly rims make depth readable. Clods in the colour of the layer being dug fly away from the stroke. The selected tool follows the finger and jerks with each scrape.

**Camera and navigation:** the trench is larger than the screen. Drag with the move tool or two fingers, pinch or scroll to zoom, or tap the minimap. The minimap shows only dug ground, the visible area and finds that are already exposed or recorded.

**Screen:** soil fills the whole screen. The camera is clamped inside the trench and the widest zoom still shows only soil. A bottom bar matches the app's tab bar: Sites (with a count badge), Notebook, a raised tool-basket button showing the current tool, Sieve and Guide. The header shows "Site 1/3". On a first visit, the site picker opens on its own, so players see every site before they start.

**Tool basket:** the basket button opens a woven basket of eight tools. Each tool shows the layer it works on. Picking a tool closes the basket. Tapping the field closes it too.

**Tools are limited to their soil band** (`TOOLS` in `assets/excavation-field.js`), so the kit must be used in order:

- **Shovel:** works only on the pale topsoil (depth 1 → 0.62) and stops at the dark layer.
- **Trowel:** works only on the dark culture layer (0.66 → 0.2). It cannot cut untouched topsoil and stops just above a find. On fragile gold it scratches near the surface.
- **Bamboo pick:** works only once you are near a find (≤ 0.4). It reaches the bottom without scratching.
- **Brush:** works only on the last thin layer (≤ 0.26).
- **Blower:** clears only dust on exposed surfaces (≤ 0.12).
- **Magnifier:** observes and never digs. Glass-bead glints are clearer under the lens.
- **Camera with scale bar:** records an exposed find (85% of its outline cleaned).
- **Sieve:** beads leave the trench in trowelled culture-layer soil and appear only after sieving.

A tool used in the wrong layer does nothing, gives a dull knock and shows a short hint about which tool to use.

**Sound** (`assets/dig-sound.js`): sounds are synthesised locally with Web Audio. They are on by default inside the game, with a mute button in the header (`oceo-dig-sound`). Nothing is created before the player touches the field. Sounds:

- different scrapes for shovel, trowel, pick, brush and blower;
- a dull knock for the wrong layer;
- a scratch;
- a rising marimba arpeggio with sparkle when a find appears, plus lime confetti;
- a shutter and chime when recording;
- glass twinkles for beads;
- a short fanfare when a site is complete.

Care points start at 100%. Each find can cost at most 12 points, so one slip does not end a run.

**Field notebook:** recorded finds become swipeable pages with the illustration, square, date, material, story, source note and the existing narration. A locked page counts finds still underground without naming them. Completing a site opens the notebook at the first page.

### Ground light and pebbles

The trench shader adds sunlight through the canopy: soft warm and cool patches fixed to the ground, seeded per run. It also scatters Voronoi pebbles, irregular rounded stones in a few cells with their own colours and domed lighting. The dappling is static so the field still redraws only on demand. The Canvas 2D fallback does not draw either effect.

### Wet sieving stream (online only)

Opening the sieve shows a forest stream where the sieve floats in the current. Shaking it, by dragging across the picture or pressing the button, jolts the frame, sends ripples across the water and washes a plume of silt downstream. Beads pop up on the mesh. A tap on the water drops a ripple. The scene lives in `assets/stream-sieve.js`. It is adapted, with phone-sized reductions, from a three.js "Forest Stream" scene supplied by the project owner.

- **three.js is not stored in this repository.** r128 (MIT) is loaded from `cdnjs.cloudflare.com` the first time the sieve opens. The service worker does not cache it, but the browser's HTTP cache may.
- **Offline:** the panel says "Tính năng cảnh suối cần mạng để tải tài nguyên" and the dry sieve works as before.
- **Mobile data or Data Saver** (`navigator.connection`, where the browser reports it): the scene asks before downloading (~600 KB), recommending Wi-Fi.
- **Load failure or missing WebGL features:** a retry note appears and the dry sieve stays. Without half-float render targets, the ripples are skipped.
- The scene renders only while the sieve panel is open and is destroyed on close. Reduced motion stops the butterfly, sway and camera drift.
- Loading from cdnjs exposes the visitor's IP address and user agent to Cloudflare. Mention this in the privacy page before production.

### Images

Four finds use the existing illustrations. `dau-phat-naga`, `mo-vo-linh-son-nam` and the three bead groups use drawn placeholders labelled "Hình tạm · ảnh sẽ được cập nhật". To add a picture:

1. Put a transparent WebP in `assets/heritage-art/`.
2. Set `image` for that find in `assets/excavation-sites.js`.

Missing or failed images fall back to the placeholder, so the game keeps working. To add more finds, add a sourced card to `artifacts.js`, then list it in `FINDS` and in a site.

### Rendering

`assets/excavation-renderer.js` draws the soil height field, up to 12 objects from one texture atlas, bead glints, scratches and the magnifier with WebGL. A Canvas 2D fallback keeps the game playable without WebGL. Objects are 2D illustrations, not 3D scans.

## Original narration

`assets/narration-scripts.js` contains 34 independently edited listening scripts: 25 curated places/stops and 9 artifacts, each in Vietnamese, English and Simplified Chinese. Scripts invite observation and explain context; they do not repeat the visible descriptions verbatim. Historic assertions are constrained to existing `content.js` and `artifacts.js` sources. Local café/food tips remain attributed as local suggestions; current service, prices and access should be checked. Unknown administrative records receive no unrelated automatic narration.

These are synthetic voices, labelled as such in the player:

| Language | Voice |
| --- | --- |
| Vietnamese | `vi-VN-HoaiMyNeural` |
| English | `en-GB-SoniaNeural` |
| Simplified Chinese | `zh-CN-XiaoxiaoNeural` |

The 102 MP3 files are first-party static assets (about 15 MiB total), compatible with GitHub Pages and the existing Firebase Hosting configuration. No browser TTS dependency, microphone permission, new account or external speech-service request is required for visitors. Native media controls support play/pause and seeking; a separate speed control and full transcript are provided. Only one narration plays at a time. Opening another detail, closing a detail, changing routes/language or hiding the document stops playback. There is no autoplay. UI effect muting is independent of explicitly playing narration.

Audio uses `preload="none"`. The service worker fetches a complete track only when requested, caches it opportunistically and serves HTTP byte ranges for seeking, including offline. Audio is excluded from the mandatory installation cache. Previously unplayed tracks still need a connection; storage eviction/cache upgrades can remove downloaded tracks. The transcript stays available with the cached app. A network failure exposes retry and transcript options.

### Updating audio

Edit the corresponding script, then run `tools/generate_narration.py` in a virtual environment with `edge-tts` installed and `ffmpeg`/`ffprobe` available. The script uses the inherited HTTPS proxy and CA trust. It synthesises only changed scripts, remuxes MP3s with a seek table without re-encoding, and records voice, duration, file size and script hash in `assets/audio/catalog.json`; failures leave the existing completed files intact. Review the resulting voice and pronunciation before production publication. No credentials are stored in the repository. Increment the service-worker version when publishing changed assets.

### Verification

- `node --test tests/narration.test.mjs`: catalogue coverage, unique IDs, all three languages, script hashes and MP3 file completeness.
- `node --test tests/excavation-field.test.mjs`: sourced configuration, non-overlapping placement, tool limits and damage, fragile finds, beads through the sieve, recording.
- `python3 tests/excavation_field.py`: full-viewport trench, pan/zoom/minimap, real touch digging, eight tools, sieve, camera records, notebook paging with narration, site switching, three languages, canvas fallback and placeholder images, offline route.
- Existing collection, gallery motion, directional header/bottom-bar, browser smoke and cache-upgrade checks remain relevant.

Browser tests block all non-local requests, including Firebase, and do not submit live visitor data. These checks do not replace testing the tactile experience and voice quality on physical iOS/Android devices.
