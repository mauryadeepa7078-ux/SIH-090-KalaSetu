import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from backend.app.pipeline.pricing_model import pricing_engine
from backend.app.pipeline.voice_catalog import generate_bilingual_catalog
from backend.app.pipeline.qr_generator import generate_product_qr_badge
from backend.app.data.db_store import db_store
from backend.app.models.schemas import PricingCalculationRequest, CatalogGenerateRequest

def run_tests():
    print("=" * 60)
    print("[TEST] RUNNING KALASETU AI PIPELINE & BACKEND TESTS")
    print("=" * 60)

    # 1. Test Database & Seed Products
    products = db_store.get_all_products()
    print(f"[PASS] DB Store initialized: {len(products)} products found.")
    assert len(products) >= 10, "Should have at least 10 seed products"
    sample_prod = products[0]
    print(f"       Sample Product: '{sample_prod['title_en']}' (INR {sample_prod['price']})")

    # 2. Test Scikit-Learn Pricing Assistant
    pricing_req = PricingCalculationRequest(
        category="Handloom Saree",
        material_type="Pure Silk",
        material_cost=1500.0,
        hours_spent=36.0,
        skill_level="Master Artisan",
        dimensions="Medium",
        is_gi_tagged=True
    )
    pricing_res = pricing_engine.calculate_price(pricing_req)
    print(f"[PASS] Scikit-Learn Dynamic Pricing calculated:")
    print(f"       Recommended: INR {pricing_res.recommended_price} (Range: INR {pricing_res.min_price} - INR {pricing_res.max_price})")
    print(f"       Explanation (EN): {pricing_res.explanation_en}")
    assert pricing_res.recommended_price > 1500, "Recommended price must cover materials"

    # 3. Test Bilingual Voice-to-Catalog Generator
    catalog_req = CatalogGenerateRequest(
        raw_text="Handmade Banarasi silk saree with kadwa golden zari motifs.",
        language="hi",
        artisan_name="Ram Das"
    )
    catalog_res = generate_bilingual_catalog(catalog_req)
    print(f"[PASS] Bilingual Voice-to-Catalog generated:")
    print(f"       Title (EN): {catalog_res.title_en}")
    print(f"       Category: {catalog_res.suggested_category}")
    assert catalog_res.title_en, "Title required"

    # 4. Test QR Code Badge Generator
    qr_url = generate_product_qr_badge(sample_prod["id"], sample_prod["artisan_name"])
    print(f"[PASS] QR Code Badge generated: {qr_url}")
    assert qr_url.endswith(".png"), "QR URL should be a PNG path"

    print("=" * 60)
    print("[SUCCESS] ALL 4 BACKEND AI TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
