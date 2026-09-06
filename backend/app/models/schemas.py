from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PricingCalculationRequest(BaseModel):
    category: str
    material_type: str
    material_cost: float = Field(..., ge=0, description="Raw material cost in INR")
    hours_spent: float = Field(..., ge=0.5, description="Artisan working hours")
    skill_level: str = "Master Artisan"  # Apprentice, Skilled, Master Artisan
    dimensions: str = "Medium"  # Small, Medium, Large
    is_gi_tagged: bool = False

class PriceBreakdown(BaseModel):
    min_price: float
    recommended_price: float
    max_price: float
    material_cost: float
    labor_cost: float
    heritage_margin: float
    platform_avg: float
    explanation_en: str
    explanation_hi: str

class CatalogGenerateRequest(BaseModel):
    raw_text: str
    language: str = "hi"
    category: Optional[str] = None
    artisan_name: Optional[str] = "Artisan"
    materials: Optional[str] = None

class ProductCatalogResponse(BaseModel):
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    bullet_points_en: List[str]
    bullet_points_hi: List[str]
    cultural_story_en: str
    cultural_story_hi: str
    materials: str
    dimensions: str
    care_instructions: str
    tags: List[str]
    suggested_category: str

class ProductCreate(BaseModel):
    id: Optional[str] = None
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    cultural_story_en: Optional[str] = ""
    cultural_story_hi: Optional[str] = ""
    bullet_points_en: Optional[List[str]] = []
    bullet_points_hi: Optional[List[str]] = []
    category: str
    material_type: str
    dimensions: Optional[str] = "Standard"
    care_instructions: Optional[str] = "Wipe gently with soft dry cloth"
    tags: Optional[List[str]] = []
    
    # Pricing
    price: float
    min_price: Optional[float] = 0.0
    max_price: Optional[float] = 0.0
    material_cost: Optional[float] = 0.0
    hours_spent: Optional[float] = 0.0
    price_explanation: Optional[str] = ""
    
    # Images
    original_image_url: Optional[str] = ""
    enhanced_image_url: Optional[str] = ""
    
    # Artisan & Trust Details
    artisan_name: str
    artisan_phone: Optional[str] = ""
    artisan_village: str
    artisan_state: str
    mosje_scheme_id: Optional[str] = "MoSJE-VISH-2026-908"
    gi_tagged: bool = False
    gi_certification_no: Optional[str] = ""
    craft_lineage_years: Optional[int] = 15
    
    # Marketplace status
    gem_published: bool = False
    ondc_published: bool = False
    views_count: int = 0
    inquiries_count: int = 0
    sync_status: str = "SYNCED"  # PENDING, SYNCED
    created_at: Optional[str] = None

class BatchSyncRequest(BaseModel):
    products: List[ProductCreate]

class RFQItem(BaseModel):
    id: str
    buyer_name: str
    organization: str
    category: str
    quantity: int
    target_price: float
    location: str
    status: str  # OPEN, QUOTED, ACCEPTED
    inquiry_date: str
    requirements: str

class WhatsAppSimulationRequest(BaseModel):
    phone_number: str
    message_text: Optional[str] = ""
    audio_base64: Optional[str] = None
    image_base64: Optional[str] = None
    media_url: Optional[str] = None

class AssistantChatRequest(BaseModel):
    query: str
    lang: Optional[str] = "hi"
    role: Optional[str] = "artisan"
    context: Optional[str] = None

class AssistantChatResponse(BaseModel):
    reply: str
    suggested_action: Optional[str] = None
    target_tab: Optional[str] = None

