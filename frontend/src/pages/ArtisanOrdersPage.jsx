import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import { 
  Package, 
  Truck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  DollarSign, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Send, 
  Boxes, 
  Inbox, 
  Filter, 
  RefreshCw, 
  Sparkles,
  Phone
} from 'lucide-react';

export const ArtisanOrdersPage = () => {
  const { 
    orders, 
    loadOrders,
    updateOrderStatus, 
    lang, 
    t, 
    showToast, 
    currentUser 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('retail'); // 'retail' | 'bulk'
  const [rfqs, setRfqs] = useState([]);
  const [loadingRfqs, setLoadingRfqs] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    if (loadOrders) {
      try {
        await loadOrders();
      } catch (e) {
        console.warn('[ArtisanOrders] Failed to load orders:', e);
      }
    }
    await loadRfqs();
  };

  const loadRfqs = async () => {
    setLoadingRfqs(true);
    try {
      console.log('[ArtisanOrders] Loading RFQs from backend...');
      const data = await api.getRFQs();
      console.log(`[ArtisanOrders] Loaded ${data?.length || 0} RFQs successfully.`);
      setRfqs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[ArtisanOrders] Failed to load RFQs:', e);
    } finally {
      setLoadingRfqs(false);
    }
  };

  const handleUpdateRfqStatus = async (rfqId, newStatus) => {
    try {
      console.log(`[ArtisanOrders] Updating RFQ ${rfqId} status to ${newStatus}...`);
      await api.updateRFQStatus(rfqId, newStatus);
      showToast(`RFQ status updated to ${newStatus}!`, 'success');
      loadRfqs();
    } catch (e) {
      console.error('[ArtisanOrders] RFQ update failed:', e);
      showToast('Failed to update RFQ status', 'error');
    }
  };

  // Metrics
  const totalRetailRevenue = orders.reduce((sum, o) => sum + (o.total || (o.price * o.qty) || 0), 0);
  const totalBulkDealValue = rfqs.reduce((sum, r) => sum + ((r.quantity || 0) * (r.target_price || 0)), 0);
  const pendingRetailCount = orders.filter(o => o.status !== 'DELIVERED').length;
  const pendingBulkCount = rfqs.filter(r => r.status === 'OPEN').length;

  // Filtered lists
  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const filteredRfqs = rfqs.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-orange-950 to-stone-900 rounded-[28px] p-6 sm:p-8 text-white border border-orange-800/40 shadow-xl space-y-4 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold font-sans">
              <Package className="w-3.5 h-3.5" />
              <span>Artisan Order Fulfillment & B2B Inquiries</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              {lang === 'hi' ? 'मेरे ऑर्डर व व्यापारिक पूछताछ' : 'My Orders & Buyer Inquiries'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed font-sans">
              {lang === 'hi'
                ? 'व्यक्तिगत ग्राहकों के रिटेल ऑर्डर और व्यापारियों (GeM / B2B) की थोक खरीद पूछताछ को एक ही स्थान पर प्रबंधित करें।'
                : 'Manage consumer retail orders and institutional B2B bulk inquiries together with direct IndiaPost DNK dispatch tracking.'}
            </p>
          </div>

          <button
            onClick={loadAllData}
            disabled={loadingRfqs}
            className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 font-sans"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRfqs ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-800/80 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block font-sans">Retail Orders</span>
            <span className="text-lg sm:text-xl font-black text-white font-serif">{orders.length}</span>
            <span className="text-[10px] text-orange-400 block font-semibold font-sans">{pendingRetailCount} In Progress</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block font-sans">Bulk B2B RFQs</span>
            <span className="text-lg sm:text-xl font-black text-white font-serif">{rfqs.length}</span>
            <span className="text-[10px] text-blue-400 block font-semibold font-sans">{pendingBulkCount} Open Inquiries</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block font-sans">Retail Value</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 font-serif">₹{totalRetailRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-400 block font-sans">Direct Artisan Payout</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-stone-400 font-bold uppercase block font-sans">Bulk Pipeline</span>
            <span className="text-lg sm:text-xl font-black text-cyan-400 font-serif">₹{totalBulkDealValue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-stone-400 block font-sans">GeM & Corporate B2B</span>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher (Retail vs B2B Bulk) */}
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center space-x-2">
          {/* Retail Orders Tab */}
          <button
            onClick={() => { setActiveSubTab('retail'); setFilterStatus('ALL'); }}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all min-h-[44px] font-sans ${
              activeSubTab === 'retail'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30 ring-2 ring-orange-500/20'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Retail Buyer Orders (खुदरा ग्राहक ऑर्डर)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSubTab === 'retail' ? 'bg-white/20 text-white' : 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
            }`}>
              {orders.length}
            </span>
          </button>

          {/* Bulk Inquiries Tab */}
          <button
            onClick={() => { setActiveSubTab('bulk'); setFilterStatus('ALL'); }}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all min-h-[44px] font-sans ${
              activeSubTab === 'bulk'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Businessman & GeM Inquiries (थोक पूछताछ)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSubTab === 'bulk' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
            }`}>
              {rfqs.length}
            </span>
          </button>
        </div>
      </div>

      {/* RETAIL ORDERS LIST */}
      {activeSubTab === 'retail' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-stone-900 rounded-[28px] border border-stone-200/80 dark:border-stone-800 p-8 space-y-3 shadow-card">
              <Inbox className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-base font-extrabold text-stone-800 dark:text-stone-200 font-serif">No Retail Orders Received Yet</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto font-sans leading-relaxed">
                When retail buyers place orders for your handmade crafts from the Marketplace, they will appear here with full buyer details and delivery tracking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const isPlaced = order.status === 'PLACED';
                const isConfirmed = order.status === 'CONFIRMED';
                const isPacked = order.status === 'PACKED';
                const isShipped = order.status === 'SHIPPED';
                const isDelivered = order.status === 'DELIVERED';

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated space-y-4 hover:border-orange-500/50 transition-all"
                  >
                    {/* Top Row: Order ID, Date, Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-mono font-bold text-xs">
                          {order.id}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center space-x-1 font-sans">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{order.order_date || 'Recent'}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[10px] uppercase font-sans">
                          👤 Retail Consumer
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black font-sans ${
                          isDelivered ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                          isShipped ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800' :
                          isPacked ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800' :
                          isConfirmed ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                          'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 animate-pulse'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Product & Buyer Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Thumbnail & Title */}
                      <div className="md:col-span-6 flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-2xl bg-stone-50 dark:bg-stone-950 p-1 border border-stone-200 dark:border-stone-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <img
                            src={getProductImage(order) || order.product_image || getCategoryFallbackImage('Handloom Saree')}
                            alt={order.product_title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getCategoryFallbackImage(order.category || 'Handloom Saree');
                            }}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-stone-900 dark:text-white text-sm leading-snug font-serif">
                            {order.product_title}
                          </h4>
                          <div className="text-xs text-stone-600 dark:text-stone-400 font-medium font-sans">
                            <span>Qty: <b>{order.qty || 1} Unit(s)</b></span> • <span>Price: ₹{order.price?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-xs font-black text-orange-600 dark:text-orange-400 font-sans">
                            Total Payout: ₹{(order.total || (order.price * (order.qty || 1))).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Buyer Name & Shipping Destination */}
                      <div className="md:col-span-6 space-y-1.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-xs">
                        <div className="flex items-center space-x-1.5 text-stone-800 dark:text-stone-200 font-bold font-sans">
                          <User className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                          <span>Buyer: {order.buyer_name || (order.artisan_name ? 'Direct Customer' : 'Priya Sharma (Retail Buyer)')}</span>
                        </div>
                        {order.buyer_phone && (
                          <div className="flex items-center space-x-1.5 text-stone-700 dark:text-stone-300 font-medium font-sans">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Contact: <b>{order.buyer_phone}</b></span>
                          </div>
                        )}
                        <div className="flex items-start space-x-1.5 text-stone-600 dark:text-stone-400 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.delivery_address || '124 Connaught Place, Central Delhi, New Delhi - 110001'}</span>
                        </div>
                        {order.notes && (
                          <div className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 leading-snug font-sans">
                            <span className="font-bold">Customer Note:</span> {order.notes}
                          </div>
                        )}
                        <div className="flex items-center space-x-1.5 text-stone-500 dark:text-stone-400 font-mono text-[11px] pt-1.5 border-t border-stone-200 dark:border-stone-800">
                          <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>IndiaPost DNK Tracking: <b>{order.tracking_id || 'DNK-INPOST-882194'}</b></span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Artisan Fulfillment Workflow Actions */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
                      <div className="text-xs text-stone-500 dark:text-stone-400 font-medium font-sans">
                        Logistics: <span className="font-bold text-stone-700 dark:text-stone-300">IndiaPost Dak Ghar Niryat Kendra</span>
                      </div>

                      <div className="flex items-center space-x-2 font-sans">
                        {isPlaced && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED', 1)}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Order (ऑर्डर स्वीकार करें)</span>
                          </button>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PACKED', 2)}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span>Mark Packed (सामान पैक करें)</span>
                          </button>
                        )}

                        {isPacked && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'SHIPPED', 3)}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Ship via IndiaPost DNK (डाक घर से भेजें)</span>
                          </button>
                        )}

                        {isShipped && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED', 5)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Delivered (डिलीवर हुआ)</span>
                          </button>
                        )}

                        {isDelivered && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Order Completed & Payout Settled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* B2B BULK INQUIRIES LIST */}
      {activeSubTab === 'bulk' && (
        <div className="space-y-4">
          {rfqs.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-stone-900 rounded-[28px] border border-stone-200/80 dark:border-stone-800 p-8 space-y-3 shadow-card">
              <Building2 className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-base font-extrabold text-stone-800 dark:text-stone-200 font-serif">No B2B Bulk Inquiries Yet</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto font-sans leading-relaxed">
                Government departments, PSUs, and institutional exporters submitting RFQs on GeM & ONDC will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rfqs.map((rfq) => {
                const isAccepted = rfq.status === 'ACCEPTED';
                const isQuoted = rfq.status === 'QUOTED';
                const dealValue = (rfq.quantity || 0) * (rfq.target_price || 0);

                return (
                  <div
                    key={rfq.id}
                    className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated space-y-4 hover:border-blue-500/50 transition-all"
                  >
                    {/* Top Row: Organization, Buyer, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase font-sans">
                            🏢 {rfq.organization}
                          </span>
                          <span className="font-mono text-xs text-stone-400">ID: {rfq.id}</span>
                        </div>
                        <h4 className="font-extrabold text-stone-900 dark:text-white text-sm font-serif">
                          Buyer: {rfq.buyer_name}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 font-sans">
                        <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span>{rfq.location || 'New Delhi'}</span>
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          isAccepted ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                          isQuoted ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800' :
                          'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                        }`}>
                          {rfq.status}
                        </span>
                      </div>
                    </div>

                    {/* Requirements & Craft Category */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-sans">
                        Craft Category & Procurement Requirements:
                      </span>
                      <p className="text-xs text-stone-800 dark:text-stone-200 bg-blue-50/80 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 leading-relaxed font-sans font-medium">
                        <b>{rfq.category}:</b> {rfq.requirements}
                      </p>
                    </div>

                    {/* Bulk Numbers Strip */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 text-xs font-sans">
                      <div>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">Bulk Quantity</span>
                        <span className="font-extrabold text-stone-900 dark:text-white text-sm">{rfq.quantity} Units</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">Target Price / Unit</span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">₹{rfq.target_price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase block">Total Contract Value</span>
                        <span className="font-black text-blue-900 dark:text-blue-300 text-sm">₹{dealValue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Bottom Actions for Artisan */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800 font-sans">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                        Date: {rfq.inquiry_date || '4 Sep 2026'} • GeM Standard Contract
                      </span>

                      <div className="flex items-center space-x-2">
                        {!isAccepted && (
                          <>
                            <button
                              onClick={() => handleUpdateRfqStatus(rfq.id, 'QUOTED')}
                              className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-colors active:scale-95"
                            >
                              Submit Quotation (दर सूची भेजें)
                            </button>
                            <button
                              onClick={() => handleUpdateRfqStatus(rfq.id, 'ACCEPTED')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Bulk PO (थोक ऑर्डर स्वीकारें)</span>
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Purchase Order Accepted • Dispatched via IndiaPost DNK</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
