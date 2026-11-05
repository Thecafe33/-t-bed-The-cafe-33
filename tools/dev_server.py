#!/usr/bin/env python3
"""Static preview with Firebase aliases and an optional GitHub Pages-style directory prefix."""
import argparse
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
