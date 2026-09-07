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
  Sparkle
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
    { 
      id: 'catalog', 
      label: t('navHome'), 
      icon: ShoppingBag, 
      bgLight: 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200', 
      iconColor: 'bg-amber-600 text-white', 
      count: `${products.length} Items`, 
      desc: 'View & manage your live craft inventory' 
    },
    { 
      id: 'pricing', 
      label: t('navPricing'), 
      icon: DollarSign, 
      bgLight: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200', 
      iconColor: 'bg-emerald-600 text-white', 
      count: 'ML Engine', 
      desc: 'Calculate fair prices with Scikit-Learn' 
    },
    { 
      id: 'gem', 
      label: t('navGeM'), 
      icon: Building2, 
      bgLight: 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200', 
      iconColor: 'bg-blue-600 text-white', 
      count: 'Govt RFQs', 
      desc: 'Publish to GeM and receive bulk orders' 
    },
    { 
      id: 'whatsapp', 
      label: t('navWhatsApp'), 
      icon: MessageCircle, 
      bgLight: 'bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-200', 
      iconColor: 'bg-green-600 text-white', 
      count: 'AI Bot', 
      desc: 'Interact with your simulated WhatsApp store' 
    },
    { 
      id: 'analytics', 
      label: t('navAnalytics'), 
      icon: BarChart3, 
      bgLight: 'bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-200', 
      iconColor: 'bg-purple-600 text-white', 
      count: 'Sales & Growth', 
      desc: 'Revenue analytics and visitor charts' 
    },
    { 
      id: 'community', 
      label: t('navCommunity'), 
      icon: Users, 
      bgLight: 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200', 
      iconColor: 'bg-rose-600 text-white', 
      count: 'Peer Guild', 
      desc: 'Connect with fellow artisans & craft fairs' 
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 animate-fade-in pb-28">
      
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-950/15 relative overflow-hidden">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MoSJE Verified Artisan Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-serif text-white">
              {lang === 'hi' ? 'नमस्ते, शिल्पकार साथी!' : 'Namaste, Master Artisan!'}
            </h1>

            <p className="text-xs sm:text-sm text-orange-50 font-sans leading-relaxed">
              {lang === 'hi' 
                ? 'कलासेतु AI आपका पर्सनल बिजनेस मैनेजर है — सिर्फ 1 फोटो या बोलकर अपना उत्पाद ऑनलाइन लाइव करें।' 
                : 'KalaSetu AI is your virtual studio — snap a photo or speak to digitize and sell your handcrafted treasures.'}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => switchRole('buyer')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/30 text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
              title="Switch to Buyer Marketplace view"
            >
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              <span>{lang === 'hi' ? 'खरीदार दृश्य' : 'Buyer View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Voice Assistant Companion Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-600 dark:text-orange-400 block">
              AI Companion Guide • सहायक
            </span>
            <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
              {lang === 'hi'
                ? 'शुरू करने के लिए नीचे दी गई फोटो बटन दबाएँ या आवाज से बताएं।'
                : 'Tap the photo button below or describe your craft by voice to begin.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSpeakGreeting}
          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-600 hover:text-white text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all shadow-sm shrink-0 flex items-center space-x-1.5"
          title="Listen to AI voice guide"
        >
          <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400 group-hover:text-white" />
          <span className="text-xs font-bold hidden sm:inline">Listen</span>
        </button>
      </div>

      {/* PRIMARY TWO GIANT ACTION TILES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 font-sans">
            {lang === 'hi' ? 'मुख्य आसान कदम (Primary Actions)' : 'Fast Listing Studio'}
          </span>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 font-sans">
            {lang === 'hi' ? '2 मिनट में लाइव' : 'Live in 2 mins'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Action 1: Photo Lo (AI Photo Studio) */}
          <button
            onClick={() => setActiveTab('camera')}
            className="group relative p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 text-white text-left shadow-xl shadow-orange-950/20 hover:shadow-2xl hover:scale-[1.015] active:scale-[0.985] transition-all border border-orange-400/30 flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3.5 rounded-2xl bg-black/20 backdrop-blur-md group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider uppercase backdrop-blur-md border border-white/20">
                Step 1 • कदम 1
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
            className="group relative p-6 sm:p-8 rounded-[28px] bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-left shadow-md dark:shadow-xl hover:shadow-xl hover:scale-[1.015] active:scale-[0.985] transition-all border-2 border-stone-200/90 dark:border-stone-800 hover:border-orange-500 dark:hover:border-orange-500 flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
              </div>
              <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-black tracking-wider uppercase border border-stone-200 dark:border-stone-700">
                Step 2 • कदम 2
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
        <div className="flex items-center justify-between px-1 border-t border-stone-200/80 dark:border-stone-800 pt-6">
          <div>
            <h4 className="text-base font-black text-stone-900 dark:text-white font-serif">
              {t('quickTools')}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
              {lang === 'hi' ? 'कैटलॉग, GeM बाज़ार, स्मार्ट मूल्य निर्धारण व बिक्री' : 'Manage catalog, pricing, GeM orders & sales'}
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
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/80 border border-stone-200/80 dark:border-stone-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 text-left transition-all group flex flex-col justify-between shadow-sm hover:shadow-md min-h-[110px]"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${tool.iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
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

