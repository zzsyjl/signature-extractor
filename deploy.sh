#!/bin/bash
# 一键部署：本地构建推送 + 服务器拉取更新
# 用法: ./deploy.sh

set -e
USERNAME="${1:-zzsyjl}"
IMAGE="${USERNAME}/signature-extractor:latest"
SERVER="yyhome"

echo ">>> [本地] 构建 linux/amd64 镜像并推送..."
docker buildx build --platform linux/amd64 -t "$IMAGE" --push .

echo ">>> [服务器] 拉取并重启容器..."
ssh "$SERVER" "\
  docker pull $IMAGE && \
  docker stop signature-extractor 2>/dev/null; \
  docker rm signature-extractor 2>/dev/null; \
  docker run -d -p 8000:8000 --name signature-extractor --restart unless-stopped $IMAGE"

echo ">>> [服务器] 验证服务..."
ssh "$SERVER" "sleep 2 && curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://localhost:8000/"

echo ">>> 部署完成！公网访问: https://sign.yjl.app"
