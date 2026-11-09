# Discovery Lab and audio narration

Implemented 2026-11-09. Open `index.html#discovery` from the home discovery card or the artifact collection page.

## Two playable discoveries

- **Nandin ring — Gò Giồng Cát:** discovery year 2018, as recorded in the [heritage authority's article](https://vanhoaoceo.angiang.gov.vn/chiec-nhan-vang-nandin-giong-cat-bao-vat-quoc-gia-cua-van-hoa-oc-eo).
- **Buddha relief — Linh Sơn Bắc:** discovery year 2019, as recorded in the [heritage authority's article](https://vanhoaoceo.angiang.gov.vn/bao-vat-quoc-gia-phu-dieu-phat-linh-son-bac-dau-an-phat-giao-thoi-ky-som-trong-van-hoa-oc-eo).

The existing generated object illustrations are reused unchanged. See `PASS-ART-DIRECTION.md` for provenance. They are labelled illustrations, not documentary photographs, scans, or scientifically accurate reconstructions. The seeded earth textures, layer order, relative depth and tool gestures are invented for the game; none represents the stratigraphy of either excavation. No actual digging technique or field treatment is taught. The final view tilts a 2D illustration; it is not a 3D scan.

Pointer capture keeps dragging inside the game without scrolling the underlying page. The same canvases stay mounted through strokes. Area coverage, rather than gesture count, determines progress: repeatedly touching a cleared spot does not advance the game. There are two earth layers and one dust layer. A soft brush is required for dust. The assist button and Enter/Space on the scene provide the same area-based progression without dragging. Progress survives route changes in the current session; restarting/reloading begins a new dig. Only the two discovered-object IDs are retained under `oceo-discoveries-v1` in local storage. They never write to Firebase or to Pass/profile/check-in state.

Particles and inspection tilt respect reduced motion. Tool noise uses the existing opt-in sound control and starts muted. Navigating away releases the pointer; hiding the document also stops transient particles. Images that fail to load expose a retry state instead of awarding a discovery.

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
- `python3 tests/discovery_audio.py`: real mobile touch, unchanged canvas DOM, repeated-stroke behaviour, tool stages, both missions, isolated Pass state, actual MP3 playback/pause/seek/rate, navigation cleanup, language switching, narrow/desktop layouts and offline byte-range caching.
- Existing collection, gallery motion, directional header/bottom-bar, browser smoke and cache-upgrade checks remain relevant.

Browser tests block all non-local requests, including Firebase, and do not submit live visitor data. These checks do not replace testing the tactile experience and voice quality on physical iOS/Android devices.
