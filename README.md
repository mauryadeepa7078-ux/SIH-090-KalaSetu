# 🏺 KalaSetu (कलासेतु)
### AI-Driven Market Linkage & Smart Cataloging Virtual Business Manager for Artisans
**Smart India Hackathon 2026** | **Problem Statement ID:** `SIH26090`  
**Ministry:** Ministry of Social Justice and Empowerment (MoSJE) | **Theme:** Heritage & Culture

---

## 📖 Executive Summary
Marginalized artisans, weavers, and rural micro-entrepreneurs receive periodic exposure through physical fairs (Dilli Haat, Surajkund Mela, Shilp Samagam) but lack continuous digital sales channels due to low digital literacy, language barriers, and lack of skills for professional product photography, pricing, and cataloging.

**KalaSetu (कलासेतु)** acts as an autonomous **AI Virtual Business Manager** enabling artisans to digitize products, generate studio-grade e-commerce assets, create bilingual listings in their native dialects, obtain fair dynamic pricing, and link directly to B2B government e-marketplaces (GeM & ONDC) and WhatsApp.

---

## 🌟 Feature Breakdown

### A. CORE FEATURES (100% Functional)
1. **AI Photo Studio**:
   - In-app camera capture and gallery upload.
   - Pretrained `rembg` (U2-Net) background removal with smart fallback.
   - OpenCV auto-enhancement: Gray World auto-white balance, LAB-color CLAHE (Contrast Limited Adaptive Histogram Equalization), and brightness correction.
   - Standardized 1:1 e-commerce format on crisp white studio background.
2. **Multilingual Voice-to-Catalog**:
   - Voice recording in regional dialects (Hindi, Bhojpuri, Tamil, Bengali, English).
   - Speech-to-text via OpenAI Whisper & browser Web Speech API.
   - Google Gemini / LLM bilingual description generation producing structured listings in **both Hindi and English** (Titles, descriptions, cultural heritage stories, bullet features, dimensions, care instructions, tags).
   - Interactive, editable form for artisan review before publishing.
3. **Dynamic Pricing Assistant**:
   - Machine Learning regression model (`scikit-learn` Ridge/RandomForest) trained on benchmark Indian handicraft pricing datasets.
   - Inputs: Craft Category, Raw Material Cost, Labor Hours, Skill Tier, Dimensions, GI Tag status.
   - Outputs: Recommended Selling Price, Min–Max Fair Range, and an **Explainable Cost Breakdown** (`Material + Labor + Margin + Heritage Premium`).

### B. DIFFERENTIATOR FEATURES
4. **Offline-First Mode**:
   - Local storage queue with visual "Pending Sync" indicators.
   - Works seamlessly in rural craft melas without internet; automatically batch syncs to backend once connectivity is restored.
5. **WhatsApp Bot Integration**:
   - Twilio WhatsApp API webhook (`/api/whatsapp/webhook`).
   - Interactive **Live WhatsApp Simulator** inside the app allowing judges to send photos + voice notes and receive instant catalog cards and pricing recommendations.
6. **B2B / Government e-Marketplace (GeM / ONDC) Integration (Simulated)**:
   - Institutional buyer RFQs dashboard (TRIFED, FabIndia, Central Cottage Industries Emporium, SBI CSR).
   - 1-click "Publish to GeM" and compliance exporter generating valid HSN codes (`5007`, `9701`, `7419`), 0% GST exemption flags, and IndiaPost Dak Ghar Niryat Kendra logistics mapping.
7. **Trust & Authenticity Badge (Digital MoSJE Certificate)**:
   - Dynamic QR code generated per product.
   - Public verifiable Certificate page detailing artisan beneficiary ID, craft cluster origin, GI certification number, and digital authentication seal.
8. **Voice-Guided Navigation**:
   - Voice hotword listener ("नया उत्पाद", "बिक्री देखें", "मूल्य जांचें", "GeM पोर्टल", "सिंक करें").
   - Spoken Text-to-Speech (TTS) audio guidance in Hindi and English for low-literacy artisans.
9. **Analytics Dashboard**:
   - Recharts visual analytics: total listings, monthly views, institutional inquiries, catalog valuation, and craft category distribution.

