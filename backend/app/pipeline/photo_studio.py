import io
import os
import uuid
import base64
import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageDraw
from pathlib import Path
from backend.app.config import UPLOAD_DIR

try:
    import cv2
    CV2_AVAILABLE = True
except Exception as e:
    print(f"[WARN] cv2 import notice: {e}. Pure PIL mode active.")
    CV2_AVAILABLE = False

try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except Exception as e:
    print(f"[WARN] rembg import notice: {e}. GrabCut segmentation enabled.")
    REMBG_AVAILABLE = False


def apply_opencv_enhancements(
    pil_img: Image.Image, 
    brightness_factor: float = 1.06, 
    contrast_factor: float = 1.18,
    vibrance_factor: float = 1.15,
    sharpness_factor: float = 1.25
) -> Image.Image:
    """
    Applies professional OpenCV color correction & lighting enhancement:
    - Auto White Balance (Gray World algorithm) to correct harsh shadows/yellow phone tints
    - LAB CLAHE on Luminance channel only (crisp contrast without altering craft color hues)
    - High-fidelity PIL vibrance and micro-texture sharpness polish
    """
    result_pil = pil_img.copy().convert('RGB')

    if CV2_AVAILABLE:
        try:
            # Convert PIL RGB to OpenCV BGR
            img_np = np.array(result_pil)
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

            # 2. CLAHE on L-channel of LAB space (preserves authentic Indian craft colors in A and B channels)
            lab = cv2.cvtColor(balanced_bgr, cv2.COLOR_BGR2LAB)
            l, a, b_ch = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
            l_clahe = clahe.apply(l)
            
            # Blend slightly with original L channel for soft natural lighting
            l_blended = cv2.addWeighted(l_clahe, 0.85, l, 0.15, 0)
            enhanced_lab = cv2.merge([l_blended, a, b_ch])
            enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

            # Convert back to PIL
            enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
            result_pil = Image.fromarray(enhanced_rgb)
        except Exception as err:
            print(f"[WARN] OpenCV enhancement fallback: {err}")

    # Pure PIL AutoContrast Polish
    result_pil = ImageOps.autocontrast(result_pil.convert('RGB'), cutoff=0.5)

    # Brightness adjustment
    if brightness_factor != 1.0:
        enhancer = ImageEnhance.Brightness(result_pil)
        result_pil = enhancer.enhance(brightness_factor)

    # Contrast adjustment
    if contrast_factor != 1.0:
        enhancer = ImageEnhance.Contrast(result_pil)
        result_pil = enhancer.enhance(contrast_factor)
    
    # Vibrance / Rich craft saturation (preserves brass, terracotta, silk zari hues)
    if vibrance_factor != 1.0:
        color_enhancer = ImageEnhance.Color(result_pil)
        result_pil = color_enhancer.enhance(vibrance_factor)

    # Micro-Texture Sharpness (makes handloom weaves and carving textures crisp)
    if sharpness_factor != 1.0:
        sharp_enhancer = ImageEnhance.Sharpness(result_pil)
        result_pil = sharp_enhancer.enhance(sharpness_factor)

    return result_pil


def refine_alpha_edges(rgba_img: Image.Image) -> Image.Image:
    """
    Feathers alpha edges to prevent harsh border staircasing.
    """
    if rgba_img.mode != 'RGBA':
        return rgba_img.convert('RGBA')

    r, g, b, a = rgba_img.split()
    a_smooth = a.filter(ImageFilter.GaussianBlur(radius=0.7))
    return Image.merge('RGBA', (r, g, b, a_smooth))


def remove_background_grabcut(pil_img: Image.Image) -> Image.Image:
    """
    High-fidelity OpenCV GrabCut segmentation fallback.
    Extracts foreground craft without converting product pixels to black/white or threshold artifacts.
    """
    if CV2_AVAILABLE:
        try:
            img_rgb = pil_img.convert('RGB')
            img_np = np.array(img_rgb)
            h, w = img_np.shape[:2]

            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
            mask = np.zeros((h, w), np.uint8)
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)

            margin_x = max(6, int(w * 0.04))
            margin_y = max(6, int(h * 0.04))
            rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

            cv2.grabCut(img_bgr, mask, rect, bgd_model, fgd_model, 4, cv2.GC_INIT_WITH_RECT)
            fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype('uint8')
            
            # Smooth mask edges cleanly
            fg_mask = cv2.GaussianBlur(fg_mask, (5, 5), 0)
            
            img_rgba = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2BGRA)
            img_rgba[:, :, 3] = fg_mask
            pil_res = Image.fromarray(cv2.cvtColor(img_rgba, cv2.COLOR_BGRA2RGBA))
            return refine_alpha_edges(pil_res)
        except Exception as e:
            print(f"[WARN] Grabcut segmentation notice: {e}")

    # Pure PIL Alpha Mask fallback
    img_rgba = pil_img.convert("RGBA")
    return img_rgba


