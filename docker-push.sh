#!/bin/bash
# 构建并推送签名提取器到 Docker Hub（跨架构，适配 x86_64 服务器）
# 用法: ./docker-push.sh [DockerHub用户名]  (默认 zzsyjl)

set -e
USERNAME="${1:-zzsyjl}"
IMAGE="${USERNAME}/signature-extractor:latest"

echo ">>> 构建 linux/amd64 镜像并推送到 Docker Hub..."
docker buildx build --platform linux/amd64 -t "$IMAGE" --push .

echo ">>> 完成！在服务器上运行："
echo "docker pull $IMAGE && docker stop signature-extractor 2>/dev/null; docker rm signature-extractor 2>/dev/null; docker run -d -p 8000:8000 --name signature-extractor --restart unless-stopped $IMAGE"
