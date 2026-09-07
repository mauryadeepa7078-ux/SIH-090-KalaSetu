import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  QrCode, 
  MessageCircle, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Award,
  ShoppingBag,
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';

export const BuyerOrdersPage = () => {
  const { 
    orders, 
    lang, 
    t, 
    setActiveTab, 
    setSelectedProduct, 
    products, 
    showToast 
  } = useApp();

  const [selectedOrder, setSelectedOrder] = useState(orders.length > 0 ? orders[0] : null);

  const stages = [
    { labelEn: 'Order Placed', labelHi: 'ऑर्डर दर्ज हुआ', descEn: 'Payment verified & order sent to artisan unit', descHi: 'भुगतान सत्यापित, ऑर्डर कारीगर इकाई को भेजा गया' },
    { labelEn: 'Confirmed by Artisan', labelHi: 'कारीगर द्वारा स्वीकृत', descEn: 'Master artisan accepted production/dispatch', descHi: 'मास्टर कारीगर ने निर्माण व प्रेषण स्वीकार किया' },
    { labelEn: 'Quality & GI Verified', labelHi: 'गुणवत्ता व GI जांच', descEn: 'MoSJE provenance seal & QR tag affixed', descHi: 'MoSJE प्रामाणिकता सील व डिजिटल QR संलग्न' },
    { labelEn: 'Dispatched via India Post', labelHi: 'डाक घर से रवाना', descEn: 'Handed over to Dak Ghar Niryat Kendra (DNK)', descHi: 'डाक घर निर्यात केंद्र (DNK) द्वारा प्रेषित' },
    { labelEn: 'Out for Delivery', labelHi: 'डिलीवरी हेतु रवाना', descEn: 'Arrived at local hub and out for door delivery', descHi: 'स्थानीय डाक हब से आपके पते के लिए रवाना' },
    { labelEn: 'Delivered', labelHi: 'सफलतापूर्वक प्राप्त', descEn: 'Delivered to recipient with digital proof', descHi: 'डिजिटल पावती सहित सफलतापूर्वक डिलीवर' }
  ];

  const handleOpenCertificate = (order) => {
    const matched = products.find(p => p.id === order.product_id) || {
      id: order.product_id,
      title_en: order.product_title,
      title_hi: order.product_title,
      artisan_name: order.artisan_name,
      artisan_village: order.artisan_village,
      artisan_state: 'India',
      gi_tagged: true,
      category: 'Handicraft'
    };
    setSelectedProduct(matched);
    setActiveTab('certificate');
  };

  const handleWhatsAppContact = (order) => {
    showToast(`Opening WhatsApp chat with ${order.artisan_name}...`, 'info');
    setActiveTab('whatsapp');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-900 rounded-[28px] p-6 sm:p-8 text-white border border-amber-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold mb-2 font-sans">
            <Truck className="w-3.5 h-3.5" />
            <span>Buyer Portal • Live Order Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            {lang === 'hi' ? 'मेरे ऑर्डर व लाइव ट्रैकिंग' : 'My Orders & Real-Time Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl font-sans leading-relaxed">
            {lang === 'hi'
              ? 'कारीगर से आपके दरवाजे तक — इंडिया पोस्ट डाक घर निर्यात केंद्र (DNK) द्वारा सत्यापित'
              : 'Direct artisan-to-doorstep tracking with IndiaPost Dak Ghar Niryat Kendra (DNK) verification'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('buyer-market')}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center space-x-2 self-start sm:self-auto active:scale-95 relative z-10 font-sans"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{lang === 'hi' ? 'शिल्प बाज़ार देखें' : 'Explore More Crafts'}</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-[28px] border border-stone-200/80 dark:border-stone-800 p-8 space-y-4 shadow-card">
          <Package className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto" />
          <h3 className="text-lg font-extrabold text-stone-800 dark:text-stone-200 font-serif">
            {lang === 'hi' ? 'अभी तक कोई ऑर्डर नहीं है' : 'No orders placed yet'}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto font-sans leading-relaxed">
            {lang === 'hi' 
              ? 'कारीगरों द्वारा बनाए गए प्रामाणिक GI हस्तशिल्प खोजें और पहला ऑर्डर दें।' 
              : 'Discover authentic GI-certified crafts made directly by verified master artisans.'}
          </p>
          <button
            onClick={() => setActiveTab('buyer-market')}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow-md transition-all active:scale-95 font-sans"
          >
            {lang === 'hi' ? 'हस्तशिल्प बाज़ार ब्राउज़ करें' : 'Browse Marketplace'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Orders List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 font-sans">
                {lang === 'hi' ? 'आपके ऑर्डर की सूची' : 'Your Placed Orders'} ({orders.length})
              </span>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-4 sm:p-5 rounded-[24px] border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={getProductImage(ord) || ord.product_image || getCategoryFallbackImage('Handloom Saree')}
                        alt={ord.product_title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getCategoryFallbackImage(ord.category || 'Handloom Saree');
                        }}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 font-sans">
                          <span className="font-mono text-[10px] font-bold text-stone-500 dark:text-stone-400">
                            {ord.id}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                            ord.status === 'DELIVERED' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                            ord.status === 'SHIPPED' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800' :
                            ord.status === 'CONFIRMED' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800' :
                            'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white line-clamp-1 mt-0.5 font-serif">
                          {ord.product_title}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mt-1 font-sans">
                          <span className="font-black text-stone-900 dark:text-white">
                            ₹{ord.total?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] font-medium">
                            {ord.artisan_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Tracking Timeline & Stage Details */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-card space-y-6">
              
              {/* Order Header Summary */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider block font-sans">
                    Order Reference ID
                  </span>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-stone-900 dark:text-white font-mono">
                      {selectedOrder.id}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 font-sans">
                      ✓ MoSJE Authenticated
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider block font-sans">
                    Estimated Delivery
                  </span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-400 flex items-center justify-end space-x-1 font-sans">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {selectedOrder.est_delivery}
                  </span>
                </div>
              </div>

              {/* Courier & Tracking Details Pill */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">
                    Courier Partner & Tracking Number
                  </span>
                  <p className="font-bold text-stone-800 dark:text-stone-200">
                    {selectedOrder.delivery_partner || 'IndiaPost Dak Ghar Niryat Kendra'}
                  </p>
                  <span className="font-mono text-xs font-bold text-orange-700 dark:text-orange-400">
                    AWB: {selectedOrder.tracking_id}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenCertificate(selectedOrder)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                    title="Inspect digital authenticity certificate"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>View QR Certificate</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppContact(selectedOrder)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                    title="Direct inquiry with artisan"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact Artisan</span>
                  </button>
                </div>
              </div>

              {/* PROGRESS TIMELINE (6 Stages) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 font-sans">
                  {lang === 'hi' ? 'ऑर्डर की प्रगति (Live Tracking Timeline)' : 'Order Milestone Timeline'}
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx <= selectedOrder.stage_index;
                    const isCurrent = idx === selectedOrder.stage_index;

                    return (
                      <div key={idx} className="relative flex items-start space-x-3">
                        {/* Step Marker Dot */}
                        <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          isCompleted
                            ? 'bg-amber-600 border-amber-600 text-stone-950 shadow-md font-extrabold'
                            : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        {/* Stage Content */}
                        <div className={`flex-1 transition-all ${isCurrent ? 'p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50' : ''}`}>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs sm:text-sm font-extrabold ${isCurrent ? 'text-amber-900 dark:text-amber-300' : isCompleted ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-600'}`}>
                              {lang === 'hi' ? stage.labelHi : stage.labelEn}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-stone-950 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                Current Status
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed font-sans">
                            {lang === 'hi' ? stage.descHi : stage.descEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address Details */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-start space-x-3 text-xs text-stone-600 dark:text-stone-400 font-sans">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 dark:text-white block">Shipping Destination:</span>
                  <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {selectedOrder.delivery_address}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
