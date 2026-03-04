#!/bin/bash
# 构建并推送签名提取器到 Docker Hub
# 用法: ./docker-push.sh <你的DockerHub用户名>

set -e
USERNAME="${1:?请提供 Docker Hub 用户名，如: ./docker-push.sh myusername}"

echo ">>> 构建镜像..."
docker build -t signature-extractor:latest .

echo ">>> 打标签..."
docker tag signature-extractor:latest "${USERNAME}/signature-extractor:latest"

echo ">>> 推送到 Docker Hub..."
docker push "${USERNAME}/signature-extractor:latest"

echo ">>> 完成！在服务器上运行："
echo "docker run -d -p 8000:8000 --name signature-extractor --restart unless-stopped ${USERNAME}/signature-extractor:latest"
