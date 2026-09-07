import React, { useState, useEffect } from 'react';
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
  Download
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
    triggerSync, 
    isMobileFrame, 
    setIsMobileFrame, 
    setShowResetModal,
    userRole,
    currentUser,
    switchRole,
    openOnboarding,
    orders,
    cart
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt captured successfully.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      setIsPwaModalOpen(true);
    }
  };

  // 1. Artisan-specific nav items (Strict RBAC: Creator & studio tools only)
  const artisanNavItems = [
    { id: 'artisan-home', label: 'Studio Home', icon: Sparkles, desc: 'Photo & Voice first artisan hub' },
    { id: 'artisan-orders', label: 'My Orders / Inquiries', icon: Truck, badge: orders.length > 0 ? orders.length : null, desc: 'Retail orders & GeM bulk inquiries' },
    { id: 'camera', label: t('navPhotoStudio') || 'AI Photo Studio', icon: Camera, highlight: true, desc: 'Remove background & enhance lighting' },
    { id: 'voice', label: t('navVoiceCatalog') || 'Voice-to-Catalog', icon: Mic, desc: 'Generate bilingual listings from voice' },
    { id: 'pricing', label: t('navPricing') || 'Smart Pricing', icon: DollarSign, desc: 'Dynamic Scikit-Learn pricing model' },
    { id: 'catalog', label: 'Mera Catalog', icon: ShoppingBag, desc: 'View digitized inventory & crafts' },
    { id: 'whatsapp', label: t('navWhatsApp') || 'WhatsApp Bot', icon: MessageCircle, desc: 'Direct WhatsApp seller assistant' },
    { id: 'analytics', label: t('navAnalytics') || 'Analytics', icon: BarChart3, desc: 'Sales, views, and inquiry charts' },
    { id: 'community', label: t('navCommunity') || 'Community', icon: Users, desc: 'Artisan peer network and feed' },
  ];

  // 2. Buyer-specific nav items (Strict RBAC: Consumer marketplace only)
  const buyerNavItems = [
    { id: 'buyer-market', label: 'Marketplace', icon: ShoppingBag, desc: 'Explore GI crafts & verified artisans' },
    { id: 'orders', label: 'My Orders', icon: Truck, badge: orders.length > 0 ? orders.length : null, desc: 'Real-time 6-stage delivery & DNK tracking' },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cart.length > 0 ? cart.length : null, desc: 'Shopping cart & instant checkout' },
    { id: 'community', label: 'Heritage Stories', icon: Users, desc: 'Artisan heritage and fair calendar' },
  ];

  // 3. Businessman-specific nav items (Strict RBAC: B2B, GeM, RFQ, Bulk tenders only)
  const businessmanNavItems = [
    { id: 'businessman-home', label: 'B2B Hub', icon: Briefcase, desc: 'Institutional sourcing & cluster directory' },
    { id: 'businessman-orders', label: 'B2B & RFQ Tracker', icon: Truck, desc: '6-stage live procurement & tender timeline' },
    { id: 'gem', label: 'GeM & ONDC Tenders', icon: Building2, desc: 'Government & corporate bulk procurement' },
    { id: 'whatsapp', label: 'Cluster Inquiries', icon: MessageCircle, desc: 'Direct cooperative communication' },
    { id: 'community', label: 'Craft Clusters', icon: Users, desc: 'State craft guilds & cluster directory' },
  ];

  const allNavItems = userRole === 'artisan' 
    ? artisanNavItems 
    : userRole === 'businessman' 
    ? businessmanNavItems 
    : buyerNavItems;

  // Mobile Bottom Navigation Tabs (4 distinct items per role)
  const bottomTabs = userRole === 'artisan'
    ? [
        { id: 'artisan-home', label: 'Studio', icon: Sparkles },
        { id: 'artisan-orders', label: 'Orders', icon: Truck, badge: orders.length > 0 ? orders.length : null },
        { id: 'camera', label: 'Photo Lo', icon: Camera, isFab: true },
        { id: 'voice', label: 'Bolkar', icon: Mic },
        { id: 'catalog', label: 'Catalog', icon: ShoppingBag },
      ]
    : userRole === 'businessman'
    ? [
        { id: 'businessman-home', label: 'B2B Hub', icon: Briefcase },
        { id: 'gem', label: 'GeM Board', icon: Building2, isFab: true },
        { id: 'whatsapp', label: 'Inquiries', icon: MessageCircle },
        { id: 'community', label: 'Clusters', icon: Users },
      ]
    : [
        { id: 'buyer-market', label: 'Explore', icon: ShoppingBag },
        { id: 'orders', label: 'Orders', icon: Truck, badge: orders.length > 0 ? orders.length : null },
        { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: cart.length > 0 ? cart.length : null },
        { id: 'community', label: 'Stories', icon: Users },
      ];

  const handleMobileNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 shadow-md">
        {/* Top Info Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-stone-800/80 text-xs">
          <div className="flex items-center space-x-2 text-stone-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-950/90 border border-orange-600/40 text-orange-400 font-bold tracking-wide text-[10px] sm:text-xs">
              SIH 2026 • SIH26090
            </span>
            <span className="hidden md:inline text-stone-400">
              MoSJE • Heritage & Culture
            </span>
          </div>

          {/* Quick controls */}
          <div className="flex items-center space-x-2">
            
            {/* Role Verified Status Badge (Static, RBAC strictly enforced via Onboarding) */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border min-h-[32px] ${
              userRole === 'artisan'
                ? 'bg-orange-950/90 text-orange-300 border-orange-600/50'
                : userRole === 'businessman'
                ? 'bg-blue-950/90 text-blue-300 border-blue-600/50'
                : 'bg-amber-950/90 text-amber-300 border-amber-600/50'
            }`}>
              {userRole === 'artisan' && <Palette className="w-3.5 h-3.5 text-orange-400" />}
              {userRole === 'businessman' && <Building2 className="w-3.5 h-3.5 text-blue-400" />}
              {userRole === 'buyer' && <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />}
              <span>
                {userRole === 'artisan' ? 'Artisan Studio' : userRole === 'businessman' ? 'Businessman (B2B)' : 'Buyer Portal'}
              </span>
            </div>

            {/* Offline simulator toggle button */}
            <button
              onClick={toggleOfflineSimulation}
              title={isOnline ? "Simulate Offline Mode" : "Simulate Online Mode"}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all min-h-[32px] ${
                isOnline 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-900' 
                  : 'bg-amber-950 text-amber-400 border border-amber-700/50 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            {/* Sync status badge if items pending */}
            {pendingQueue.length > 0 && (
              <button
                onClick={triggerSync}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-orange-600 text-white font-bold text-[11px] animate-bounce shadow-md hover:bg-orange-700 min-h-[32px]"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sync ({pendingQueue.length})</span>
              </button>
            )}

            {/* All 15 Indian Languages selector */}
            <div className="flex items-center space-x-1 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 min-h-[32px]">
              <Globe className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Language Selector"
                className="bg-transparent text-stone-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="hi" className="bg-stone-800">हिंदी (Hindi)</option>
                <option value="en" className="bg-stone-800">English</option>
                <option value="bn" className="bg-stone-800">বাংলা (Bengali)</option>
                <option value="mr" className="bg-stone-800">मराठी (Marathi)</option>
                <option value="te" className="bg-stone-800">తెలుగు (Telugu)</option>
                <option value="ta" className="bg-stone-800">தமிழ் (Tamil)</option>
                <option value="gu" className="bg-stone-800">ગુજરાતી (Gujarati)</option>
                <option value="ur" className="bg-stone-800">اردو (Urdu)</option>
                <option value="kn" className="bg-stone-800">ಕನ್ನಡ (Kannada)</option>
                <option value="or" className="bg-stone-800">ଓଡ଼ିଆ (Odia)</option>
                <option value="ml" className="bg-stone-800">മലയാളം (Malayalam)</option>
                <option value="pa" className="bg-stone-800">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="as" className="bg-stone-800">অসমীয়া (Assamese)</option>
                <option value="mai" className="bg-stone-800">मैथिली (Maithili)</option>
                <option value="bho" className="bg-stone-800">भोजपुरी (Bhojpuri)</option>
              </select>
            </div>

            {/* Install App Button */}
            <button
              onClick={handleInstallClick}
              title={lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install PWA App'}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-stone-950 font-black text-[11px] shadow-sm transition-all min-h-[32px] active:scale-95"
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
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all min-h-[32px] ${
                  userRole === 'artisan'
                    ? 'bg-orange-600 text-white border-orange-400 shadow-md shadow-orange-950/40'
                    : userRole === 'businessman'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-950/40'
                    : 'bg-amber-600 text-stone-950 border-amber-400 shadow-md shadow-amber-950/40'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
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

            {/* Device frame preview toggle */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              title={isMobileFrame ? "Switch to Full Screen Responsive" : "Switch to Mobile Phone Frame Preview"}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors hidden sm:flex min-h-[32px] items-center justify-center"
            >
              {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>

            {/* Reset Demo Data Button (Desktop) */}
            <button
              onClick={() => setShowResetModal(true)}
              title="Reset to 10 pristine seed artisan listings"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-red-950/80 hover:text-red-300 text-stone-400 border border-stone-700 text-xs font-semibold transition-colors min-h-[32px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Main App Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand */}
          <div 
            onClick={() => setActiveTab(userRole === 'artisan' ? 'artisan-home' : userRole === 'businessman' ? 'businessman-home' : 'buyer-market')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center ${
              userRole === 'businessman' 
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-blue-900/30'
                : 'bg-gradient-to-tr from-orange-600 via-amber-600 to-yellow-500 shadow-orange-900/30'
            }`}>
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
                {userRole === 'businessman' ? (
                  <Building2 className="w-5 h-5 text-blue-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-orange-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-hindi">
                  {t('appName')}
                </h1>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold border ${
                  userRole === 'artisan'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : userRole === 'businessman'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {userRole === 'artisan' ? 'AI Virtual Manager' : userRole === 'businessman' ? 'B2B & GeM Procurement' : 'Heritage Marketplace'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                {userRole === 'businessman' ? 'Institutional Wholesale & Government Tender Linkage' : t('appSub')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                    isActive
                      ? userRole === 'businessman'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'bg-orange-600 text-white shadow-md shadow-orange-900/40'
                      : item.highlight
                      ? 'bg-stone-800 text-orange-400 border border-orange-600/30 hover:bg-orange-950'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
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
          </nav>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-orange-400" /> : <Menu className="w-6 h-6 text-stone-200" />}
            </button>
          </div>
        </div>
      </header>

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        onNativeInstall={handleInstallClick}
        canNativeInstall={!!deferredPrompt}
        lang={lang}
      />

      {/* Mobile Fullscreen Slide-Over Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border-t border-stone-700 rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span className="font-extrabold text-white text-base">
                  {userRole === 'artisan' ? 'Artisan Studio' : userRole === 'businessman' ? 'B2B & GeM Procurement' : 'Buyer Marketplace'}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center"
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
                        : 'bg-stone-800/80 text-stone-200 hover:bg-stone-800 border border-stone-750'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-stone-900 text-orange-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold block">{item.label}</span>
                          {item.badge != null && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black leading-none">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] block ${isActive ? 'text-orange-100' : 'text-stone-400'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  </button>
                );
              })}
            </div>

            {/* Mobile Drawer Profile & Utilities */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
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
                className="w-full py-3 px-4 rounded-2xl bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <User className="w-4 h-4 text-orange-400" />
                <span>{currentUser?.name || 'My Profile'} (प्रोफ़ाइल व खाता)</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowResetModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-stone-800 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-xs font-bold flex items-center justify-center space-x-2 min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('resetDemo')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ergonomic Mobile Bottom Tab Bar (Permanent on Small Screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 shadow-2xl px-2 py-1.5 flex items-center justify-around">
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

