# 签名提取器

将签名图片中的笔迹与背景分离，导出透明背景的 PNG 文件。

**所有图片处理均在浏览器本地完成，数据不会上传至任何服务器。**

## 功能

- 拖放或点击上传签名图片（PNG、JPG、WEBP，最大 10MB）
- 可调节亮度阈值，精确控制笔迹保留程度
- 实时预览原图与提取结果
- 一键下载透明 PNG

## 本地运行

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python run.py
```

或使用 uvicorn 直接启动：

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. 访问应用

在浏览器中打开：**http://127.0.0.1:8000**

## 项目结构

```
signature-extractor/
├── app/
│   ├── main.py           # FastAPI 入口（仅提供静态文件服务）
│   └── static/           # 前端静态资源
│       ├── index.html
│       ├── styles.css
│       ├── app.js
│       └── sign-sample-pencil.png
├── requirements.txt
├── run.py
├── Dockerfile
└── README.md
```

## Docker 部署

### 构建镜像

```bash
docker build -t signature-extractor:latest .
```

### 推送到 Docker Hub

```bash
docker login
docker tag signature-extractor:latest YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
docker push YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
```

### 服务器一键拉起

```bash
docker run -d -p 8000:8000 --name signature-extractor --restart unless-stopped \
  YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
```

访问 **http://服务器IP:8000**

---

## 技术栈

- **服务端**：FastAPI + uvicorn（仅负责静态文件托管）
- **前端**：原生 HTML/CSS/JS，Canvas API 处理图片，无构建步骤
