"""
签名提取服务 - 将笔迹与背景分离，背景透明化
"""

import io
from PIL import Image


def extract_signature(image_bytes: bytes, threshold: int = 160) -> bytes:
    """
    从图片中提取笔迹，将背景变为透明
    
    Args:
        image_bytes: 原始图片的字节数据
        threshold: 亮度阈值 (0-255)，低于此值的像素视为笔迹
    
    Returns:
        处理后的 PNG 图片字节数据
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGBA")
    
    data = img.getdata()
    new_data = []
    
    for pixel in data:
        r, g, b, a = pixel
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        
        if brightness < threshold:
            new_data.append((r, g, b, 255))
        else:
            new_data.append((r, g, b, 0))
    
    img.putdata(new_data)
    
    output = io.BytesIO()
    img.save(output, format="PNG")
    return output.getvalue()
