import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.config import STATIC_DIR
from backend.app.routes import ai, products, whatsapp, marketplace, analytics

app = FastAPI(
    title="KalaSetu (कलासेतु) - AI Virtual Business Manager Backend",
    description="Smart India Hackathon 2026 (SIH26090) - MoSJE Heritage & Culture AI Backend API",
    version="1.0.0"
)

# Enable CORS for cross-origin frontend & mobile apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (uploads, QR codes, processed images)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include Routers
app.include_router(ai.router)
app.include_router(products.router)
app.include_router(whatsapp.router)
app.include_router(marketplace.router)
app.include_router(analytics.router)

@app.get("/")
def root_endpoint():
    return {
        "app": "KalaSetu (कलासेतु) AI Virtual Business Manager",
        "sih_problem_id": "SIH26090",
        "ministry": "Ministry of Social Justice and Empowerment (MoSJE)",
        "theme": "Heritage & Culture",
        "status": "ONLINE",
        "docs_url": "/docs",
        "modules": [
            "AI Photo Studio (rembg + OpenCV CLAHE / Gray World)",
            "Multilingual Voice-to-Catalog (Whisper + Gemini LLM)",
            "Dynamic Pricing Assistant (Scikit-Learn Regression)",
            "Offline-First Sync Engine",
            "Twilio WhatsApp Bot & Interactive Simulator",
            "B2B GeM / ONDC Connector (Simulated)",
            "Trust & Authenticity QR Certificate Generator",
            "Analytics Engine"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "kalasetu-backend"}
