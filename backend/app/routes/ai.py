from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from backend.app.models.schemas import (
    PricingCalculationRequest, 
    PriceBreakdown, 
    CatalogGenerateRequest, 
    ProductCatalogResponse,
    AssistantChatRequest,
    AssistantChatResponse
)
from backend.app.pipeline.photo_studio import process_artisan_photo
from backend.app.pipeline.voice_catalog import transcribe_audio_whisper, generate_bilingual_catalog, answer_artisan_question
from backend.app.pipeline.pricing_model import pricing_engine

router = APIRouter(prefix="/api/ai", tags=["AI Pipeline"])

@router.post("/photo-studio")
async def ai_photo_studio(
    file: UploadFile = File(...),
    remove_bg: bool = Form(True),
    apply_enhancement: bool = Form(True),
    standardize: bool = Form(True),
    brightness: float = Form(1.08),
    contrast: float = Form(1.22),
    vibrance: float = Form(1.25),
    sharpness: float = Form(1.45),
    add_shadow: bool = Form(True)
):
    """
    Core Feature 1: AI Photo Studio
    - Background removal via rembg / U2-Net with alpha defringing
    - Multi-band Unsharp Mask (USM), CLAHE dynamic range, HSV saturation booster
    - Standardized 1:1 luxury e-commerce studio format with soft ambient contact shadow
    """
    print(f"[BACKEND-API] POST /api/ai/photo-studio received: filename='{file.filename}', content_type='{file.content_type}', remove_bg={remove_bg}, standardize={standardize}, add_shadow={add_shadow}")
    try:
        image_bytes = await file.read()
        if not image_bytes:
            print("[BACKEND-API-ERROR] Empty image file received in photo-studio endpoint")
            raise HTTPException(status_code=400, detail="Empty image file received.")
        
        print(f"[BACKEND-API] Processing image of size {len(image_bytes)} bytes with AI pipeline...")
        result = process_artisan_photo(
            image_bytes=image_bytes,
            remove_bg=remove_bg,
            apply_enhancement=apply_enhancement,
            standardize=standardize,
            brightness=brightness,
            contrast=contrast,
            vibrance=vibrance,
            sharpness=sharpness,
            add_shadow=add_shadow
        )
        print(f"[BACKEND-API] AI Photo Studio completed successfully. Enhanced image URL: {result.get('enhanced_image_url')}")
        return {
            "status": "success",
            "message": "Image processed through AI Photo Studio",
            "data": result
        }
    except Exception as e:
        print(f"[BACKEND-API-ERROR] Photo Studio processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Photo Studio error: {str(e)}")


@router.post("/transcribe-voice")
async def transcribe_voice(file: UploadFile = File(...)):
    """
    Core Feature 2a: Multilingual Speech-to-Text via Whisper
    """
    try:
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file.")
        
        transcribed_text = await transcribe_audio_whisper(audio_bytes, file.filename or "audio.webm")
        return {
            "status": "success",
            "transcription": transcribed_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text error: {str(e)}")

@router.post("/generate-catalog", response_model=ProductCatalogResponse)
async def generate_catalog(req: CatalogGenerateRequest):
    """
    Core Feature 2b: Voice-to-Catalog LLM generation in Hindi & English
    """
    try:
        result = generate_bilingual_catalog(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Catalog generation error: {str(e)}")

@router.post("/calculate-pricing", response_model=PriceBreakdown)
async def calculate_pricing(req: PricingCalculationRequest):
    """
    Core Feature 3: Dynamic ML Pricing Assistant with explainable breakdown
    """
    try:
        result = pricing_engine.calculate_price(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pricing calculation error: {str(e)}")

@router.post("/assistant-chat", response_model=AssistantChatResponse)
async def assistant_chat(req: AssistantChatRequest):
    """
    Update 4: Conversational AI Voice Assistant / Advisor for Artisans
    """
    try:
        result = answer_artisan_question(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant chat error: {str(e)}")

