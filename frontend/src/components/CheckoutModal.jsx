import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import { 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  ShieldCheck, 
  Award, 
  X, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Zap,
  CreditCard,
  QrCode,
  Banknote,
  Smartphone,
  Lock,
  Loader2
} from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, product, initialQty = 1 }) => {
  const { 
    currentUser, 
    placeOrder, 
    lang, 
    t, 
    showToast 
  } = useApp();

  const [qty, setQty] = useState(initialQty || 1);
  const [buyerName, setBuyerName] = useState(currentUser?.name || 'Priya Sharma (Retail Buyer)');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '+91 98112 34567');
  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser?.location || '124 Connaught Place, Central Delhi, New Delhi - 110001'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'COD' | 'CARD'
  const [upiId, setUpiId] = useState('priya.craft@okhdfcbank');
  const [showQrCode, setShowQrCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  if (!isOpen || !product) return null;

  const unitPrice = product.price || 2400;
  const subtotal = unitPrice * qty;
  const shipping = 0; // Free IndiaPost DNK
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      showToast('Please enter your delivery address', 'warning');
      return;
    }
    if (!buyerPhone.trim()) {
      showToast('Please enter your contact phone number', 'warning');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate payment settlement / processing step
    if (paymentMethod === 'UPI') {
      setProcessingStatus(lang === 'hi' ? 'UPI तत्काल सत्यापन हो रहा है...' : 'Verifying UPI Instant Settlement...');
      await new Promise(r => setTimeout(r, 1200));
    } else if (paymentMethod === 'CARD') {
      setProcessingStatus(lang === 'hi' ? 'सुरक्षित एस्क्रो गेटवे सत्यापन...' : 'Verifying Secure Escrow Gateway...');
      await new Promise(r => setTimeout(r, 1200));
    } else {
      setProcessingStatus(lang === 'hi' ? 'कैश ऑन डिलीवरी ऑर्डर दर्ज हो रहा है...' : 'Registering Cash on Delivery Order...');
      await new Promise(r => setTimeout(r, 600));
    }

    const payLabel = paymentMethod === 'UPI' ? 'UPI' : (paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit / Debit Card');
    const payStatus = paymentMethod === 'COD' ? 'Pending — Pay on Delivery' : 'PAID (Verified)';
    const payTxn = paymentMethod === 'UPI'
      ? `UPI-TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`
      : paymentMethod === 'COD'
      ? `COD-INPOST-2026-${Math.floor(1000 + Math.random() * 9000)}`
      : `CARD-TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await placeOrder(
        product, 
        qty, 
        deliveryAddress, 
        customNotes, 
        { name: buyerName, phone: buyerPhone, address: deliveryAddress },
        {
          payment_method: payLabel,
          payment_status: payStatus,
          payment_txn_id: payTxn
        }
      );
      onClose();
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setProcessingStatus('');
    }
  };

  const displayTitle = lang === 'hi' && product.title_hi ? product.title_hi : product.title_en;
  const imgSrc = getProductImage(product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl text-stone-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 p-4 sm:p-5 text-stone-950 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-stone-950 text-amber-400 shadow-md">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-black/20 text-stone-950 font-sans">
                CraftX Direct Purchase
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-stone-950 font-serif">
                {lang === 'hi' ? 'सुरक्षित चेकआउट व भुगतान' : 'Secure Checkout & Payment'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 transition-colors"
          >
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Product Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-700/80 flex items-center space-x-3.5">
            <img
              src={imgSrc}
              alt={product.title_en}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getCategoryFallbackImage(product.category);
              }}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover bg-stone-800 border border-stone-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-amber-400 block truncate font-sans">
                {product.category || 'Handicraft'} • {product.artisan_name}
              </span>
              <h4 className="font-extrabold text-sm text-white truncate font-serif">
                {displayTitle}
              </h4>
              <div className="flex items-center space-x-2 mt-1 font-sans">
                <span className="text-sm font-black text-amber-400">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-400">/ unit</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Units */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/80 border border-stone-700 font-sans">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Quantity / संख्या:</span>
              <span className="text-[10px] text-stone-400">Directly handwoven by artisan</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded-xl bg-stone-700 hover:bg-stone-600 text-white flex items-center justify-center font-bold transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-base font-black text-white min-w-[24px] text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 rounded-xl bg-stone-700 hover:bg-stone-600 text-white flex items-center justify-center font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Buyer Details Grid */}
          <div className="space-y-3 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'hi' ? 'खरीदार का पूरा नाम' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'hi' ? 'मोबाइल नंबर (SMS ट्रैकिंग)' : 'Contact Phone'}</span>
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'hi' ? 'डिलीवरी का पूरा पता व पिनकोड' : 'Delivery Address & Pincode'}</span>
              </label>
              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                placeholder="House / Flat, Street, City, State - PINCODE"
                className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>

            {/* Optional Notes for Artisan */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'hi' ? 'कारीगर के लिए विशेष निर्देश (वैकल्पिक)' : 'Special Instructions for Artisan (Optional)'}</span>
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="उदा. उपहार पैकिंग, विशेष संदेश, आदि..."
                className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* UPDATE 3: PAYMENT METHOD SELECTION (UPI, COD, CARD) */}
          {/* ========================================================================= */}
          <div className="space-y-2.5 pt-2 border-t border-stone-800 font-sans">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'hi' ? 'भुगतान का तरीका चुनें (Payment Option)' : 'Select Payment Method'}</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-600/40 px-2 py-0.5 rounded-full">
                100% Escrow Protected
              </span>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black">UPI</span>
                <span className="text-[9px] text-stone-400 text-center">GPay/PhonePe</span>
              </button>

              {/* 2. Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'COD'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black">Cash on Delivery</span>
                <span className="text-[9px] text-stone-400 text-center">Pay at Door</span>
              </button>

              {/* 3. Card / NetBanking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-black">Cards / NetBank</span>
                <span className="text-[9px] text-stone-400 text-center">Debit/Credit</span>
              </button>
            </div>

            {/* Method Specific Details */}
            {paymentMethod === 'UPI' && (
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Enter UPI ID or Scan QR:</span>
                  <button
                    type="button"
                    onClick={() => setShowQrCode(!showQrCode)}
                    className="text-[11px] font-bold text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQrCode ? 'Hide QR' : 'Show Instant QR Code'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or name@okhdfcbank"
                    className="flex-1 p-2 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => showToast('UPI ID Verified successfully! ✅', 'success')}
                    className="px-3 py-1.5 bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50 rounded-xl text-xs font-bold"
                  >
                    Verify
                  </button>
                </div>

                {showQrCode && (
                  <div className="p-3 rounded-xl bg-white text-stone-900 text-center space-y-2 animate-fade-in flex flex-col items-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=craftx.artisan@upi&pn=CraftX%20Artisan&am=${total}&cu=INR`}
                      alt="UPI Payment QR Code"
                      className="w-32 h-32 rounded-lg border border-stone-200"
                    />
                    <div className="text-[10px] font-mono text-stone-600">
                      Scan via GPay / PhonePe / Paytm / BHIM • ₹{total}
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-600/30 text-xs text-stone-300 flex items-start space-x-2.5">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-300 block">Cash on Delivery Available</span>
                  <p className="text-[11px] text-stone-400">
                    Pay safely in cash or through UPI QR to the IndiaPost postal delivery agent upon receiving your order.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-3 rounded-2xl bg-stone-850 border border-stone-700 space-y-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-stone-400 block font-bold">Card Number:</label>
                  <input
                    type="text"
                    defaultValue="4532 •••• •••• 8821"
                    className="w-full p-2 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    defaultValue="08/29"
                    placeholder="MM/YY"
                    className="w-full p-2 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white font-mono text-center"
                  />
                  <input
                    type="password"
                    defaultValue="892"
                    placeholder="CVV"
                    className="w-full p-2 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white font-mono text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Free Shipping Box */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 space-y-2 text-xs font-sans">
            <div className="flex justify-between text-stone-300">
              <span>Items Total ({qty} unit{qty > 1 ? 's' : ''}):</span>
              <span className="font-mono font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>IndiaPost Dak Ghar Niryat Kendra Shipping:</span>
              <span className="font-bold text-emerald-400">FREE (MoSJE Rural Subsidy)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-amber-600/30 text-sm font-black text-white">
              <span>Total Payable Amount:</span>
              <span className="text-amber-400 font-mono text-base">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 font-sans">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{processingStatus || 'Processing Order...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {lang === 'hi' 
                      ? `₹${total.toLocaleString('en-IN')} का भुगतान करें व ऑर्डर दें ➔` 
                      : `Pay ₹${total.toLocaleString('en-IN')} via ${paymentMethod} & Track Live ➔`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
