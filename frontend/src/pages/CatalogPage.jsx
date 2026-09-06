import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Building2,
  Filter,
  Layers
} from 'lucide-react';

export const CatalogPage = () => {
  const { 
    products, 
    loading, 
    t, 
    lang, 
    setActiveTab, 
    setSelectedProduct, 
    pendingQueue 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const titleMatch = (p.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.title_hi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.artisan_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && titleMatch;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Call to Action */}
      <div className="bg-gradient-to-r from-stone-900 via-orange-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white border border-orange-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MoSJE AI Virtual Business Manager</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-hindi">
              {lang === 'hi' ? 'कारीगर डिजिटल कैटलॉग व इन्वेंटरी' : 'Artisan Digital Inventory & Catalog'}
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              {lang === 'hi' 
                ? 'AI फोटो स्टूडियो और आवाज से 2 मिनट में अपने हस्तशिल्प को डिजिटल रूप दें। GeM और ONDC पर सीधे बेचें।'
                : 'Digitize your handmade crafts in 2 minutes with AI Photo Studio & Multilingual Voice. Sell directly on GeM & ONDC.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('camera')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-900/50 active:scale-95 transition-all min-h-[48px]"
            >
              <Plus className="w-5 h-5" />
              <span>{t('newListing')}</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-sm transition-all min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{t('navVoiceCatalog')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'उत्पाद, शिल्प श्रेणी या शिल्पकार का नाम खोजें...' : 'Search by craft, title, or artisan name...'}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-stone-500 flex-shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-stone-500">Loading authentic artisan listings...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
          <Layers className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">No products found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or add a new handmade craft using AI Photo Studio.
          </p>
          <button
            onClick={() => setActiveTab('camera')}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md hover:bg-orange-700"
          >
            {t('newListing')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isPending = product.sync_status === 'PENDING';
            const displayTitle = lang === 'hi' && product.title_hi ? product.title_hi : product.title_en;
            const imgSrc = product.enhanced_image_url || product.original_image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="group bg-white rounded-3xl border border-stone-200 hover:border-orange-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Product Image Container */}
                <div className="relative aspect-square bg-stone-50 overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={imgSrc}
                    alt={product.title_en}
                    className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Sync Status Badge */}
                  {isPending ? (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center space-x-1 shadow-md">
                      <Clock className="w-3 h-3" />
                      <span>{t('pendingSync')}</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center space-x-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('synced')}</span>
                    </div>
                  )}

                  {/* GI Tag Badge */}
                  {product.gi_tagged && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-orange-600 text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-md">
                      <Award className="w-3 h-3" />
                      <span>GI TAG</span>
                    </div>
                  )}

                  {/* Quick QR Certificate link button */}
                  <button
                    onClick={(e) => handleOpenCertificate(product, e)}
                    title="View MoSJE Digital Certificate"
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-sm shadow-md transition-transform group-hover:scale-110"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold text-[11px]">
                        {product.category}
                      </span>
                      <span>{product.artisan_village}</span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors font-hindi">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Price and Artisan Name */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                        {t('recommendedPrice')}
                      </span>
                      <span className="text-lg font-black text-stone-900">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-stone-700 block">
                        {product.artisan_name}
                      </span>
                      {product.gem_published && (
                        <span className="inline-flex items-center text-[10px] text-blue-600 font-bold">
                          <Building2 className="w-3 h-3 mr-0.5" /> GeM Live
                        </span>
                      )}
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
