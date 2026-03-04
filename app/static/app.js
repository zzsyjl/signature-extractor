/**
 * 签名提取器 - 前端逻辑
 */

const dropZone = document.getElementById('dropZone');
const dropZonePlaceholder = document.getElementById('dropZonePlaceholder');
const dropZonePreview = document.getElementById('dropZonePreview');
const dropZoneImage = document.getElementById('dropZoneImage');
const dropFileName = document.getElementById('dropFileName');
const changeFileBtn = document.getElementById('changeFileBtn');
const fileInput = document.getElementById('fileInput');
const controlsSection = document.getElementById('controlsSection');
const previewSection = document.getElementById('previewSection');
const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');
const extractBtn = document.getElementById('extractBtn');
const originalPreview = document.getElementById('originalPreview');
const resultPreview = document.getElementById('resultPreview');
const resultFrame = document.getElementById('resultFrame');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const downloadBtn = document.getElementById('downloadBtn');
const btnText = extractBtn.querySelector('.btn-text');
const btnLoader = extractBtn.querySelector('.btn-loader');

let currentFile = null;
let resultBlobUrl = null;
let dropZoneImageUrl = null;

function getDownloadFilename() {
  if (!currentFile) return 'signature-transparent.png';
  const base = currentFile.name.replace(/\.[^/.]+$/, '');
  return `${base}_签名提取.png`;
}

// 拖放事件
function setupDropZone() {
  dropZone.addEventListener('click', (e) => {
    if (!e.target.closest('.drop-change-btn')) fileInput.click();
  });

  changeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dropZone.hasAttribute('data-has-file')) dropZone.setAttribute('data-state', 'hover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.setAttribute('data-state', 'idle');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.setAttribute('data-state', 'idle');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) handleFile(file);
  });
}

function handleFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10MB');
    return;
  }

  currentFile = file;
  if (dropZoneImageUrl) URL.revokeObjectURL(dropZoneImageUrl);
  dropZoneImageUrl = URL.createObjectURL(file);

  dropZone.setAttribute('data-has-file', 'true');
  dropZonePlaceholder.hidden = true;
  dropZonePreview.hidden = false;
  dropZoneImage.src = dropZoneImageUrl;
  dropFileName.textContent = file.name;

  originalPreview.src = dropZoneImageUrl;

  controlsSection.hidden = false;
  previewSection.hidden = false;
  resultPreview.hidden = true;
  resultPlaceholder.hidden = false;
  downloadBtn.hidden = true;
}

// 阈值滑块
thresholdSlider.addEventListener('input', () => {
  thresholdValue.textContent = thresholdSlider.value;
});

// 纯前端签名提取（Canvas API，图片数据不离开浏览器）
function extractWithCanvas(file, threshold) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        data[i + 3] = brightness < threshold ? 255 : 0;
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('图片导出失败'));
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

// 提取签名
async function extract() {
  if (!currentFile) return;

  extractBtn.disabled = true;
  btnText.hidden = true;
  btnLoader.hidden = false;

  try {
    const threshold = parseInt(thresholdSlider.value, 10);
    const blob = await extractWithCanvas(currentFile, threshold);
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    resultBlobUrl = URL.createObjectURL(blob);
    resultPreview.src = resultBlobUrl;
    resultPreview.hidden = false;
    resultPlaceholder.hidden = true;
    downloadBtn.hidden = false;
  } catch (err) {
    alert(err.message);
  } finally {
    extractBtn.disabled = false;
    btnText.hidden = false;
    btnLoader.hidden = true;
  }
}

extractBtn.addEventListener('click', extract);

// 下载：使用程序化触发，确保正确保存到 Downloads 文件夹
downloadBtn.addEventListener('click', () => {
  if (!resultBlobUrl) return;
  const a = document.createElement('a');
  a.href = resultBlobUrl;
  a.download = getDownloadFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// 预加载示例图片
async function loadSample() {
  try {
    const res = await fetch('/sign-sample-pencil.png');
    if (!res.ok) return;
    const blob = await res.blob();
    const file = new File([blob], 'sign-sample-pencil.png', { type: blob.type });
    handleFile(file);
  } catch {
    // 示例加载失败时静默忽略
  }
}

// 初始化
setupDropZone();
loadSample();