### C. POLISH & UTILITIES
10. **Multi-language UI Toggle**: Hindi (हिंदी), English, Tamil (தமிழ்), Bhojpuri (भोजपुरी), Bengali (বাংলা).
11. **Social Media Auto-Post Generator**: Pre-formatted high-conversion Instagram & Facebook captions with hashtags.
12. **Artisan Community Feed**: Peer showcase and inspiring handcrafted collections.
13. **1-Click "Reset Demo Data" Button**: Restores 10 pre-seeded authentic Indian craft listings for practice and presentation runs.

---

## ⚖️ Real AI vs. Simulated Integrations (For Judges)

| Feature Component | Implementation Status | Technologies Used |
|---|---|---|
| **AI Background Removal** | **REAL WORKING AI** | `rembg` (U2-Net) + PIL alpha compositing |
| **Color & Lighting Correction** | **REAL WORKING AI** | OpenCV (CLAHE, Gray World AWB, Tone curves) |
| **Speech-to-Text (STT)** | **REAL WORKING AI** | OpenAI Whisper API + Web Speech API |
| **Bilingual Listing Generation** | **REAL WORKING AI** | Google Gemini 1.5 Flash / LLM Engine |
| **Dynamic Pricing Model** | **REAL WORKING ML** | Scikit-Learn Regression on handicraft datasets |
| **Offline Sync Queue** | **REAL WORKING ENGINE** | Local Storage / IndexedDB Queue + Batch API |
| **Trust Certificate & QR** | **REAL WORKING ENGINE** | Python `qrcode` + Public Verification Canvas |
| **GeM / ONDC B2B Connector** | **MOCK ADAPTER LAYER** | Mock endpoint & dashboard styled to match GeM v4.0 & ONDC schemas |
| **WhatsApp Bot Interface** | **REAL WEBHOOK + SIMULATOR** | Twilio MMS webhook + In-App Live WhatsApp Chat simulator |
| **Social Media Auto-Post** | **SIMULATED GENERATOR** | Formatted copy generator with clipboard copy |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm

### 1. Backend Setup
```bash
# Navigate to project root
cd "SIH 090"

# Activate Python virtual environment
backend\venv\Scripts\activate

# Run the FastAPI server
python backend/run.py
```
Backend API will be live at: **`http://localhost:8000`**  
Interactive API Docs (Swagger): **`http://localhost:8000/docs`**

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd "SIH 090/frontend"

# Start the Vite development server
npm run dev
```
Frontend App will be live at: **`http://localhost:5173`**

---

## 🔑 Environment Variables (`.env`)
Create a file named `backend/.env` (optional — resilient fallbacks are enabled for all AI components):
```env
# Google Gemini API Key (for Voice-to-Catalog LLM)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (for Whisper Speech-to-Text)
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Credentials (for live WhatsApp Webhook)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

---

## 🎯 Recommended 3-Minute Demo Flow for Hackathon Judges
1. **Catalog Overview**: Show the 10 pre-seeded authentic Indian craft listings (Banarasi Saree, Madhubani Art, Dokra Brass, Blue Pottery, etc.).
2. **AI Photo Studio**: Take or upload a raw handicraft photo. Show the real-time background removal (`rembg`) and OpenCV studio lighting enhancement.
3. **Voice-to-Catalog**: Click the microphone or use a sample voice note. Watch AI produce instant dual **Hindi and English** listings with cultural heritage stories.
4. **Dynamic Pricing Assistant**: Adjust artisan hours and material costs. Explain the Scikit-Learn ML price breakdown.
5. **Offline Mode Test**: Toggle the "Online/Offline" switch in the header. Add an item offline, watch the "Pending Sync (1)" badge appear, reconnect, and click "Sync Now".
6. **WhatsApp Simulator**: Open the WhatsApp Bot tab. Send a photo and audio message to watch the AI bot reply in real time!
7. **Trust & Certificate QR**: Open any product and view the public verifiable MoSJE Digital Authenticity Certificate.
8. **GeM Portal**: Show the simulated GeM/ONDC buyer inquiries (TRIFED / FabIndia) and compliant metadata export.
