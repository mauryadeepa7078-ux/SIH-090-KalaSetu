import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle
} from 'lucide-react';

// Fast client-side image compression (max 1024x1024)
const compressImageForAI = (file, maxDim = 1024) => {
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
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export const PhotoStudioPage = () => {
  const { t, lang, activeDraft, setActiveDraft, setActiveTab, showToast } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [rawPreview, setRawPreview] = useState(activeDraft.original_image_url || null);
  const [studioResult, setStudioResult] = useState(activeDraft.enhanced_image_url || null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Controls
  const [removeBg, setRemoveBg] = useState(true);
  const [applyEnhancement, setApplyEnhancement] = useState(true);
  const [standardize, setStandardize] = useState(true);
  const [brightness, setBrightness] = useState(1.05);
  const [contrast, setContrast] = useState(1.15);

  // Camera stream
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'artisan_capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setRawPreview(URL.createObjectURL(blob));
        stopCamera();
        const optimizedFile = await compressImageForAI(file);
        processImageWithAI(optimizedFile);
      }
    }, 'image/jpeg', 0.92);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRawPreview(URL.createObjectURL(file));
      stopCamera();
      const optimizedFile = await compressImageForAI(file);
      processImageWithAI(optimizedFile);
    }
  };

  // Run Backend AI Photo Studio (rembg + OpenCV CLAHE + 1:1 format)
  const processImageWithAI = async (fileToProcess = selectedFile) => {
    if (!fileToProcess) {
      showToast('Please select or capture a photo first.', 'warning');
      return;
    }

    setIsProcessing(true);
    showToast('AI Photo Studio: Removing background & applying studio lighting...', 'info');

    try {
      const readyFile = await compressImageForAI(fileToProcess);
      const formData = new FormData();
      formData.append('file', readyFile);
      formData.append('remove_bg', removeBg.toString());
      formData.append('apply_enhancement', applyEnhancement.toString());
      formData.append('standardize', standardize.toString());
      formData.append('brightness', brightness.toString());
      formData.append('contrast', contrast.toString());

      const res = await api.processPhotoStudio(formData);
      if (res.status === 'success' && res.data) {
        setStudioResult(res.data.enhanced_image_url);
        
        // Update active draft state
        setActiveDraft(prev => ({
          ...prev,
          original_image_url: res.data.original_image_url,
          enhanced_image_url: res.data.enhanced_image_url
        }));

        showToast('Photo successfully standardized to e-commerce white studio format!', 'success');

        // Update 2: Proactive AI Guide prompt
        const promptText = lang === 'hi' || lang === 'bho'
          ? "बहुत सुंदर फोटो है! बैकग्राउंड भी साफ हो गया। अब मुझे बोलकर बताइए — यह उत्पाद क्या है और इसे कैसे बनाया गया?"
          : "Great photo! The studio background is clean. Now tell me by voice — what is this craft and how was it made?";
        
        setTimeout(() => {
          try { speechService.speak(promptText, lang); } catch (e) {}
        }, 500);
      }
    } catch (err) {
      console.error('Photo Studio error:', err);
      showToast('Photo Studio processing notice: Using fallback preview.', 'warning');
      // If offline/backend issue, fallback to raw preview
      setStudioResult(rawPreview);
    } finally {
      setIsProcessing(false);
    }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <Wand2 className="w-3.5 h-3.5 text-orange-600" />
          <span>Core Feature 1: AI Photo Studio</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-hindi">
          {t('cameraTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
          {t('cameraSubtitle')}
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Viewport (Before/After) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-orange-600" />
              <span>Studio Viewport (1:1 Square)</span>
            </span>
            {studioResult && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Processed</span>
              </span>
            )}
          </div>

          {/* Main Visual Display */}
          <div className="relative aspect-square w-full bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 flex items-center justify-center p-2">
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
                  className="absolute bottom-4 px-6 py-2.5 rounded-full bg-orange-600 text-white font-bold text-sm shadow-xl flex items-center space-x-2 animate-bounce"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>
            ) : isProcessing ? (
              <div className="text-center space-y-4 p-8">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-orange-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{t('processingImage')}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Running U2-Net Background Removal & OpenCV CLAHE Equalization...
                  </p>
                </div>
              </div>
            ) : studioResult ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={studioResult}
                  alt="Studio Result"
                  className="w-full h-full object-contain rounded-xl"
                />
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
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-stone-700">
                  Take a photo of your craft or upload from gallery
                </p>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  AI will remove the rustic background and place your craft on a pristine white e-commerce canvas.
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
              className={`py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px] active:scale-95 ${
                isCameraActive
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white shadow-md'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isCameraActive ? 'Cancel Camera' : t('capturePhoto')}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-3.5 px-4 rounded-2xl bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-800 border border-orange-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all min-h-[48px]"
            >
              <Upload className="w-4 h-4 text-orange-600" />
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
        </div>

        {/* Right Column: AI Studio Controls & Pipeline Settings */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Settings Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm pb-2 border-b border-stone-100">
              <Sliders className="w-4 h-4 text-orange-600" />
              <span>AI Photo Studio Enhancements</span>
            </div>

            {/* Toggle: rembg Background Removal */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800 block">
                  {t('removeBgLabel')}
                </span>
                <span className="text-[11px] text-stone-500">
                  Pretrained U2-Net automated foreground isolation
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeBg}
                onChange={(e) => setRemoveBg(e.target.checked)}
                className="w-5 h-5 accent-orange-600 cursor-pointer rounded"
              />
            </div>

            {/* Toggle: OpenCV CLAHE & Auto White Balance */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800 block">
                  {t('enhanceLightingLabel')}
                </span>
                <span className="text-[11px] text-stone-500">
                  Gray World balance & adaptive histogram boost
                </span>
              </div>
              <input
                type="checkbox"
                checked={applyEnhancement}
                onChange={(e) => setApplyEnhancement(e.target.checked)}
                className="w-5 h-5 accent-orange-600 cursor-pointer rounded"
              />
            </div>

            {/* Toggle: E-Commerce 1:1 Canvas */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-800 block">
                  {t('standardizeLabel')}
                </span>
                <span className="text-[11px] text-stone-500">
                  Centered square framing with pure white background
                </span>
              </div>
              <input
                type="checkbox"
                checked={standardize}
                onChange={(e) => setStandardize(e.target.checked)}
                className="w-5 h-5 accent-orange-600 cursor-pointer rounded"
              />
            </div>

            {/* Brightness & Contrast Sliders */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lighting Brightness</span>
                  </span>
                  <span>{brightness.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <Contrast className="w-3.5 h-3.5 text-stone-700" />
                    <span>Color Contrast (CLAHE)</span>
                  </span>
                  <span>{contrast.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Re-process trigger button */}
            {selectedFile && (
              <button
                onClick={() => processImageWithAI(selectedFile)}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-Apply AI Filters</span>
              </button>
            )}
          </div>

          {/* Next Step Action Button & Proactive AI Guide */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-3xl p-5 text-white shadow-xl space-y-3.5 border border-orange-400/40">
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
                ? '"बहुत सुंदर फोटो है! बैकग्राउंड साफ हो गया। अब बोलकर बताइए — यह उत्पाद क्या है और कैसे बना?"'
                : '"Great photo! Studio background is clean. Now speak to describe — what craft is this and how was it created?"'}
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-4 rounded-2xl bg-white text-orange-800 font-black text-sm shadow-2xl hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center space-x-2 ring-4 ring-white/30 animate-pulse min-h-[48px]"
            >
              <span>{t('proceedToVoice')}</span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
