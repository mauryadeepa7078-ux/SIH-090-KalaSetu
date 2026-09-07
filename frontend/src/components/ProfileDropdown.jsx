import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Palette, 
  ShoppingBag, 
  Building2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Award, 
  LogOut, 
  RefreshCw, 
  X, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const ProfileDropdown = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    userRole, 
    switchRole, 
    logout, 
    openOnboarding, 
    lang, 
    t 
  } = useApp();

  if (!isOpen) return null;

  const roleColors = {
    artisan: 'from-orange-600 to-amber-600 text-orange-400 border-orange-500/40',
    businessman: 'from-blue-600 to-cyan-600 text-blue-400 border-blue-500/40',
    buyer: 'from-amber-600 to-yellow-600 text-amber-400 border-amber-500/40'
  };

  const getInitials = (name) => {
    if (!name) return 'KS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="absolute right-2 top-14 z-50 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-3xl p-5 text-stone-100 shadow-2xl animate-fade-in space-y-4">
      {/* Top Banner / Avatar */}
      <div className="flex items-start justify-between pb-3 border-b border-stone-800">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${roleColors[userRole] || 'from-orange-600 to-amber-600'} text-stone-950 font-black flex items-center justify-center text-base shadow-lg`}>
            {getInitials(currentUser?.name)}
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-white font-hindi line-clamp-1">
              {currentUser?.name || 'KalaSetu User'}
            </h4>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border bg-black/40 ${
                userRole === 'artisan' ? 'text-orange-400 border-orange-500/40' :
                userRole === 'businessman' ? 'text-blue-300 border-blue-500/40' :
                'text-amber-300 border-amber-500/40'
              }`}>
                {userRole === 'artisan' ? '🎨 Master Artisan' :
                 userRole === 'businessman' ? '🏢 B2B / GeM Buyer' :
                 '🛍️ Retail Collector'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Details List */}
      <div className="space-y-2.5 text-xs bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800">
        <div className="flex items-center space-x-2 text-stone-300">
          <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="font-mono text-stone-200">{currentUser?.phone || '+91 98765 43210'}</span>
        </div>

        <div className="flex items-start space-x-2 text-stone-300">
          <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
          <span className="line-clamp-2 text-stone-300">{currentUser?.location || 'Pan India'}</span>
        </div>

        {/* Role Specific IDs */}
        {userRole === 'artisan' && (
          <div className="pt-2 border-t border-stone-800 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-400">Craft Specialty:</span>
              <span className="font-bold text-orange-400">{currentUser?.craft_type || 'Handloom Weaving'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-400">MoSJE Pehchan ID:</span>
              <span className="font-mono font-bold text-stone-200">{currentUser?.scheme_id || 'MoSJE-VISH-2026-UP-091'}</span>
            </div>
          </div>
        )}

        {userRole === 'businessman' && (
          <div className="pt-2 border-t border-stone-800 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-400">Enterprise:</span>
              <span className="font-bold text-blue-300 truncate max-w-[170px]">{currentUser?.company || 'Singhal Crafts Exports'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-400">GSTIN:</span>
              <span className="font-mono font-bold text-stone-200">{currentUser?.gstin || '07AAAAA0000A1Z5'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Switch Role Quick Actions */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block px-1">
          Switch Portal / Role:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              switchRole('artisan');
              onClose();
            }}
            className={`p-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center space-y-1 border transition-all ${
              userRole === 'artisan' ? 'bg-orange-600 text-white border-orange-500 shadow-md' : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border-stone-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Artisan</span>
          </button>

          <button
            onClick={() => {
              switchRole('buyer');
              onClose();
            }}
            className={`p-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center space-y-1 border transition-all ${
              userRole === 'buyer' ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md' : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border-stone-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buyer</span>
          </button>

          <button
            onClick={() => {
              switchRole('businessman');
              onClose();
            }}
            className={`p-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center space-y-1 border transition-all ${
              userRole === 'businessman' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-stone-800 text-stone-300 hover:bg-stone-750 border-stone-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B / GeM</span>
          </button>
        </div>
      </div>

      {/* Logout & Account Actions */}
      <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            onClose();
            openOnboarding();
          }}
          className="text-xs text-stone-400 hover:text-white font-semibold underline"
        >
          Edit Profile
        </button>

        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40 text-xs font-bold flex items-center space-x-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out (खाता बदलें)</span>
        </button>
      </div>
    </div>
  );
};
