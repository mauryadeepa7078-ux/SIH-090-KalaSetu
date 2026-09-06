import React, { useState } from 'react';
import { useVoiceNav } from '../context/VoiceNavContext';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Volume2, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

export const VoiceAssistantBar = () => {
  const { isListening, startVoiceNavigation, recognizedText, assistantReply, speakGuide } = useVoiceNav();
  const { t, lang } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const sampleCommands = [
    { label: 'नया उत्पाद', cmd: 'नया उत्पाद' },
    { label: 'बिक्री देखें', cmd: 'बिक्री देखें' },
    { label: 'मूल्य जांचें', cmd: 'मूल्य जांचें' },
    { label: 'GeM मार्केट', cmd: 'GeM पोर्टल' },
    { label: 'सिंक करें', cmd: 'सिंक करें' },
  ];

  const conversationalQuestions = [
    { label: '💰 सही दाम कैसे तय होगा?', cmd: 'यह प्राइस कैसे तय होता है?' },
    { label: '🏛️ GeM पोर्टल क्या है?', cmd: 'GeM पोर्टल क्या है और कैसे काम करता है?' },
    { label: '📷 फोटो कैसे लें?', cmd: 'फोटो का बैकग्राउंड कैसे हटेगा?' },
    { label: '📜 प्रामाणिकता सर्टिफिकेट?', cmd: 'MoSJE सर्टिफिकेट क्या है?' }
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {/* Voice commands hint drawer */}
      {isExpanded && (
        <div className="mb-3 p-4 bg-stone-900/95 backdrop-blur-md border border-orange-600/40 rounded-2xl shadow-2xl w-80 sm:w-96 text-xs text-stone-200 transition-all animate-float">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center space-x-1.5 font-semibold text-orange-400">
              <Sparkles className="w-4 h-4" />
              <span>{t('voiceNavActive')} (AI साथी)</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-white p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Voice Commands */}
          <div className="mt-2.5">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
              नेविगेशन कमांड्स (Voice Commands):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleCommands.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => speakGuide(item.cmd)}
                  className="cursor-pointer px-2 py-1 rounded-lg bg-stone-800 border border-stone-700 hover:border-orange-500 text-stone-300 hover:text-white text-[11px] transition-colors"
                >
                  🗣️ {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Conversational Questions */}
          <div className="mt-3 pt-2.5 border-t border-stone-800">
            <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block mb-1">
              पूछें कोई भी सवाल (Ask AI Advisor):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {conversationalQuestions.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => speakGuide(item.cmd)}
                  className="cursor-pointer px-2 py-1 rounded-lg bg-orange-950/60 border border-orange-800/50 hover:border-orange-500 text-orange-200 hover:text-white text-[11px] transition-colors"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Live Recognition or AI Reply display */}
          {recognizedText && (
            <div className="mt-3 p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 space-y-1">
              <span className="font-semibold text-[10px] text-orange-400 uppercase tracking-wider block">Recognized Speech:</span>
              <p className="text-xs text-white">"{recognizedText}"</p>
            </div>
          )}

          {assistantReply && (
            <div className="mt-2 p-2.5 rounded-xl bg-orange-950/70 border border-orange-600/40 text-orange-200 space-y-1">
              <span className="font-bold text-[10px] text-orange-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Advisor Reply:
              </span>
              <p className="text-xs text-white leading-relaxed">{assistantReply}</p>
            </div>
          )}
        </div>
      )}


      {/* Floating Action Voice Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-stone-800/90 text-stone-300 hover:text-white px-3 py-2 rounded-full border border-stone-700 shadow-lg text-xs font-medium flex items-center space-x-1 backdrop-blur-sm"
        >
          <span>Voice Guide</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={startVoiceNavigation}
          className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isListening
              ? 'bg-red-600 text-white ring-4 ring-red-400/50 animate-pulse'
              : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white hover:scale-110 shadow-orange-900/50'
          }`}
          title="Click to speak a voice command"
        >
          {isListening ? (
            <>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <MicOff className="w-6 h-6 animate-bounce" />
            </>
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};
