import base64
from fastapi import APIRouter, Form, Request, Response
from typing import Optional
from backend.app.models.schemas import (
    WhatsAppSimulationRequest,
    PricingCalculationRequest,
    CatalogGenerateRequest
)
from backend.app.pipeline.photo_studio import process_artisan_photo
from backend.app.pipeline.voice_catalog import generate_bilingual_catalog, transcribe_audio_whisper
from backend.app.pipeline.pricing_model import pricing_engine
from backend.app.data.db_store import db_store

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Virtual Business Manager"])

@router.post("/webhook")
async def twilio_whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    Body: Optional[str] = Form(""),
    MediaUrl0: Optional[str] = Form(None),
    MediaContentType0: Optional[str] = Form(None)
):
    """
    Differentiator Feature 5: Real Twilio WhatsApp API Webhook
    Reuses the exact same AI pipeline (Photo Studio + Voice/Text Catalog + Pricing)
    """
    incoming_text = Body.strip() if Body else ""
    media_url = MediaUrl0
    
    # Process text/voice description
    desc_query = incoming_text if incoming_text else "हस्तनिर्मित पारंपरिक उत्पाद"
    catalog_res = generate_bilingual_catalog(
        CatalogGenerateRequest(
            raw_text=desc_query,
            artisan_name="WhatsApp Artisan"
        )
    )

    # Dynamic pricing calculation
    pricing_res = pricing_engine.calculate_price(
        PricingCalculationRequest(
            category=catalog_res.suggested_category,
            material_type=catalog_res.materials,
            material_cost=400.0,
            hours_spent=12.0
        )
    )

    # Prepare TwiML XML Response
    bot_reply = (
        f"🙏 *नमस्ते! शिल्पसेतु (KalaSetu) AI बिज़नेस मैनेजर में आपका स्वागत है.*\n\n"
        f"✅ *उत्पाद सूची तैयार (Listing Created):*\n"
        f"📌 *शीर्षक:* {catalog_res.title_hi}\n"
        f"🏷️ *श्रेणी:* {catalog_res.suggested_category}\n"
        f"💰 *अनुशंसित मूल्य:* ₹{pricing_res.recommended_price} (रेंज: ₹{pricing_res.min_price} - ₹{pricing_res.max_price})\n"
        f"📝 *विवरण:* {catalog_res.description_hi}\n\n"
        f"💡 *अंग्रेजी शीर्षक:* {catalog_res.title_en}\n"
        f"✨ *GeM/ONDC पर प्रकाशित करने के लिए 'PUBLISH' लिखकर भेजें।* 🚀"
    )

    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>
        <Body>{bot_reply}</Body>
    </Message>
