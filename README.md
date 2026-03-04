# 签名提取器

将签名图片中的笔迹与背景分离，导出透明背景的 PNG 文件。数据全在本地处理，不上传至任何服务器。

## 功能

- 拖放或点击上传签名图片（PNG、JPG、WEBP，最大 10MB）
- 可调节亮度阈值，精确控制笔迹保留程度
- 实时预览原图与提取结果
- 一键下载透明 PNG

## 本地部署

### 1. 安装依赖

```bash
cd signature-extractor
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
│   ├── main.py           # FastAPI 应用入口
│   ├── services/
│   │   └── extractor.py  # 签名提取逻辑
│   └── static/           # 前端静态资源
│       ├── index.html
│       ├── styles.css
│       └── app.js
├── requirements.txt
├── run.py
└── README.md
```

## Docker 部署

### 构建镜像

```bash
docker build -t signature-extractor:latest .
```

### 推送到 Docker Hub

1. 登录 Docker Hub：`docker login`
2. 替换 `YOUR_DOCKERHUB_USERNAME` 为你的用户名，然后执行：

```bash
docker tag signature-extractor:latest YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
docker push YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
```

### 服务器一键拉起

```bash
docker run -d -p 8000:8000 --name signature-extractor YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
```

访问 **http://服务器IP:8000**

持久运行（重启后自动启动）：

```bash
docker run -d -p 8000:8000 --name signature-extractor --restart unless-stopped YOUR_DOCKERHUB_USERNAME/signature-extractor:latest
```

---

## 技术栈

- **后端**：FastAPI + Pillow
- **前端**：原生 HTML/CSS/JS，无构建步骤
