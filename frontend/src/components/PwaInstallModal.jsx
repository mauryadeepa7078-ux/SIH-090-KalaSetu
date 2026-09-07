import React from 'react';
import { 
  Smartphone, 
  Share2, 
  PlusSquare, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Download,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const PwaInstallModal = ({ isOpen, onClose, onNativeInstall, canNativeInstall, lang = 'hi' }) => {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-md rounded-3xl p-6 text-stone-100 space-y-5 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-orange-600 text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'hi' ? 'KalaSetu ऐप इंस्टॉल करें' : 'Install KalaSetu App'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === 'hi' ? 'ऑफलाइन सहायता व 1-टैप फास्ट एक्सेस' : 'Offline support & 1-tap fast home screen access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Proposition Strip */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-2xl bg-orange-950/40 border border-orange-600/30 flex items-center space-x-2 text-orange-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{lang === 'hi' ? 'बिना इंटरनेट काम करे' : 'Works Offline'}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-blue-950/40 border border-blue-600/30 flex items-center space-x-2 text-blue-200 font-semibold">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{lang === 'hi' ? 'शून्य स्टोरेज खर्च' : 'Ultra-Lightweight'}</span>
          </div>
        </div>

        {/* Platform-Specific Install Steps */}
        {canNativeInstall ? (
          <div className="space-y-4 text-center py-2">
            <p className="text-xs text-stone-300">
              {lang === 'hi'
                ? 'अपने फोन या कंप्यूटर पर ऐप इंस्टॉल करने के लिए नीचे दिए गए बटन पर टैप करें।'
                : 'Click the button below to install KalaSetu directly to your home screen or desktop.'}
            </p>
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'hi' ? 'अभी इंस्टॉल करें (Install Now)' : 'Install App Now'}</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 bg-stone-950/80 p-4 rounded-2xl border border-stone-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
              iOS Safari Installation Steps (3 Easy Steps):
            </span>
            <div className="space-y-2.5 text-stone-300">
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  Safari के नीचे या ऊपर स्थित <span className="font-bold text-white flex-inline items-center bg-stone-800 px-1.5 py-0.5 rounded text-stone-200">Share / शेयर <Share2 className="w-3 h-3 inline mx-0.5 text-blue-400" /></span> बटन पर टैप करें।
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  नीचे स्क्रॉल करें और <span className="font-bold text-white bg-stone-800 px-1.5 py-0.5 rounded">"Add to Home Screen" <PlusSquare className="w-3 h-3 inline mx-0.5 text-orange-400" /></span> चुनें।
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  ऊपर दाएं कोने में <span className="font-bold text-white bg-stone-800 px-1.5 py-0.5 rounded">"Add / जोड़ें"</span> पर टैप करें।
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-stone-950/80 p-4 rounded-2xl border border-stone-800 text-xs text-stone-300">
            <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
              Desktop / Browser Instructions:
            </span>
            <p className="leading-relaxed">
              {lang === 'hi'
                ? 'अपने ब्राउज़र के एड्रेस बार में दाईं ओर दिए गए "Install" या "ऐप जोड़ें" आइकन (⤓) पर क्लिक करें, या मेनू (⋮) खोलकर "Install KalaSetu" चुनें।'
                : 'Click the install icon (⤓) on the right side of your browser address bar, or open the browser menu (⋮) and select "Install KalaSetu".'}
            </p>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-white underline font-semibold"
          >
            {lang === 'hi' ? 'बाद में करें (Close)' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
