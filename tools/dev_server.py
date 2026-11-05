#!/usr/bin/env python3
"""Local static development server with the Firebase Hosting route aliases."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parent.parent
class Handler(SimpleHTTPRequestHandler):
    def blocked(self):
        return any(p.startswith('.') for p in PurePosixPath(unquote(urlsplit(self.path).path)).parts)
    def do_GET(self):
        if self.blocked():return self.send_error(404)
        super().do_GET()
    def do_HEAD(self):
        if self.blocked():return self.send_error(404)
        super().do_HEAD()
    def translate_path(self,path):
        aliases={'/admin':'/admin.html','/privacy':'/privacy.html'}
        return super().translate_path(aliases.get(urlsplit(path).path,path))
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8000);parser.add_argument('--bind',default='127.0.0.1');args=parser.parse_args()
    ThreadingHTTPServer((args.bind,args.port),partial(Handler,directory=str(ROOT))).serve_forever()
