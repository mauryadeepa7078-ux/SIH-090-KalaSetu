import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Monitor } from 'lucide-react';

export const DeviceFrameToggle = ({ children }) => {
  const { isMobileFrame, setIsMobileFrame } = useApp();

  if (!isMobileFrame) {
    return <main className="min-h-[calc(100vh-120px)] pb-32 lg:pb-20">{children}</main>;
  }

  return (
    <div className="py-6 px-3 sm:px-4 flex flex-col items-center justify-center bg-stone-950 min-h-[calc(100vh-120px)]">
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-[420px] bg-stone-900 border-8 border-stone-800 rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Top Speaker / Notch */}
        <div className="h-6 bg-stone-900 flex items-center justify-center relative z-20 pt-1">
          <div className="w-20 h-4 bg-stone-800 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-stone-950 mr-2 border border-stone-700"></div>
            <div className="w-8 h-1.5 bg-stone-700 rounded-full"></div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="h-[760px] overflow-y-auto bg-stone-100 pb-32 scrollbar-none">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-4 bg-stone-900 flex items-center justify-center">
          <div className="w-28 h-1 bg-stone-600 rounded-full"></div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsMobileFrame(false)}
          className="text-xs text-orange-400 hover:text-orange-300 underline font-medium flex items-center space-x-1 mx-auto min-h-[36px]"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit Mobile Frame Mode (View Full Screen)</span>
        </button>
      </div>
    </div>
  );
};
