import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  Award, 
  ShieldCheck, 
  QrCode, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Calendar,
  Building
} from 'lucide-react';

export const CertificatePage = () => {
  const { selectedProduct, setActiveTab, t, lang } = useApp();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  const product = selectedProduct || {
    id: 'prod-101',
    title_en: 'Handwoven Royal Banarasi Katan Silk Saree',
    title_hi: 'हस्तनिर्मित शाही बनारसी कातान सिल्क साड़ी',
    artisan_name: 'Master Weaver Ram Das',
    artisan_village: 'Kotwa, Varanasi',
    artisan_state: 'Uttar Pradesh',
    mosje_scheme_id: 'MoSJE-VISH-2026-UP-091',
    gi_tagged: true,
    gi_certification_no: 'GI-AU/2026/UP-044',
    craft_lineage_years: 28,
    category: 'Handloom Saree',
    material_type: 'Pure Silk & Golden Zari',
    created_at: '2026-08-20T10:30:00Z',
    enhanced_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  };

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await api.getCertificate(product.id);
        setCertData(res);
      } catch (e) {
        // Fallback local mock
        setCertData({
          certificate_id: `CERT-MoSJE-2026-${product.id.toUpperCase()}`,
          product_id: product.id,
          title_en: product.title_en,
          title_hi: product.title_hi,
          artisan_name: product.artisan_name,
          artisan_village: product.artisan_village,
          artisan_state: product.artisan_state,
          mosje_scheme_id: product.mosje_scheme_id,
          gi_tagged: product.gi_tagged,
          gi_certification_no: product.gi_certification_no,
          craft_lineage_years: product.craft_lineage_years || 25,
          category: product.category,
          material_type: product.material_type,
          qr_badge_url: product.qr_badge_url || `/static/qrcodes/qr_${product.id}.png`,
          issued_date: product.created_at || '2026-09-01T10:00:00Z'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [product.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => setActiveTab('catalog')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Certificate PDF</span>
        </button>
      </div>

      {/* Official Certificate Canvas Container */}
      <div className="bg-gradient-to-b from-amber-50/50 via-white to-orange-50/40 rounded-3xl p-8 sm:p-12 border-8 border-amber-800/20 shadow-2xl relative overflow-hidden text-stone-900">
        {/* Subtle Watermark Seal */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <Award className="w-[450px] h-[450px] text-stone-900" />
        </div>

        {/* Certificate Header */}
        <div className="text-center space-y-2 pb-6 border-b-2 border-dashed border-amber-900/30 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <span>Ministry of Social Justice & Empowerment (MoSJE) • Govt. of India</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-amber-950 font-serif">
            Digital Certificate of Craft Authenticity
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Theme: Heritage & Culture • KalaSetu Decentralized Artisan Provenance Registry
          </p>
          <p className="text-xs font-mono font-bold text-orange-700">
            Certificate ID: {certData?.certificate_id || 'CERT-MoSJE-2026-VISH-090'}
          </p>
        </div>

        {/* Main Certificate Content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Details */}
          <div className="md:col-span-8 space-y-4 text-xs sm:text-sm">
            <p className="text-stone-600 italic">
              This is to certify that the handcrafted article described herein has been officially verified as a genuine, non-industrial heritage product produced by registered beneficiary artisans under MoSJE upliftment initiatives.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-start justify-between py-1.5 border-b border-stone-200">
                <span className="font-bold text-stone-500 uppercase text-xs">Product Name:</span>
                <span className="font-bold text-stone-900 text-right">{certData?.title_en}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                <span className="font-bold text-stone-500 uppercase text-xs">Master Artisan:</span>
                <span className="font-bold text-stone-900">{certData?.artisan_name}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                <span className="font-bold text-stone-500 uppercase text-xs">Craft Cluster & Origin:</span>
                <span className="font-bold text-stone-900">{certData?.artisan_village}, {certData?.artisan_state}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                <span className="font-bold text-stone-500 uppercase text-xs">Primary Materials:</span>
                <span className="font-bold text-stone-900">{certData?.material_type}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                <span className="font-bold text-stone-500 uppercase text-xs">MoSJE Scheme ID:</span>
                <span className="font-mono font-bold text-orange-800">{certData?.mosje_scheme_id || 'MoSJE-VISH-2026'}</span>
              </div>

              {certData?.gi_tagged && (
                <div className="flex items-center justify-between py-1.5 border-b border-stone-200">
                  <span className="font-bold text-orange-600 uppercase text-xs">GI Certification No:</span>
                  <span className="font-mono font-bold text-orange-700">{certData?.gi_certification_no || 'GI-CERT-IN-2026'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: QR Code & Verification Seal */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-3 p-4 bg-white rounded-2xl border border-amber-200/80 shadow-sm text-center">
            <div className="w-32 h-32 bg-stone-50 rounded-xl p-1.5 border border-stone-200 flex items-center justify-center">
              <img
                src={certData?.qr_badge_url || `/static/qrcodes/qr_${product.id}.png`}
                alt="Verification QR"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback standard QR placeholder
                  e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://kalasetu.mosje.gov.in";
                }}
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Public Verification QR
              </span>
              <span className="text-[11px] font-semibold text-stone-700">
                Scan with any smartphone camera to verify artisan credentials
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Footer Seal */}
        <div className="pt-6 border-t-2 border-dashed border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs relative z-10">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>AUTHENTICATED BY MoSJE ARTISAN WELFARE CLUSTER</span>
          </div>

          <div className="text-stone-500 font-mono text-[11px] text-right">
            <span>Date of Issue: {new Date(certData?.issued_date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
