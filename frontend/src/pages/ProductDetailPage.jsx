import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import { CheckoutModal } from '../components/CheckoutModal';
import { 
  ArrowLeft, 
  Award, 
  ShieldCheck, 
  QrCode, 
  Building2, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  MapPin, 
  Tag, 
  ShoppingBag, 
  Heart, 
  MessageCircle,
  Truck,
  Zap
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { 
    selectedProduct, 
    setActiveTab, 
    t, 
    lang, 
    loadProducts, 
    showToast,
    userRole,
    addToCart,
    placeOrder,
    toggleWishlist,
    wishlist,
    currentUser
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isGemPublishing, setIsGemPublishing] = useState(false);

  if (!selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="text-stone-500">No product selected</p>
        <button
          onClick={() => setActiveTab(userRole === 'artisan' ? 'catalog' : 'buyer-market')}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs"
        >
          Return to {userRole === 'artisan' ? 'Catalog' : 'Marketplace'}
        </button>
      </div>
    );
  }

  const p = selectedProduct;
  const isWishlisted = wishlist.includes(p.id);
  const displayTitle = lang === 'hi' && p.title_hi ? p.title_hi : p.title_en;
  const displayDesc = lang === 'hi' && p.description_hi ? p.description_hi : p.description_en;
  const displayStory = lang === 'hi' && p.cultural_story_hi ? p.cultural_story_hi : p.cultural_story_en;
  const bullets = (lang === 'hi' && p.bullet_points_hi?.length) ? p.bullet_points_hi : p.bullet_points_en || [];
  const imgSrc = getProductImage(p);

  // Toggle GeM Publishing
  const handleToggleGeM = async () => {
    setIsGemPublishing(true);
    try {
      const res = await api.toggleGeMPublish(p.id);
      showToast(res.message, 'success');
      await loadProducts();
      p.gem_published = res.gem_published;
    } catch (err) {
      showToast('Error toggling GeM publish', 'error');
    } finally {
      setIsGemPublishing(false);
    }
  };

  // Instant Buy Now Flow
  const handleBuyNow = () => {
    const address = currentUser?.location || '124 Connaught Place, Central Delhi, New Delhi - 110001';
    placeOrder(p, 1, address);
  };

  // Social Post Generator
  const socialPostCaption = `✨ Authentic Handmade Indian Heritage: ${p.title_en}\n\n` +
    `🏺 Handcrafted by ${p.artisan_name} in ${p.artisan_village}, ${p.artisan_state}.\n` +
    `🧵 Material: ${p.material_type}\n` +
    `🏛️ MoSJE Scheme ID: ${p.mosje_scheme_id || 'MoSJE-VISH-2026'}\n` +
    `💰 Price: ₹${p.price?.toLocaleString('en-IN')}\n\n` +
    `🌿 Direct from artisan to you. 100% genuine with digital authenticity certificate.\n\n` +
    `#VocalForLocal #IndianHandicrafts #${(p.category || 'Handicraft').replace(/\s+/g, '')} #MoSJE #GIProduct #ArtisanHeritage #KalaSetu`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialPostCaption);
    setCopied(true);
    showToast('Social caption copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      {/* Back Button */}
      <button
        onClick={() => setActiveTab(userRole === 'artisan' ? 'catalog' : 'buyer-market')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-stone-900 px-4 py-2 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm transition-all hover:scale-105 active:scale-95 font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {userRole === 'artisan' ? 'Catalog' : 'Marketplace'}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        {/* Left Column: Image and QR Badge */}
        <div className="lg:col-span-6 space-y-5">
          <div className="relative aspect-square w-full bg-white dark:bg-stone-900 rounded-[28px] p-4 border border-stone-200/80 dark:border-stone-800 shadow-card overflow-hidden flex items-center justify-center group">
            <img
              src={imgSrc}
              alt={p.title_en}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getCategoryFallbackImage(p.category);
              }}
              className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />

            {p.gi_tagged && (
              <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-orange-600 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-900/40">
                <Award className="w-4 h-4" />
                <span>GI CERTIFIED CRAFT</span>
              </div>
            )}
          </div>

          {/* Trust and Verification Panel */}
          <div className="bg-orange-50/80 dark:bg-orange-950/30 rounded-[28px] p-5 sm:p-6 border border-orange-200/80 dark:border-orange-900/50 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-orange-950 dark:text-orange-300 uppercase tracking-wider font-sans">
                <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>MoSJE Trust & Authenticity Badge</span>
              </div>
              <button
                onClick={() => setActiveTab('certificate')}
                className="text-xs font-bold text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 underline flex items-center space-x-1 font-sans"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>View Full Certificate</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-stone-700 dark:text-stone-300">
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-orange-200/60 dark:border-orange-900/40 shadow-sm">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block uppercase font-bold">Artisan Beneficiary ID</span>
                <span className="font-mono font-bold text-stone-900 dark:text-white">{p.mosje_scheme_id || 'MoSJE-VISH-2026-908'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-orange-200/60 dark:border-orange-900/40 shadow-sm">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block uppercase font-bold">Heritage Craft Origin</span>
                <span className="font-bold text-stone-900 dark:text-white">{p.artisan_village}, {p.artisan_state}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Information & Marketplace Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs font-sans">
                {p.category}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium font-sans">
                Created by {p.artisan_name} ({p.craft_lineage_years || 20}+ yrs lineage)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white leading-tight font-serif">
              {displayTitle}
            </h1>

            <div className="pt-2 flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white font-serif">
                ₹{p.price?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium font-sans">
                ({userRole === 'artisan' ? 'Fair AI Recommended Price' : 'Direct Artisan Price • Free Shipping'})
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 font-sans">
              Product Overview
            </h3>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-hindi bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
              {displayDesc}
            </p>
          </div>

          {/* Cultural Heritage Story */}
          {displayStory && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-1.5">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-400 flex items-center space-x-1.5 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Heritage Craft Narrative</span>
              </h3>
              <p className="text-xs text-stone-700 dark:text-stone-300 italic leading-relaxed font-hindi">
                "{displayStory}"
              </p>
            </div>
          )}

          {/* Bullet Features */}
          {bullets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 font-sans">
                Authentic Craft Features
              </h3>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 font-sans">
                {bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role-Specific Action Buttons */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
            {userRole === 'buyer' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Buy Now Button */}
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-900/30 transition-all min-h-[48px] active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-stone-950 text-stone-950" />
                    <span>⚡ Buy Now (तुरंत खरीदें)</span>
                  </button>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="py-3.5 px-4 rounded-2xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all min-h-[48px] active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Add to Cart</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className={`py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all min-h-[44px] ${
                      isWishlisted
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                        : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-stone-500'}`} />
                    <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </button>

                  {/* WhatsApp Direct Inquiry */}
                  <button
                    onClick={() => {
                      showToast(`Contacting master artisan ${p.artisan_name}...`, 'info');
                      setActiveTab('whatsapp');
                    }}
                    className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all min-h-[44px] active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Artisan</span>
                  </button>
                </div>
              </div>
            ) : userRole === 'businessman' ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold block font-sans">Wholesale Rate (MOQ 50+)</span>
                    <span className="text-base font-black text-blue-900 dark:text-blue-300 font-serif">₹{Math.round((p.price || 3000) * 0.72).toLocaleString('en-IN')}/unit</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] font-sans">
                    28% Bulk Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      showToast(`Bulk RFQ Request generated for ${p.title_en}!`, 'success');
                      setActiveTab('businessman-home');
                    }}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 transition-all min-h-[48px] active:scale-95 font-sans"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Request Bulk RFQ Quote</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Direct cluster inquiry with ${p.artisan_name} initiated...`, 'info');
                      setActiveTab('whatsapp');
                    }}
                    className="py-3.5 px-4 rounded-2xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all min-h-[48px] active:scale-95 font-sans"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Inquire Cluster</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 font-sans"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Check Pricing Model</span>
                </button>

                <button
                  onClick={() => setShowSocialModal(true)}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 font-sans"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Social Auto-Post</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Social Media Post Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-[28px] max-w-lg w-full p-6 sm:p-7 text-stone-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2 text-pink-400 font-bold text-sm font-serif">
                <Share2 className="w-4 h-4" />
                <span>Simulated Social Media Auto-Post</span>
              </div>
              <button
                onClick={() => setShowSocialModal(false)}
                className="text-stone-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs font-mono text-stone-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {socialPostCaption}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-stone-400">
                <Share2 className="w-4 h-4 text-pink-500" />
                <span>Ready for Instagram, WhatsApp & FB</span>
              </div>

              <button
                onClick={handleCopyCaption}
                className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-md"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        product={p}
        initialQty={1}
      />
    </div>
  );
};
