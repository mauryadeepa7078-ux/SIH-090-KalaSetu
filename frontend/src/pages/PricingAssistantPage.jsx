import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
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
    const finalProduct = {
      ...activeDraft,
      price: pricingResult.recommended_price,
      min_price: pricingResult.min_price,
      max_price: pricingResult.max_price,
      material_cost: parseFloat(materialCost),
      hours_spent: parseFloat(hoursSpent),
      price_explanation: pricingResult.explanation_en,
      gi_tagged: isGiTagged,
      sync_status: isOnline ? 'SYNCED' : 'PENDING'
    };

    try {
      if (isOnline) {
        const res = await api.saveProduct(finalProduct);
        await loadProducts();
        setSelectedProduct(res.product);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        showToast('Product listing published successfully!', 'success');
        setActiveTab('detail');
      } else {
        // Queue locally
        offlineStorage.addToQueue(finalProduct);
        await loadProducts();
        setSelectedProduct(finalProduct);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        showToast('Saved to Offline Queue. Will sync when back online.', 'warning');
        setActiveTab('detail');
      }
    } catch (err) {
      console.error('Save error', err);
      // Fallback offline queue
      offlineStorage.addToQueue(finalProduct);
      await loadProducts();
      setSelectedProduct(finalProduct);
      showToast('Saved to offline storage.', 'info');
      setActiveTab('detail');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
          <span>Core Feature 3: Dynamic Pricing Assistant (Scikit-Learn)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-hindi">
          {t('pricingTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
          {t('pricingSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cost and Labor Inputs */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
            <Calculator className="w-4 h-4 text-orange-600" />
            <span>Production Factors & Labor Input</span>
          </div>

          {/* Raw Material Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
              <label>{t('materialCostLabel')}</label>
              <span className="text-orange-600 font-extrabold text-sm">₹{materialCost}</span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={materialCost}
              onChange={(e) => setMaterialCost(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>₹50 (Clay/Jute)</span>
              <span>₹2,500 (Brass/Silk)</span>
              <span>₹5,000 (Pashmina/Silver)</span>
            </div>
          </div>

          {/* Artisan Labor Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
              <label>{t('hoursSpentLabel')}</label>
              <span className="text-orange-600 font-extrabold text-sm">{hoursSpent} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="80"
              step="1"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>1 hr (Simple mold)</span>
              <span>25 hrs (Fine carving)</span>
              <span>80 hrs (Master weaving)</span>
            </div>
          </div>

          {/* Skill Level Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">{t('artisanSkillLabel')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['Apprentice', 'Skilled', 'Master Artisan'].map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSkillLevel(skill)}
                  className={`py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center leading-tight active:scale-95 ${
                    skillLevel === skill
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {skill === 'Apprentice' ? t('apprentice') : skill === 'Skilled' ? t('skilled') : t('masterArtisan')}
                </button>
              ))}
            </div>
          </div>

          {/* Size / Dimensions Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">{t('dimensionsGrade')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['Small', 'Medium', 'Large'].map((dim) => (
                <button
                  key={dim}
                  type="button"
                  onClick={() => setDimensions(dim)}
                  className={`py-2.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold border transition-all min-h-[44px] flex items-center justify-center text-center active:scale-95 ${
                    dimensions === dim
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {dim}
                </button>
              ))}
            </div>
          </div>

          {/* GI Tag Checkbox */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200">
            <div className="flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {t('giTaggedCheck')}
                </span>
                <span className="text-[11px] text-stone-500">
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
          <div className="bg-gradient-to-br from-stone-900 via-orange-950 to-stone-900 text-white rounded-3xl p-6 border border-orange-800/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Recommended Selling Price</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Scikit-Learn ML
              </span>
            </div>

            <div className="text-center py-2">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ₹{pricingResult.recommended_price?.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-stone-300 mt-2">
                Fair Market Range: <b className="text-orange-300">₹{pricingResult.min_price}</b> — <b className="text-orange-300">₹{pricingResult.max_price}</b>
              </p>
            </div>

            {/* Visual Stacked Cost Breakdown Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-medium text-stone-300">
                <span>Material: ₹{pricingResult.material_cost}</span>
                <span>Labor: ₹{pricingResult.labor_cost}</span>
                <span>Margin: ₹{pricingResult.heritage_margin}</span>
              </div>
              <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${Math.min(60, (pricingResult.material_cost / (pricingResult.recommended_price || 1)) * 100)}%` }}
                  title="Material Cost"
                ></div>
                <div 
                  className="bg-orange-500 h-full" 
                  style={{ width: `${Math.min(60, (pricingResult.labor_cost / (pricingResult.recommended_price || 1)) * 100)}%` }}
                  title="Artisan Labor Value"
                ></div>
                <div 
                  className="bg-emerald-500 h-full flex-1" 
                  title="Fair Margin"
                ></div>
              </div>
            </div>
          </div>

          {/* Explainable "Why This Price?" Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('whyThisPrice')}</span>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200 font-hindi">
              {lang === 'hi' ? pricingResult.explanation_hi : pricingResult.explanation_en}
            </p>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>Category Benchmark Average:</span>
              <span className="font-bold text-stone-800">~₹{pricingResult.platform_avg}</span>
            </div>
          </div>

          {/* Save & Publish Action Button */}
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-orange-900/40 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSaving ? 'Publishing Product...' : t('saveAndPublish')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
