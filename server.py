#!/usr/bin/env python3
"""
Production Dual Web & API Server
Ministry of Tribal Affairs | Smart India Hackathon 2026 (SIH26238)
"""

import os
import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProductionPortalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_cors_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        # Direct Root Access
        if parsed.path == "/" or parsed.path == "":
            self.path = "/index.html"
            return super().do_GET()

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        # Real Multipart Document Upload Endpoint
        if parsed.path == "/api/v1/upload-document":
            content_type = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in content_type:
                self._send_cors_headers(400)
                self.wfile.write(json.dumps({"error": "Expected multipart/form-data"}).encode())
                return

            boundary = content_type.split("boundary=")[-1].strip().encode()
            length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(length)

            parts = raw_body.split(b"--" + boundary)
            saved_filename = None

            for part in parts:
                if b'filename="' in part:
                    header, file_data = part.split(b"\r\n\r\n", 1)
                    filename_line = [l for l in header.split(b"\r\n") if b'filename="' in l][0]
                    orig_filename = filename_line.split(b'filename="')[1].split(b'"')[0].decode('utf-8', errors='ignore')
                    
                    file_content = file_data.rstrip(b"\r\n")
                    safe_name = os.path.basename(orig_filename)
                    disk_target = os.path.join(UPLOAD_DIR, safe_name)

                    with open(disk_target, "wb") as f:
                        f.write(file_content)
                    saved_filename = safe_name
                    break

            if saved_filename:
                print(f"[Upload Success] Saved {saved_filename} to server disk.")
                self._send_cors_headers(200)
                self.wfile.write(json.dumps({
                    "status": "success",
                    "filename": saved_filename,
                    "file_url": f"/uploads/{urllib.parse.quote(saved_filename)}"
                }).encode("utf-8"))
            else:
                self._send_cors_headers(400)
                self.wfile.write(json.dumps({"error": "Upload failed"}).encode())
            return

        self._send_cors_headers(404)
        self.wfile.write(json.dumps({"error": "Not Found"}).encode())

print(f"🚀 Unified Portal Server running on http://127.0.0.1:{PORT}")
HTTPServer(("0.0.0.0", PORT), ProductionPortalHandler).serve_forever()