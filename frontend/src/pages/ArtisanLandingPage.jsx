import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { 
  Camera, 
  Mic, 
  Sparkles, 
  ShoppingBag, 
  DollarSign, 
  Building2, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export const ArtisanLandingPage = () => {
  const { 
    setActiveTab, 
    lang, 
    t, 
    products, 
    switchRole, 
    openOnboarding,
    activeDraft
  } = useApp();

  const [hasSpokenGreeting, setHasSpokenGreeting] = useState(false);

  // Proactive greeting on artisan page arrival
  useEffect(() => {
    const greetingText = lang === 'hi' || lang === 'bho'
      ? "नमस्ते! चलिए शुरू करते हैं। सबसे पहले अपने उत्पाद की एक अच्छी फोटो खींचिए या बोलकर बताइए।"
      : "Namaste! Let's get started. First, take a clear photo of your craft or describe it by voice.";

    const timer = setTimeout(() => {
      try {
        speechService.speak(greetingText, lang);
        setHasSpokenGreeting(true);
      } catch (e) {
        console.warn('Auto voice guide skipped:', e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [lang]);

  const handleSpeakGreeting = () => {
    const greetingText = lang === 'hi' || lang === 'bho'
      ? "नमस्ते! चलिए शुरू करते हैं। सबसे पहले अपने उत्पाद की एक अच्छी फोटो खींचिए या बोलकर बताइए।"
      : "Namaste! Let's get started. First, take a clear photo of your craft or describe it by voice.";
    speechService.speak(greetingText, lang);
  };

  const secondaryTools = [
    { id: 'catalog', label: t('navHome'), icon: ShoppingBag, color: 'from-amber-600 to-orange-600', count: `${products.length} Items`, desc: 'View & manage your craft inventory' },
    { id: 'pricing', label: t('navPricing'), icon: DollarSign, color: 'from-emerald-600 to-teal-600', count: 'ML Engine', desc: 'Calculate fair prices with Scikit-Learn' },
    { id: 'gem', label: t('navGeM'), icon: Building2, color: 'from-blue-600 to-indigo-600', count: 'Govt RFQs', desc: 'Publish to GeM and receive bulk orders' },
    { id: 'whatsapp', label: t('navWhatsApp'), icon: MessageCircle, color: 'from-green-600 to-emerald-600', count: 'AI Bot', desc: 'Interact with your simulated WhatsApp store' },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3, color: 'from-purple-600 to-pink-600', count: 'Sales & Growth', desc: 'Revenue analytics and visitor charts' },
    { id: 'community', label: t('navCommunity'), icon: Users, color: 'from-rose-600 to-orange-600', count: 'Peer Hub', desc: 'Connect with fellow artisans & fairs' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      
      {/* Artisan Welcome & MoSJE Trust Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="flex items-center space-x-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 p-0.5 shadow-md shadow-orange-900/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-stone-900 dark:bg-stone-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-serif tracking-tight">
                {lang === 'hi' ? 'नमस्ते, कारीगर साथी!' : 'Namaste, Artisan Partner!'}
              </h2>
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-400 font-bold">
                विक्रेता मोड
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-0.5 font-sans">
              {lang === 'hi' 
                ? 'AI आपका डिजिटल बिज़नेस मैनेजर है — सिर्फ 2 आसान कदमों में उत्पाद लाइव करें' 
                : 'AI is your virtual business manager — publish products online in 2 simple steps'}
            </p>
          </div>
        </div>

        {/* Action badges & Role Switcher */}
        <div className="flex items-center space-x-2 self-start sm:self-auto z-10">
          <button
            onClick={() => switchRole('buyer')}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
            title="Switch to Buyer Marketplace view"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{lang === 'hi' ? 'खरीदार मोड देखें' : 'Switch to Buyer View'}</span>
          </button>
        </div>
      </div>

      {/* Proactive AI Companion Guide Banner */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/70 dark:via-stone-900 dark:to-stone-900 border-2 border-orange-500/30 dark:border-orange-500/50 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-900/30 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 font-sans">
                  कलासेतु AI साथी (AI Companion Guide)
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-stone-800 dark:text-white mt-1 leading-relaxed font-sans">
                {lang === 'hi'
                  ? '"नमस्ते! चलिए शुरू करते हैं। सबसे पहले नीचे दिए गए बटन से अपने उत्पाद की फोटो खींचिए या बोलकर बताइए।"'
                  : '"Namaste! Let\'s get started. First, snap a clear photo below or describe your craft by voice."'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakGreeting}
            className="p-3 rounded-2xl bg-white dark:bg-stone-800 hover:bg-orange-600 hover:text-white text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all shadow-sm shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="Listen to AI guide voice"
          >
            <Volume2 className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* PRIMARY TWO GIANT ACTION TILES (PHOTO LO & BOLKAR BATAO) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 font-sans">
            {lang === 'hi' ? 'मुख्य आसान विकल्प (Primary Actions)' : 'Primary Artisan Actions'}
          </span>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 font-sans">
            {lang === 'hi' ? '1 मिनट में तैयार' : 'Ready in 1 min'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Action 1: Photo Lo (AI Photo Studio) */}
          <button
            onClick={() => setActiveTab('camera')}
            className="group relative p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 text-white text-left shadow-xl shadow-orange-900/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border border-orange-400/30 flex flex-col justify-between min-h-[220px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase backdrop-blur-sm">
                कदम 1 • Step 1
              </span>
            </div>

            <div className="mt-6 space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-serif flex items-center justify-between">
                <span>{t('btnPhotoLo')}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed font-sans">
                {t('btnPhotoLoSub')}
              </p>
            </div>
          </button>

          {/* Action 2: Bolkar Batao (Voice to Catalog) */}
          <button
            onClick={() => setActiveTab('voice')}
            className="group relative p-6 sm:p-8 rounded-[32px] bg-white dark:bg-gradient-to-br dark:from-stone-800 dark:via-stone-850 dark:to-stone-900 text-stone-900 dark:text-white text-left shadow-md dark:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 flex flex-col justify-between min-h-[220px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-4 rounded-2xl bg-orange-100 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-600/40 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              </div>
              <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-black tracking-wider uppercase">
                कदम 2 • Step 2
              </span>
            </div>

            <div className="mt-6 space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-serif flex items-center justify-between text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                <span>{t('btnBolkarBatao')}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed font-sans">
                {t('btnBolkarBataoSub')}
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* SECONDARY DASHBOARD & MANAGEMENT TOOLS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1 border-t border-stone-200 dark:border-stone-800 pt-6">
          <div>
            <h4 className="text-base font-black text-stone-900 dark:text-white font-serif">
              {t('quickTools')}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
              {lang === 'hi' ? 'कैटलॉग प्रबंधन, GeM मार्केट, मूल्य निर्धारण और एनालिटिक्स' : 'Manage catalog, pricing, GeM orders & sales'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('catalog')}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center space-x-1 font-sans"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {secondaryTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className="p-4 rounded-2xl bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750 hover:border-orange-500/60 dark:hover:border-orange-500/60 text-left transition-all group flex flex-col justify-between shadow-sm dark:shadow-lg min-h-[110px]"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${tool.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    {tool.count}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors block font-sans">
                    {tool.label}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 block mt-0.5 font-sans">
                    {tool.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
