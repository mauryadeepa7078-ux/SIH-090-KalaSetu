from fastapi import APIRouter
from backend.app.data.db_store import db_store

router = APIRouter(prefix="/api/analytics", tags=["Artisan Analytics Dashboard"])

@router.get("/dashboard")
def get_analytics_dashboard():
    """
    Differentiator Feature 9: Analytics Dashboard Metrics & Chart Data
    """
    products = db_store.get_all_products()
    rfqs = db_store.get_rfqs()

    total_listings = len(products)
    total_views = sum(p.get("views_count", 0) for p in products)
    total_inquiries = sum(p.get("inquiries_count", 0) for p in products)
    total_valuation = sum(p.get("price", 0) for p in products)
    gem_published_count = sum(1 for p in products if p.get("gem_published"))
    ondc_published_count = sum(1 for p in products if p.get("ondc_published"))
    gi_tagged_count = sum(1 for p in products if p.get("gi_tagged"))

    # Top performing products
    top_products = sorted(products, key=lambda x: x.get("views_count", 0), reverse=True)[:5]

    # Category distribution
    cat_counts = {}
    for p in products:
        c = p.get("category", "Other")
        cat_counts[c] = cat_counts.get(c, 0) + 1
    
    category_chart_data = [{"category": k, "count": v} for k, v in cat_counts.items()]

    # State distribution
    state_counts = {}
    for p in products:
        st = p.get("artisan_state", "Other")
        state_counts[st] = state_counts.get(st, 0) + 1
    
    state_chart_data = [{"state": k, "count": v} for k, v in state_counts.items()]

    # Monthly performance trend (simulated high-fidelity trend)
    monthly_trend = [
        {"month": "Apr", "views": 140, "inquiries": 12, "sales_k": 18.5},
        {"month": "May", "views": 210, "inquiries": 19, "sales_k": 26.0},
        {"month": "Jun", "views": 350, "inquiries": 34, "sales_k": 42.0},
        {"month": "Jul", "views": 480, "inquiries": 48, "sales_k": 58.0},
        {"month": "Aug", "views": 720, "inquiries": 76, "sales_k": 84.5},
        {"month": "Sep (Current)", "views": total_views, "inquiries": total_inquiries, "sales_k": 112.0}
    ]

    return {
        "summary": {
            "total_listings": total_listings,
            "total_views": total_views,
            "total_inquiries": total_inquiries,
            "total_valuation_inr": total_valuation,
            "gem_published_count": gem_published_count,
            "ondc_published_count": ondc_published_count,
            "gi_tagged_count": gi_tagged_count,
            "pending_rfqs_count": len([r for r in rfqs if r.get("status") == "OPEN"])
        },
        "top_products": [
            {
                "id": p.get("id"),
                "title_en": p.get("title_en"),
                "title_hi": p.get("title_hi"),
                "price": p.get("price"),
                "views": p.get("views_count", 0),
                "inquiries": p.get("inquiries_count", 0),
                "image": p.get("enhanced_image_url") or p.get("original_image_url")
            } for p in top_products
        ],
        "category_distribution": category_chart_data,
        "state_distribution": state_chart_data,
        "monthly_trend": monthly_trend
    }
