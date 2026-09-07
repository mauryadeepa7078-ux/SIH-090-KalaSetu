import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.app.config import DATA_DIR
from backend.app.data.seed_data import SEED_PRODUCTS, SEED_RFQS, SEED_ORDERS
from backend.app.pipeline.qr_generator import generate_product_qr_badge

DB_FILE = DATA_DIR / "products_store.json"
RFQ_FILE = DATA_DIR / "rfq_store.json"
ORDERS_FILE = DATA_DIR / "orders_store.json"

class DatabaseStore:
    def __init__(self):
        self.products: List[Dict[str, Any]] = []
        self.rfqs: List[Dict[str, Any]] = []
        self.orders: List[Dict[str, Any]] = []
        self._initialize()

    def _initialize(self):
        if not DB_FILE.exists():
            self.reset_demo_data()
        else:
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    self.products = json.load(f)
            except Exception:
                self.reset_demo_data()

        if not RFQ_FILE.exists():
            self.rfqs = [dict(r) for r in SEED_RFQS]
            self._save_rfqs()
        else:
            try:
                with open(RFQ_FILE, "r", encoding="utf-8") as f:
                    self.rfqs = json.load(f)
            except Exception:
                self.rfqs = [dict(r) for r in SEED_RFQS]
                self._save_rfqs()

        if not ORDERS_FILE.exists():
            self.orders = [dict(o) for o in SEED_ORDERS]
            self._save_orders()
        else:
            try:
                with open(ORDERS_FILE, "r", encoding="utf-8") as f:
                    self.orders = json.load(f)
            except Exception:
                self.orders = [dict(o) for o in SEED_ORDERS]
                self._save_orders()

    def _save_products(self):
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(self.products, f, ensure_ascii=False, indent=2)
                f.flush()
                try:
                    os.fsync(f.fileno())
                except Exception:
                    pass
            print(f"[BACKEND-DB] Successfully persisted {len(self.products)} products to disk: {DB_FILE}")
        except Exception as e:
            print(f"[BACKEND-DB-ERROR] Error writing products to disk: {e}")

    def _save_rfqs(self):
        try:
            with open(RFQ_FILE, "w", encoding="utf-8") as f:
                json.dump(self.rfqs, f, ensure_ascii=False, indent=2)
                f.flush()
                try:
                    os.fsync(f.fileno())
                except Exception:
                    pass
            print(f"[BACKEND-DB] Successfully persisted {len(self.rfqs)} RFQs to disk: {RFQ_FILE}")
        except Exception as e:
            print(f"[BACKEND-DB-ERROR] Error writing RFQs to disk: {e}")

    def _save_orders(self):
        try:
            with open(ORDERS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.orders, f, ensure_ascii=False, indent=2)
                f.flush()
                try:
                    os.fsync(f.fileno())
                except Exception:
                    pass
            print(f"[BACKEND-DB] Successfully persisted {len(self.orders)} orders to disk: {ORDERS_FILE}")
        except Exception as e:
            print(f"[BACKEND-DB-ERROR] Error writing orders to disk: {e}")


    def reset_demo_data(self) -> List[Dict[str, Any]]:
        """
        Resets database to pristine hackathon demo state with 10 rich artisan products, generated QRs, orders, and RFQs.
        """
        self.products = []
        for item in SEED_PRODUCTS:
            prod = dict(item)
            try:
                prod["qr_badge_url"] = generate_product_qr_badge(prod["id"], prod["artisan_name"])
            except Exception as e:
                prod["qr_badge_url"] = f"/static/qrcodes/qr_{prod['id']}.png"
            self.products.append(prod)

        self.rfqs = [dict(r) for r in SEED_RFQS]
        self.orders = [dict(o) for o in SEED_ORDERS]
        self._save_products()
        self._save_rfqs()
        self._save_orders()
        print(f"[OK] Demo database reset successfully to {len(self.products)} products and {len(self.orders)} orders.")
        return self.products

    def get_all_products(self, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.products
        if category and category != "All":
            results = [p for p in results if p.get("category") == category]
        if search:
            s = search.lower()
            results = [p for p in results if s in p.get("title_en", "").lower() or s in p.get("title_hi", "").lower() or s in p.get("artisan_name", "").lower() or s in p.get("artisan_state", "").lower()]
        print(f"[BACKEND-DB] get_all_products returning {len(results)} products (category={category}, search={search})")
        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        for p in self.products:
            if p.get("id") == product_id:
                p["views_count"] = p.get("views_count", 0) + 1
                self._save_products()
                return p
        return None

    def add_or_update_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        prod_id = product_data.get("id") or f"prod-{str(uuid.uuid4())[:8]}"
        product_data["id"] = prod_id
        
        if not product_data.get("created_at"):
            product_data["created_at"] = datetime.utcnow().isoformat() + "Z"
        
        # Ensure QR badge exists
        if not product_data.get("qr_badge_url"):
            try:
                product_data["qr_badge_url"] = generate_product_qr_badge(prod_id, product_data.get("artisan_name", "Artisan"))
            except Exception:
                product_data["qr_badge_url"] = f"/static/qrcodes/qr_{prod_id}.png"

        print(f"[BACKEND-DB] add_or_update_product called for ID={prod_id}, title={product_data.get('title_en')}")

        # Check existing
        for i, existing in enumerate(self.products):
            if existing.get("id") == prod_id:
                self.products[i] = product_data
                self._save_products()
                print(f"[BACKEND-DB] Updated existing product ID={prod_id}. Total products in DB: {len(self.products)}")
                return product_data

        self.products.insert(0, product_data)
        self._save_products()
        print(f"[BACKEND-DB] Inserted new product ID={prod_id}. Total products in DB: {len(self.products)}")
        return product_data

    def delete_product(self, product_id: str) -> bool:
        initial_len = len(self.products)
        self.products = [p for p in self.products if p.get("id") != product_id]
        if len(self.products) < initial_len:
            self._save_products()
            print(f"[BACKEND-DB] Deleted product ID={product_id}. Remaining: {len(self.products)}")
            return True
        return False


    def sync_batch(self, offline_products: List[Dict[str, Any]]) -> Dict[str, Any]:
        synced_count = 0
        for item in offline_products:
            item["sync_status"] = "SYNCED"
            self.add_or_update_product(item)
            synced_count += 1
        return {
            "synced_count": synced_count,
            "total_products": len(self.products),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

    # Orders Management
    def get_orders(self, artisan_name: Optional[str] = None) -> List[Dict[str, Any]]:
        if artisan_name:
            norm = artisan_name.lower().strip()
            return [o for o in self.orders if norm in o.get("artisan_name", "").lower()]
        return self.orders

    def add_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        order_id = order_data.get("id") or f"ORD-2026-{str(uuid.uuid4())[:6].upper()}"
        order_data["id"] = order_id
        if not order_data.get("order_date"):
            order_data["order_date"] = datetime.utcnow().strftime("%d %b %Y")
        if not order_data.get("created_at"):
            order_data["created_at"] = datetime.utcnow().isoformat() + "Z"
        if not order_data.get("status"):
            order_data["status"] = "PLACED"
        if "stage_index" not in order_data:
            order_data["stage_index"] = 0
        if not order_data.get("tracking_id"):
            order_data["tracking_id"] = f"DNK-INPOST-{str(uuid.uuid4())[:6].upper()}"
        if not order_data.get("delivery_partner"):
            order_data["delivery_partner"] = "IndiaPost Dak Ghar Niryat Kendra"

        self.orders.insert(0, order_data)
        self._save_orders()
        print(f"[BACKEND-DB] Saved new order ID={order_id}, buyer={order_data.get('buyer_name')}. Total orders: {len(self.orders)}")
        return order_data

    def update_order_status(self, order_id: str, new_status: str, stage_index: Optional[int] = None) -> Optional[Dict[str, Any]]:
        stage_map = {
            "PLACED": 0,
            "CONFIRMED": 1,
            "PACKED": 2,
            "SHIPPED": 3,
            "OUT_FOR_DELIVERY": 4,
            "DELIVERED": 5
        }
        computed_stage = stage_index if stage_index is not None else stage_map.get(new_status, 0)

        for o in self.orders:
            if o.get("id") == order_id:
                o["status"] = new_status
                o["stage_index"] = computed_stage
                self._save_orders()
                print(f"[BACKEND-DB] Updated order ID={order_id} to status={new_status} (stage={computed_stage})")
                return o
        return None

    # RFQ Management
    def get_rfqs(self) -> List[Dict[str, Any]]:
        return self.rfqs

    def add_rfq(self, rfq_data: Dict[str, Any]) -> Dict[str, Any]:
        rfq_id = rfq_data.get("id") or f"rfq-{str(uuid.uuid4())[:6]}"
        rfq_data["id"] = rfq_id
        if not rfq_data.get("inquiry_date"):
            rfq_data["inquiry_date"] = datetime.utcnow().strftime("%Y-%m-%d")
        if not rfq_data.get("status"):
            rfq_data["status"] = "OPEN"
        if not rfq_data.get("stage_index"):
            rfq_data["stage_index"] = 0

        self.rfqs.insert(0, rfq_data)
        self._save_rfqs()
        print(f"[BACKEND-DB] Saved new RFQ ID={rfq_id}, org={rfq_data.get('organization')}. Total RFQs: {len(self.rfqs)}")
        return rfq_data

    def update_rfq_status(self, rfq_id: str, new_status: str, stage_index: Optional[int] = None) -> Optional[Dict[str, Any]]:
        rfq_stage_map = {
            "OPEN": 0,
            "SEEN": 1,
            "QUOTED": 2,
            "ACCEPTED": 3,
            "IN_PRODUCTION": 4,
            "DISPATCHED": 5,
            "DELIVERED": 6
        }
        for rfq in self.rfqs:
            if rfq.get("id") == rfq_id:
                rfq["status"] = new_status
                if stage_index is not None:
                    rfq["stage_index"] = stage_index
                elif new_status in rfq_stage_map:
                    rfq["stage_index"] = rfq_stage_map[new_status]
                self._save_rfqs()
                print(f"[BACKEND-DB] Updated RFQ ID={rfq_id} to status={new_status}")
                return rfq
        return None

    def toggle_gem_publish(self, product_id: str) -> Optional[Dict[str, Any]]:
        for p in self.products:
            if p.get("id") == product_id:
                p["gem_published"] = not p.get("gem_published", False)
                self._save_products()
                return p
        return None

    def get_analytics_summary(self) -> Dict[str, Any]:
        total_listings = len(self.products)
        total_views = sum(p.get("views_count", 0) for p in self.products)
        total_valuation = sum(p.get("price", 0) for p in self.products)
        pending_rfqs = len([r for r in self.rfqs if r.get("status") in ["OPEN", "BID_SUBMITTED", "QUOTED"]])
        return {
            "total_listings": total_listings,
            "total_views": max(total_views, 1420),
            "total_inquiries": 84,
            "pending_rfqs_count": max(pending_rfqs, 4),
            "total_valuation_inr": total_valuation or 58000,
            "total_orders_count": len(self.orders)
        }

db_store = DatabaseStore()

