import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { getProductImage, getCategoryFallbackImage } from '../utils/imageHelper';
import confetti from 'canvas-confetti';
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Calculator, 
  ShieldCheck, 
  HelpCircle, 
  Award, 
  Clock, 
  PackageCheck, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react';

export const PricingAssistantPage = () => {
  const { 
    t, 
    lang, 
    activeDraft, 
    setActiveDraft, 
    setActiveTab, 
    isOnline, 
    loadProducts, 
    showToast,
    setSelectedProduct 
  } = useApp();

  // Pricing inputs
  const [materialCost, setMaterialCost] = useState(activeDraft.material_cost || 650);
  const [hoursSpent, setHoursSpent] = useState(activeDraft.hours_spent || 16);
  const [skillLevel, setSkillLevel] = useState('Master Artisan');
  const [dimensions, setDimensions] = useState('Medium');
  const [isGiTagged, setIsGiTagged] = useState(activeDraft.gi_tagged !== undefined ? activeDraft.gi_tagged : true);

  // Result state
  const [pricingResult, setPricingResult] = useState({
    min_price: activeDraft.min_price || 2800,
    recommended_price: activeDraft.price || 3500,
    max_price: activeDraft.max_price || 4200,
    material_cost: 650,
    labor_cost: 2240,
    heritage_margin: 610,
    platform_avg: 3600,
    explanation_en: 'Raw Material (₹650) + 16hrs Master Artisan Labor (₹2240) + Fair Profit Margin (₹610) + 20% GI Heritage Premium. Category market average is ~₹3600.',
    explanation_hi: 'कच्चा माल (₹650) + 16 घंटे वरिष्ठ उस्ताद श्रम (₹2240) + उचित लाभ मार्जिन (₹610) + 20% जीआई विरासत प्रीमियम पर आधारित। श्रेणी का औसत ~₹3600 है।'
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-calculate on initial load or parameter change
  const calculatePricing = async () => {
    setIsCalculating(true);
    try {
      const payload = {
        category: activeDraft.category || 'Handloom Saree',
        material_type: activeDraft.material_type || 'Pure Silk',
        material_cost: parseFloat(materialCost) || 100,
        hours_spent: parseFloat(hoursSpent) || 4,
        skill_level: skillLevel,
        dimensions: dimensions,
        is_gi_tagged: isGiTagged
      };

      const res = await api.calculatePricing(payload);
      setPricingResult(res);

      // Update active draft price
      setActiveDraft(prev => ({
        ...prev,
        price: res.recommended_price,
        min_price: res.min_price,
        max_price: res.max_price,
        material_cost: res.material_cost,
        hours_spent: parseFloat(hoursSpent),
        price_explanation: res.explanation_en,
        gi_tagged: isGiTagged
      }));
    } catch (err) {
      console.warn('Pricing calculation fallback:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculatePricing();
  }, [materialCost, hoursSpent, skillLevel, dimensions, isGiTagged]);

  // Save product to Backend or Offline Queue
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    const chosenImage = getProductImage(activeDraft) || getCategoryFallbackImage(activeDraft.category || 'Handloom Saree');
    
    const finalProduct = {
      ...activeDraft,
      title_en: activeDraft.title_en || 'Handmade Heritage Craft',
      title_hi: activeDraft.title_hi || 'पारंपरिक हस्तशिल्प उत्पाद',
      description_en: activeDraft.description_en || 'Authentic handmade Indian craft created with traditional techniques.',
      description_hi: activeDraft.description_hi || 'पारंपरिक भारतीय हस्तशिल्प कला द्वारा निर्मित।',
      category: activeDraft.category || 'Handloom Saree',
      material_type: activeDraft.material_type || 'Natural Fiber',
      price: pricingResult.recommended_price || 3500.0,
      min_price: pricingResult.min_price || 2800.0,
      max_price: pricingResult.max_price || 4200.0,
      material_cost: parseFloat(materialCost) || 650.0,
      hours_spent: parseFloat(hoursSpent) || 16.0,
      price_explanation: pricingResult.explanation_en || '',
      enhanced_image_url: chosenImage,
      enhanced_image_data: activeDraft.enhanced_image_data,
      original_image_url: activeDraft.original_image_url || chosenImage,
      artisan_name: activeDraft.artisan_name || 'Master Artisan Ram Das',
      artisan_village: activeDraft.artisan_village || 'Kotwa, Varanasi',
      artisan_state: activeDraft.artisan_state || 'Uttar Pradesh',
      gi_tagged: isGiTagged,
      sync_status: isOnline ? 'SYNCED' : 'PENDING'
    };

    console.log('[FRONTEND-SAVE] [STEP 1: FORM SUBMITTED] Preparing product listing:', finalProduct);

    try {
      if (isOnline) {
        console.log('[FRONTEND-SAVE] [STEP 2: API CALLED] Sending product to backend database API...');
        const res = await api.saveProduct(finalProduct);
        console.log('[FRONTEND-SAVE] [STEP 3: SERVER RESPONSE] Backend returned saved product:', res);
        
        // Immediately persist to local storage cache as well for offline resilience
        offlineStorage.updateCachedProduct(res.product || finalProduct);
        await loadProducts();
        
        console.log('[FRONTEND-SAVE] [STEP 4: WRITE CONFIRMED] Product saved to database & synchronized with local cache!');
        setSelectedProduct(res.product || finalProduct);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        showToast('Product listing published successfully!', 'success');
        setActiveTab('detail');
      } else {
        console.log('[FRONTEND-SAVE] [OFFLINE QUEUED] Offline mode active, queuing in local storage...');
        offlineStorage.addToQueue(finalProduct);
        await loadProducts();
        setSelectedProduct(finalProduct);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        showToast('Saved to Offline Queue. Will sync when back online.', 'warning');
        setActiveTab('detail');
      }
    } catch (err) {
      console.error('[FRONTEND-SAVE-ERROR] Backend save error, using offline storage fallback:', err);
      // Fallback offline queue
      offlineStorage.addToQueue(finalProduct);
      await loadProducts();
      setSelectedProduct(finalProduct);
      showToast('Saved to local storage.', 'info');
      setActiveTab('detail');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-bold tracking-wide font-sans">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Core Feature 3 • Dynamic Pricing Assistant (Scikit-Learn ML)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
          {t('pricingTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed font-sans">
          {t('pricingSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Cost and Labor Inputs */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-5">
          <div className="flex items-center space-x-2 text-sm font-extrabold text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800 font-serif">
            <Calculator className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Production Factors & Labor Input</span>
          </div>

          {/* Raw Material Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
              <label className="font-sans">{t('materialCostLabel')}</label>
              <span className="text-orange-600 dark:text-orange-400 font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/40">
                ₹{materialCost}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={materialCost}
              onChange={(e) => setMaterialCost(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer h-2 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-medium">
              <span>₹50 (Clay/Jute)</span>
              <span>₹2,500 (Brass/Silk)</span>
              <span>₹5,000 (Pashmina/Silver)</span>
            </div>
          </div>

          {/* Artisan Labor Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
              <label className="font-sans">{t('hoursSpentLabel')}</label>
              <span className="text-orange-600 dark:text-orange-400 font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-900/40">
                {hoursSpent} Hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="80"
              step="1"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer h-2 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-medium">
              <span>1 hr (Simple mold)</span>
              <span>25 hrs (Fine carving)</span>
              <span>80 hrs (Master weaving)</span>
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">{t('artisanSkillLabel')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['Apprentice', 'Skilled', 'Master Artisan'].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSkillLevel(skill)}
                  className={`py-2.5 px-2 rounded-2xl text-[11px] sm:text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center leading-tight active:scale-95 ${
                    skillLevel === skill
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-transparent shadow-md'
                      : 'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {skill === 'Apprentice' ? t('apprentice') : skill === 'Skilled' ? t('skilled') : t('masterArtisan')}
                </button>
              ))}
            </div>
          </div>

          {/* Size / Dimensions Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">{t('dimensionsGrade')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['Small', 'Medium', 'Large'].map((dim) => (
                <button
                  key={dim}
                  type="button"
                  onClick={() => setDimensions(dim)}
                  className={`py-2.5 px-2 rounded-2xl text-[11px] sm:text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center active:scale-95 ${
                    dimensions === dim
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-md'
                      : 'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {dim}
                </button>
              ))}
            </div>
          </div>

          {/* GI Tag Checkbox */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/50">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-white block font-sans">
                  {t('giTaggedCheck')}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Adds +20% GI Heritage Premium recognized on MoSJE & GeM
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isGiTagged}
              onChange={(e) => setIsGiTagged(e.target.checked)}
              className="w-5 h-5 accent-orange-600 cursor-pointer rounded"
            />
          </div>
        </div>

        {/* Right Column: Scikit-Learn Pricing Prediction & Cost Breakdown */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Price Recommendation Card */}
          <div className="bg-gradient-to-br from-stone-900 via-orange-950 to-stone-900 text-white rounded-[28px] p-6 sm:p-7 border border-orange-800/40 shadow-xl space-y-5 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-stone-800 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Recommended Selling Price</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-900/60 border border-orange-700/50 text-orange-200 font-mono font-bold">
                Scikit-Learn ML
              </span>
            </div>

            <div className="text-center py-3 relative z-10">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-serif">
                ₹{pricingResult.recommended_price?.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-stone-300 mt-2 font-sans">
                Fair Market Range: <b className="text-orange-300">₹{pricingResult.min_price}</b> — <b className="text-orange-300">₹{pricingResult.max_price}</b>
              </p>
            </div>

            {/* Visual Stacked Cost Breakdown Bar */}
            <div className="space-y-2 pt-2 relative z-10">
              <div className="flex justify-between text-[11px] font-medium text-stone-300 font-sans">
                <span>Material: ₹{pricingResult.material_cost}</span>
                <span>Labor: ₹{pricingResult.labor_cost}</span>
                <span>Margin: ₹{pricingResult.heritage_margin}</span>
              </div>
              <div className="w-full h-3.5 bg-stone-800 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                <div 
                  className="bg-amber-500 h-full rounded-l-full transition-all duration-500" 
                  style={{ width: `${Math.min(60, (pricingResult.material_cost / (pricingResult.recommended_price || 1)) * 100)}%` }}
                  title="Material Cost"
                ></div>
                <div 
                  className="bg-orange-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(60, (pricingResult.labor_cost / (pricingResult.recommended_price || 1)) * 100)}%` }}
                  title="Artisan Labor Value"
                ></div>
                <div 
                  className="bg-emerald-500 h-full flex-1 rounded-r-full transition-all duration-500" 
                  title="Fair Margin"
                ></div>
              </div>
            </div>
          </div>

          {/* Explainable "Why This Price?" Card */}
          <div className="bg-white dark:bg-stone-900 rounded-[28px] p-6 border border-stone-200/80 dark:border-stone-800 shadow-card space-y-3.5">
            <div className="flex items-center space-x-2 text-stone-900 dark:text-white font-extrabold text-xs uppercase tracking-wider font-serif">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('whyThisPrice')}</span>
            </div>

            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 font-hindi">
              {lang === 'hi' ? pricingResult.explanation_hi : pricingResult.explanation_en}
            </p>

            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 font-sans">
              <span>Category Benchmark Average:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">~₹{pricingResult.platform_avg}</span>
            </div>
          </div>

          {/* Save & Publish Action Button */}
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-900/30 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[48px]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSaving ? 'Publishing Product...' : t('saveAndPublish')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
