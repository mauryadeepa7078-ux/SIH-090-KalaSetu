import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-900 rounded-3xl p-6 text-white border border-amber-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Buyer Portal • Live Order Tracking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-hindi">
            {lang === 'hi' ? 'मेरे ऑर्डर व लाइव ट्रैकिंग' : 'My Orders & Real-Time Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            {lang === 'hi'
              ? 'कारीगर से आपके दरवाजे तक — इंडिया पोस्ट डाक घर निर्यात केंद्र (DNK) द्वारा सत्यापित'
              : 'Direct artisan-to-doorstep tracking with IndiaPost Dak Ghar Niryat Kendra (DNK) verification'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('buyer-market')}
          className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{lang === 'hi' ? 'शिल्प बाज़ार देखें' : 'Explore More Crafts'}</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-sm">
          <Package className="w-16 h-16 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">
            {lang === 'hi' ? 'अभी तक कोई ऑर्डर नहीं है' : 'No orders placed yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {lang === 'hi' 
              ? 'कारीगरों द्वारा बनाए गए प्रामाणिक GI हस्तशिल्प खोजें और पहला ऑर्डर दें।' 
              : 'Discover authentic GI-certified crafts made directly by verified master artisans.'}
          </p>
          <button
            onClick={() => setActiveTab('buyer-market')}
            className="px-6 py-3 rounded-2xl bg-amber-600 text-white font-extrabold text-xs shadow-md"
          >
            {lang === 'hi' ? 'हस्तशिल्प बाज़ार ब्राउज़ करें' : 'Browse Marketplace'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Orders List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500">
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
                    className={`p-4 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={ord.product_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                        alt={ord.product_title}
                        className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-bold text-stone-500">
                            {ord.id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                            ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 mt-0.5 font-hindi">
                          {ord.product_title}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
                          <span className="font-black text-stone-900">
                            ₹{ord.total?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px]">
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
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              
              {/* Order Header Summary */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Order Reference ID
                  </span>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-stone-900 font-mono">
                      {selectedOrder.id}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      ✓ MoSJE Authenticated
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Estimated Delivery
                  </span>
                  <span className="text-sm font-black text-amber-700 flex items-center justify-end space-x-1">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {selectedOrder.est_delivery}
                  </span>
                </div>
              </div>

              {/* Courier & Tracking Details Pill */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Courier Partner & Tracking Number
                  </span>
                  <p className="font-bold text-stone-800">
                    {selectedOrder.delivery_partner || 'IndiaPost Dak Ghar Niryat Kendra'}
                  </p>
                  <span className="font-mono text-xs font-bold text-orange-700">
                    AWB: {selectedOrder.tracking_id}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenCertificate(selectedOrder)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                    title="Inspect digital authenticity certificate"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-600" />
                    <span>View QR Certificate</span>
                  </button>

                  <button
                    onClick={() => handleWhatsAppContact(selectedOrder)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                    title="Direct inquiry with artisan"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact Artisan</span>
                  </button>
                </div>
              </div>

              {/* PROGRESS TIMELINE (6 Stages) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                  {lang === 'hi' ? 'ऑर्डर की प्रगति (Live Tracking Timeline)' : 'Order Milestone Timeline'}
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx <= selectedOrder.stage_index;
                    const isCurrent = idx === selectedOrder.stage_index;

                    return (
                      <div key={idx} className="relative flex items-start space-x-3">
                        {/* Step Marker Dot */}
                        <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          isCompleted
                            ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                            : 'bg-white border-stone-300 text-stone-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        {/* Stage Content */}
                        <div className={`flex-1 transition-all ${isCurrent ? 'p-3 rounded-2xl bg-amber-50/70 border border-amber-200' : ''}`}>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs sm:text-sm font-extrabold ${isCurrent ? 'text-amber-900' : isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                              {lang === 'hi' ? stage.labelHi : stage.labelEn}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                                Current Status
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

              {/* Delivery Address Details */}
              <div className="pt-4 border-t border-stone-100 flex items-start space-x-3 text-xs text-stone-600">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">Shipping Destination:</span>
                  <p className="text-stone-500 mt-0.5">
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
