import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  ShoppingBag, 
  Building2, 
  Award, 
  DollarSign, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

export const AnalyticsDashboard = () => {
  const { t, lang } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (e) {
      console.warn('Analytics err', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-stone-500 mt-3 font-medium">Aggregating real-time artisan metrics...</p>
      </div>
    );
  }

  const { summary, top_products, category_distribution, state_distribution, monthly_trend } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-bold tracking-wide font-sans">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Core Differentiator Feature 9 • Artisan Business Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
          {t('navAnalytics')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-2xl leading-relaxed">
          Real-time performance overview of your digitized craft inventory, institutional inquiries, and market reach.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Listings */}
        <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-3">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Total Listings</span>
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-serif">
            {summary.total_listings}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center font-sans">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 100% Digitized
          </p>
        </div>

        {/* Monthly Views */}
        <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-3">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Catalog Views</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-serif">
            {summary.total_views?.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center font-sans">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +34% this month
          </p>
        </div>

        {/* Buyer Inquiries */}
        <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-3">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Buyer Inquiries</span>
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-serif">
            {summary.total_inquiries}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center font-sans">
            {summary.pending_rfqs_count} open B2B RFQs
          </p>
        </div>

        {/* Catalog Valuation */}
        <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-3">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Portfolio Value</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-serif">
            ₹{(summary.total_valuation_inr / 1000)?.toFixed(1)}k
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center font-sans">
            {summary.gi_tagged_count} GI Certified Crafts
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-extrabold text-stone-900 dark:text-white text-sm font-serif">
              Monthly Growth Trends (Views vs Inquiries)
            </h3>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono font-bold">2026 YTD</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Line type="monotone" dataKey="views" name="Views" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c' }} />
                <Line type="monotone" dataKey="inquiries" name="Inquiries" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-4">
          <h3 className="font-extrabold text-stone-900 dark:text-white text-sm font-serif pb-2 border-b border-stone-100 dark:border-stone-800">
            Craft Category Distribution
          </h3>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                <XAxis type="number" stroke="#888888" fontSize={10} hide />
                <YAxis dataKey="category" type="category" stroke="#888888" fontSize={10} width={90} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Items" fill="#ea580c" radius={[0, 8, 8, 0]}>
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Crafts Leaderboard */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card space-y-4">
        <h3 className="font-extrabold text-stone-900 dark:text-white text-sm flex items-center space-x-2 font-serif">
          <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span>Top Performing Master Crafts Leaderboard</span>
        </h3>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {top_products.map((item, idx) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <span className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <img src={item.image} alt={item.title_en} className="w-12 h-12 rounded-2xl object-cover bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white line-clamp-1 font-serif">{item.title_en}</h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold font-sans">₹{item.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-5 text-xs font-semibold text-stone-600 dark:text-stone-400 font-sans">
                <span className="flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.views}</span>
                </span>
                <span className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-bold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{item.inquiries}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
