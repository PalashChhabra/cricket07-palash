#!/usr/bin/env python3
"""Serve the public browser build with WebGPU/pthread isolation and byte ranges."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import os
import re
from functools import partial

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_head(self):
        file = Path(self.translate_path(self.path.split('?')[0]))
        value = self.headers.get('Range', '')
        match = re.fullmatch(r'bytes=(\d+)-(\d*)', value)
        if file.is_file() and match:
            size = file.stat().st_size
            first = int(match[1]); last = int(match[2]) if match[2] else size - 1
            if first >= size or last < first:
                self.send_response(416); self.send_header('Content-Range', f'bytes */{size}'); self.end_headers(); return None
            last = min(last, size - 1)
            self.send_response(206)
            self.send_header('Content-Type', self.guess_type(str(file)))
            self.send_header('Content-Range', f'bytes {first}-{last}/{size}')
            self.send_header('Content-Length', str(last - first + 1))
            self.send_header('Accept-Ranges', 'bytes'); self.end_headers()
            stream = file.open('rb'); stream.seek(first); self.range_length = last - first + 1
            return stream
        return super().send_head()

    def copyfile(self, source, outputfile):
        if not hasattr(self, 'range_length'):
            return super().copyfile(source, outputfile)
        remaining = self.range_length
        del self.range_length
        while remaining:
            chunk = source.read(min(262144, remaining))
            if not chunk: break
            outputfile.write(chunk); remaining -= len(chunk)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('--port', type=int, default=8086)
    args = parser.parse_args()
    print(f'Cricket 07: http://localhost:{args.port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(args.directory.resolve()))).serve_forever()
