import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProfileDropdown } from './ProfileDropdown';
import { PwaInstallModal } from './PwaInstallModal';
import { 
  ShoppingBag, 
  Camera, 
  Mic, 
  DollarSign, 
  Building2, 
  MessageCircle, 
  BarChart3, 
  Users, 
  RefreshCw, 
  Globe, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Monitor, 
  RotateCcw,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Award,
  Palette,
  Truck,
  Briefcase,
  Layers,
  ChevronDown,
  User,
  Download,
  Sun,
  Moon,
  FileCheck,
  PackageCheck,
  SlidersHorizontal
} from 'lucide-react';

export const Navbar = () => {
  const { 
    lang, 
    setLang, 
    t, 
    activeTab, 
    setActiveTab, 
    isOnline, 
    toggleOfflineSimulation, 
    pendingQueue, 
    isMobileFrame, 
    setIsMobileFrame, 
    screenDevice,
    setScreenDevice,
    setShowResetModal,
    userRole,
    currentUser,
    switchRole,
    openOnboarding,
    orders,
    cart,
    theme,
    toggleTheme
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(
    typeof window !== 'undefined' ? (window.deferredPwaPrompt || null) : null
  );

  const moreMenuRef = useRef(null);

  // Close More Menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Capture PWA beforeinstallprompt event with fallback to global store
  useEffect(() => {
    if (typeof window !== 'undefined' && window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      setDeferredPrompt(e);
      console.log('[PWA Navbar] beforeinstallprompt event captured and ready for 1-tap install.');
    };

    const handlePromptAvailable = () => {
      if (typeof window !== 'undefined' && window.deferredPwaPrompt) {
        setDeferredPrompt(window.deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWA Navbar] KalaSetu app installed.');
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') window.deferredPwaPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleNativeInstall = async () => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.deferredPwaPrompt : null);
    if (promptEvent) {
      console.log('[PWA Navbar] Triggering native install prompt dialog...');
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        console.log('[PWA Navbar] User choice outcome:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA Navbar] User accepted the KalaSetu app install.');
        }
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') window.deferredPwaPrompt = null;
      } catch (err) {
        console.warn('[PWA Navbar] Error displaying native prompt:', err);
      }
    }
  };

  const handleInstallClick = () => {
    const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.deferredPwaPrompt : null);

    if (promptEvent && !isIOS) {
      handleNativeInstall();
    } else {
      setIsPwaModalOpen(true);
    }
  };

  // -------------------------------------------------------------
  // Streamlined Navigation Groupings (3-4 Core Items + More Dropdown)
  // -------------------------------------------------------------

  // Artisan Core vs Secondary
  const artisanPrimaryNav = [
    { id: 'artisan-home', label: 'Studio Home', icon: Sparkles, desc: 'Photo & voice first creator hub' },
    { id: 'camera', label: t('navPhotoStudio') || 'AI Studio', icon: Camera, highlight: true, desc: 'Lighting & background enhancement' },
    { id: 'voice', label: t('navVoiceCatalog') || 'Voice Catalog', icon: Mic, desc: 'Bilingual AI voice descriptions' },
    { id: 'catalog', label: 'Mera Catalog', icon: ShoppingBag, desc: 'Digitized craft inventory' },
  ];

  const artisanSecondaryNav = [
    { id: 'pricing', label: t('navPricing') || 'Smart Pricing Assistant', icon: DollarSign, desc: 'ML fair-wage benchmark calculator' },
    { id: 'artisan-orders', label: 'Orders & Bulk Inquiries', icon: Truck, badge: orders.length > 0 ? orders.length : null, desc: 'Retail fulfillment & GeM purchase inquiries' },
    { id: 'whatsapp', label: t('navWhatsApp') || 'WhatsApp Assistant', icon: MessageCircle, desc: 'Conversational seller bot' },
    { id: 'analytics', label: t('navAnalytics') || 'Performance Analytics', icon: BarChart3, desc: 'Sales, views, and cluster charts' },
    { id: 'community', label: t('navCommunity') || 'Artisan Community', icon: Users, desc: 'Peer artisan feed and guild network' },
    { id: 'certificate', label: 'GI Authenticity Certificates', icon: Award, desc: 'Verified GI tags and provenance QR' },
  ];

  // Buyer Core vs Secondary
  const buyerPrimaryNav = [
    { id: 'buyer-market', label: 'Marketplace', icon: ShoppingBag, desc: 'Authentic GI Indian crafts' },
    { id: 'orders', label: 'My Orders', icon: Truck, badge: orders.length > 0 ? orders.length : null, desc: '6-stage IndiaPost DNK live tracking' },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cart.length > 0 ? cart.length : null, desc: 'Shopping cart & instant checkout' },
    { id: 'community', label: 'Heritage Stories', icon: Users, desc: 'Artisan lineage & craft fair calendar' },
  ];

  const buyerSecondaryNav = [
    { id: 'certificate', label: 'Verify GI Heritage Certificate', icon: ShieldCheck, desc: 'Verify craft origin & MoSJE stamp' },
  ];

  // Businessman Core vs Secondary
  const businessmanPrimaryNav = [
    { id: 'businessman-home', label: 'B2B Procurement', icon: Briefcase, desc: 'Direct artisan cluster sourcing' },
    { id: 'businessman-orders', label: 'B2B & RFQ Tracker', icon: PackageCheck, desc: '6-stage live milestone tracker' },
    { id: 'gem', label: 'GeM & ONDC Tenders', icon: Building2, desc: 'Government & corporate bulk tenders' },
  ];

  const businessmanSecondaryNav = [
    { id: 'whatsapp', label: 'Cluster Inquiries', icon: MessageCircle, desc: 'Direct cooperative communication' },
    { id: 'community', label: 'Craft Clusters & Guilds', icon: Users, desc: 'Directory of registered artisan cooperatives' },
    { id: 'certificate', label: 'Institutional Compliance', icon: FileCheck, desc: 'GST, GI & MoSJE compliance credentials' },
  ];

  const primaryNavItems = userRole === 'artisan'
    ? artisanPrimaryNav
    : userRole === 'businessman'
    ? businessmanPrimaryNav
    : buyerPrimaryNav;

  const secondaryNavItems = userRole === 'artisan'
    ? artisanSecondaryNav
    : userRole === 'businessman'
    ? businessmanSecondaryNav
    : buyerSecondaryNav;

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];
  const isSecondaryActive = secondaryNavItems.some(item => item.id === activeTab);

  // Mobile Bottom Navigation Tabs (4 distinct items per role)
  const bottomTabs = userRole === 'artisan'
    ? [
        { id: 'artisan-home', label: 'Studio', icon: Sparkles },
        { id: 'artisan-orders', label: 'Orders', icon: Truck, badge: orders.length > 0 ? orders.length : null },
        { id: 'camera', label: 'Photo Studio', icon: Camera, isFab: true },
        { id: 'voice', label: 'Voice', icon: Mic },
        { id: 'catalog', label: 'Catalog', icon: ShoppingBag },
      ]
    : userRole === 'businessman'
    ? [
        { id: 'businessman-home', label: 'B2B Hub', icon: Briefcase },
        { id: 'businessman-orders', label: 'Orders', icon: PackageCheck, badge: 1 },
        { id: 'gem', label: 'GeM Board', icon: Building2, isFab: true },
        { id: 'whatsapp', label: 'Inquiries', icon: MessageCircle },
      ]
    : [
        { id: 'buyer-market', label: 'Market', icon: ShoppingBag },
        { id: 'orders', label: 'Orders', icon: Truck, badge: orders.length > 0 ? orders.length : null },
        { id: 'cart', label: 'Cart', icon: ShoppingBag, isFab: true, badge: cart.length > 0 ? cart.length : null },
        { id: 'community', label: 'Stories', icon: Users },
      ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200">
        
        {/* Top Utility Bar */}
        <div className="bg-stone-100/80 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800/60 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 transition-colors">
          
          {/* Left: Ministry Brand & Status */}
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center space-x-1 font-semibold text-[11px] text-stone-500 dark:text-stone-400">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block" />
              <span>MoSJE • SIH-26090 Initiative</span>
            </span>

            {/* Offline Simulator Pill */}
            <button
              onClick={toggleOfflineSimulation}
              className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-600 dark:text-red-400" />}
              <span>{isOnline ? t('online') : t('offline')}</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-stone-200/70 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-300/60 dark:border-stone-700/60">
              <button
                onClick={() => switchRole('artisan')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  userRole === 'artisan'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                🎨 Artisan
              </button>
              <button
                onClick={() => switchRole('buyer')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  userRole === 'buyer'
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                🛍️ Buyer
              </button>
              <button
                onClick={() => switchRole('businessman')}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                  userRole === 'businessman'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                🏢 B2B / GeM
              </button>
            </div>
          </div>

          {/* Right: Actions, Language, Theme, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {pendingQueue.length > 0 && (
              <button
                onClick={triggerSync}
                className="flex items-center space-x-1 px-2 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-bold animate-pulse"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sync ({pendingQueue.length})</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={() => toggleTheme()}
              title={theme === 'dark' ? 'Switch to Light Mode (दिन का दृश्य)' : 'Switch to Dark Mode (रात का दृश्य)'}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 text-stone-700 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all min-h-[30px] flex items-center justify-center shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 rotate-0 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-stone-700" />
              )}
            </button>

            {/* All 15 Indian Languages selector */}
            <div className="flex items-center space-x-1 bg-stone-200/80 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 rounded-xl px-2 py-1 min-h-[30px]">
              <Globe className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Language Selector"
                className="bg-transparent text-stone-800 dark:text-stone-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="hi" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">हिंदी (Hindi)</option>
                <option value="en" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">English</option>
                <option value="bn" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">বাংলা (Bengali)</option>
                <option value="mr" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">मराठी (Marathi)</option>
                <option value="te" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">తెలుగు (Telugu)</option>
                <option value="ta" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">தமிழ் (Tamil)</option>
                <option value="gu" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">ગુજરાતી (Gujarati)</option>
                <option value="ur" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">اردو (Urdu)</option>
                <option value="kn" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">ಕನ್ನಡ (Kannada)</option>
                <option value="or" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">ଓଡ଼ିଆ (Odia)</option>
                <option value="ml" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">മലയാളം (Malayalam)</option>
                <option value="pa" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="as" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">অসমীয়া (Assamese)</option>
                <option value="mai" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">मैथिली (Maithili)</option>
                <option value="bho" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">भोजपुरी (Bhojpuri)</option>
              </select>
            </div>

            {/* Install App Button */}
            <button
              onClick={handleInstallClick}
              title={lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install PWA App'}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-stone-950 font-black text-[11px] shadow-sm transition-all min-h-[30px] active:scale-95"
            >
              <Download className="w-3.5 h-3.5 fill-stone-950" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
              <span className="sm:hidden">Install</span>
            </button>

            {/* Profile Avatar & Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title="User Profile & Settings"
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all min-h-[30px] ${
                  userRole === 'artisan'
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/20'
                    : userRole === 'businessman'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950/20'
                    : 'bg-amber-600 text-stone-950 border-amber-500 shadow-md shadow-amber-950/20'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[70px] sm:max-w-[110px] truncate">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'Profile'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Profile Dropdown Component */}
              <ProfileDropdown 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
              />
            </div>

            {/* Device Viewport Mode Switcher (Laptop / Android / iOS) */}
            <button
              onClick={() => {
                if (screenDevice === 'responsive') {
                  setScreenDevice('android');
                  setIsMobileFrame(true);
                } else if (screenDevice === 'android') {
                  setScreenDevice('ios');
                  setIsMobileFrame(true);
                } else {
                  setScreenDevice('responsive');
                  setIsMobileFrame(false);
                }
              }}
              title={
                screenDevice === 'responsive' 
                  ? "Current: Laptop / Responsive View (Click for Android View)" 
                  : screenDevice === 'android' 
                  ? "Current: Android Phone View (Click for iOS View)" 
                  : "Current: iOS iPhone View (Click for Laptop View)"
              }
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all hidden sm:flex min-h-[30px] items-center justify-center space-x-1 shadow-sm ${
                screenDevice === 'responsive'
                  ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300/80 dark:border-stone-700'
                  : screenDevice === 'android'
                  ? 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                  : 'bg-blue-600/20 text-blue-700 dark:text-blue-400 border-blue-500/40'
              }`}
            >
              {screenDevice === 'responsive' ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">Laptop</span>
                </>
              ) : screenDevice === 'android' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] hidden md:inline">Android</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[11px] hidden md:inline">iOS</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button (Desktop) */}
            <button
              onClick={() => setShowResetModal(true)}
              title="Reset to 10 pristine seed artisan listings"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-stone-200/80 dark:bg-stone-800 hover:bg-red-100 dark:hover:bg-red-950/80 text-stone-600 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-300 border border-stone-300/80 dark:border-stone-700 text-xs font-semibold transition-colors min-h-[30px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Main App Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Brand Logo & Editorial Title */}
          <div 
            onClick={() => setActiveTab(userRole === 'artisan' ? 'artisan-home' : userRole === 'businessman' ? 'businessman-home' : 'buyer-market')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center ${
              userRole === 'businessman' 
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-blue-900/30'
                : 'bg-gradient-to-tr from-orange-600 via-amber-600 to-yellow-500 shadow-orange-900/30'
            }`}>
              <div className="w-full h-full bg-stone-900 dark:bg-stone-950 rounded-[14px] flex items-center justify-center">
                {userRole === 'businessman' ? (
                  <Building2 className="w-5 h-5 text-blue-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-orange-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white font-heritage">
                  {t('appName')}
                </h1>
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                  userRole === 'artisan'
                    ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30'
                    : userRole === 'businessman'
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                }`}>
                  {userRole === 'artisan' ? 'Artisan AI Studio' : userRole === 'businessman' ? 'B2B & GeM Portal' : 'Heritage Craft Market'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block font-medium">
                {userRole === 'businessman' ? 'Direct Artisan Cluster Sourcing & GeM Tenders' : t('appSub')}
              </p>
            </div>
          </div>

          {/* Calm Desktop Navigation: Primary 3-4 items + More Dropdown */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                    isActive
                      ? userRole === 'businessman'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                      : item.highlight
                      ? 'bg-orange-50 dark:bg-stone-800/90 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-950/40'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black leading-none shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* "More Tools / अधिक सुविधाएं" Dropdown Menu */}
            {secondaryNavItems.length > 0 && (
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] border ${
                    isSecondaryActive
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white border-orange-500/50'
                      : 'bg-stone-100 dark:bg-stone-850/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span>{lang === 'hi' ? 'अधिक सुविधाएं' : 'More Tools'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-stone-800">
                      {lang === 'hi' ? 'विशेष सुविधाएं व नेटवर्क' : 'Specialized AI & Business Tools'}
                    </div>

                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMoreMenuOpen(false);
                          }}
                          className={`w-full flex items-start space-x-3 p-2.5 rounded-2xl text-left transition-all ${
                            isActive
                              ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-600/30'
                              : 'hover:bg-stone-100 dark:hover:bg-stone-800/70 text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isActive ? 'bg-orange-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs leading-snug">{item.label}</span>
                              {item.badge != null && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.desc && (
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">{item.desc}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-orange-500" /> : <Menu className="w-6 h-6 text-stone-700 dark:text-stone-200" />}
            </button>
          </div>
        </div>
      </header>

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        onNativeInstall={handleNativeInstall}
        canNativeInstall={!!(deferredPrompt || (typeof window !== 'undefined' && window.deferredPwaPrompt))}
        lang={lang}
      />

      {/* Mobile Fullscreen Slide-Over Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="text-lg font-black text-stone-900 dark:text-white font-serif">
                  {lang === 'hi' ? 'नेविगेशन मेनू' : 'Navigation Menu'}
                </h3>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                  {userRole === 'artisan' ? 'Artisan Studio' : userRole === 'businessman' ? 'B2B & GeM Procurement' : 'Buyer Marketplace'}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Options List */}
            <div className="grid grid-cols-1 gap-2.5">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavClick(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all min-h-[54px] ${
                      isActive
                        ? userRole === 'businessman'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg'
                          : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg'
                        : 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-750'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-stone-900 text-orange-600 dark:text-orange-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold block font-sans">{item.label}</span>
                          {item.badge != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black leading-none font-sans">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] block font-sans ${isActive ? 'text-orange-100' : 'text-stone-500 dark:text-stone-400'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                  </button>
                );
              })}
            </div>

            {/* Mobile Drawer Profile & Utilities */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2 font-sans">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleInstallClick();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-stone-950 font-black text-xs flex items-center justify-center space-x-2 min-h-[48px] shadow-md"
              >
                <Download className="w-4 h-4 fill-stone-950" />
                <span>{lang === 'hi' ? 'KalaSetu ऐप इंस्टॉल करें' : 'Install KalaSetu App'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <User className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <span>{currentUser?.name || 'My Profile'} (प्रोफ़ाइल व खाता)</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowResetModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-bold flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('resetDemo')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ergonomic Mobile Bottom Tab Bar (Permanent on Small Screens & Safe Area Aware) */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 shadow-2xl px-2 py-1.5 flex items-center justify-around"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isFab) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center -mt-6 group focus:outline-none"
              >
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center shadow-xl group-active:scale-90 transition-transform ring-4 ring-stone-900 ${
                  userRole === 'businessman'
                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 shadow-blue-900/50'
                    : 'bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 shadow-orange-900/50'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-extrabold mt-1 ${userRole === 'businessman' ? 'text-blue-400' : 'text-orange-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-h-[48px] min-w-[56px] ${
                isActive
                  ? userRole === 'businessman'
                    ? 'text-blue-400 font-extrabold'
                    : 'text-orange-400 font-extrabold'
                  : 'text-stone-400 hover:text-stone-200 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? (userRole === 'businessman' ? 'scale-110 text-blue-400' : 'scale-110 text-orange-400') : ''}`} />
                {tab.badge != null && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black min-w-[14px] text-center leading-tight shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}

        {/* More Options Tab (triggers slide-over drawer) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-h-[48px] min-w-[56px] ${
            ['analytics', 'community', 'certificate', 'whatsapp', 'gem'].includes(activeTab)
              ? 'text-orange-400 font-extrabold'
              : 'text-stone-400 hover:text-stone-200 font-medium'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </>
  );
};

