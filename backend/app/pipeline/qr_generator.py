import qrcode
from PIL import Image, ImageDraw
from pathlib import Path
from backend.app.config import QR_DIR, FRONTEND_URL

def generate_product_qr_badge(product_id: str, artisan_name: str = "Artisan") -> str:
    """
    Generates a QR code linking to the public digital authenticity certificate.
    """
    cert_url = f"{FRONTEND_URL}/certificate/{product_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(cert_url)
    qr.make(fit=True)

    # Styling QR image (terracotta / saffron themed dots)
    qr_img = qr.make_image(fill_color="#C2410C", back_color="white").convert("RGB")
    
    # Save QR code
    qr_filename = f"qr_{product_id}.png"
    qr_filepath = QR_DIR / qr_filename
    qr_img.save(qr_filepath, format="PNG")

    return f"/static/qrcodes/{qr_filename}"
