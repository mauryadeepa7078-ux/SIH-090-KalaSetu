from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from backend.app.data.db_store import db_store

router = APIRouter(prefix="/api/marketplace", tags=["B2B & Government e-Marketplace (GeM/ONDC)"])

@router.get("/rfqs")
def get_buyer_rfqs():
    """
    Differentiator Feature 6: Simulated Institutional Buyer Inquiries (TRIFED, FabIndia, Govt Depts)
    """
    return db_store.get_rfqs()

@router.post("/rfqs/{rfq_id}/status")
def update_rfq_status(rfq_id: str, status: str):
    updated = db_store.update_rfq_status(rfq_id, status)
    if not updated:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return {"status": "success", "rfq": updated}

@router.post("/products/{product_id}/toggle-gem")
def toggle_gem_publish(product_id: str):
    """
    1-Click Publishing to Government e-Marketplace (GeM) & ONDC
    """
    updated = db_store.toggle_gem_publish(product_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "status": "success",
        "gem_published": updated.get("gem_published", False),
        "message": "Product published to GeM / ONDC network" if updated.get("gem_published") else "Product unlisted from GeM"
    }

@router.get("/gem-export/{product_id}")
def generate_gem_compliance_export(product_id: str):
    """
    Generates standard GeM & ONDC compliant catalog metadata export for government integration.
    """
    product = db_store.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # HSN code mapping for handicrafts
    hsn_mapping = {
        "Handloom Saree": "5007 (Woven fabrics of silk)",
        "Madhubani Painting": "9701 (Paintings, drawings hand-executed)",
        "Brass Dokra Craft": "7419 (Other articles of brass/copper)",
        "Wood Carving": "4420 (Wood marquetry and inlaid wood)",
        "Blue Pottery": "6913 (Statuettes and ceramic articles)",
        "Leather Craft": "6403 (Footwear with outer soles of leather)"
    }

    hsn_code = hsn_mapping.get(product.get("category"), "9703 (Original sculptures and statuary)")

    return {
        "protocol_version": "ONDC:RET10 / GeM-v4.0-Handicraft",
        "integration_type": "MOCK_CONNECTOR_LAYER",
        "note": "Mock GeM/ONDC Integration Layer - Ready to bind live Govt API keys post-hackathon",
        "gem_catalog_item": {
            "item_code": f"GeM-HC-{product.get('id', '').upper()}",
            "item_name": product.get("title_en"),
            "category_name": product.get("category"),
            "hsn_code": hsn_code,
            "gst_rate": "0% (Exempt for registered MoSJE rural artisans)",
            "artisan_beneficiary_id": product.get("mosje_scheme_id"),
            "gi_certified": product.get("gi_tagged", False),
            "gi_cert_no": product.get("gi_certification_no", "N/A"),
            "base_offering_price_inr": product.get("price"),
            "delivery_sla_days": 7,
            "origin_cluster": f"{product.get('artisan_village')}, {product.get('artisan_state')}",
            "fulfillment_mode": "IndiaPost-DakGhar-Niryat-Kendra"
        }
    }
