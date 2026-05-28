import argparse
import json
import os
import socket
import threading
import urllib.error
import urllib.request
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def _load_dotenv(root_dir: str) -> None:
    env_path = os.path.join(root_dir, ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


def _pick_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


class LuminaryHandler(SimpleHTTPRequestHandler):
    server_version = "LuminaryHTTP/1.0"

    def __init__(self, *args, directory: str, **kwargs):
        self.root_dir = directory
        super().__init__(*args, directory=directory, **kwargs)

    def _json_response(self, payload: dict, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _tts_settings(self) -> dict:
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").strip().rstrip("/")
        model = os.environ.get("OPENAI_TTS_MODEL", "tts-1").strip() or "tts-1"
        voice = os.environ.get("OPENAI_TTS_VOICE", "alloy").strip() or "alloy"
        return {
            "available": bool(api_key),
            "provider": "openai",
            "base_url": base_url,
            "model": model,
            "voice": voice,
        }

    def do_GET(self) -> None:
        if self.path == "/api/tts-config":
            settings = self._tts_settings()
            self._json_response(
                {
                    "available": settings["available"],
                    "provider": settings["provider"],
                    "model": settings["model"],
                    "voice": settings["voice"],
                }
            )
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path != "/api/tts":
            self.send_error(HTTPStatus.NOT_FOUND, "Unknown API path")
            return

        settings = self._tts_settings()
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        if not api_key:
            self._json_response(
                {
                    "error": "OPENAI_API_KEY is not configured. Add it to Luminary/.env or your shell environment.",
                },
                status=HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return

        content_length = int(self.headers.get("Content-Length", "0") or "0")
        try:
            payload = json.loads(self.rfile.read(content_length) or b"{}")
        except json.JSONDecodeError:
            self._json_response({"error": "Invalid JSON body."}, status=HTTPStatus.BAD_REQUEST)
            return

        text = str(payload.get("text", "")).strip()
        if not text:
            self._json_response({"error": "The 'text' field is required."}, status=HTTPStatus.BAD_REQUEST)
            return

        request_body = json.dumps(
            {
                "model": str(payload.get("model") or settings["model"]),
                "voice": str(payload.get("voice") or settings["voice"]),
                "input": text,
                "response_format": "mp3",
            }
        ).encode("utf-8")

        request = urllib.request.Request(
            url=f"{settings['base_url']}/audio/speech",
            data=request_body,
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                audio_bytes = response.read()
        except urllib.error.HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            self._json_response(
                {
                    "error": "OpenAI TTS request failed.",
                    "details": details,
                },
                status=exc.code or HTTPStatus.BAD_GATEWAY,
            )
            return
        except Exception as exc:  # noqa: BLE001
            self._json_response(
                {
                    "error": "Failed to contact OpenAI TTS.",
                    "details": str(exc),
                },
                status=HTTPStatus.BAD_GATEWAY,
            )
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(audio_bytes)))
        self.end_headers()
        self.wfile.write(audio_bytes)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    root_dir = os.path.abspath(os.path.dirname(__file__))
    _load_dotenv(root_dir)
    port = int(args.port) if int(args.port) > 0 else _pick_port()

    handler = lambda *h_args, **h_kwargs: LuminaryHandler(*h_args, directory=root_dir, **h_kwargs)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)

    url = f"http://127.0.0.1:{port}/index.html"
    print(f"Luminary demo: {url}")
    print("Controls: Mouse drag to orbit • Wheel to zoom")
    print(f"TTS backend: {'configured' if os.environ.get('OPENAI_API_KEY') else 'missing OPENAI_API_KEY'}")

    if not args.no_browser:
        threading.Timer(0.25, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
