"""
签名提取器 - 静态文件服务
"""

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path


class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        if path.endswith((".html", "/")) or "?" in str(request.url):
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
        elif path.endswith((".js", ".css")):
            response.headers["Cache-Control"] = "public, max-age=3600"
        return response


app = FastAPI(title="签名提取器")
app.add_middleware(CacheControlMiddleware)

static_dir = Path(__file__).parent / "static"
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
