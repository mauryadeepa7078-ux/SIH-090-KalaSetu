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
  ShieldCheck,
  Layers
} from 'lucide-react';

export const PwaInstallModal = ({ isOpen, onClose, onNativeInstall, canNativeInstall, lang = 'hi' }) => {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-700/80 w-full max-w-md rounded-3xl p-6 text-stone-100 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">
                {lang === 'hi' ? 'KalaSetu ऐप इंस्टॉल करें' : 'Install KalaSetu App'}
              </h3>
              <p className="text-[11px] text-stone-400 font-sans">
                {lang === 'hi' ? 'ऑफलाइन सहायता व 1-टैप फास्ट एक्सेस' : 'Offline support & 1-tap fast home screen access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Proposition Strip */}
        <div className="grid grid-cols-2 gap-2.5 text-[11px] relative z-10">
          <div className="p-3 rounded-2xl bg-orange-950/40 border border-orange-600/30 flex items-center space-x-2 text-orange-200 font-semibold font-sans">
            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{lang === 'hi' ? 'बिना इंटरनेट काम करे' : 'Works 100% Offline'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-600/30 flex items-center space-x-2 text-blue-200 font-semibold font-sans">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{lang === 'hi' ? 'शून्य स्टोरेज खर्च' : 'Ultra-Lightweight PWA'}</span>
          </div>
        </div>

        {/* Platform-Specific Install Steps */}
        {isStandalone ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl text-center space-y-2 relative z-10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-200 font-serif">
              {lang === 'hi' ? 'ऐप पहले से इंस्टॉल है!' : 'App Is Already Installed!'}
            </h4>
            <p className="text-xs text-stone-300 font-sans">
              {lang === 'hi'
                ? 'KalaSetu आपके डिवाइस की होम स्क्रीन पर स्टैंडअलोन मोड में सक्रिय है।'
                : 'KalaSetu is already installed and running as a standalone PWA on your device.'}
            </p>
          </div>
        ) : canNativeInstall ? (
          <div className="space-y-4 text-center py-2 relative z-10">
            <p className="text-xs text-stone-300 font-sans">
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
          <div className="space-y-3 bg-stone-950/90 p-4 rounded-2xl border border-stone-800 text-xs relative z-10">
            <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs">
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>iOS Safari Installation (3 Easy Steps):</span>
            </div>
            <div className="space-y-2.5 text-stone-300 font-sans">
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  Safari में नीचे स्थित <span className="font-bold text-white bg-stone-800 px-1.5 py-0.5 rounded text-blue-300">Share / शेयर <Share2 className="w-3 h-3 inline mx-0.5 text-blue-400" /></span> बटन पर टैप करें।
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  नीचे स्क्रॉल करें और <span className="font-bold text-white bg-stone-800 px-1.5 py-0.5 rounded text-orange-300">"Add to Home Screen" <PlusSquare className="w-3 h-3 inline mx-0.5 text-orange-400" /></span> चुनें।
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-orange-400 font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  ऊपर दाएं कोने में <span className="font-bold text-white bg-stone-800 px-1.5 py-0.5 rounded text-emerald-300">"Add / जोड़ें"</span> पर टैप करें।
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 bg-stone-950/90 p-4 rounded-2xl border border-stone-800 text-xs text-stone-300 relative z-10">
            <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block font-sans">
              Desktop & Chrome Instructions:
            </span>
            <p className="leading-relaxed font-sans">
              {lang === 'hi'
                ? 'अपने ब्राउज़र के एड्रेस बार में दाईं ओर दिए गए "Install" या "ऐप जोड़ें" आइकन (⤓) पर क्लिक करें, या मेनू (⋮) खोलकर "Install KalaSetu" चुनें।'
                : 'Click the install icon (⤓) on the right side of your browser address bar, or open the browser menu (⋮) and select "Install KalaSetu".'}
            </p>
          </div>
        )}

        <div className="pt-2 text-center relative z-10">
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-white underline font-semibold transition-colors"
          >
            {lang === 'hi' ? 'बाद में करें (Close)' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
