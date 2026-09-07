import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VoiceNavProvider } from './context/VoiceNavContext';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { DeviceFrameToggle } from './components/DeviceFrameToggle';
import { ResetDemoModal } from './components/ResetDemoModal';
import { OnboardingModal } from './components/OnboardingModal';

// Pages
import { ArtisanLandingPage } from './pages/ArtisanLandingPage';
import { BuyerLandingPage } from './pages/BuyerLandingPage';
import { BusinessmanLandingPage } from './pages/BusinessmanLandingPage';
import { BusinessmanOrdersPage } from './pages/BusinessmanOrdersPage';
import { BuyerOrdersPage } from './pages/BuyerOrdersPage';
import { BuyerCartPage } from './pages/BuyerCartPage';
import { ArtisanOrdersPage } from './pages/ArtisanOrdersPage';
import { CatalogPage } from './pages/CatalogPage';
import { PhotoStudioPage } from './pages/PhotoStudioPage';
import { VoiceCatalogPage } from './pages/VoiceCatalogPage';
import { PricingAssistantPage } from './pages/PricingAssistantPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CertificatePage } from './pages/CertificatePage';
import { WhatsAppSimulator } from './pages/WhatsAppSimulator';
import { MarketplaceGeMPage } from './pages/MarketplaceGeMPage';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { CommunityPage } from './pages/CommunityPage';

const MainContent = () => {
  const { hasCompletedOnboarding, activeTab, userRole, notification } = useApp();

  // Root Entry Point Guard: If onboarding is not completed, ONLY render Language -> Role -> Registration entry flow
  if (!hasCompletedOnboarding) {
    return <OnboardingModal isFullScreen={true} />;
  }

  const renderCurrentTab = () => {
    // Strict Role-Based Tab Guard across all 3 Roles
    if (userRole === 'buyer') {
      const buyerAllowedTabs = ['buyer-market', 'detail', 'cart', 'orders', 'wishlist', 'certificate', 'community'];
      if (!buyerAllowedTabs.includes(activeTab)) {
        return <BuyerLandingPage />;
      }
    } else if (userRole === 'businessman') {
      const businessmanAllowedTabs = ['businessman-home', 'businessman-orders', 'gem', 'detail', 'certificate', 'whatsapp', 'community'];
      if (!businessmanAllowedTabs.includes(activeTab)) {
        return <BusinessmanLandingPage />;
      }
    } else {
      // Artisan Role
      const artisanAllowedTabs = ['artisan-home', 'artisan-orders', 'camera', 'voice', 'pricing', 'catalog', 'detail', 'certificate', 'whatsapp', 'analytics', 'community'];
      if (!artisanAllowedTabs.includes(activeTab)) {
        return <ArtisanLandingPage />;
      }
    }

    switch (activeTab) {
      case 'artisan-home':
        return <ArtisanLandingPage />;
      case 'artisan-orders':
        return <ArtisanOrdersPage />;
      case 'businessman-home':
        return <BusinessmanLandingPage />;
      case 'businessman-orders':
        return <BusinessmanOrdersPage />;
      case 'buyer-market':
      case 'wishlist':
        return <BuyerLandingPage />;
      case 'orders':
        return <BuyerOrdersPage />;
      case 'cart':
        return <BuyerCartPage />;
      case 'catalog':
        return <CatalogPage />;
      case 'camera':
        return <PhotoStudioPage />;
      case 'voice':
        return <VoiceCatalogPage />;
      case 'pricing':
        return <PricingAssistantPage />;
      case 'detail':
        return <ProductDetailPage />;
      case 'certificate':
        return <CertificatePage />;
      case 'whatsapp':
        return <WhatsAppSimulator />;
      case 'gem':
        return <MarketplaceGeMPage />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'community':
        return <CommunityPage />;
      default:
        return userRole === 'artisan' 
          ? <ArtisanLandingPage /> 
          : userRole === 'businessman' 
          ? <BusinessmanLandingPage /> 
          : <BuyerLandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col relative text-stone-900 dark:text-stone-100 selection:bg-orange-500 selection:text-white transition-colors duration-200 craft-pattern-bg">
      {/* Navbar & Offline Sync Bar */}
      <Navbar />
      <OfflineBanner />

      {/* Global Toast Notification */}
      {notification && (
        <div className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' :
          notification.type === 'error' ? 'bg-red-600 text-white' :
          notification.type === 'warning' ? 'bg-amber-600 text-white' :
          'bg-stone-900 text-white'
        }`}>
          {notification.msg}
        </div>
      )}

      {/* Page Canvas (Mobile Frame or Full Width) */}
      <DeviceFrameToggle>
        {renderCurrentTab()}
      </DeviceFrameToggle>

      {/* Floating Voice Navigation Mic & TTS Bar */}
      <VoiceAssistantBar />

      {/* 1-Click Reset Demo Modal for SIH Judges */}
      <ResetDemoModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <VoiceNavProvider>
        <MainContent />
      </VoiceNavProvider>
    </AppProvider>
  );
}

export default App;
