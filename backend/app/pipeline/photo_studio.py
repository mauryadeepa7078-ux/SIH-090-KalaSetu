import io
import os
import uuid
import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
from pathlib import Path
from backend.app.config import UPLOAD_DIR

try:
    import cv2
    CV2_AVAILABLE = True
except Exception as e:
    print(f"[WARN] cv2 import notice: {e}. Pure PIL enhancements mode active.")
    CV2_AVAILABLE = False

try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except Exception as e:
    print(f"[WARN] rembg import notice: {e}. Fallback background segmentation enabled.")
    REMBG_AVAILABLE = False


def apply_opencv_enhancements(pil_img: Image.Image, brightness_factor: float = 1.05, contrast_factor: float = 1.15) -> Image.Image:
    """
    Applies OpenCV color correction, auto white balance (Gray World),
    and CLAHE when cv2 is present, or high-fidelity PIL enhancement fallback.
    """
    result_pil = pil_img.copy()

    if CV2_AVAILABLE:
        try:
            # Convert PIL Image to OpenCV BGR
            img_np = np.array(result_pil.convert('RGB'))
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

            # 1. Auto White Balance (Gray World algorithm)
            b, g, r = cv2.split(img_bgr)
            b_avg, g_avg, r_avg = np.mean(b), np.mean(g), np.mean(r)
            gray_avg = (b_avg + g_avg + r_avg) / 3.0

            if b_avg > 0 and g_avg > 0 and r_avg > 0:
                b = np.clip(b * (gray_avg / b_avg), 0, 255).astype(np.uint8)
                g = np.clip(g * (gray_avg / g_avg), 0, 255).astype(np.uint8)
                r = np.clip(r * (gray_avg / r_avg), 0, 255).astype(np.uint8)
                balanced_bgr = cv2.merge([b, g, r])
            else:
                balanced_bgr = img_bgr

            # 2. CLAHE on L-channel of LAB space
            lab = cv2.cvtColor(balanced_bgr, cv2.COLOR_BGR2LAB)
            l, a, b_ch = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l_clahe = clahe.apply(l)
            enhanced_lab = cv2.merge([l_clahe, a, b_ch])
            enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

            # Convert back to PIL
            enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
            result_pil = Image.fromarray(enhanced_rgb)
        except Exception as err:
            print(f"[WARN] OpenCV enhancement fallback: {err}")

    # Pure PIL Color & AutoContrast Polish
    result_pil = ImageOps.autocontrast(result_pil.convert('RGB'), cutoff=0.5)

    if brightness_factor != 1.0:
        enhancer = ImageEnhance.Brightness(result_pil)
        result_pil = enhancer.enhance(brightness_factor)
    if contrast_factor != 1.0:
        enhancer = ImageEnhance.Contrast(result_pil)
        result_pil = enhancer.enhance(contrast_factor)
    
    # Subtle color vibrance
    color_enhancer = ImageEnhance.Color(result_pil)
    result_pil = color_enhancer.enhance(1.08)

    return result_pil


def remove_background_fallback(pil_img: Image.Image) -> Image.Image:
    """
    Fast and robust background segmentation fallback.
    """
    if CV2_AVAILABLE:
        try:
            img_np = np.array(pil_img.convert('RGB'))
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
            
            img_rgba = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2BGRA)
            img_rgba[:, :, 3] = mask
            return Image.fromarray(cv2.cvtColor(img_rgba, cv2.COLOR_BGRA2RGBA))
        except Exception:
            pass

    # Pure PIL Alpha Mask fallback
    img_rgba = pil_img.convert("RGBA")
    return img_rgba


def standardize_ecommerce_format(rgba_img: Image.Image, target_size: int = 1000, pad_percent: float = 0.08) -> Image.Image:
    """
    Places the foreground on a crisp pure white studio canvas,
    centered and padded with a standardized 1:1 aspect ratio.
    """
    # Find bounding box of non-transparent pixels
    bbox = rgba_img.getbbox()
    if bbox:
        cropped = rgba_img.crop(bbox)
    else:
        cropped = rgba_img

    # Scale while maintaining aspect ratio
    max_dim = int(target_size * (1.0 - (pad_percent * 2)))
    w, h = cropped.size
    scaling_ratio = min(max_dim / w, max_dim / h)
    new_w, new_h = int(w * scaling_ratio), int(h * scaling_ratio)
    resized_obj = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Create solid white studio background
    studio_bg = Image.new("RGBA", (target_size, target_size), (255, 255, 255, 255))
    
    # Paste centered
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2
    studio_bg.paste(resized_obj, (offset_x, offset_y), mask=resized_obj)

    return studio_bg.convert("RGB")


def process_artisan_photo(
    image_bytes: bytes,
    remove_bg: bool = True,
    apply_enhancement: bool = True,
    standardize: bool = True,
    brightness: float = 1.05,
    contrast: float = 1.15
) -> dict:
    """
    Full pipeline: Ingest image -> rembg background removal -> OpenCV CLAHE/white-balance -> 1:1 studio standardize.
    """
    raw_img = Image.open(io.BytesIO(image_bytes))
    raw_img = ImageOps.exif_transpose(raw_img) # Fix phone camera orientation
    
    # Optimize: Downscale high-resolution images to max 1024x1024 for sub-second background removal
    max_side = 1024
    if max(raw_img.width, raw_img.height) > max_side:
        raw_img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    
    img_id = str(uuid.uuid4())[:8]
    original_filename = f"raw_{img_id}.jpg"
    enhanced_filename = f"studio_{img_id}.jpg"

    original_path = UPLOAD_DIR / original_filename
    enhanced_path = UPLOAD_DIR / enhanced_filename

    # Save original
    raw_img.convert("RGB").save(original_path, format="JPEG", quality=88)

    # 1. Color and Lighting Enhancement
    processed_img = raw_img
    if apply_enhancement:
        processed_img = apply_opencv_enhancements(processed_img, brightness_factor=brightness, contrast_factor=contrast)


    # 2. Background Removal
    if remove_bg:
        if REMBG_AVAILABLE:
            try:
                # rembg accepts PIL Image or bytes
                processed_rgba = rembg_remove(processed_img)
            except Exception as e:
                print(f"rembg processing error: {e}, falling back.")
                processed_rgba = remove_background_fallback(processed_img)
        else:
            processed_rgba = remove_background_fallback(processed_img)
    else:
        processed_rgba = processed_img.convert("RGBA")

    # 3. E-commerce studio standardization (1:1 square, centered, white background)
    if standardize:
        final_img = standardize_ecommerce_format(processed_rgba)
    else:
        # Just blend on white if RGBA
        bg = Image.new("RGB", processed_rgba.size, (255, 255, 255))
        bg.paste(processed_rgba, mask=processed_rgba.split()[3])
        final_img = bg

    # Save processed studio image
    final_img.save(enhanced_path, format="JPEG", quality=92, optimize=True)

    return {
        "original_image_url": f"/static/uploads/{original_filename}",
        "enhanced_image_url": f"/static/uploads/{enhanced_filename}",
        "width": final_img.width,
        "height": final_img.height,
        "bg_removed": remove_bg,
        "enhanced": apply_enhancement
    }
