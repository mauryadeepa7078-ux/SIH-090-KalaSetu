import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Monitor, Apple, Sparkles, Check } from 'lucide-react';

export const DeviceFrameToggle = ({ children }) => {
  const { isMobileFrame, setIsMobileFrame, screenDevice, setScreenDevice } = useApp();

  const activeMode = isMobileFrame 
    ? (screenDevice === 'responsive' ? 'android' : screenDevice)
    : (screenDevice || 'responsive');

  // Standard Full-Screen Responsive View for Laptop, Tablets & Real Mobile Devices
  if (!isMobileFrame || activeMode === 'responsive') {
    return (
      <main className="flex-1 w-full min-h-[calc(100dvh-72px)] pb-24 lg:pb-12 transition-all duration-200">
        {children}
      </main>
    );
  }

  // Device Simulation Mode (Android or iOS)
  const isIOS = activeMode === 'ios';

  return (
    <div className="py-6 px-2 sm:px-4 flex flex-col items-center justify-center bg-stone-950/95 min-h-[calc(100dvh-72px)] text-stone-100 animate-fade-in">
      {/* Device Switcher Selector Pill Header */}
      <div className="mb-4 inline-flex items-center p-1.5 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl space-x-1 z-30">
        <button
          onClick={() => {
            setScreenDevice('responsive');
            setIsMobileFrame(false);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'responsive'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Switch to Laptop / Responsive Full-Screen"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Laptop (Fluid)</span>
        </button>

        <button
          onClick={() => {
            setScreenDevice('android');
            setIsMobileFrame(true);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'android'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Switch to Android Phone View (412x915)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android (412px)</span>
        </button>

        <button
          onClick={() => {
            setScreenDevice('ios');
            setIsMobileFrame(true);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'ios'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Switch to iOS iPhone View (393x852)"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-300" />
          <span>iOS iPhone (393px)</span>
        </button>
      </div>

      {/* Realistic Device Frame */}
      <div className={`relative w-full ${isIOS ? 'max-w-[393px]' : 'max-w-[412px]'} bg-stone-900 border-[10px] ${isIOS ? 'border-stone-800 rounded-[52px]' : 'border-stone-850 rounded-[44px]'} shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] overflow-hidden transition-all duration-300`}>
        
        {/* Device Top Bar: Dynamic Island for iOS vs Punch-Hole for Android */}
        <div className="h-9 bg-stone-900 flex items-center justify-between px-6 relative z-20 select-none text-[11px] text-stone-300 font-semibold pt-1">
          <span>9:41</span>

          {isIOS ? (
            /* iPhone Dynamic Island Pill */
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800"></div>
            </div>
          ) : (
            /* Android Center Punch-Hole Camera */
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-stone-950 rounded-full border border-stone-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
            </div>
          )}

          <div className="flex items-center space-x-1 text-stone-400">
            <span className="text-[10px]">5G</span>
            <span className="text-[10px]">100%</span>
          </div>
        </div>

        {/* Screen Viewport with internal scrolling */}
        <div className="h-[780px] overflow-y-auto bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pb-28 scrollbar-thin scrollbar-thumb-stone-700 select-text">
          {children}
        </div>

        {/* Device Bottom Bar: iOS Home Indicator vs Android Navigation Pill */}
        <div className="h-6 bg-stone-900 flex items-center justify-center select-none">
          {isIOS ? (
            <div className="w-32 h-1 bg-stone-500 rounded-full"></div>
          ) : (
            <div className="w-20 h-1 bg-stone-600 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Exit to Laptop full screen prompt */}
      <div className="mt-3.5 text-center">
        <button
          onClick={() => {
            setScreenDevice('responsive');
            setIsMobileFrame(false);
          }}
          className="text-xs text-orange-400 hover:text-orange-300 underline font-semibold flex items-center space-x-1 mx-auto min-h-[36px]"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit to Laptop Full Screen (Fluid Responsive View)</span>
        </button>
      </div>
    </div>
  );
};
