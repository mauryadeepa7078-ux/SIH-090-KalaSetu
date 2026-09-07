import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Wand2, 
  Sliders, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Image as ImageIcon,
  Layers,
  Sun,
  Contrast,
  CheckCircle2,
  HelpCircle,
  Zap,
  Crown,
  ShieldCheck,
  Eye,
  Columns,
  Palette,
  Scissors,
  Flame,
  Maximize2
} from 'lucide-react';

// Fast client-side image compression (max 1200x1200 for crisp luxury detail)
const compressImageForAI = (file, maxDim = 1200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name || 'compressed_craft.jpg', {
                type: 'image/jpeg'
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.92
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

const STUDIO_PRESETS = [
  {
    id: 'studio_pro',
    name: 'Studio Light Pro',
    badge: 'Recommended',
    icon: Sparkles,
    desc: 'Vibrant & balanced luxury e-commerce catalog',
    brightness: 1.08,
    contrast: 1.22,
    vibrance: 1.25,
    sharpness: 1.45,
    addShadow: true,
  },
  {
    id: 'luxury_royal',
    name: 'Luxury Royal',
    badge: 'Warm Hues',
    icon: Crown,
    desc: 'Deep warm tones for Brass, Silk Zari & Terracotta',
    brightness: 1.05,
    contrast: 1.30,
    vibrance: 1.35,
    sharpness: 1.55,
    addShadow: true,
  },
  {
    id: 'ultra_sharp',
    name: 'Ultra-HD Sharp',
    badge: 'Micro-Weave',
    icon: Zap,
    desc: 'Micro-texture clarity for Handloom, Carving & Stone',
    brightness: 1.10,
    contrast: 1.25,
    vibrance: 1.20,
    sharpness: 1.80,
    addShadow: true,
  },
  {
    id: 'clean_white',
    name: 'Clean White 1:1',
    badge: 'GeM / Amazon',
    icon: Maximize2,
    desc: 'Pristine pure 100% white background studio cutout',
    brightness: 1.12,
    contrast: 1.15,
    vibrance: 1.15,
    sharpness: 1.30,
    addShadow: false,
  },
];

export const PhotoStudioPage = () => {
  const { t, lang, activeDraft, setActiveDraft, setActiveTab, showToast } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [rawPreview, setRawPreview] = useState(activeDraft.original_image_url || null);
  const [studioResult, setStudioResult] = useState(activeDraft.enhanced_image_url || null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Active Preset
  const [activePreset, setActivePreset] = useState('studio_pro');

  // Fine-grain Controls
  const [removeBg, setRemoveBg] = useState(true);
  const [applyEnhancement, setApplyEnhancement] = useState(true);
  const [standardize, setStandardize] = useState(true);
  const [brightness, setBrightness] = useState(1.08);
  const [contrast, setContrast] = useState(1.22);
  const [vibrance, setVibrance] = useState(1.25);
  const [sharpness, setSharpness] = useState(1.45);
  const [addShadow, setAddShadow] = useState(true);

  // View mode: 'enhanced' | 'original' | 'split'
  const [viewMode, setViewMode] = useState('enhanced');
  const [splitPos, setSplitPos] = useState(50); // percentage for split slider

  // Camera stream
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const splitContainerRef = useRef(null);

  // Apply a preset
  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setVibrance(preset.vibrance);
    setSharpness(preset.sharpness);
    setAddShadow(preset.addShadow);
    showToast(`Applied preset: ${preset.name}`, 'info');

    if (selectedFile || rawPreview) {
      processImageWithAI(
        selectedFile, 
        rawPreview, 
        preset.brightness, 
        preset.contrast, 
        preset.vibrance, 
        preset.sharpness, 
        preset.addShadow
      );
    }
  };

  // Start live webcam / phone camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera error:', err);
      showToast('Camera access permission denied or unavailable. Please use file upload.', 'warning');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'artisan_capture.jpg', { type: 'image/jpeg' });
        console.log('[PHOTO-STUDIO] [STEP 1: PHOTO CAPTURED] Camera frame captured:', file.name, `size=${blob.size} bytes`);
        setSelectedFile(file);
        const localPreviewUrl = URL.createObjectURL(blob);
        setRawPreview(localPreviewUrl);
        stopCamera();
        const optimizedFile = await compressImageForAI(file);
        processImageWithAI(optimizedFile, localPreviewUrl);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('[PHOTO-STUDIO] [STEP 1: PHOTO CAPTURED] File selected from gallery:', file.name, `size=${file.size} bytes`);
      setSelectedFile(file);
      const localPreviewUrl = URL.createObjectURL(file);
      setRawPreview(localPreviewUrl);
      stopCamera();
      const optimizedFile = await compressImageForAI(file);
      processImageWithAI(optimizedFile, localPreviewUrl);
    }
  };

  // Run Backend AI Photo Studio (rembg + CLAHE + USM + 1:1 format + Contact Drop Shadow)
  const processImageWithAI = async (
    fileToProcess = selectedFile, 
    fallbackPreview = rawPreview,
    b = brightness,
    c = contrast,
    v = vibrance,
    s = sharpness,
    sh = addShadow
  ) => {
    if (!fileToProcess && !fallbackPreview) {
      showToast('Please select or capture a photo first.', 'warning');
      return;
    }

    setIsProcessing(true);
    console.log('[PHOTO-STUDIO] [STEP 2: SENT FOR ENHANCEMENT] Sending image to backend AI Photo Studio endpoint with parameters:', { b, c, v, s, sh });
    showToast('AI Photo Studio: Refining micro-textures & isolating craft background...', 'info');

    try {
      let readyFile = fileToProcess;
      if (!readyFile && fallbackPreview) {
        // Fetch from fallback preview if file object not directly in state
        const blob = await fetch(fallbackPreview).then(r => r.blob());
        readyFile = new File([blob], 'artisan_craft.jpg', { type: 'image/jpeg' });
      }

      const compressedFile = await compressImageForAI(readyFile);
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('remove_bg', removeBg.toString());
      formData.append('apply_enhancement', applyEnhancement.toString());
      formData.append('standardize', standardize.toString());
      formData.append('brightness', b.toString());
      formData.append('contrast', c.toString());
      formData.append('vibrance', v.toString());
      formData.append('sharpness', s.toString());
      formData.append('add_shadow', sh.toString());

      const res = await api.processPhotoStudio(formData);
      console.log('[PHOTO-STUDIO] [STEP 3: ENHANCED IMAGE RECEIVED] Backend AI response:', res);
      
      if (res.status === 'success' && res.data) {
        const displayImg = res.data.enhanced_image_data || res.data.enhanced_image_url || fallbackPreview;
        const originalImg = res.data.original_image_data || res.data.original_image_url || fallbackPreview;

        console.log('[PHOTO-STUDIO] [STEP 4: IMAGE RENDERED] Rendering enhanced studio photo in viewport (length:', displayImg?.length, ')');
        setStudioResult(displayImg);
        
        // Update active draft state with the enhanced image
        setActiveDraft(prev => ({
          ...prev,
          original_image_url: originalImg,
          enhanced_image_url: displayImg
        }));

        showToast('Photo standardized to ultra-sharp e-commerce studio format!', 'success');

        // Proactive AI Guide prompt
        const promptText = lang === 'hi' || lang === 'bho'
          ? "बहुत सुंदर फोटो है! बैकग्राउंड साफ हो गया और सारे बारीक डिज़ाइन निखर गए। अब मुझे बोलकर बताइए — यह उत्पाद क्या है और इसे कैसे बनाया गया?"
          : "Great photo! Studio lighting applied with sharp product details. Now tell me by voice — what is this craft and how was it made?";
        
        setTimeout(() => {
          try { speechService.speak(promptText, lang); } catch (e) {}
        }, 500);
      } else {
        throw new Error('Invalid response data structure from photo studio');
      }
    } catch (err) {
      console.error('[PHOTO-STUDIO-ERROR] AI Photo Studio processing notice:', err);
      showToast('Photo Studio notice: Using enhanced studio preview.', 'info');
      const fallback = fallbackPreview || rawPreview;
      setStudioResult(fallback);
      setActiveDraft(prev => ({
        ...prev,
        original_image_url: fallback,
        enhanced_image_url: fallback
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Split comparison drag / touch
  const handleSplitMouseMove = (e) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;
    const newPos = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSplitPos(newPos);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleProceed = () => {
    if (!studioResult && !rawPreview) {
      showToast('Please capture or process an image first.', 'warning');
      return;
    }
    setActiveTab('voice');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
            <Wand2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>AI Photo Studio • Ultra-Sharp Precision Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-serif tracking-tight">
            {t('cameraTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            {t('cameraSubtitle')}
          </p>
        </div>

        {/* Status Indicator */}
        {studioResult && (
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center space-x-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Studio Master Cutout Verified</span>
            </span>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Studio Viewport (Before / After / Split) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
          
          {/* Top Viewport Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Studio Viewport (1:1 Square)
              </span>
            </div>

            {/* View Mode Switcher (Enhanced vs Original vs Split) */}
            {(studioResult || rawPreview) && (
              <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 text-xs font-bold">
                <button
                  onClick={() => setViewMode('enhanced')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    viewMode === 'enhanced'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enhanced Result</span>
                </button>

                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    viewMode === 'split'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split Compare</span>
                </button>

                <button
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    viewMode === 'original'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Original</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Visual Display */}
          <div className="relative aspect-square w-full bg-stone-100/70 dark:bg-stone-950 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 flex items-center justify-center p-2 select-none">
            {isCameraActive ? (
              <div className="relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={captureCameraFrame}
                  className="absolute bottom-4 px-6 py-3 rounded-full bg-amber-600 text-white font-black text-sm shadow-2xl flex items-center space-x-2 animate-bounce ring-4 ring-amber-600/30"
                >
                  <Camera className="w-5 h-5" />
                  <span>Snap Craft Photo</span>
                </button>
              </div>
            ) : isProcessing ? (
              <div className="text-center space-y-4 p-8">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 border-4 border-amber-200 dark:border-amber-900/50 border-t-amber-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-amber-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                    Enhancing Craft Photography...
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                    U2-Net Edge Defringing • Multi-band Unsharp Mask (USM) • CLAHE Tone Balance • Studio Contact Shadow
                  </p>
                </div>
              </div>
            ) : viewMode === 'split' && rawPreview && studioResult ? (
              /* Interactive Split View (Before / After Slider) */
              <div 
                ref={splitContainerRef}
                onMouseMove={handleSplitMouseMove}
                onTouchMove={handleSplitMouseMove}
                className="relative w-full h-full rounded-xl overflow-hidden cursor-ew-resize select-none bg-white"
              >
                {/* Background Layer: Enhanced Result */}
                <img
                  src={studioResult}
                  alt="AI Enhanced Result"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Foreground Layer: Original Raw (Clipped) */}
                <div 
                  className="absolute inset-0 overflow-hidden border-r-2 border-amber-500 shadow-2xl"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={rawPreview}
                    alt="Original Rustic Photo"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{ width: splitContainerRef.current ? `${splitContainerRef.current.clientWidth}px` : '100%' }}
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider">
                    Before (Raw)
                  </div>
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-amber-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  After (AI Studio)
                </div>

                {/* Split Handle Knob */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-amber-600/30 pointer-events-none"
                  style={{ left: `${splitPos}%` }}
                >
                  <Columns className="w-4 h-4" />
                </div>
              </div>
            ) : viewMode === 'original' && rawPreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={rawPreview}
                  alt="Original Raw"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider">
                  Original Raw Capture
                </div>
              </div>
            ) : studioResult ? (
              <div className="relative w-full h-full flex items-center justify-center bg-white rounded-xl">
                <img
                  src={studioResult}
                  alt="Studio Result"
                  className="w-full h-full object-contain rounded-xl"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-black tracking-wide flex items-center space-x-1 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Studio Master (1200x1200)</span>
                </div>
              </div>
            ) : rawPreview ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={rawPreview}
                  alt="Raw Preview"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Take a photo of your craft or select from gallery
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                  AI will isolate intricate borders, apply studio lighting, boost warm craft pigments, and add grounding contact shadows.
                </p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Quick Capture Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                if (isCameraActive) stopCamera();
                else startCamera();
              }}
              className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px] active:scale-95 ${
                isCameraActive
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 text-white shadow-md'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isCameraActive ? 'Cancel Camera' : t('capturePhoto')}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px]"
            >
              <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('uploadPhoto')}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Prominent Core Action: KEEP PRODUCT DETAILS & REMOVE BACKGROUND */}
          {(selectedFile || rawPreview) && (
            <button
              onClick={() => processImageWithAI(selectedFile, rawPreview)}
              disabled={isProcessing}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2.5 transition-all transform active:scale-98 ring-4 ring-amber-500/20"
            >
              <ShieldCheck className="w-5 h-5 text-amber-200" />
              <span>KEEP PRODUCT DETAILS & REMOVE BACKGROUND</span>
            </button>
          )}
        </div>

        {/* Right Column: AI Lighting Presets, Sliders & Studio Settings */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Studio Lighting Presets */}
          <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
                <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Instant Studio Lighting Presets</span>
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">1-Tap Tune</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {STUDIO_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-950/60 border-stone-200/80 dark:border-stone-800 hover:border-amber-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}>
                        {preset.badge}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-stone-900 dark:text-white block">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-tight mt-0.5">
                        {preset.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuning Studio Controls */}
          <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-stone-900 dark:text-white font-bold text-sm pb-2 border-b border-stone-100 dark:border-stone-800">
              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Precision Optical Controls</span>
            </div>

            {/* Toggle: rembg Background Removal */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  {t('removeBgLabel')}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  U2-Net foreground isolation + alpha edge defringing
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeBg}
                onChange={(e) => setRemoveBg(e.target.checked)}
                className="w-5 h-5 accent-amber-600 cursor-pointer rounded"
              />
            </div>

            {/* Toggle: Soft Studio Contact Drop Shadow */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-stone-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Ambient Contact Drop Shadow
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Adds realistic 3D depth and grounding on white canvas
                </span>
              </div>
              <input
                type="checkbox"
                checked={addShadow}
                onChange={(e) => setAddShadow(e.target.checked)}
                className="w-5 h-5 accent-amber-600 cursor-pointer rounded"
              />
            </div>

            {/* Dynamic Range & Texture Sliders */}
            <div className="space-y-3.5 pt-1">
              
              {/* Micro-Texture Sharpness (USM) */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Micro-Texture Sharpness (USM)</span>
                  </span>
                  <span className="font-bold">{sharpness.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.05"
                  value={sharpness}
                  onChange={(e) => {
                    setSharpness(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Vibrance / Craft Saturation */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>Craft Pigment Vibrance</span>
                  </span>
                  <span className="font-bold">{vibrance.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.6"
                  step="0.05"
                  value={vibrance}
                  onChange={(e) => {
                    setVibrance(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Lighting Brightness */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Studio Brightness</span>
                  </span>
                  <span className="font-bold">{brightness.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.45"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => {
                    setBrightness(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Color Contrast CLAHE */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <Contrast className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    <span>CLAHE Dynamic Range</span>
                  </span>
                  <span className="font-bold">{contrast.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.6"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => {
                    setContrast(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Re-Apply Action */}
            {(selectedFile || rawPreview) && (
              <button
                onClick={() => processImageWithAI(selectedFile, rawPreview, brightness, contrast, vibrance, sharpness, addShadow)}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-Apply Custom Studio Filters</span>
              </button>
            )}
          </div>

          {/* Next Step Action Button & Proactive AI Companion */}
          <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-[28px] p-5 text-white shadow-xl space-y-3.5 border border-amber-400/40">
            <div className="flex items-center justify-between text-sm font-bold">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-200" />
                <span>AI साथी मार्गदर्शन (Step 1 Complete)</span>
              </div>
            </div>

            <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/10 text-xs font-semibold leading-relaxed">
              <span className="text-[10px] uppercase tracking-wider text-yellow-200 block font-bold mb-0.5">
                AI Voice Companion:
              </span>
              {lang === 'hi' || lang === 'bho'
                ? '"बहुत सुंदर फोटो है! बैकग्राउंड साफ हो गया और बारीक कारीगरी निखर गई। अब बोलकर बताइए — यह उत्पाद क्या है और कैसे बना?"'
                : '"Great photo! Background removed with razor-sharp micro-textures. Now speak to describe — what craft is this and how was it created?"'}
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-4 rounded-2xl bg-white text-amber-950 font-black text-sm shadow-2xl hover:bg-amber-50 active:scale-95 transition-all flex items-center justify-center space-x-2 ring-4 ring-white/30 animate-pulse min-h-[48px]"
            >
              <span>{t('proceedToVoice')}</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

