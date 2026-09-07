import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Truck, 
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';

export const BuyerCartPage = () => {
  const { 
    cart, 
    removeFromCart, 
    addToCart, 
    placeOrder, 
    setActiveTab, 
    lang, 
    t, 
    currentUser, 
    showToast 
  } = useApp();

  const [buyerName, setBuyerName] = useState(
    currentUser?.name || 'Priya Sharma (Retail Buyer)'
  );
  const [buyerPhone, setBuyerPhone] = useState(
    currentUser?.phone || '+91 98112 34567'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser?.location || '124 Connaught Place, Central Delhi, New Delhi - 110001'
  );
  const [customNotes, setCustomNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 150) : 0;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    setIsCheckingOut(true);
    // Place order for each item
    for (const item of cart) {
      await placeOrder(item, item.qty || 1, deliveryAddress, customNotes, {
        name: buyerName,
        phone: buyerPhone,
        address: deliveryAddress
      });
    }

    cart.forEach(item => removeFromCart(item.id));
    setIsCheckingOut(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in pb-28">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-800 text-xs font-bold mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buyer Cart & Checkout</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 font-hindi">
            {lang === 'hi' ? 'आपकी खरीदारी की टोकरी (Cart)' : 'Your Craft Shopping Cart'}
          </h2>
        </div>

        <button
          onClick={() => setActiveTab('buyer-market')}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
        >
          {lang === 'hi' ? '← और उत्पाद जोड़ें' : '← Continue Shopping'}
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-sm">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800">
            {lang === 'hi' ? 'आपकी टोकरी खाली है' : 'Your cart is currently empty'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {lang === 'hi'
              ? 'कारीगरों के हस्तशिल्प बाज़ार से अपने पसंदीदा उत्पाद जोड़ें।'
              : 'Explore genuine GI-certified handcrafted items directly from Indian artisan clusters.'}
          </p>
          <button
            onClick={() => setActiveTab('buyer-market')}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs shadow-md transition-all"
          >
            {lang === 'hi' ? 'हस्तशिल्प बाज़ार देखें' : 'Explore Marketplace'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-3">
            {cart.map((item) => {
              const displayTitle = lang === 'hi' && item.title_hi ? item.title_hi : item.title_en;
              const imgSrc = getProductImage(item);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex items-start space-x-4"
                >
                  <img
                    src={imgSrc}
                    alt={item.title_en}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getCategoryFallbackImage(item.category);
                    }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-stone-900 line-clamp-2 font-hindi leading-snug">
                        {displayTitle}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-500">
                      Artisan: <span className="font-semibold text-stone-700">{item.artisan_name}</span> ({item.artisan_village})
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-black text-stone-900">
                        ₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center space-x-2 bg-stone-100 rounded-xl px-2 py-1">
                        <span className="text-xs font-bold text-stone-700">
                          Qty: {item.qty || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-5">
            <h3 className="font-extrabold text-base text-stone-900 pb-3 border-b border-stone-100">
              Order Summary
            </h3>

            {/* Buyer Contact & Delivery Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                    placeholder="Buyer Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
                    Phone Number:
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                    placeholder="+91 98112 34567"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
                  Shipping Address (डाक पता):
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  placeholder="Complete postal address for IndiaPost Speed Post"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block uppercase tracking-wider">
                  Custom Notes for Artisan (वैकल्पिक संदेश):
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  placeholder="e.g. Gift packaging / Specific color choice"
                />
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Items Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>IndiaPost Speed Post Shipping</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? 'FREE (Special MoSJE Subsidy)' : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-stone-900 pt-3 border-t border-stone-200">
                <span>Total Amount:</span>
                <span className="text-lg text-amber-700">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>100% Direct to Artisan Payment with QR Provenance</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isCheckingOut ? 'Processing Order...' : 'Confirm Order & Track Live ➔'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
