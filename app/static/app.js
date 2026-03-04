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

// 提取签名
async function extract() {
  if (!currentFile) return;
  
  extractBtn.disabled = true;
  btnText.hidden = true;
  btnLoader.hidden = false;

  const formData = new FormData();
  formData.append('file', currentFile);
  formData.append('threshold', thresholdSlider.value);

  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || '提取失败');
    }

    const blob = await res.blob();
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
