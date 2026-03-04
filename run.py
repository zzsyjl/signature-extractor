#!/usr/bin/env python3
"""
签名提取器 - 本地启动脚本
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
