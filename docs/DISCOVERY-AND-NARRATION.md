# Discovery Lab and audio narration

Implemented 2026-11-09. Open `index.html#discovery` from the home discovery card or the artifact collection page.

## Two playable discoveries

- **Nandin ring — Gò Giồng Cát:** discovery year 2018, as recorded in the [heritage authority's article](https://vanhoaoceo.angiang.gov.vn/chiec-nhan-vang-nandin-giong-cat-bao-vat-quoc-gia-cua-van-hoa-oc-eo).
- **Buddha relief — Linh Sơn Bắc:** discovery year 2019, as recorded in the [heritage authority's article](https://vanhoaoceo.angiang.gov.vn/bao-vat-quoc-gia-phu-dieu-phat-linh-son-bac-dau-an-phat-giao-thoi-ky-som-trong-van-hoa-oc-eo).

The existing generated object illustrations are reused unchanged. See `PASS-ART-DIRECTION.md` for provenance. They are labelled illustrations, not documentary photographs, scans, or scientifically accurate reconstructions. The soil texture and depth model are fictitious, not the stratigraphy of either site.

### Free exploration (09/11/2026 revision)

The field fills the browser viewport, including on mobile. App header and bottom navigation are hidden only on this route; an explicit exit returns to the artifact page. Browser Back, route exit, orientation changes and native dialog dismissal are covered by tests. Body scrolling is locked during play and restored on exit. Help and the discovered-object record open only when requested.

The player starts with no selected tool. Trowel, brush and magnifier are available throughout the session; none is locked behind a prescribed global stage. Every patch has its own remaining soil depth and dust. A trowel loosens soil but stops short of a buried object's surface; a brush clears a thin covering once exposed. A wrong tool produces a physical response without automatically switching tools or presenting the answer. The magnifier enlarges the visible surface; it does not see through soil. Keyboard arrows and Space use the currently selected tool at the current cursor. The assist action never auto-targets an object or chooses the correct tool. Optional hints are inside Help and require a separate click.

A new run chooses a hidden artifact and a different off-centre location, size and rotation. No object selector, name, silhouette marker or progress bar reveals the answer in advance. Discovery requires cleaning at least 88% of the object's alpha-mask area, not the entire field or a count of clicks. Dirt outside the object cannot earn a find. Work can continue after discovery; no automatic scene wipe removes the remaining ground. Reload begins a new run; only previously discovered IDs are retained under `oceo-discoveries-v1`. They never write to Firebase or Pass/check-in state.

The main renderer uses a GPU-lit height field: local surface normals, recessed edges, directional shadows, pebbles, illustration shadows, and a movable magnifier. Object textures use mipmaps to reduce shimmer. Only changed terrain data is uploaded, the render resolution is capped, and animation stops when idle/hidden. The artifact itself is still a 2D illustration, not a rotating 3D scan. A CPU canvas renderer keeps the same gameplay available without WebGL or after context loss. Rotation reprojects worked ground and the collision mask together. Reduced motion disables flying particles, and brush sounds retain the existing opt-in sound setting.

Images that fail to load expose a retry state instead of awarding a discovery. Outside the simulation, the app continues to advise following site instructions and not digging or cleaning objects independently.

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
- `node --test tests/discovery-field.test.mjs`: tool suitability, spatial excavation, discovery thresholds, changing placement and rotation reprojection.
- `python3 tests/discovery_audio.py`: full-screen mobile touch, freely chosen tools, optional hints, unchanged canvas DOM, isolated Pass state, actual narration, navigation/rotation cleanup, three languages, canvas fallback, retry and offline caching.
- Existing collection, gallery motion, directional header/bottom-bar, browser smoke and cache-upgrade checks remain relevant.

Browser tests block all non-local requests, including Firebase, and do not submit live visitor data. These checks do not replace testing the tactile experience and voice quality on physical iOS/Android devices.
