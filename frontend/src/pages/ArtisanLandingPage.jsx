import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { getProductImage } from '../utils/imageHelper';
import { 
  Camera, 
  Mic, 
  Sparkles, 
  ShoppingBag, 
  DollarSign, 
  Truck,
  Building2, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Volume2, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  ChevronRight,
  TrendingUp,
  Package,
  Clock,
  ArrowUpRight,
  Plus,
  Tag,
  CheckCircle2
} from 'lucide-react';

export const ArtisanLandingPage = () => {
  const { 
    setActiveTab, 
    lang, 
    t, 
    products = [], 
    orders = [],
    currentUser,
    setSelectedProduct
  } = useApp();

  const [hasSpokenGreeting, setHasSpokenGreeting] = useState(false);

  // Proactive greeting on artisan page arrival
  useEffect(() => {
    const greetingText = lang === 'hi' || lang === 'bho'
      ? "नमस्ते! क्राफ्टएक्स में आपका स्वागत है। चलिए शुरू करते हैं — एक फोटो लें या बोलकर अपना हस्तशिल्प दर्ज करें।"
      : "Namaste! Welcome to CraftX. Snap a photo or describe your craft by voice to begin.";

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
      ? "नमस्ते! क्राफ्टएक्स में आपका स्वागत है। चलिए शुरू करते हैं — एक फोटो लें या बोलकर अपना हस्तशिल्प दर्ज करें।"
      : "Namaste! Welcome to CraftX. Snap a photo or describe your craft by voice to begin.";
    speechService.speak(greetingText, lang);
  };

  // Real Application Data Computations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const displayRevenue = totalRevenue > 0 ? totalRevenue : (products.length > 0 ? products.reduce((acc, p) => acc + (Number(p.price) || 0) * (p.sales_count || 1), 0) : 0);
  const netEarnings = Math.round(displayRevenue * 0.82);
  const businessExpenses = Math.round(displayRevenue * 0.18);

  // Top products from actual products store
  const bestSellers = [...products]
    .sort((a, b) => (b.sales_count || b.views_count || 0) - (a.sales_count || a.views_count || 0))
    .slice(0, 4);

  // Recent orders
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 animate-fade-in pb-28 text-stone-900 dark:text-stone-100">
      
      {/* 1. GREETING / IDENTITY HEADER */}
      <div className="rounded-[28px] p-6 sm:p-8 bg-gradient-to-r from-[#B35438] via-[#C86D51] to-[#C29B38] text-white shadow-xl shadow-stone-950/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MoSJE Certified Artisan Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-editorial text-white">
              {lang === 'hi' 
                ? `नमस्ते, ${currentUser?.name || 'शिल्पकार साथी'}!` 
                : `Namaste, ${currentUser?.name || 'Master Artisan'}!`}
            </h1>

            <p className="text-xs sm:text-sm text-orange-50 font-sans leading-relaxed">
              {currentUser?.location ? `📍 ${currentUser.location} • ` : ''}
              {currentUser?.craft_type ? `🎨 ${currentUser.craft_type}` : (lang === 'hi' ? 'भारतीय पारंपरिक हस्तकला' : 'Authentic Indian Handicrafts')}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/30 text-xs font-bold flex items-center space-x-2 shadow-sm font-mono">
              <Award className="w-4 h-4 text-amber-200" />
              <span>{currentUser?.scheme_id || currentUser?.mosje_pehchan_id || 'MoSJE-UP-2026-091'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Companion Voice Prompt Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#B35438] dark:text-[#E07A5F] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#B35438] dark:text-[#E07A5F] block">
              AI Voice Assistant • मार्गदर्शन
            </span>
            <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
              {lang === 'hi'
                ? 'नया हस्तशिल्प जोड़ने के लिए फोटो खींचें या बोलकर विवरण दें।'
                : 'Tap Photo Studio or describe by voice to list a new handcrafted product.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSpeakGreeting}
          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#B35438] hover:text-white text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all shadow-sm shrink-0 flex items-center space-x-1.5"
          title="Voice prompt"
        >
          <Volume2 className="w-4 h-4 text-[#B35438] dark:text-[#E07A5F] group-hover:text-white" />
          <span className="text-xs font-bold hidden sm:inline">{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
        </button>
      </div>

      {/* 2. EARNINGS & KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Artisan Earnings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {lang === 'hi' ? 'कुल आय (Earnings)' : 'Artisan Earnings'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono">
            ₹{displayRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-stone-400">
            {lang === 'hi' ? 'सकल शिल्प बिक्री' : 'Gross craft revenue'}
          </p>
        </div>

        {/* Net Earnings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              {lang === 'hi' ? 'शुद्ध कमाई (Net)' : 'Net Earnings'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            ₹{netEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-stone-400">
            {lang === 'hi' ? 'लागत घटाकर लाभ' : 'After estimated costs'}
          </p>
        </div>

        {/* Orders KPI */}
        <button
          onClick={() => setActiveTab('artisan-orders')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-[#B35438]/60 shadow-sm text-left transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider group-hover:text-[#B35438] transition-colors">
              {lang === 'hi' ? 'सक्रिय ऑर्डर्स' : 'Active Orders'}
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-[#B35438] dark:text-[#E07A5F] group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono flex items-center justify-between">
            <span>{orders.length}</span>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#B35438]" />
          </div>
          <p className="text-[10px] text-stone-400">
            {lang === 'hi' ? 'DNK डिलीवरी ट्रैकिंग' : 'Fulfillment & DNK'}
          </p>
        </button>

        {/* Products KPI */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/60 shadow-sm text-left transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
              {lang === 'hi' ? 'लाइव उत्पाद' : 'Live Products'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono flex items-center justify-between">
            <span>{products.length}</span>
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
          </div>
          <p className="text-[10px] text-stone-400">
            {lang === 'hi' ? 'कैटलॉग में दर्ज' : 'In your catalog'}
          </p>
        </button>

      </div>

      {/* 3. AI QUICK TOOLS (Studio, Voice, Smart Pricing) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 font-sans">
            {lang === 'hi' ? 'AI त्वरित उपकरण (AI Studio Tools)' : 'AI Creator Tools'}
          </span>
          <span className="text-xs font-bold text-[#B35438] dark:text-[#E07A5F] font-sans">
            {lang === 'hi' ? 'आसान व तेज़' : 'Fast 2-Min Listing'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Tool 1: AI Photo Studio */}
          <button
            onClick={() => setActiveTab('camera')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#B35438] via-[#C86D51] to-[#C29B38] text-white text-left shadow-lg hover:shadow-xl hover:scale-[1.015] active:scale-[0.985] transition-all flex flex-col justify-between min-h-[160px] group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-md group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white uppercase tracking-wider">
                Step 1
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-black tracking-tight font-editorial flex items-center justify-between">
                <span>{t('btnPhotoLo') || 'AI Photo Studio'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="text-xs text-orange-100 mt-1 line-clamp-2">
                {t('btnPhotoLoSub') || 'Professional background removal & studio lighting in 1 tap.'}
              </p>
            </div>
          </button>

          {/* Tool 2: Voice -> AI Catalog */}
          <button
            onClick={() => setActiveTab('voice')}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border-2 border-stone-200/90 dark:border-stone-800 hover:border-[#B35438] dark:hover:border-[#C86D51] text-stone-900 dark:text-white text-left shadow-sm hover:shadow-md hover:scale-[1.015] active:scale-[0.985] transition-all flex flex-col justify-between min-h-[160px] group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-[#B35438] dark:text-[#E07A5F] group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                Step 2
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-black tracking-tight font-editorial flex items-center justify-between group-hover:text-[#B35438] dark:group-hover:text-[#E07A5F] transition-colors">
                <span>{t('btnBolkarBatao') || 'Voice to Catalog'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                {t('btnBolkarBataoSub') || 'Describe craft in Hindi or regional language for instant AI catalog.'}
              </p>
            </div>
          </button>

          {/* Tool 3: Smart ML Pricing */}
          <button
            onClick={() => setActiveTab('pricing')}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-500/60 text-stone-900 dark:text-white text-left shadow-sm hover:shadow-md hover:scale-[1.015] active:scale-[0.985] transition-all flex flex-col justify-between min-h-[160px] group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                Step 3
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-black tracking-tight font-editorial flex items-center justify-between group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>{t('navPricing') || 'Smart Pricing'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                {lang === 'hi' 
                  ? 'सामग्री व समय के आधार पर निष्पक्ष पारिश्रमिक मूल्य तय करें।' 
                  : 'Calculate fair artisan wages and market-ready price breakdown.'}
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* 4. BEST-SELLING PRODUCTS PREVIEW */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-black text-stone-900 dark:text-white font-editorial">
              {lang === 'hi' ? 'शीर्ष हस्तशिल्प (Best-Selling Crafts)' : 'Top Performing Crafts'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {lang === 'hi' ? 'आपके कैटलॉग से सबसे लोकप्रिय उत्पाद' : 'Products with active buyer interest & views'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('catalog')}
            className="text-xs font-bold text-[#B35438] dark:text-[#E07A5F] hover:underline flex items-center space-x-1"
          >
            <span>{lang === 'hi' ? 'कैटलॉग देखें' : 'View Catalog'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {bestSellers.map((p) => {
              const img = getProductImage(p, true);
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setActiveTab('detail');
                  }}
                  className="rounded-2xl p-3 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative mb-2.5">
                      <img 
                        src={img} 
                        alt={p.title_en || p.title_hi || 'Craft'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {p.gi_tagged && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-bold text-amber-300">
                          GI
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      {lang === 'hi' && p.title_hi ? p.title_hi : p.title_en}
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      {p.category || 'Handicraft'}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-[#B35438] dark:text-[#E07A5F]">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {p.sales_count || 0} {lang === 'hi' ? 'बिके' : 'sold'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-800 text-center space-y-3">
            <Package className="w-8 h-8 text-stone-400 mx-auto" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                {lang === 'hi' ? 'कैटलॉग में कोई उत्पाद नहीं है' : 'No products in your catalog yet'}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {lang === 'hi' ? 'पहला उत्पाद जोड़ने के लिए AI Photo Studio खोलें' : 'Take a photo to digitize your first craft item.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('camera')}
              className="px-4 py-2 rounded-xl bg-[#B35438] text-white text-xs font-bold shadow-md hover:bg-[#C86D51] transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'hi' ? 'नया उत्पाद जोड़ें' : 'Add First Craft'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. RECENT ORDERS SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-black text-stone-900 dark:text-white font-editorial">
              {lang === 'hi' ? 'हाल के ऑर्डर्स (Recent Orders)' : 'Recent Orders'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {lang === 'hi' ? 'खरीदारों द्वारा दिए गए हालिया आदेश' : 'Customer orders with DNK shipping tracking'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('artisan-orders')}
            className="text-xs font-bold text-[#B35438] dark:text-[#E07A5F] hover:underline flex items-center space-x-1"
          >
            <span>{lang === 'hi' ? 'सभी ऑर्डर्स देखें' : 'View All Orders'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <div 
                key={order.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                    <img 
                      src={order.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80'} 
                      alt="Order item"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-white truncate">
                        {order.product_title || 'Handmade Craft Order'}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                        {order.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {order.order_date || 'Recent'} • Qty: {order.qty || 1} • {order.payment_method || 'UPI'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black font-mono text-stone-900 dark:text-white">
                    ₹{order.total?.toLocaleString('en-IN') || order.price?.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {order.status || 'ACCEPTED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center text-xs text-stone-500">
            {lang === 'hi' ? 'अभी तक कोई ऑर्डर नहीं आया है।' : 'No customer orders received yet.'}
          </div>
        )}
      </div>

    </div>
  );
};