def standardize_ecommerce_format(
    rgba_img: Image.Image, 
    target_size: int = 1000, 
    pad_percent: float = 0.08
) -> Image.Image:
    """
    Places the foreground craft on a crisp pure white studio canvas,
    centered and padded with a standardized 1:1 square aspect ratio.
    """
    bbox = rgba_img.getbbox()
    if bbox:
        cropped = rgba_img.crop(bbox)
    else:
        cropped = rgba_img

    # Scale while maintaining aspect ratio
    max_dim = int(target_size * (1.0 - (pad_percent * 2)))
    w, h = cropped.size
    scaling_ratio = min(max_dim / w, max_dim / h)
    new_w, new_h = max(1, int(w * scaling_ratio)), max(1, int(h * scaling_ratio))
    resized_obj = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    resized_obj = refine_alpha_edges(resized_obj)

    # Create solid pure white studio background
    studio_bg = Image.new("RGBA", (target_size, target_size), (255, 255, 255, 255))
    
    # Calculate center placement
    offset_x = (target_size - new_w) // 2
    offset_y = (target_size - new_h) // 2

    # Paste isolated product cleanly
    if resized_obj.mode == 'RGBA':
        studio_bg.paste(resized_obj, (offset_x, offset_y), mask=resized_obj.split()[3])
    else:
        studio_bg.paste(resized_obj, (offset_x, offset_y))

    return studio_bg.convert("RGB")


def process_artisan_photo(
    image_bytes: bytes,
    remove_bg: bool = True,
    apply_enhancement: bool = True,
    standardize: bool = True,
    brightness: float = 1.06,
    contrast: float = 1.18,
    vibrance: float = 1.15,
    sharpness: float = 1.25,
    add_shadow: bool = False
) -> dict:
    """
    Full pipeline: Ingest image -> OpenCV CLAHE & White-Balance -> Background removal -> 1:1 pure white studio standardize.
    """
    raw_img = Image.open(io.BytesIO(image_bytes))
    raw_img = ImageOps.exif_transpose(raw_img) # Fix phone camera orientation
    
    # Optimize: Standardize size to max 1200x1200
    max_side = 1200
    if max(raw_img.width, raw_img.height) > max_side:
        raw_img.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    
    img_id = str(uuid.uuid4())[:8]
    original_filename = f"raw_{img_id}.jpg"
    enhanced_filename = f"studio_{img_id}.jpg"

    original_path = UPLOAD_DIR / original_filename
    enhanced_path = UPLOAD_DIR / enhanced_filename

    # Save original
    raw_img.convert("RGB").save(original_path, format="JPEG", quality=90)

    # 1. Color and Lighting Enhancement (OpenCV Auto White-Balance + LAB CLAHE)
    processed_img = raw_img
    if apply_enhancement:
        processed_img = apply_opencv_enhancements(
            processed_img, 
            brightness_factor=brightness, 
            contrast_factor=contrast,
            vibrance_factor=vibrance,
            sharpness_factor=sharpness
        )

    # 2. Background Removal
    if remove_bg:
        if REMBG_AVAILABLE:
            try:
                processed_rgba = rembg_remove(processed_img)
                processed_rgba = refine_alpha_edges(processed_rgba)
            except Exception as e:
                print(f"[WARN] rembg processing notice: {e}, using GrabCut fallback.")
                processed_rgba = remove_background_grabcut(processed_img)
        else:
            processed_rgba = remove_background_grabcut(processed_img)
    else:
        processed_rgba = processed_img.convert("RGBA")

    # 3. E-commerce studio standardization (1:1 square, centered, crisp white background)
    if standardize:
        final_img = standardize_ecommerce_format(processed_rgba)
    else:
        bg = Image.new("RGB", processed_rgba.size, (255, 255, 255))
        if processed_rgba.mode == 'RGBA':
            bg.paste(processed_rgba, mask=processed_rgba.split()[3])
        else:
            bg.paste(processed_rgba)
        final_img = bg

    # Save processed studio image at 95% quality for sharp presentation
    final_img.save(enhanced_path, format="JPEG", quality=95, optimize=True)

    # Encode to base64 data URI for instant reliable frontend display
    buffered_enhanced = io.BytesIO()
    final_img.save(buffered_enhanced, format="JPEG", quality=94)
    enhanced_b64 = base64.b64encode(buffered_enhanced.getvalue()).decode('utf-8')
    enhanced_data_uri = f"data:image/jpeg;base64,{enhanced_b64}"

    buffered_raw = io.BytesIO()
    raw_img.convert("RGB").save(buffered_raw, format="JPEG", quality=88)
    raw_b64 = base64.b64encode(buffered_raw.getvalue()).decode('utf-8')
    raw_data_uri = f"data:image/jpeg;base64,{raw_b64}"

    print(f"[PHOTO-STUDIO] Processed photo: ID={img_id}, dimensions={final_img.width}x{final_img.height}, bg_removed={remove_bg}, enhanced={apply_enhancement}")

    return {
        "original_image_url": f"/static/uploads/{original_filename}",
        "enhanced_image_url": f"/static/uploads/{enhanced_filename}",
        "enhanced_image_data": enhanced_data_uri,
        "original_image_data": raw_data_uri,
        "width": final_img.width,
        "height": final_img.height,
        "bg_removed": remove_bg,
        "enhanced": apply_enhancement
    }


