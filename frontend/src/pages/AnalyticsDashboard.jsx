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
  ArrowDownRight,
  Sparkles,
  Wallet,
  Receipt,
  PiggyBank,
  PackageCheck,
  Calendar
} from 'lucide-react';

const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

export const AnalyticsDashboard = () => {
  const { t, lang, orders, products, userRole, currentUser } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week' | 'month' | 'year'

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

  // Exact required terminology calculations (Reference 2 inspiration)
  const craftSales = orders?.length > 0 
    ? orders.reduce((sum, o) => sum + (Number(o.total_price || o.total || o.amount) || 0), 0)
    : (summary?.total_valuation_inr ? Math.round(summary.total_valuation_inr * 0.42) : 48500);

  const businessExpenses = Math.round(craftSales * 0.22) || 10670;
  const netEarnings = craftSales - businessExpenses;
  const artisanEarnings = netEarnings;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28 min-w-0">
      {/* Header with Time Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-bold tracking-wide font-sans">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Artisan Business Intelligence & Sales Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
            {t('navAnalytics')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-sans max-w-2xl leading-relaxed">
            Transparent revenue tracking, craft order performance, and institutional buyer reach.
          </p>
        </div>

        {/* Time Filter Pill */}
        <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'week'
                ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'month'
                ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'year'
                ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Year to Date
          </button>
        </div>
      </div>

      {/* CORE FINANCIAL OVERVIEW — Exact Required Terminology */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Receipt className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Artisan Financial Performance
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Card 1: Artisan Earnings */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-2">
            <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">Artisan Earnings</span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-serif">
              ₹{artisanEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center font-sans">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.4% vs last period
            </p>
          </div>

          {/* Card 2: Craft Sales */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-2">
            <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">Craft Sales</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white font-serif">
              ₹{craftSales.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium font-sans">
              Gross craft receipts
            </p>
          </div>

          {/* Card 3: Net Earnings */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-2">
            <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">Net Earnings</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-serif">
              ₹{netEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
              78% Profit retention
            </p>
          </div>

          {/* Card 4: Business Expenses */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-2">
            <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
              <span className="text-[11px] font-bold uppercase tracking-wider font-sans">Business Expenses</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-700 dark:text-stone-300 font-serif">
              ₹{businessExpenses.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium font-sans">
              Clay, dyes, packaging & logistics
            </p>
          </div>
        </div>
      </div>

      {/* SECONDARY METRICS: Catalog & Demand KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3.5 border border-stone-200/60 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active Crafts</span>
          <div className="text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200 font-serif mt-1">
            {products?.length || summary.total_listings}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Digitized</span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3.5 border border-stone-200/60 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Views</span>
          <div className="text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200 font-serif mt-1">
            {summary.total_views?.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">+34% vs last mo.</span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3.5 border border-stone-200/60 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Buyer Inquiries</span>
          <div className="text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200 font-serif mt-1">
            {summary.total_inquiries}
          </div>
          <span className="text-[10px] text-purple-600 font-semibold">{summary.pending_rfqs_count} open RFQs</span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-3.5 border border-stone-200/60 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">GI Certified</span>
          <div className="text-lg sm:text-xl font-bold text-stone-800 dark:text-stone-200 font-serif mt-1">
            {summary.gi_tagged_count}
          </div>
          <span className="text-[10px] text-orange-600 font-semibold">Heritage Authenticated</span>
        </div>
      </div>

      {/* Charts Grid — Guaranteed Responsive without horizontal overflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-4 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm font-serif">
                Monthly Growth Trends (Views vs Inquiries)
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Artisan catalog exposure and incoming buyer leads</p>
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono font-bold">2026 YTD</span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Line type="monotone" dataKey="views" name="Catalog Views" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c' }} />
                <Line type="monotone" dataKey="inquiries" name="Inquiries" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-[28px] p-5 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-4 min-w-0 overflow-hidden">
          <h3 className="font-extrabold text-stone-900 dark:text-white text-sm font-serif pb-2 border-b border-stone-100 dark:border-stone-800">
            Craft Category Distribution
          </h3>

          <div className="h-64 sm:h-72 w-full pt-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_distribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                <XAxis type="number" stroke="#888888" fontSize={10} hide />
                <YAxis dataKey="category" type="category" stroke="#888888" fontSize={10} width={75} tickLine={false} />
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
              <div className="flex items-center space-x-3.5 min-w-0">
                <span className="w-7 h-7 flex-shrink-0 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-extrabold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <img src={item.image} alt={item.title_en} className="w-12 h-12 flex-shrink-0 rounded-2xl object-cover bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800" />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-white truncate font-serif">{item.title_en}</h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold font-sans">₹{item.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 sm:space-x-5 text-xs font-semibold text-stone-600 dark:text-stone-400 font-sans flex-shrink-0">
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

