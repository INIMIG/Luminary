import argparse
import json
import os
import re
import socket
import threading
import urllib.error
import urllib.request
import uuid
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


def _api_settings() -> dict:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").strip().rstrip("/")
    return {
        "available": bool(api_key),
        "api_key": api_key,
        "base_url": base_url,
        "tts_model": os.environ.get("OPENAI_TTS_MODEL", "tts-1").strip() or "tts-1",
        "tts_voice": os.environ.get("OPENAI_TTS_VOICE", "alloy").strip() or "alloy",
        "chat_model": os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o").strip() or "gpt-4o",
        "whisper_model": os.environ.get("OPENAI_WHISPER_MODEL", "whisper-1").strip() or "whisper-1",
    }


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
        s = _api_settings()
        return {
            "available": s["available"],
            "provider": "openai",
            "base_url": s["base_url"],
            "model": s["tts_model"],
            "voice": s["tts_voice"],
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
        if self.path == "/api/tts":
            self._handle_tts()
            return
        if self.path == "/api/chat":
            self._handle_chat()
            return
        if self.path == "/api/transcribe":
            self._handle_transcribe()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Unknown API path")

    def _handle_tts(self) -> None:
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

    def _handle_chat(self) -> None:
        settings = _api_settings()
        if not settings["available"]:
            self._json_response(
                {"error": "OPENAI_API_KEY is not configured."},
                status=HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return

        content_length = int(self.headers.get("Content-Length", "0") or "0")
        try:
            payload = json.loads(self.rfile.read(content_length) or b"{}")
        except json.JSONDecodeError:
            self._json_response({"error": "Invalid JSON body."}, status=HTTPStatus.BAD_REQUEST)
            return

        messages = payload.get("messages")
        if not isinstance(messages, list) or not messages:
            self._json_response({"error": "'messages' must be a non-empty list."}, status=HTTPStatus.BAD_REQUEST)
            return

        mode = str(payload.get("mode") or "ask")
        request_body = json.dumps(
            {
                "model": str(payload.get("model") or settings["chat_model"]),
                "messages": messages,
                "temperature": 0.4 if mode == "grade" else 0.6,
            }
        ).encode("utf-8")

        request = urllib.request.Request(
            url=f"{settings['base_url']}/chat/completions",
            data=request_body,
            method="POST",
            headers={
                "Authorization": f"Bearer {settings['api_key']}",
                "Content-Type": "application/json",
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = json.loads(response.read())
        except urllib.error.HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            self._json_response(
                {"error": "Chat request failed.", "details": details},
                status=exc.code or HTTPStatus.BAD_GATEWAY,
            )
            return
        except Exception as exc:  # noqa: BLE001
            self._json_response(
                {"error": "Failed to contact chat API.", "details": str(exc)},
                status=HTTPStatus.BAD_GATEWAY,
            )
            return

        try:
            reply = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            self._json_response(
                {"error": "Unexpected chat response shape.", "details": json.dumps(data)[:400]},
                status=HTTPStatus.BAD_GATEWAY,
            )
            return

        verdict = None
        cleaned = reply
        if mode == "grade":
            match = re.search(r"<verdict>\s*(correct|partial|wrong)\s*</verdict>", reply, re.IGNORECASE)
            if match:
                verdict = match.group(1).lower()
                cleaned = re.sub(r"<verdict>.*?</verdict>", "", reply, flags=re.IGNORECASE | re.DOTALL).strip()

        self._json_response({"reply": cleaned, "verdict": verdict})

    def _handle_transcribe(self) -> None:
        settings = _api_settings()
        if not settings["available"]:
            self._json_response(
                {"error": "OPENAI_API_KEY is not configured."},
                status=HTTPStatus.SERVICE_UNAVAILABLE,
            )
            return

        content_type = self.headers.get("Content-Type", "")
        match = re.search(r"boundary=([^;]+)", content_type)
        if not match:
            self._json_response({"error": "multipart/form-data with boundary is required."}, status=HTTPStatus.BAD_REQUEST)
            return

        boundary = match.group(1).strip().strip('"')
        content_length = int(self.headers.get("Content-Length", "0") or "0")
        if content_length <= 0 or content_length > 25 * 1024 * 1024:
            self._json_response({"error": "Audio body missing or too large (>25MB)."}, status=HTTPStatus.BAD_REQUEST)
            return

        raw = self.rfile.read(content_length)
        audio_bytes, audio_filename, audio_mime = _extract_first_file_part(raw, boundary)
        if not audio_bytes:
            self._json_response({"error": "No audio file found in request."}, status=HTTPStatus.BAD_REQUEST)
            return

        # Re-encode to multipart for the upstream API
        outer_boundary = f"----LuminaryBoundary{uuid.uuid4().hex}"
        upstream_body = _build_whisper_multipart(
            outer_boundary,
            audio_bytes=audio_bytes,
            audio_filename=audio_filename or "audio.webm",
            audio_mime=audio_mime or "audio/webm",
            model=settings["whisper_model"],
        )

        request = urllib.request.Request(
            url=f"{settings['base_url']}/audio/transcriptions",
            data=upstream_body,
            method="POST",
            headers={
                "Authorization": f"Bearer {settings['api_key']}",
                "Content-Type": f"multipart/form-data; boundary={outer_boundary}",
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                data = json.loads(response.read())
        except urllib.error.HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            self._json_response(
                {"error": "Transcribe request failed.", "details": details},
                status=exc.code or HTTPStatus.BAD_GATEWAY,
            )
            return
        except Exception as exc:  # noqa: BLE001
            self._json_response(
                {"error": "Failed to contact transcription API.", "details": str(exc)},
                status=HTTPStatus.BAD_GATEWAY,
            )
            return

        text = str(data.get("text", "")).strip()
        self._json_response({"text": text})


def _extract_first_file_part(raw: bytes, boundary: str):
    """Parse a single-file multipart body and return (bytes, filename, content_type)."""
    delim = ("--" + boundary).encode()
    parts = raw.split(delim)
    for part in parts:
        if not part or part in (b"--\r\n", b"--"):
            continue
        if part.startswith(b"\r\n"):
            part = part[2:]
        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue
        headers_blob = part[:header_end].decode("utf-8", errors="replace")
        body = part[header_end + 4:]
        if body.endswith(b"\r\n"):
            body = body[:-2]
        if "filename=" not in headers_blob:
            continue
        fn_match = re.search(r'filename="([^"]*)"', headers_blob)
        ct_match = re.search(r"Content-Type:\s*([^\r\n]+)", headers_blob, re.IGNORECASE)
        return body, (fn_match.group(1) if fn_match else None), (ct_match.group(1).strip() if ct_match else None)
    return b"", None, None


def _build_whisper_multipart(boundary: str, *, audio_bytes: bytes, audio_filename: str, audio_mime: str, model: str) -> bytes:
    crlf = b"\r\n"
    parts = []
    parts.append(f"--{boundary}".encode())
    parts.append(b'Content-Disposition: form-data; name="model"')
    parts.append(b"")
    parts.append(model.encode())
    parts.append(f"--{boundary}".encode())
    parts.append(f'Content-Disposition: form-data; name="file"; filename="{audio_filename}"'.encode())
    parts.append(f"Content-Type: {audio_mime}".encode())
    parts.append(b"")
    parts.append(audio_bytes)
    parts.append(f"--{boundary}--".encode())
    parts.append(b"")
    return crlf.join(parts)


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
