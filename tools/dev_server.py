#!/usr/bin/env python3
"""Static preview with Firebase aliases and an optional GitHub Pages-style directory prefix."""
import argparse
import io
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, unquote, quote
ROOT = Path(__file__).resolve().parent.parent
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, base_path='', **kwargs):
        self.base_path = base_path
        super().__init__(*args, **kwargs)
    def permitted(self):
        path = unquote(urlsplit(self.path).path)
        if any(p.startswith('.') for p in PurePosixPath(path).parts):
            self.send_error(404)
            return False
        if self.base_path and not (path == self.base_path or path.startswith(self.base_path + '/')):
            self.send_error(404)
            return False
        if self.base_path and path == self.base_path:
            self.send_response(301)
            self.send_header('Location', self.base_path + '/' + ('?' + urlsplit(self.path).query if urlsplit(self.path).query else ''))
            self.end_headers()
            return False
        return True
    def do_GET(self):
        if self.permitted(): super().do_GET()
    def do_HEAD(self):
        if self.permitted(): super().do_HEAD()
    def send_head(self):
        # Match Hosting/Pages byte-range support for native mobile audio seeking.
        # SimpleHTTPRequestHandler otherwise advertises an unseekable stream.
        path = Path(self.translate_path(self.path))
        if path.suffix == '.mp3' and path.is_file():
            size = path.stat().st_size
            value = self.headers.get('Range')
            start, end = 0, size - 1
            if value:
                match = re.fullmatch(r'bytes=(\d*)-(\d*)', value)
                if not match or not any(match.groups()):
                    self.send_error(416)
                    return None
                start = int(match[1]) if match[1] else max(0, size - int(match[2]))
                end = min(size - 1, int(match[2])) if match[1] and match[2] else size - 1
                if start > end or start >= size:
                    self.send_response(416)
                    self.send_header('Content-Range', f'bytes */{size}')
                    self.send_header('Content-Length', '0')
                    self.end_headers()
                    return None
            self.send_response(206 if value else 200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Content-Length', str(end - start + 1))
            if value:
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.end_headers()
            with path.open('rb') as file:
                file.seek(start)
                return io.BytesIO(file.read(end - start + 1))
        return super().send_head()
    def translate_path(self, path):
        local = unquote(urlsplit(path).path)[len(self.base_path):] or '/'
        aliases = {'/admin': '/admin.html', '/privacy': '/privacy.html'}
        return super().translate_path(quote(aliases.get(local, local), safe='/'))
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--base-path', default='/', help='Example: /-t-bed-The-cafe-33')
    args = parser.parse_args()
    base_path = '/' + args.base_path.strip('/') if args.base_path.strip('/') else ''
    if any(p in ('.', '..') for p in args.base_path.split('/')): parser.error('Invalid base path')
    ThreadingHTTPServer((args.bind, args.port), partial(Handler, directory=str(ROOT), base_path=base_path)).serve_forever()
