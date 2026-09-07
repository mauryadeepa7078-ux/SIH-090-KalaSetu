import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Building2, 
  FileText, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Download, 
  MessageCircle, 
  RefreshCw, 
  ShieldCheck, 
  Boxes, 
  Award,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  DollarSign
} from 'lucide-react';

export const BusinessmanOrdersPage = () => {
  const { 
    lang, 
    t, 
    showToast, 
    currentUser, 
    setActiveTab 
  } = useApp();

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);

  const rfqStages = [
    { key: 'OPEN', stageIdx: 0, labelEn: 'RFQ Submitted', labelHi: 'कोटेशन अनुरोध दर्ज', descEn: 'Tender requirements posted to verified artisan guild', descHi: 'कारीगर गिल्ड को थोक टेंडर विवरण भेजा गया' },
    { key: 'SEEN', stageIdx: 1, labelEn: 'Seen by Artisan / Guild', labelHi: 'कारीगर द्वारा देखा गया', descEn: 'Cluster lead reviewed technical specs and quantity', descHi: 'क्लस्टर प्रमुख ने तकनीकी विनिर्देशों और संख्या का अवलोकन किया' },
    { key: 'QUOTED', stageIdx: 2, labelEn: 'Quotation Received', labelHi: 'दर सूची प्राप्त', descEn: 'Artisan submitted unit pricing and delivery SLA', descHi: 'कारीगर ने इकाई दर और डिलीवरी समय सीमा प्रस्तुत की' },
    { key: 'ACCEPTED', stageIdx: 3, labelEn: 'PO Accepted', labelHi: 'खरीद आदेश स्वीकृत', descEn: 'Formal GeM Purchase Order confirmed and escrow locked', descHi: 'GeM खरीद आदेश स्वीकृत और एस्क्रो लॉक' },
    { key: 'IN_PRODUCTION', stageIdx: 4, labelEn: 'In Production', labelHi: 'उत्पादन प्रगति पर', descEn: 'Artisans crafting bulk batch with MoSJE quality checks', descHi: 'MoSJE गुणवत्ता मानकों के अनुसार बैच उत्पादन जारी' },
    { key: 'DISPATCHED', stageIdx: 5, labelEn: 'Dispatched via DNK', labelHi: 'डाक घर से रवाना', descEn: 'Bulk freight handed to IndiaPost Dak Ghar Niryat Kendra', descHi: 'इंडिया पोस्ट डाक घर निर्यात केंद्र को खेप सौंपी गई' },
    { key: 'DELIVERED', stageIdx: 6, labelEn: 'Delivered', labelHi: 'वितरण संपन्न', descEn: 'Delivered to corporate depot with audit certificate', descHi: 'ऑडिट प्रमाणपत्र सहित कॉरपोरेट डिपो पर सफलतापूर्वक प्राप्त' }
  ];

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      console.log('[BusinessmanOrders] Loading RFQs from backend...');
      const data = await api.getRFQs();
      const list = Array.isArray(data) ? data : [];
      setRfqs(list);
      if (list.length > 0 && !selectedRfq) {
        setSelectedRfq(list[0]);
      }
    } catch (e) {
      console.warn('[BusinessmanOrders] Error fetching RFQs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuotation = async (rfqId) => {
    try {
      await api.updateRFQStatus(rfqId, 'ACCEPTED', 3);
      showToast('Quotation Accepted! Purchase Order (PO) issued.', 'success');
      await fetchRfqs();
      if (selectedRfq && selectedRfq.id === rfqId) {
        setSelectedRfq(prev => ({ ...prev, status: 'ACCEPTED', stage_index: 3 }));
      }
    } catch (e) {
      showToast('Failed to accept quotation', 'error');
    }
  };

  const getStageIndex = (rfq) => {
    if (typeof rfq.stage_index === 'number') return rfq.stage_index;
    const s = rfq.status;
    if (s === 'DELIVERED') return 6;
    if (s === 'DISPATCHED') return 5;
    if (s === 'IN_PRODUCTION') return 4;
    if (s === 'ACCEPTED') return 3;
    if (s === 'QUOTED') return 2;
    if (s === 'SEEN') return 1;
    return 0;
  };

  const totalProcurementValue = rfqs.reduce((acc, r) => acc + ((r.quantity || 0) * (r.target_price || 0)), 0);
  const activeCount = rfqs.filter(r => r.status !== 'DELIVERED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-blue-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white border border-blue-800/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B Institutional Procurement & GeM Tender Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-hindi">
              {lang === 'hi' ? 'थोक खरीद व RFQ ट्रैकर (6-स्टेज लाइव स्थिति)' : 'B2B RFQ & Purchase Order Live Tracker'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              {lang === 'hi'
                ? 'कारीगर क्लस्टरों को भेजे गए थोक कोटेशन अनुरोध, स्वीकार किए गए PO और इंडिया पोस्ट DNK लॉजिस्टिक्स की लाइव ट्रैकिंग।'
                : 'Track institutional tenders, artisan quotations, and 6-stage milestone progression directly with MoSJE cluster guilds.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <button
              onClick={fetchRfqs}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setActiveTab('businessman-home')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
            >
              + New RFQ
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-800/80">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Total RFQs</span>
            <span className="text-lg sm:text-xl font-black text-white">{rfqs.length}</span>
            <span className="text-[10px] text-blue-400 block font-semibold">{activeCount} In Pipeline</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Contract Value</span>
            <span className="text-lg sm:text-xl font-black text-cyan-400">₹{totalProcurementValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-400 block">Direct Cluster Sourcing</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">GeM Escrow Protection</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400">100% Secure</span>
            <span className="text-[10px] text-stone-400 block">MoSJE Verified Guilds</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block">Freight Carrier</span>
            <span className="text-lg sm:text-xl font-black text-white">IndiaPost DNK</span>
            <span className="text-[10px] text-cyan-300 block font-semibold">Bulk Export Ready</span>
          </div>
        </div>
      </div>

      {rfqs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-sm">
          <FileText className="w-16 h-16 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">
            {lang === 'hi' ? 'कोई सक्रिय थोक कोटेशन (RFQ) नहीं है' : 'No Bulk RFQs Submitted Yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {lang === 'hi'
              ? 'कारीगर क्लस्टरों से सीधे थोक माल खरीदने के लिए नया RFQ दर्ज करें।'
              : 'Submit a custom RFQ from the B2B Hub to initiate wholesale procurement directly from artisan guilds.'}
          </p>
          <button
            onClick={() => setActiveTab('businessman-home')}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-md"
          >
            {lang === 'hi' ? 'नया RFQ बनाएं' : 'Create First Bulk RFQ'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: RFQs List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                {lang === 'hi' ? 'आपके RFQ टेंडर' : 'Your Submitted RFQs'} ({rfqs.length})
              </span>
            </div>

            <div className="space-y-3">
              {rfqs.map((r) => {
                const isSelected = selectedRfq?.id === r.id;
                const dealVal = (r.quantity || 0) * (r.target_price || 0);

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRfq(r)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {r.id}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'QUOTED' ? 'bg-purple-100 text-purple-800' :
                          r.status === 'IN_PRODUCTION' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">
                          {r.category || 'Handicraft Bulk Order'}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                          {r.organization || r.buyer_name} • {r.quantity} Units
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
                        <span className="font-bold text-stone-500">
                          Target: ₹{r.target_price?.toLocaleString('en-IN')}/unit
                        </span>
                        <span className="font-black text-blue-900">
                          ₹{dealVal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 6-Stage Timeline & Order Details */}
          {selectedRfq && (
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              {/* Top Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    GeM RFQ Reference
                  </span>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-stone-900 font-mono">
                      {selectedRfq.id}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      🏢 {selectedRfq.organization || 'Institutional Tender'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Total Contract Value
                  </span>
                  <span className="text-lg font-black text-blue-900 font-mono">
                    ₹{((selectedRfq.quantity || 0) * (selectedRfq.target_price || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Requirement Summary Pill */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Category: {selectedRfq.category}</span>
                  <span>Quantity: {selectedRfq.quantity} Units</span>
                </div>
                <p className="text-stone-600 leading-relaxed font-medium">
                  <b>Specifications:</b> {selectedRfq.requirements || 'Export grade finish with individual MoSJE GI authenticity cards.'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 text-[11px] text-stone-500">
                  <span>Location: {selectedRfq.location || 'New Delhi Central Hub'}</span>
                  <span>Inquiry Date: {selectedRfq.inquiry_date || '4 Sep 2026'}</span>
                </div>
              </div>

              {/* 6-STAGE TIMELINE */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                  {lang === 'hi' ? '6-चरणीय स्थिति टाइमलाइन (Milestone Timeline)' : '6-Stage Procurement Status Timeline'}
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {rfqStages.map((stage, idx) => {
                    const currentStageIdx = getStageIndex(selectedRfq);
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.key} className="relative flex items-start space-x-3">
                        {/* Step Marker Dot */}
                        <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          isCompleted
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-stone-300 text-stone-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        {/* Stage Content */}
                        <div className={`flex-1 transition-all ${isCurrent ? 'p-3 rounded-2xl bg-blue-50 border border-blue-200' : ''}`}>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs sm:text-sm font-extrabold ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                              {lang === 'hi' ? stage.labelHi : stage.labelEn}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                                Live Status
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                            {lang === 'hi' ? stage.descHi : stage.descEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Businessman */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => showToast('Downloading HSN & GeM Compliance Contract...', 'success')}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download PO Pack</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Opening direct WhatsApp channel with artisan cooperative...', 'info');
                      setActiveTab('whatsapp');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Inquire Guild</span>
                  </button>
                </div>

                {selectedRfq.status === 'QUOTED' && (
                  <button
                    onClick={() => handleAcceptQuotation(selectedRfq.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Quotation & Issue PO (ऑर्डर स्वीकारें) ➔</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
