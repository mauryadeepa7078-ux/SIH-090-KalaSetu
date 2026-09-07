import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import { 
  Search, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  QrCode, 
  MessageCircle, 
  Filter, 
  MapPin, 
  Layers, 
  Palette,
  ExternalLink,
  ShoppingBag,
  Heart
} from 'lucide-react';

export const BuyerLandingPage = () => {
  const { 
    products, 
    loading, 
    lang, 
    t, 
    setActiveTab, 
    setSelectedProduct, 
    switchRole 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [giOnly, setGiOnly] = useState(false);

  const categories = [
    'All',
    'Handloom Saree',
    'Terracotta Pottery',
    'Brass Dokra Craft',
    'Madhubani Painting',
    'Blue Pottery',
    'Wood Carving',
    'Leather Craft',
    'Zari Embroidery'
  ];

  const states = ['All', 'Uttar Pradesh', 'Bihar', 'Odisha', 'Karnataka', 'Rajasthan', 'West Bengal'];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesState = selectedState === 'All' || p.artisan_state === selectedState;
    const matchesGi = !giOnly || p.gi_tagged === true;
    const titleMatch = (p.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.title_hi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.artisan_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesState && matchesGi && titleMatch;
  });

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setActiveTab('detail');
  };

  const handleOpenCertificate = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setActiveTab('certificate');
  };

  const handleWhatsAppInquiry = (product, e) => {
    e.stopPropagation();
    setActiveTab('whatsapp');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      
      {/* Buyer Marketplace Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/80 rounded-3xl p-6 sm:p-8 text-white border border-amber-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MoSJE Verified Artisan Marketplace</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
              {lang === 'hi' 
                ? 'भारतीय प्रामाणिक हस्तशिल्प बाज़ार' 
                : 'Direct Indian Heritage & GI Craft Marketplace'}
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              {lang === 'hi' 
                ? 'सीधे भारत सरकार (MoSJE) द्वारा सत्यापित मास्टर कारीगरों से खरीदें। 100% प्रामाणिक, GI टैग प्रमाणित और डिजिटल QR प्रमाण पत्र सहित।'
                : 'Purchase directly from master artisans verified under Ministry of Social Justice & Empowerment (MoSJE). 100% authentic, GI-tagged with digital QR provenance.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => switchRole('artisan')}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md"
              title="Switch to Seller / Creator view"
            >
              <Palette className="w-4 h-4 text-orange-400" />
              <span>{lang === 'hi' ? 'कारीगर मोड में बदलें' : 'Switch to Artisan View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Comprehensive Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'शिल्प, साड़ी, मूर्ति, पॉटरी या कारीगर खोजें...' : 'Search crafts, silk sarees, pottery, paintings, artisans...'}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm shadow-sm transition-colors font-sans"
            />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-colors font-sans"
          >
            {states.map(st => (
              <option key={st} value={st}>{st === 'All' ? 'All States (सभी राज्य)' : st}</option>
            ))}
          </select>

          {/* GI Tag Only Toggle */}
          <button
            onClick={() => setGiOnly(!giOnly)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm min-h-[44px] ${
              giOnly
                ? 'bg-amber-600 text-white border border-amber-500 shadow-md'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Award className={`w-4 h-4 ${giOnly ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
            <span>GI Certified Only</span>
          </button>
        </div>

        {/* Categories scrollbar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Listings Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400 font-sans">Connecting to verified craft units...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4 shadow-sm">
          <Layers className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 font-serif">No crafts matching your criteria</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto font-sans">
            Try resetting filters or searching for another craft category like Silk Saree or Blue Pottery.
          </p>
          <button
            onClick={() => { setSelectedCategory('All'); setSelectedState('All'); setGiOnly(false); setSearchQuery(''); }}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all font-sans"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const displayTitle = lang === 'hi' && product.title_hi ? product.title_hi : product.title_en;
            const imgSrc = getProductImage(product);

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="group bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-stone-50 dark:bg-stone-950 overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={imgSrc}
                    alt={product.title_en}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getCategoryFallbackImage(product.category);
                    }}
                    className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* GI Tag Badge */}
                  {product.gi_tagged && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-md">
                      <Award className="w-3 h-3" />
                      <span>GI TAG</span>
                    </div>
                  )}

                  {/* Verified MoSJE Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-stone-900/80 backdrop-blur-sm text-emerald-400 text-[10px] font-bold flex items-center space-x-1 shadow-md">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>MoSJE Verified</span>
                  </div>

                  {/* Quick Action Buttons on Image */}
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <button
                      onClick={(e) => handleOpenCertificate(product, e)}
                      title="View Digital Provenance Certificate"
                      className="p-2 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-sm shadow-md transition-transform group-hover:scale-110"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleWhatsAppInquiry(product, e)}
                      title="Direct WhatsApp Inquire"
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform group-hover:scale-110"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
                        {product.category}
                      </span>
                      <span className="flex items-center text-stone-500 dark:text-stone-400 text-[11px]">
                        <MapPin className="w-3 h-3 mr-0.5" />
                        {product.artisan_village}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-serif">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Price & Master Artisan */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 block uppercase font-bold tracking-wider font-sans">
                        Direct Price
                      </span>
                      <span className="text-lg font-black text-stone-900 dark:text-white font-sans">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 block font-sans">
                        {product.artisan_name}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-sans">
                        {product.craft_lineage_years || 20}+ Yrs Lineage
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
