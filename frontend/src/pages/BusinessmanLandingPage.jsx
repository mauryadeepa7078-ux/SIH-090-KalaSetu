import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  FileText, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Search, 
  Filter, 
  MessageCircle, 
  Phone, 
  Mail, 
  Briefcase, 
  Truck, 
  FileCheck, 
  Clock, 
  DollarSign, 
  Globe, 
  Plus, 
  X,
  Copy,
  Check
} from 'lucide-react';

export const BusinessmanLandingPage = () => {
  const { 
    products, 
    setActiveTab, 
    setSelectedProduct, 
    showToast, 
    lang, 
    t,
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [activeRfqProduct, setActiveRfqProduct] = useState(null);
  const [showPoSuccessModal, setShowPoSuccessModal] = useState(false);
  const [generatedPoData, setGeneratedPoData] = useState(null);
  const [copied, setCopied] = useState(false);

  // RFQ Form State
  const [rfqForm, setRfqForm] = useState({
    companyName: currentUser?.company || 'Singhal Crafts Export & Retailers Pvt Ltd',
    gstin: currentUser?.gstin || '07AAAAA0000A1Z5',
    contactPerson: currentUser?.name || 'Rajesh Singhal',
    contactPhone: currentUser?.phone || '+91 98200 11223',
    quantity: 100,
    targetPrice: 2200,
    deliveryDate: '2026-10-15',
    destinationCity: 'New Delhi / Export Hub',
    customNotes: 'Require MoSJE authenticity certificates for each unit with export-grade packaging.'
  });

  // Major Indian Craft Clusters
  const clusters = [
    { id: 'ALL', name: 'All India Clusters (समस्त भारत)', state: 'Pan India', artisans: '14,200+' },
    { id: 'Varanasi', name: 'Varanasi Handloom Silk Cluster', state: 'Uttar Pradesh', artisans: '3,800+' },
    { id: 'Bastar', name: 'Bastar Dokra Metal Guild', state: 'Chhattisgarh', artisans: '1,450+' },
    { id: 'Madhubani', name: 'Mithila Folk Painting Hub', state: 'Bihar', artisans: '2,100+' },
    { id: 'Jaipur', name: 'Jaipur Blue Pottery Guild', state: 'Rajasthan', artisans: '950+' },
    { id: 'Pochampally', name: 'Pochampally Ikat Cooperative', state: 'Telangana', artisans: '1,800+' }
  ];

  // Filtered Products for Bulk
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      (p.title_en && p.title_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.title_hi && p.title_hi.includes(searchQuery)) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.artisan_village && p.artisan_village.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCluster = selectedCluster === 'ALL' || 
      (p.artisan_village && p.artisan_village.toLowerCase().includes(selectedCluster.toLowerCase())) ||
      (p.artisan_state && p.artisan_state.toLowerCase().includes(selectedCluster.toLowerCase()));

    return matchesSearch && matchesCluster;
  });

  const handleOpenRfq = (product) => {
    setActiveRfqProduct(product);
    setRfqForm(prev => ({
      ...prev,
      targetPrice: Math.round((product.price || 3000) * 0.75) // 25% wholesale discount estimation
    }));
    setShowRfqModal(true);
  };

  const handleSubmitRfq = (e) => {
    e.preventDefault();
    const poNumber = `PO-GEM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalEst = rfqForm.quantity * rfqForm.targetPrice;
    
    const poData = {
      poNumber,
      productTitle: activeRfqProduct?.title_en || 'Handcrafted Heritage Goods',
      artisanName: activeRfqProduct?.artisan_name || 'Cluster Cooperative Lead',
      cluster: `${activeRfqProduct?.artisan_village || 'Varanasi'}, ${activeRfqProduct?.artisan_state || 'UP'}`,
      quantity: rfqForm.quantity,
      unitPrice: rfqForm.targetPrice,
      totalAmount: totalEst,
      company: rfqForm.companyName,
      gstin: rfqForm.gstin,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryDate: rfqForm.deliveryDate,
      gemContractId: `GEM-BID-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setGeneratedPoData(poData);
    setShowRfqModal(false);
    setShowPoSuccessModal(true);
    showToast(`RFQ Generated: ${poNumber}`, 'success');
  };

  const handleCopyPo = () => {
    if (!generatedPoData) return;
    const text = `📋 INSTITUTIONAL PURCHASE ORDER\nPO Number: ${generatedPoData.poNumber}\nGeM Contract: ${generatedPoData.gemContractId}\nBuyer: ${generatedPoData.company} (GSTIN: ${generatedPoData.gstin})\nProduct: ${generatedPoData.productTitle}\nSupplier Cluster: ${generatedPoData.cluster}\nQuantity: ${generatedPoData.quantity} Units @ ₹${generatedPoData.unitPrice}/unit\nTotal Contract Value: ₹${generatedPoData.totalAmount.toLocaleString('en-IN')}\nExpected Delivery: ${generatedPoData.deliveryDate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('PO Details copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      
      {/* Hero Banner for Businessman / Institutional Procurement */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-stone-900 via-blue-950 to-stone-900 border border-blue-800/40 p-6 sm:p-10 shadow-2xl text-stone-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Government e-Marketplace (GeM) & ONDC Institutional Procurement Hub</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight font-hindi">
              संस्थागत थोक खरीद व GeM टेंडर पोर्टल
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
              Source GI-certified authentic Indian handicrafts directly from MoSJE-registered artisan cooperatives at zero intermediary markup. Integrated with GeM contracts, GST compliance, and bulk freight logistics.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('gem')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all min-h-[44px]"
              >
                <Layers className="w-4 h-4" />
                <span>Open GeM Tenders & RFQ Board ➔</span>
              </button>

              <button
                onClick={() => {
                  if (products.length > 0) handleOpenRfq(products[0]);
                  else showToast('No products available for RFQ', 'info');
                }}
                className="px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 font-bold text-xs sm:text-sm flex items-center space-x-2 min-h-[44px] transition-all"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Create Custom Bulk RFQ</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-stone-850/90 border border-stone-700/80 space-y-1">
              <div className="flex items-center justify-between text-blue-400">
                <Briefcase className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-400">GeM Tenders</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">₹48.6 L</div>
              <p className="text-[10px] text-emerald-400 font-medium">12 Active Tenders</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-850/90 border border-stone-700/80 space-y-1">
              <div className="flex items-center justify-between text-amber-400">
                <Award className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-400">Verified Hubs</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">24 Guilds</div>
              <p className="text-[10px] text-amber-300 font-medium">100% MoSJE Verified</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-850/90 border border-stone-700/80 space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-400">Savings</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">28.4%</div>
              <p className="text-[10px] text-stone-400 font-medium">Zero Middlemen</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-850/90 border border-stone-700/80 space-y-1">
              <div className="flex items-center justify-between text-cyan-400">
                <Truck className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold text-stone-400">Freight</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">IndiaPost</div>
              <p className="text-[10px] text-cyan-300 font-medium">DNK Niryat Kendra</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Navigation Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Direct Artisan Cluster Sourcing Directory</span>
            </h2>
            <p className="text-xs text-stone-500">
              Procure in bulk (MOQ 50+ units) directly from state craft corporations and verified artisan guilds
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {clusters.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCluster(c.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                selectedCluster === c.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-blue-400'
              }`}
            >
              <span>{c.name}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCluster === c.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
              }`}>
                {c.artisans}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Bulk Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wholesale products, GI tags, clusters..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-stone-600 self-end sm:self-auto">
            <span>Showing {filteredProducts.length} Wholesale Verified Products</span>
          </div>
        </div>

        {/* Wholesale Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const wholesalePrice = Math.round((product.price || 3000) * 0.72);
            const moq = 50;
            const bulkSavings = Math.round((product.price - wholesalePrice) * moq);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={product.enhanced_image_url || product.original_image_url}
                    alt={product.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {product.gi_tagged && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-orange-600 text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-md">
                      <Award className="w-3 h-3" />
                      <span>GI CERTIFIED</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-900/90 backdrop-blur-sm text-blue-200 text-[10px] font-bold border border-blue-500/40">
                    MOQ: {moq} Units
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[11px] text-stone-300 flex items-center justify-between">
                    <span className="truncate">📍 {product.artisan_village}, {product.artisan_state}</span>
                    <span className="text-amber-400 font-bold shrink-0">{product.artisan_name}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {product.category || 'Handicraft'} • MoSJE Verified
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-base line-clamp-1">
                      {lang === 'hi' && product.title_hi ? product.title_hi : product.title_en}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {lang === 'hi' && product.description_hi ? product.description_hi : product.description_en}
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">Wholesale Rate (MOQ 50+)</span>
                        <span className="text-lg font-black text-blue-950">₹{wholesalePrice.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-stone-400 ml-1.5 line-through">₹{product.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-700 font-bold block">Est. Batch Savings</span>
                        <span className="text-xs font-black text-emerald-600">+₹{bulkSavings.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleOpenRfq(product)}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Request RFQ</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setActiveTab('detail');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>Spec Sheet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance & Export Pack Banner */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-700">
            <FileCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">
              Institutional Compliance & HSN Tax Export Package
            </h3>
            <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
              Auto-generate GSTIN-compliant e-Invoices, e-Way bills, GeM bid compliance sheets, and MoSJE origin authenticity certificates for seamless institutional auditing.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('Downloading HSN & GeM Compliance Kit (PDF)...', 'success')}
          className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center space-x-2 shrink-0 transition-colors shadow-md"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Compliance Kit (PDF)</span>
        </button>
      </div>

      {/* RFQ Request Modal */}
      {showRfqModal && activeRfqProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-3xl p-6 text-stone-100 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Generate Bulk RFQ Quotation</h3>
              </div>
              <button
                onClick={() => setShowRfqModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center space-x-3">
              <img
                src={activeRfqProduct.enhanced_image_url || activeRfqProduct.original_image_url}
                alt={activeRfqProduct.title_en}
                className="w-14 h-14 object-cover rounded-xl shrink-0"
              />
              <div className="truncate">
                <h4 className="text-sm font-bold text-white truncate">{activeRfqProduct.title_en}</h4>
                <p className="text-xs text-stone-400">Cluster: {activeRfqProduct.artisan_village}, {activeRfqProduct.artisan_state}</p>
                <p className="text-xs text-blue-400 font-mono">Retail Base: ₹{activeRfqProduct.price}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitRfq} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-400 font-bold block">Target Quantity (Units)</label>
                  <input
                    type="number"
                    min="20"
                    value={rfqForm.quantity}
                    onChange={(e) => setRfqForm({ ...rfqForm, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-400 font-bold block">Target Unit Price (₹)</label>
                  <input
                    type="number"
                    value={rfqForm.targetPrice}
                    onChange={(e) => setRfqForm({ ...rfqForm, targetPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-400 font-bold block">Required Delivery By</label>
                  <input
                    type="date"
                    value={rfqForm.deliveryDate}
                    onChange={(e) => setRfqForm({ ...rfqForm, deliveryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-400 font-bold block">Buyer GSTIN</label>
                  <input
                    type="text"
                    value={rfqForm.gstin}
                    onChange={(e) => setRfqForm({ ...rfqForm, gstin: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-blue-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold block">Company / Enterprise</label>
                <input
                  type="text"
                  value={rfqForm.companyName}
                  onChange={(e) => setRfqForm({ ...rfqForm, companyName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold block">Special Packaging / Export Specs</label>
                <textarea
                  rows="2"
                  value={rfqForm.customNotes}
                  onChange={(e) => setRfqForm({ ...rfqForm, customNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-between text-xs">
                <span className="text-stone-300">Total Contract Value:</span>
                <span className="text-base font-black text-cyan-400 font-mono">
                  ₹{(rfqForm.quantity * rfqForm.targetPrice).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl transition-all"
              >
                Submit RFQ & Generate Purchase Order ➔
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PO Generated Success Modal */}
      {showPoSuccessModal && generatedPoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-3xl p-6 text-stone-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold">Purchase Order Generated Successfully</h3>
              </div>
              <button
                onClick={() => setShowPoSuccessModal(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 font-mono text-xs space-y-2 text-stone-300 leading-relaxed">
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">PO Number:</span>
                <span className="text-blue-400 font-bold">{generatedPoData.poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Buyer:</span>
                <span className="text-white font-bold">{generatedPoData.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Product:</span>
                <span className="text-white truncate max-w-[200px]">{generatedPoData.productTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Cluster:</span>
                <span className="text-white">{generatedPoData.cluster}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Quantity:</span>
                <span className="text-white">{generatedPoData.quantity} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Unit Rate:</span>
                <span className="text-white">₹{generatedPoData.unitPrice}</span>
              </div>
              <div className="flex justify-between border-t border-stone-800 pt-2 text-sm font-black text-cyan-400">
                <span>Total Amount:</span>
                <span>₹{generatedPoData.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyPo}
                className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-stone-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied PO' : 'Copy PO Summary'}</span>
              </button>

              <button
                onClick={() => {
                  setShowPoSuccessModal(false);
                  setActiveTab('gem');
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1 transition-colors shadow-lg"
              >
                <span>Track on GeM Board ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
