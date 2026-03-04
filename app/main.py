"""
签名提取器 - FastAPI 应用入口
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from pathlib import Path

from app.services.extractor import extract_signature

app = FastAPI(
    title="签名提取器",
    description="提取签名图片中的笔迹，将背景变为透明",
    version="1.0.0",
)

# 静态文件目录（挂载在 API 路由之后，确保 /api 优先匹配）
static_dir = Path(__file__).parent / "static"


@app.post("/api/extract")
async def extract(
    file: UploadFile = File(..., description="签名图片"),
    threshold: int = Form(default=160, ge=0, le=255, description="亮度阈值"),
):
    """
    提取签名 - 上传图片并返回透明背景的 PNG
    """
    # 校验文件类型
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="请上传图片文件 (PNG, JPG 等)")
    
    content = await file.read()
    
    if len(content) > 10 * 1024 * 1024:  # 10MB 限制
        raise HTTPException(status_code=400, detail="图片大小不能超过 10MB")
    
    try:
        result_bytes = extract_signature(content, threshold=threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")
    
    return Response(
        content=result_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=signature-transparent.png"},
    )


# 挂载静态文件（必须位于所有 API 路由之后）
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
