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
    brightness: float = Form(1.05),
    contrast: float = Form(1.15)
):
    """
    Core Feature 1: AI Photo Studio
    - Background removal via rembg / U2-Net
    - OpenCV CLAHE, auto white-balance, brightness correction
    - 1:1 square e-commerce studio format standardization
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file received.")
        
        result = process_artisan_photo(
            image_bytes=image_bytes,
            remove_bg=remove_bg,
            apply_enhancement=apply_enhancement,
            standardize=standardize,
            brightness=brightness,
            contrast=contrast
        )
        return {
            "status": "success",
            "message": "Image processed through AI Photo Studio",
            "data": result
        }
    except Exception as e:
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

