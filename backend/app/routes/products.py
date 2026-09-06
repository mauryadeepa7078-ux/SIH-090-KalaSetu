from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from backend.app.models.schemas import ProductCreate, BatchSyncRequest
from backend.app.data.db_store import db_store

router = APIRouter(prefix="/api/products", tags=["Products & Catalog"])

@router.get("")
def list_products(
    category: Optional[str] = Query(None, description="Filter by craft category"),
    search: Optional[str] = Query(None, description="Search query")
):
    return db_store.get_all_products(category=category, search=search)

@router.get("/{product_id}")
def get_product(product_id: str):
    product = db_store.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("")
def save_product(product: ProductCreate):
    saved = db_store.add_or_update_product(product.model_dump())
    return {
        "status": "success",
        "message": "Product saved successfully",
        "product": saved
    }

@router.delete("/{product_id}")
def delete_product(product_id: str):
    success = db_store.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "message": "Product deleted"}

@router.post("/sync")
def sync_offline_products(payload: BatchSyncRequest):
    """
    Differentiator Feature 4: Batch Synchronization for Offline-First Mode
    """
    items = [p.model_dump() for p in payload.products]
    result = db_store.sync_batch(items)
    return result

@router.post("/reset-demo")
def reset_demo_database():
    """
    Judges & Presentation Utility: Reset database to 10 pristine seed artisan products
    """
    reset_data = db_store.reset_demo_data()
    return {
        "status": "success",
        "message": "Demo database successfully reset to 10 authentic artisan products",
        "total_products": len(reset_data)
    }

@router.get("/{product_id}/certificate")
def get_digital_authenticity_certificate(product_id: str):
    """
    Differentiator Feature 7: Public Verifiable MoSJE Digital Certificate
    """
    product = db_store.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Certificate not found for product")
    
    return {
        "certificate_id": f"CERT-MoSJE-2026-{product.get('id', '').upper()}",
        "product_id": product.get("id"),
        "title_en": product.get("title_en"),
        "title_hi": product.get("title_hi"),
        "artisan_name": product.get("artisan_name"),
        "artisan_village": product.get("artisan_village"),
        "artisan_state": product.get("artisan_state"),
        "mosje_scheme_id": product.get("mosje_scheme_id"),
        "gi_tagged": product.get("gi_tagged", False),
        "gi_certification_no": product.get("gi_certification_no"),
        "craft_lineage_years": product.get("craft_lineage_years"),
        "category": product.get("category"),
        "material_type": product.get("material_type"),
        "cultural_story_en": product.get("cultural_story_en"),
        "cultural_story_hi": product.get("cultural_story_hi"),
        "image_url": product.get("enhanced_image_url") or product.get("original_image_url"),
        "qr_badge_url": product.get("qr_badge_url"),
        "verification_seal": "OFFICIALLY VERIFIED - MoSJE HERITAGE & CULTURE CLUSTER",
        "issued_date": product.get("created_at", "2026-08-25T10:00:00Z")
    }