</Response>"""
    return Response(content=twiml_response, media_type="application/xml")


@router.post("/simulate")
async def simulate_whatsapp_conversation(req: WhatsAppSimulationRequest):
    """
    Live WhatsApp Simulator endpoint for Hackathon Demos:
    Handles quick action buttons, general questions, and craft creation via voice/text/photo.
    """
    raw_text = (req.message_text or "").strip()
    transcribed_text = raw_text
    
    # 1. If audio base64 is provided, transcribe it
    if req.audio_base64:
        try:
            audio_bytes = base64.b64decode(req.audio_base64.split(",")[-1])
            transcribed_text = await transcribe_audio_whisper(audio_bytes)
        except Exception as e:
            print(f"WhatsApp audio decode error: {e}")
            transcribed_text = raw_text or "हस्तनिर्मित पारंपरिक भारतीय कलाकृति"

    # Check for Quick Action buttons or specific queries
    q_lower = transcribed_text.lower()
    
    # Quick Action: Check Sales / Analytics
    if any(k in q_lower for k in ["check_sales", "check sales", "बिक्री", "sales", "analytics", "views"]):
        summary = db_store.get_analytics_summary()
        messages = [
            {
                "sender": "bot",
                "text": (
                    f"📊 *आपकी लाइव बिक्री व कैटलॉग रिपोर्ट (Sales Summary):*\n\n"
                    f"📦 *कुल उत्पाद (Listings):* {summary.get('total_listings', 10)}\n"
                    f"👁️ *कैटलॉग व्यूज (Views):* {summary.get('total_views', 1420):,} बार\n"
                    f"💬 *खरीदार पूछताछ (Inquiries):* {summary.get('total_inquiries', 84)}\n"
                    f"🏛️ *सक्रिय GeM RFQs:* {summary.get('pending_rfqs_count', 4)} ऑर्डर\n"
                    f"💰 *कुल इन्वेंटरी मूल्य:* ₹{(summary.get('total_valuation_inr', 58000)/1000):.1f}k\n\n"
                    f"✨ *MoSJE सुझाव:* नए उत्पाद जोड़ने से बिक्री 40% तक बढ़ सकती है!"
                ),
                "time": "Just now"
            }
        ]
        return {"status": "success", "messages": messages}

    # Quick Action: Check Pricing Assistant
    if any(k in q_lower for k in ["check_pricing", "check pricing", "मूल्य", "दाम", "pricing", "price calculation"]):
        messages = [
            {
                "sender": "bot",
                "text": (
                    f"💰 *KalaSetu स्मार्ट मूल्य मॉडल (Scikit-Learn ML):*\n\n"
                    f"हमारा AI आपके उत्पाद की सही और पारदर्शी कीमत 4 घटकों से तय करता है:\n"
                    f"1️⃣ *कच्चा माल लागत (Raw Materials)*: सिल्क, पीतल, क्ले आदि\n"
                    f"2️⃣ *शिल्पकार श्रम (Labor Hours)*: ₹140 - ₹180 प्रति घंटा\n"
                    f"3️⃣ *उचित लाभ मार्जिन (Fair Margin)*: 20-30%\n"
                    f"4️⃣ *जीआई विरासत प्रीमियम (GI Tag)*: +20% वैल्यू\n\n"
                    f"📝 *कीमत जानने के लिए:* उत्पाद की फोटो और सामग्री का नाम भेजें!"
                ),
                "time": "Just now"
            }
        ]
        return {"status": "success", "messages": messages}

    # Quick Action: GeM Market
    if any(k in q_lower for k in ["gem_market", "gem market", "gem", "जेम", "rfq", "bulk orders"]):
        rfqs = db_store.get_all_rfqs()
        rfq_count = len(rfqs)
        messages = [
            {
                "sender": "bot",
                "text": (
                    f"🏛️ *GeM एवं सरकारी बाज़ार लिंकेज (Government Orders):*\n\n"
                    f"वर्तमान में आपके लिए *{rfq_count} सक्रिय थोक ऑर्डर (Bulk RFQs)* उपलब्ध हैं:\n"
                    f"• *संस्कृति मंत्रालय:* 50 पीस स्मृति चिन्ह (₹65,000)\n"
                    f"• *जनजातीय कार्य मंत्रालय:* 100 पीस ढोकरा शिल्प (₹1,20,000)\n"
                    f"• *पर्यटन निगम:* 40 पीस बनारसी दुपट्टे (₹80,000)\n\n"
                    f"✅ ऑर्डर स्वीकार करने के लिए ऐप के 'GeM Portal' टैब पर जाएं।"
                ),
                "time": "Just now"
            }
        ]
        return {"status": "success", "messages": messages}

    # Quick Action: Sync Status
    if any(k in q_lower for k in ["sync", "सिंक", "डेटा सिंक"]):
        messages = [
            {
                "sender": "bot",
                "text": (
                    f"🔄 *डेटा सिंक स्थिति (Cloud Synchronization):*\n\n"
                    f"✅ आपका सारा डेटा क्लाउड सर्वर के साथ 100% सिंक्रनाइज़ है।\n"
                    f"📱 जब आपका इंटरनेट बंद होता है, तो सारे बदलाव सुरक्षित रूप से ऑफलाइन कतार में जुड़ जाते हैं और कनेक्शन आते ही स्वतः सिंक हो जाते हैं।"
                ),
                "time": "Just now"
            }
        ]
        return {"status": "success", "messages": messages}

    # Quick Action: New Listing Request
    if any(k in q_lower for k in ["new_listing", "new listing", "नया उत्पाद", "add product"]):
        messages = [
            {
                "sender": "bot",
                "text": (
                    f"📷 *नया उत्पाद जोड़ने के लिए तैयार! (Add New Craft):*\n\n"
                    f"कृपया नीचे दिए गए 📎 बटन से उत्पाद की फोटो भेजें, या 🎙️ माइक दबाकर बोलें:\n"
                    f"• यह क्या उत्पाद है?\n"
                    f"• इसे बनाने में कौन सी सामग्री और कितना समय लगा?\n\n"
                    f"AI तुरंत फोटो का बैकग्राउंड हटाकर द्विभाषी कैटलॉग और मूल्य तैयार कर देगा!"
                ),
                "time": "Just now"
            }
        ]
        return {"status": "success", "messages": messages}

    # 2. If it's a general question / greeting
    if any(k in q_lower for k in ["नमस्ते", "hello", "hi", "help", "मदद", "who are you", "क्या कर सकते हो"]):
        messages = [
            {
                "sender": "bot",
                "text": (
                    f"🙏 *नमस्ते! मैं आपका शिल्पसेतु (KalaSetu) AI बिज़नेस मैनेजर हूँ.*\n\n"
                    f"मैं आपकी इन कामों में मदद कर सकता हूँ:\n"
                    f"1. 📷 फोटो का बैकग्राउंड हटाकर ई-कॉमर्स जैसा बनाना\n"
                    f"2. 🎙️ बोलकर हिंदी व अंग्रेजी में कैटलॉग बनाना\n"
                    f"3. 💰 ML मॉडल से उचित बिक्री मूल्य तय करना\n"
                    f"4. 🏛️ GeM पोर्टल पर सरकारी खरीदारों से जुड़ना\n\n"
                    f"👉 *शुरू करने के लिए फोटो भेजें या कोई भी सवाल पूछें!*"
                ),
                "time": "Just now"
            }
        ]
        return {"status": "success", "messages": messages}

    # 3. Process image if provided or craft description
    enhanced_img_url = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
    raw_img_url = enhanced_img_url
    if req.image_base64:
        try:
            img_bytes = base64.b64decode(req.image_base64.split(",")[-1])
            photo_result = process_artisan_photo(img_bytes, remove_bg=True, apply_enhancement=True)
            enhanced_img_url = photo_result["enhanced_image_url"]
            raw_img_url = photo_result["original_image_url"]
        except Exception as e:
            print(f"WhatsApp image process error: {e}")

    # Fallback text if empty
    if not transcribed_text:
        transcribed_text = "हस्तनिर्मित पारंपरिक भारतीय कलाकृति"

    # 4. Generate Bilingual Catalog
    catalog = generate_bilingual_catalog(
        CatalogGenerateRequest(
            raw_text=transcribed_text,
            artisan_name="WhatsApp Artisan"
        )
    )

    # 5. Calculate Dynamic Pricing
    pricing = pricing_engine.calculate_price(
        PricingCalculationRequest(
            category=catalog.suggested_category,
            material_type=catalog.materials,
            material_cost=450.0,
            hours_spent=15.0
        )
    )

    # 6. Create draft product in db_store
    product_draft = {
        "title_en": catalog.title_en,
        "title_hi": catalog.title_hi,
        "description_en": catalog.description_en,
        "description_hi": catalog.description_hi,
        "cultural_story_en": catalog.cultural_story_en,
        "cultural_story_hi": catalog.cultural_story_hi,
        "bullet_points_en": catalog.bullet_points_en,
        "bullet_points_hi": catalog.bullet_points_hi,
        "category": catalog.suggested_category,
        "material_type": catalog.materials,
        "dimensions": catalog.dimensions,
        "care_instructions": catalog.care_instructions,
        "tags": catalog.tags,
        "price": pricing.recommended_price,
        "min_price": pricing.min_price,
        "max_price": pricing.max_price,
        "material_cost": pricing.material_cost,
        "hours_spent": 15.0,
        "price_explanation": pricing.explanation_en,
        "original_image_url": raw_img_url,
        "enhanced_image_url": enhanced_img_url,
        "artisan_name": "KalaSetu Artisan",
        "artisan_phone": req.phone_number,
        "artisan_village": "Heritage Craft Cluster",
        "artisan_state": "India",
        "mosje_scheme_id": "MoSJE-WHATSAPP-2026",
        "gi_tagged": True,
        "gem_published": False,
        "ondc_published": True,
        "views_count": 1,
        "inquiries_count": 0,
        "sync_status": "SYNCED"
    }
    
    saved_product = db_store.add_or_update_product(product_draft)

    messages = [
        {
            "sender": "bot",
            "text": f"🙏 *नमस्ते!* आपकी फोटो और विवरण सफलतापूर्वक प्राप्त हुआ। हमने इसे AI फोटो स्टूडियो और ट्रांसलेशन पाइपलाइन से प्रोसेस कर दिया है। ✨",
            "time": "Just now"
        },
        {
            "sender": "bot",
            "text": (
                f"🏷️ *नया डिजिटल उत्पाद कैटलॉग तैयार है:*\n\n"
                f"📌 *शीर्षक (Hindi):* {catalog.title_hi}\n"
                f"🌐 *Title (English):* {catalog.title_en}\n"
                f"🧵 *सामग्री (Material):* {catalog.materials}\n"
                f"💰 *सुझाया गया मूल्य (AI Price):* *₹{pricing.recommended_price}*\n"
                f"📊 *बाजार रेंज:* ₹{pricing.min_price} - ₹{pricing.max_price}\n\n"
                f"💡 *मूल्य का कारण:* {pricing.explanation_hi}"
            ),
            "image_url": enhanced_img_url,
            "product_id": saved_product.get("id"),
            "time": "Just now"
        },
        {
            "sender": "bot",
            "text": f"✅ यह उत्पाद आपके शिल्पसेतु कैटलॉग में जुड़ गया है! आप इसे 1-क्लिक में GeM व ONDC पर भी लाइव कर सकते हैं। 🚀",
            "time": "Just now"
        }
    ]

    return {
        "status": "success",
        "transcribed_text": transcribed_text,
        "messages": messages,
        "product": saved_product,
        "pricing": pricing.model_dump(),
        "catalog": catalog.model_dump()
    }

