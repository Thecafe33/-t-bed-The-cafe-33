#!/usr/bin/env python3
"""Build static, first-party narration. Requires edge-tts, ffmpeg and ffprobe.

Run in a virtual environment; no TTS service is contacted by visitors.
Existing tracks are reused only when the editorial script and voice match.
"""
import asyncio
import hashlib
import json
import os
from pathlib import Path
import subprocess
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'assets/audio'
VOICES = {'vi': 'vi-VN-HoaiMyNeural', 'en': 'en-GB-SoniaNeural', 'zh': 'zh-CN-XiaoxiaoNeural'}
if os.environ.get('SSL_CERT_FILE'):
    edge_tts.communicate._SSL_CTX.load_verify_locations(os.environ['SSL_CERT_FILE'])
rows = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import{NARRATION_SCRIPTS}from'./assets/narration-scripts.js';console.log(JSON.stringify(NARRATION_SCRIPTS))"], cwd=ROOT))
manifest_path = DEST / 'catalog.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}

async def main():
    gate = asyncio.Semaphore(3)
    async def build(row, language, index):
        key = f'{language}/{row[0]}-{row[1]}'
        path = DEST / f'{key}.mp3'
        text, voice = row[index + 2], VOICES[language]
        signature = hashlib.sha256((voice + '|-5%|' + text).encode()).hexdigest()
        unchanged = path.exists() and manifest.get(key, {}).get('scriptHash') == signature
        if unchanged and manifest[key].get('audioFormat') == 'mp3-xing-v1':
            return
        async with gate:
            path.parent.mkdir(parents=True, exist_ok=True)
            temp = path.with_suffix('.tmp.mp3')
            if not unchanged:
                await asyncio.wait_for(edge_tts.Communicate(text, voice, rate='-5%',
                    proxy=os.environ.get('HTTPS_PROXY')).save(str(temp)), timeout=90)
            # Raw speech streams lack a seek table. Remux without re-encoding so
            # mobile browsers know the duration and can seek before all bytes load.
            ready = path.with_suffix('.ready.mp3')
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                '-i', str(path if unchanged else temp), '-c:a', 'copy', '-write_xing', '1',
                '-map_metadata', '-1', str(ready)], check=True)
            duration = float(subprocess.check_output(['ffprobe', '-v', 'error',
                '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(ready)]))
            if duration < 5 or ready.stat().st_size < 5000:
                raise ValueError(f'Incomplete narration: {key}')
            ready.replace(path)
            temp.unlink(missing_ok=True)
            manifest[key] = {'voice': voice, 'scriptHash': signature,
                'audioFormat': 'mp3-xing-v1',
                'duration': round(duration, 2), 'bytes': path.stat().st_size}
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
            print(f'{key}: {duration:.1f}s', flush=True)
    results = await asyncio.gather(*(build(row, lang, i) for row in rows
        for i, lang in enumerate(VOICES)), return_exceptions=True)
    errors = [str(r) for r in results if isinstance(r, BaseException)]
    if errors:
        raise RuntimeError('\n'.join(errors))
    print(f'Validated {len(manifest)} narration tracks.')

if __name__ == '__main__':
    asyncio.run(main())
