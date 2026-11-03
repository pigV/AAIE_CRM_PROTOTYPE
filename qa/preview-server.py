"""Read-only local server for the prototype; no CRM services or data."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
ROOT = Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        name=unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
        target=(ROOT/name).resolve()
        if not target.is_relative_to(ROOT) or any(p.startswith('.') for p in Path(name).parts) or target.suffix not in {'.html','.js','.css','.png','.jpg','.webp'}:
            self.send_error(404);return
        return super().do_GET()
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',9137),Handler)
print('Prototype preview: http://127.0.0.1:9137/index.html',flush=True)
server.serve_forever()
