import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
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
  Layers,
  ShoppingBag,
  ArrowUpRight,
  LayoutGrid,
  List,
  Edit,
  Archive,
  ArchiveRestore
} from 'lucide-react';

export const CatalogPage = () => {
  const { 
    products = [], 
    loading, 
    t, 
    lang, 
    setActiveTab, 
    setSelectedProduct, 
    setActiveDraft,
    deleteProduct,
    toggleProductStatus
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Handicraft-relevant categories per Phase 2 Update 3
  const categories = [
    'All',
    'Handloom',
    'Pottery',
    'Woodcraft',
    'Textiles',
    'Paintings',
    'Jewellery',
    'Other Crafts'
  ];

  const filteredProducts = products.filter(p => {
    const pCat = (p.category || '').toLowerCase();
    const targetCat = selectedCategory.toLowerCase();
    const matchesCat = selectedCategory === 'All' || pCat.includes(targetCat) || (targetCat === 'handloom' && pCat.includes('saree')) || (targetCat === 'pottery' && (pCat.includes('terracotta') || pCat.includes('clay')));
    const titleMatch = (p.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.title_hi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.artisan_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && titleMatch;
  });

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setActiveTab('detail');
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    setActiveDraft({
      ...product,
      price: product.price || 0,
      min_price: product.min_price || 0,
      max_price: product.max_price || 0
    });
    setSelectedProduct(product);
    setActiveTab('pricing');
  };

  const handleDeleteProduct = (productId, e) => {
    e.stopPropagation();
    if (window.confirm(lang === 'hi' ? 'क्या आप इस उत्पाद को कैटलॉग से हटाना चाहते हैं?' : 'Are you sure you want to remove this craft from your catalog?')) {
      deleteProduct(productId);
    }
  };

  const handleToggleStatus = (productId, e) => {
    e.stopPropagation();
    toggleProductStatus(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in pb-28 text-stone-900 dark:text-stone-100">
      
      {/* Top Banner / Call to Action */}
      <div className="bg-gradient-to-r from-stone-900 via-orange-950/90 to-stone-900 rounded-3xl p-6 sm:p-8 text-white border border-orange-700/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold font-sans">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>MoSJE AI Virtual Business Manager</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-serif text-white">
              {lang === 'hi' ? 'कारीगर डिजिटल कैटलॉग व इन्वेंटरी' : 'Artisan Craft Catalog & Inventory'}
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-sans">
              {lang === 'hi' 
                ? 'AI फोटो स्टूडियो और आवाज से 2 मिनट में अपने हस्तशिल्प को डिजिटल रूप दें। GeM और ONDC पर सीधे बेचें।'
                : 'Manage products, edit pricing, track sales, and view MoSJE GI certificates.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('camera')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-900/40 active:scale-95 transition-all min-h-[48px]"
            >
              <Plus className="w-5 h-5" />
              <span>{t('newListing') || 'Add New Craft'}</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-stone-800/90 hover:bg-stone-750 text-stone-200 border border-stone-700/80 font-semibold text-sm transition-all min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{t('navVoiceCatalog') || 'Voice Catalog'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search, View Mode Toggle & Category Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'उत्पाद, शिल्प श्रेणी या शिल्पकार का नाम खोजें...' : 'Search by craft, title, or artisan name...'}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm shadow-sm transition-colors font-sans"
            />
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#B35438] text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#B35438] text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#B35438] text-white shadow-sm'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display (Grid or List) */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#B35438] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400 font-sans">Loading authentic artisan listings...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4 shadow-sm">
          <Layers className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 font-serif">
            {lang === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No products found'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto font-sans">
            {lang === 'hi' 
              ? 'खोज शब्द बदलें या AI Photo Studio से नया हस्तशिल्प जोड़ें।' 
              : 'Try adjusting your filter or add a new handmade craft using AI Photo Studio.'}
          </p>
          <button
            onClick={() => setActiveTab('camera')}
            className="px-5 py-2.5 rounded-2xl bg-[#B35438] hover:bg-[#C86D51] text-white font-bold text-xs shadow-md transition-all font-sans"
          >
            {t('newListing') || 'Add First Craft'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const displayTitle = lang === 'hi' && product.title_hi ? product.title_hi : product.title_en;
            const imgSrc = getProductImage(product, true);
            const isArchived = product.status === 'ARCHIVED';

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className={`group bg-white dark:bg-stone-900 rounded-3xl border ${
                  isArchived ? 'border-dashed border-stone-300 dark:border-stone-800 opacity-70' : 'border-stone-200 dark:border-stone-800 hover:border-[#B35438]/60'
                } shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer`}
              >
                {/* Product Image Container */}
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

                  {/* AI Enhanced Badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-amber-300 text-[10px] font-bold flex items-center space-x-1 shadow-md border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>AI Studio</span>
                  </div>

                  {/* GI Tag Badge */}
                  {product.gi_tagged && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#B35438] text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-md">
                      <Award className="w-3 h-3" />
                      <span>GI TAG</span>
                    </div>
                  )}

                  {/* Action Bar (Edit / Archive / Delete) */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditProduct(product, e)}
                      title="Edit Price & Details"
                      className="p-2 rounded-xl bg-white/90 dark:bg-stone-850/90 text-stone-700 dark:text-stone-200 hover:bg-[#B35438] hover:text-white backdrop-blur-sm shadow-md transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleStatus(product.id, e)}
                      title={isArchived ? 'Restore to active' : 'Archive craft'}
                      className="p-2 rounded-xl bg-white/90 dark:bg-stone-850/90 text-stone-700 dark:text-stone-200 hover:bg-amber-600 hover:text-white backdrop-blur-sm shadow-md transition-colors"
                    >
                      {isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleDeleteProduct(product.id, e)}
                      title="Remove product"
                      className="p-2 rounded-xl bg-white/90 dark:bg-stone-850/90 text-red-500 hover:bg-red-600 hover:text-white backdrop-blur-sm shadow-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
                        {product.category || 'Handicraft'}
                      </span>
                      <span className="text-[11px] font-bold text-stone-400">
                        {product.sales_count || 0} {lang === 'hi' ? 'बिके' : 'sold'}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-[#B35438] dark:group-hover:text-[#E07A5F] transition-colors font-serif">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Price and Status */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-stone-900 dark:text-white font-mono">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isArchived ? 'bg-stone-200 dark:bg-stone-800 text-stone-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isArchived ? (lang === 'hi' ? 'संग्रहीत' : 'Archived') : (lang === 'hi' ? 'सक्रिय' : 'Active')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const displayTitle = lang === 'hi' && product.title_hi ? product.title_hi : product.title_en;
            const imgSrc = getProductImage(product, true);
            const isArchived = product.status === 'ARCHIVED';

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-stone-900 border ${
                  isArchived ? 'border-dashed border-stone-300 dark:border-stone-800 opacity-70' : 'border-stone-200 dark:border-stone-800 hover:border-[#B35438]/60'
                } shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-stone-50 dark:bg-stone-950 overflow-hidden shrink-0 border border-stone-100 dark:border-stone-800">
                    <img
                      src={imgSrc}
                      alt={product.title_en}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate group-hover:text-[#B35438] transition-colors">
                        {displayTitle}
                      </h4>
                      {product.gi_tagged && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B35438]/15 text-[#B35438] font-bold shrink-0">
                          GI TAG
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {product.category} • {product.sales_count || 0} sold
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-black font-mono text-stone-900 dark:text-white">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      isArchived ? 'bg-stone-200 dark:bg-stone-800 text-stone-500' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {isArchived ? 'Archived' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleEditProduct(product, e)}
                      title="Edit Product"
                      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#B35438] hover:text-white text-stone-600 dark:text-stone-300 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleToggleStatus(product.id, e)}
                      title={isArchived ? 'Restore' : 'Archive'}
                      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-600 hover:text-white text-stone-600 dark:text-stone-300 transition-colors"
                    >
                      {isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleDeleteProduct(product.id, e)}
                      title="Delete Product"
                      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-red-600 hover:text-white text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

