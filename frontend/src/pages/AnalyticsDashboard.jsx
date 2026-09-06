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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
          <span>Core Differentiator Feature 9 • Artisan Business Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-hindi">
          {t('navAnalytics')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          Real-time performance overview of your digitized craft inventory, institutional inquiries, and market reach.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listings */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {summary.total_listings}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 100% Digitized
          </p>
        </div>

        {/* Monthly Views */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Views</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {summary.total_views?.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +34% this month
          </p>
        </div>

        {/* Buyer Inquiries */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Buyer Inquiries</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {summary.total_inquiries}
          </div>
          <p className="text-[11px] text-purple-600 font-semibold flex items-center">
            {summary.pending_rfqs_count} open institutional RFQs
          </p>
        </div>

        {/* Catalog Valuation */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Portfolio Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            ₹{(summary.total_valuation_inr / 1000)?.toFixed(1)}k
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center">
            {summary.gi_tagged_count} GI Certified Crafts
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm">
              Monthly Growth Trends (Views vs Inquiries vs Revenue)
            </h3>
            <span className="text-xs text-stone-400 font-mono">2026 YTD</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="views" name="Views" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="inquiries" name="Inquiries" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-sm">
            Craft Category Distribution
          </h3>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
                <XAxis type="number" stroke="#888888" fontSize={10} hide />
                <YAxis dataKey="category" type="category" stroke="#888888" fontSize={10} width={100} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
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
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>Top Performing Master Crafts Leaderboard</span>
        </h3>

        <div className="divide-y divide-stone-100">
          {top_products.map((item, idx) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <img src={item.image} alt={item.title_en} className="w-10 h-10 rounded-xl object-contain bg-stone-50 border border-stone-200" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">{item.title_en}</h4>
                  <span className="text-[11px] text-stone-500 font-semibold">₹{item.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold text-stone-600">
                <span className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.views}</span>
                </span>
                <span className="flex items-center space-x-1 text-purple-700 font-bold">
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
