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
  Zap 
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      await placeOrder(
        product, 
        qty, 
        deliveryAddress, 
        customNotes, 
        { name: buyerName, phone: buyerPhone, address: deliveryAddress }
      );
      onClose();
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
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
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-black/20 text-stone-950">
                Direct Artisan Purchase
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-stone-950 font-hindi">
                {lang === 'hi' ? 'सुरक्षित चेकआउट व डिलीवरी फॉर्म' : 'Secure Artisan Checkout'}
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
              <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">
                {product.category || 'Handicraft'} • {product.artisan_name}
              </span>
              <h4 className="font-extrabold text-sm text-white truncate font-hindi">
                {displayTitle}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-black text-amber-400">
                  ₹{unitPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-400">/ unit</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Units */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-800/80 border border-stone-700">
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
          <div className="space-y-3">
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

          {/* Pricing & Free Shipping Box */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 space-y-2 text-xs">
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
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-sm shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Processing Order...' : (lang === 'hi' ? 'ऑर्डर की पुष्टि करें व ट्रैक करें ➔' : 'Confirm Order & Track Live ➔')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
