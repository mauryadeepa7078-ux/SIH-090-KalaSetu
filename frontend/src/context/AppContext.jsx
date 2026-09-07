import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../services/translations';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import confetti from 'canvas-confetti';

const AppContext = createContext();

// Safe localStorage helper
const getSafeStorage = (key, fallback) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    }
  } catch (e) {
    console.warn('LocalStorage read error:', key, e);
  }
  return fallback;
};

const setSafeStorage = (key, val) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, val);
    }
  } catch (e) {
    console.warn('LocalStorage write error:', key, e);
  }
};

export const AppProvider = ({ children }) => {
  // Stored preferences with safe fallbacks
  const storedLang = getSafeStorage('kalasetu_lang', 'hi');
  const storedRole = getSafeStorage('kalasetu_role', 'artisan');
  const storedOnboarded = getSafeStorage('kalasetu_onboarding_completed', 'false') === 'true';
  const storedUser = (() => {
    try {
      const u = getSafeStorage('kalasetu_user', null);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const [lang, setLangState] = useState(storedLang); // Default Hindi
  const [userRole, setUserRole] = useState(storedRole); // 'artisan' | 'buyer' | 'businessman'
  const [currentUser, setCurrentUser] = useState(storedUser || {
    name: storedRole === 'artisan' ? 'Ram Das Bunkar' : (storedRole === 'businessman' ? 'Rajesh Singhal' : 'Priya Sharma'),
    phone: storedRole === 'artisan' ? '+91 98765 43210' : (storedRole === 'businessman' ? '+91 98200 11223' : '+91 98112 34567'),
    role: storedRole,
    location: storedRole === 'artisan' ? 'Kotwa, Varanasi, Uttar Pradesh' : (storedRole === 'businessman' ? 'New Delhi & Global Exporter' : 'Connaught Place, New Delhi - 110001'),
    craft_type: 'Handloom Silk Weaving',
    scheme_id: 'MoSJE-VISH-2026-UP-091',
    company: storedRole === 'businessman' ? 'Singhal Crafts Export & Retailers Pvt Ltd' : undefined,
    gstin: storedRole === 'businessman' ? '07AAAAA0000A1Z5' : undefined,
    gem_org_id: storedRole === 'businessman' ? 'GEM-DL-2026-9912' : undefined
  });
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(storedOnboarded);
  const [showOnboardingModal, setShowOnboardingModal] = useState(!storedOnboarded);

  // Initial Seed Buyer Orders
  const initialOrders = [
    {
      id: 'ORD-2026-9041',
      product_id: 'prod-101',
      product_title: 'Handwoven Royal Banarasi Katan Silk Saree',
      product_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      artisan_name: 'Master Ram Das Bunkar',
      artisan_village: 'Kotwa, Varanasi, UP',
      price: 6800.0,
      qty: 1,
      total: 6800.0,
      order_date: '2 Sep 2026',
      status: 'SHIPPED',
      stage_index: 3, // 0: Placed, 1: Confirmed, 2: Packed, 3: Shipped via IndiaPost, 4: Out for Delivery, 5: Delivered
      tracking_id: 'DNK-INPOST-882194',
      delivery_partner: 'IndiaPost Dak Ghar Niryat Kendra',
      est_delivery: '9 Sep 2026',
      delivery_address: '124 Connaught Place, Central Delhi, New Delhi - 110001',
      gi_tagged: true
    },
    {
      id: 'ORD-2026-8812',
      product_id: 'prod-102',
      product_title: 'Original Handmade Madhubani Folk Art Painting',
      product_image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      artisan_name: 'Sita Devi',
      artisan_village: 'Ranti, Madhubani, Bihar',
      price: 2400.0,
      qty: 1,
      total: 2400.0,
      order_date: '4 Sep 2026',
      status: 'CONFIRMED',
      stage_index: 1,
      tracking_id: 'DNK-INPOST-773120',
      delivery_partner: 'IndiaPost Dak Ghar Niryat Kendra',
      est_delivery: '12 Sep 2026',
      delivery_address: '124 Connaught Place, Central Delhi, New Delhi - 110001',
      gi_tagged: true
    }
  ];

  const storedOrders = (() => {
    try {
      const o = getSafeStorage('kalasetu_buyer_orders', null);
      return o ? JSON.parse(o) : initialOrders;
    } catch (e) {
      return initialOrders;
    }
  })();

  const [orders, setOrders] = useState(storedOrders);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Active tab routing based on role (3 Roles)
  const [activeTab, setActiveTab] = useState(
    storedRole === 'artisan' ? 'artisan-home' : (storedRole === 'businessman' ? 'businessman-home' : 'buyer-market')
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileFrame, setIsMobileFrame] = useState(false); // Mobile frame preview toggle
  const [showResetModal, setShowResetModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Proactive AI companion guidance state
  const [companionStep, setCompanionStep] = useState('welcome');
  const [proactiveMessage, setProactiveMessage] = useState(null);

  const setLang = (newLang) => {
    setLangState(newLang);
    setSafeStorage('kalasetu_lang', newLang);
  };

  const completeOnboarding = (role, selectedLang, userDetails) => {
    const finalLang = selectedLang || lang || 'hi';
    const finalRole = role || 'artisan';
    const finalUser = userDetails || (
      finalRole === 'artisan'
        ? {
            name: 'Master Artisan Ram Das',
            phone: '+91 98765 43210',
            role: 'artisan',
            location: 'Varanasi, Uttar Pradesh',
            craft_type: 'Handloom & Silk Weaving',
            scheme_id: 'MoSJE-VISH-2026-UP-091'
          }
        : finalRole === 'businessman'
        ? {
            name: 'Rajesh Singhal',
            company: 'Singhal Crafts Export & Retailers Pvt Ltd',
            phone: '+91 98200 11223',
            email: 'procurement@singhalcrafts.com',
            gstin: '07AAAAA0000A1Z5',
            gem_org_id: 'GEM-DL-2026-9912',
            role: 'businessman',
            location: 'New Delhi & Global Exporter',
            procurement_type: 'B2B Wholesale & Government GeM Tenders'
          }
        : {
            name: 'Priya Sharma (Retail Buyer)',
            phone: '+91 98112 34567',
            email: 'priya.sharma@heritagecraft.in',
            role: 'buyer',
            location: '124 Connaught Place, Central Delhi, New Delhi - 110001',
            buyer_type: 'Individual Heritage Collector'
          }
    );

    setLangState(finalLang);
    setUserRole(finalRole);
    setCurrentUser(finalUser);
    setHasCompletedOnboarding(true);
    setShowOnboardingModal(false);
    
    setSafeStorage('kalasetu_lang', finalLang);
    setSafeStorage('kalasetu_role', finalRole);
    setSafeStorage('kalasetu_onboarding_completed', 'true');
    setSafeStorage('kalasetu_user', JSON.stringify(finalUser));

    if (finalRole === 'artisan') {
      setActiveTab('artisan-home');
    } else if (finalRole === 'businessman') {
      setActiveTab('businessman-home');
    } else {
      setActiveTab('buyer-market');
    }
  };

  const switchRole = (newRole) => {
    const roleToSet = newRole || 'artisan';
    setUserRole(roleToSet);
    setSafeStorage('kalasetu_role', roleToSet);
    if (roleToSet === 'artisan') {
      setActiveTab('artisan-home');
      showToast('Switched to Artisan / Seller Portal (कारीगर मोड)', 'info');
    } else if (roleToSet === 'businessman') {
      setActiveTab('businessman-home');
      showToast('Switched to Institutional & GeM Procurement Portal (संस्थागत खरीद)', 'info');
    } else {
      setActiveTab('buyer-market');
      showToast('Switched to Consumer Buyer Marketplace (खरीदार बाज़ार)', 'info');
    }
  };

  // Logout method for Profile dropdown
  const logout = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('kalasetu_onboarding_completed');
      localStorage.removeItem('kalasetu_user');
    }
    setHasCompletedOnboarding(false);
    setShowOnboardingModal(true);
    showToast('Logged out successfully. Please log in or select your role.', 'info');
  };

  // Load orders from backend
  const loadOrders = async () => {
    try {
      console.log('[AppContext] Fetching orders from backend...');
      const backendOrders = await api.getOrders();
      if (Array.isArray(backendOrders) && backendOrders.length > 0) {
        setOrders(backendOrders);
        setSafeStorage('kalasetu_buyer_orders', JSON.stringify(backendOrders));
      }
    } catch (e) {
      console.warn('[AppContext] Failed to load backend orders, using cached:', e);
    }
  };

  // Buyer Place Order Helper (Persisting to backend + local)
  const placeOrder = async (product, qty = 1, address = '', notes = '', customBuyer = null) => {
    const buyerName = customBuyer?.name || currentUser?.name || 'Priya Sharma (Retail Buyer)';
    const buyerPhone = customBuyer?.phone || currentUser?.phone || '+91 98112 34567';
    const deliveryAddr = address || customBuyer?.address || currentUser?.location || '124 Connaught Place, Central Delhi, New Delhi - 110001';

    const newOrder = {
      id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      product_id: product.id,
      product_title: lang === 'hi' && product.title_hi ? product.title_hi : product.title_en,
      product_image: product.enhanced_image_url || product.original_image_url || product.image,
      artisan_name: product.artisan_name || 'Master Artisan Ram Das',
      artisan_village: `${product.artisan_village || 'Varanasi'}, ${product.artisan_state || 'UP'}`,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      price: product.price || 2400.0,
      qty: qty || 1,
      total: (product.price || 2400.0) * (qty || 1),
      order_date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'PLACED',
      stage_index: 0,
      tracking_id: `DNK-INPOST-${Math.floor(100000 + Math.random() * 900000)}`,
      delivery_partner: 'IndiaPost Dak Ghar Niryat Kendra',
      est_delivery: '5-7 Days',
      delivery_address: deliveryAddr,
      notes: notes || 'Standard safe packaging requested.',
      gi_tagged: product.gi_tagged || false
    };

    // Update local state immediately for instant feedback
    const updated = [newOrder, ...orders];
    setOrders(updated);
    setSafeStorage('kalasetu_buyer_orders', JSON.stringify(updated));

    // Persist to backend database
    try {
      console.log('[AppContext] Persisting order to backend database:', newOrder);
      await api.createOrder(newOrder);
      console.log('[AppContext] Order successfully persisted to backend database.');
    } catch (e) {
      console.warn('[AppContext] Backend order save failed, saved to local cache:', e);
    }

    confetti({ particleCount: 90, spread: 65, origin: { y: 0.7 } });
    showToast(`Order Placed! Tracking ID: ${newOrder.tracking_id}`, 'success');
    setActiveTab('orders');
    return newOrder;
  };

  const addToCart = (product, qty = 1) => {
    const exists = cart.find(c => c.id === product.id);
    if (exists) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c));
    } else {
      setCart([...cart, { ...product, qty: qty }]);
    }
    showToast(`Added "${product.title_en}" to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.id !== productId));
  };

  const toggleWishlist = (product) => {
    if (wishlist.some(w => w.id === product.id)) {
      setWishlist(wishlist.filter(w => w.id !== product.id));
      showToast('Removed from wishlist', 'info');
    } else {
      setWishlist([...wishlist, product]);
      showToast('Saved to wishlist!', 'success');
    }
  };

  const openOnboarding = () => {
    setHasCompletedOnboarding(false);
    setShowOnboardingModal(true);
  };




  // Shared active product draft passing between Photo Studio -> Voice Catalog -> Pricing
  const [activeDraft, setActiveDraft] = useState({
    title_en: '',
    title_hi: '',
    description_en: '',
    description_hi: '',
    cultural_story_en: '',
    cultural_story_hi: '',
    bullet_points_en: [],
    bullet_points_hi: [],
    category: 'Handloom Saree',
    material_type: 'Pure Mulberry Silk',
    dimensions: 'Standard',
    care_instructions: 'Handle with care. Dry clean recommended.',
    tags: ['Handmade', 'MoSJE', 'ArtisanHeritage'],
    price: 3500.0,
    min_price: 2800.0,
    max_price: 4200.0,
    material_cost: 650.0,
    hours_spent: 16.0,
    price_explanation: '',
    original_image_url: '',
    enhanced_image_url: '',
    artisan_name: 'Master Artisan Ram Das',
    artisan_village: 'Kotwa, Varanasi',
    artisan_state: 'Uttar Pradesh',
    mosje_scheme_id: 'MoSJE-VISH-2026-908',
    gi_tagged: true,
    gi_certification_no: 'GI-AU/2026/044',
    craft_lineage_years: 25,
    gem_published: false,
    ondc_published: true,
    sync_status: 'SYNCED'
  });

  // Translation lookup helper
  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  // Toast notification
  const showToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored! Ready to sync.', 'success');
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode: Changes will be queued locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load
    refreshPendingQueue();
    loadProducts();
    loadOrders();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingQueue = () => {
    const q = offlineStorage.getPendingQueue();
    setPendingQueue(q);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log('[AppContext] loadProducts called. isOnline:', isOnline);
      let productList = [];
      if (isOnline) {
        try {
          const data = await api.getProducts();
          productList = Array.isArray(data) ? data : (data?.products || []);
        } catch (apiErr) {
          console.warn('[AppContext] API fetch error, falling back to local storage cache:', apiErr);
          productList = offlineStorage.getCachedProducts();
        }
      } else {
        productList = offlineStorage.getCachedProducts();
      }

      // Merge with pending local queue so newly added items are always visible
      const pending = offlineStorage.getPendingQueue();
      const combinedMap = new Map();
      pending.forEach(p => combinedMap.set(p.id, p));
      productList.forEach(p => {
        if (!combinedMap.has(p.id)) combinedMap.set(p.id, p);
      });
      const finalProducts = Array.from(combinedMap.values());
      console.log(`[AppContext] Loaded ${finalProducts.length} total products (including ${pending.length} pending offline items).`);
      setProducts(finalProducts);
      offlineStorage.setCachedProducts(finalProducts);
    } catch (e) {
      console.error('[AppContext] Error in loadProducts:', e);
      const cached = offlineStorage.getCachedProducts();
      setProducts(Array.isArray(cached) ? cached : []);
    } finally {
      setLoading(false);
      refreshPendingQueue();
    }
  };

  const updateOrderStatus = async (orderId, newStatus, stageIndex = null) => {
    const nextStage = stageIndex !== null ? stageIndex : (
      newStatus === 'CONFIRMED' ? 1 :
      newStatus === 'PACKED' ? 2 :
      newStatus === 'SHIPPED' ? 3 :
      newStatus === 'OUT_FOR_DELIVERY' ? 4 :
      newStatus === 'DELIVERED' ? 5 : 0
    );

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus, stage_index: nextStage };
      }
      return o;
    });

    setOrders(updated);
    setSafeStorage('kalasetu_buyer_orders', JSON.stringify(updated));
    showToast(`Order ${orderId} updated to ${newStatus}`, 'success');

    try {
      await api.updateOrderStatus(orderId, newStatus, nextStage);
    } catch (e) {
      console.warn('[AppContext] Backend order status update error:', e);
    }
  };


  // Batch sync offline queue
  const triggerSync = async () => {
    const queue = offlineStorage.getPendingQueue();
    if (queue.length === 0) {
      showToast('All products are already synchronized!', 'info');
      return;
    }

    try {
      showToast(`Syncing ${queue.length} offline product(s)...`, 'info');
      const res = await api.syncBatch(queue);
      offlineStorage.clearQueue();
      refreshPendingQueue();
      await loadProducts();
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.8 } });
      showToast(`Successfully synchronized ${res.synced_count} items with cloud server!`, 'success');
    } catch (e) {
      showToast('Sync failed: Could not reach backend server.', 'error');
    }
  };

  // Reset demo data
  const handleResetDemo = async () => {
    try {
      setLoading(true);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('kalasetu_onboarding_completed');
        localStorage.removeItem('kalasetu_role');
        localStorage.removeItem('kalasetu_user');
        localStorage.removeItem('kalasetu_buyer_orders');
        localStorage.removeItem('kalasetu_lang');
      }
      setHasCompletedOnboarding(false);
      setShowOnboardingModal(true);
      setUserRole('artisan');
      setLangState('hi');
      setOrders(initialOrders);
      setCart([]);
      setWishlist([]);

      await api.resetDemo();
      offlineStorage.clearQueue();
      await loadProducts();
      setShowResetModal(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast('Demo reset complete! Starting fresh onboarding session.', 'success');
    } catch (e) {
      showToast('Demo reset: ' + e.message, 'info');
      setHasCompletedOnboarding(false);
      setShowOnboardingModal(true);
      setShowResetModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Manual offline toggle for testing offline mode without disconnecting WiFi
  const toggleOfflineSimulation = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (!nextState) {
      showToast('Simulated Offline Mode: All saves will be queued locally.', 'warning');
    } else {
      showToast('Simulated Online Mode: Connected to server.', 'success');
      triggerSync();
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        activeTab,
        setActiveTab,
        products,
        setProducts,
        loading,
        isOnline,
        toggleOfflineSimulation,
        pendingQueue,
        triggerSync,
        selectedProduct,
        setSelectedProduct,
        activeDraft,
        setActiveDraft,
        isMobileFrame,
        setIsMobileFrame,
        showResetModal,
        setShowResetModal,
        handleResetDemo,
        loadProducts,
        notification,
        showToast,
        userRole,
        setUserRole,
        currentUser,
        setCurrentUser,
        orders,
        setOrders,
        placeOrder,
        updateOrderStatus,
        cart,
        setCart,
        addToCart,
        removeFromCart,
        wishlist,
        setWishlist,
        toggleWishlist,
        hasCompletedOnboarding,
        showOnboardingModal,
        setShowOnboardingModal,
        completeOnboarding,
        switchRole,
        openOnboarding,
        logout,
        loadOrders,
        companionStep,
        setCompanionStep,
        proactiveMessage,
        setProactiveMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



export const useApp = () => useContext(AppContext);
