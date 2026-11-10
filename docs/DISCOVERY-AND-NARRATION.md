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

**Camera and navigation:** the trench is larger than the screen. Drag with the move tool or two fingers, pinch or scroll to zoom, or tap the minimap. The minimap shows only dug ground, the visible area and finds that are already exposed or recorded.

**Tools** (`assets/excavation-field.js`):

- **Shovel:** strips topsoil fast and stops at the dark culture layer. Shovelling on that floor over a buried find scratches it and costs care points.
- **Trowel:** scrapes thin layers. It stops just above a find's surface. On fragile finds (the gold ring), it scratches near the surface.
- **Bamboo pick:** small radius. Clears soil right against a find without damage.
- **Brush:** removes thin cover and dust only where the surface is already low.
- **Blower:** removes dust from exposed surfaces only.
- **Magnifier:** observes and never digs. Glass-bead glints show in the culture layer and are clearer under the lens.
- **Camera with scale bar:** records an exposed find (85% of its outline cleaned) into the notebook.
- **Sieve:** excavated soil fills a bucket. Beads leave the trench inside that soil and appear only after the bucket has been shaken through the sieve.

Care points start at 100%. Each find can cost at most 12 points, so one slip does not end a run.

**Field notebook:** recorded finds become swipeable pages with the illustration, square, date, material, story, source note and the existing narration. A locked page counts finds still underground without naming them. Completing a site opens the notebook at the first page.

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
