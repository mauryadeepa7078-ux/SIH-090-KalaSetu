import React, { useState } from 'react';
import { useVoiceNav } from '../context/VoiceNavContext';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, Volume2, Sparkles, ChevronUp, ChevronDown, Bot } from 'lucide-react';

export const VoiceAssistantBar = () => {
  const { isListening, startVoiceNavigation, recognizedText, assistantReply, speakGuide } = useVoiceNav();
  const { t, lang, userRole } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const sampleCommands = userRole === 'businessman'
    ? [
        { label: 'B2B हब', cmd: 'B2B हब खोलें' },
        { label: 'GeM टेंडर', cmd: 'GeM पोर्टल टेंडर' },
        { label: 'थोक RFQ', cmd: 'थोक RFQ कोटेशन' },
        { label: 'क्लस्टर्स', cmd: 'कारीगर क्लस्टर्स' }
      ]
    : userRole === 'buyer'
    ? [
        { label: 'शिल्प बाज़ार', cmd: 'शिल्प बाज़ार खोलें' },
        { label: 'मेरे ऑर्डर', cmd: 'मेरे ऑर्डर दिखाएं' },
        { label: 'कार्ट', cmd: 'कार्ट देखें' },
        { label: 'विरासत कथाएँ', cmd: 'विरासत कथाएँ' }
      ]
    : [
        { label: 'नया उत्पाद', cmd: 'नया उत्पाद' },
        { label: 'मेरे ऑर्डर', cmd: 'ऑर्डर और पूछताछ' },
        { label: 'बिक्री देखें', cmd: 'बिक्री देखें' },
        { label: 'मूल्य जांचें', cmd: 'मूल्य जांचें' },
        { label: 'सिंक करें', cmd: 'सिंक करें' }
      ];

  const conversationalQuestions = userRole === 'businessman'
    ? [
        { label: '📋 थोक RFQ कैसे बनाएं?', cmd: 'थोक RFQ और MOQ डिस्काउंट कैसे काम करता है?' },
        { label: '🏛️ GeM टेंडर कंप्लायंस?', cmd: 'GeM सरकारी टेंडर प्रक्रिया क्या है?' },
        { label: '🧾 GSTIN इनवॉइस किट?', cmd: 'GST टैक्स और HSN कोड कैसे मिलेगा?' }
      ]
    : userRole === 'buyer'
    ? [
        { label: '🚚 ऑर्डर डिलीवरी ट्रैकिंग?', cmd: 'मेरा ऑर्डर कब तक डिलीवर होगा?' },
        { label: '🏅 GI प्रामाणिकता?', cmd: 'क्या यह उत्पाद 100% प्रामाणिक GI क्राफ्ट है?' },
        { label: '💬 कारीगर से बात?', cmd: 'कारीगर से सीधे कैसे संपर्क करें?' }
      ]
    : [
        { label: '💰 सही दाम कैसे तय होगा?', cmd: 'यह प्राइस कैसे तय होता है?' },
        { label: '📷 फोटो कैसे लें?', cmd: 'फोटो का बैकग्राउंड कैसे हटेगा?' },
        { label: '🎙️ आवाज से कैटलॉग?', cmd: 'बोलकर कैटलॉग कैसे बनता है?' },
        { label: '📜 प्रामाणिकता सर्टिफिकेट?', cmd: 'MoSJE सर्टिफिकेट क्या है?' }
      ];

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end animate-fade-in">
      {/* Voice commands hint drawer */}
      {isExpanded && (
        <div className="mb-3 p-5 bg-stone-900/95 backdrop-blur-xl border border-orange-500/40 rounded-3xl shadow-2xl w-80 sm:w-96 text-xs text-stone-200 transition-all animate-float">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center space-x-2 font-bold text-orange-400">
              <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-sm text-white">{t('voiceNavActive')} (AI साथी)</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Voice Commands */}
          <div className="mt-3">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5 font-sans">
              नेविगेशन कमांड्स (Voice Commands):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleCommands.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => speakGuide(item.cmd)}
                  className="cursor-pointer px-2.5 py-1 rounded-xl bg-stone-800/90 border border-stone-700/80 hover:border-orange-500 hover:bg-orange-950/40 text-stone-200 hover:text-white text-[11px] font-semibold transition-all active:scale-95"
                >
                  🗣️ {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Conversational Questions */}
          <div className="mt-3.5 pt-3 border-t border-stone-800">
            <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block mb-1.5 font-sans">
              पूछें कोई भी सवाल (Ask AI Advisor):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {conversationalQuestions.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => speakGuide(item.cmd)}
                  className="cursor-pointer px-2.5 py-1 rounded-xl bg-orange-950/60 border border-orange-800/60 hover:border-orange-400 hover:bg-orange-900/60 text-orange-200 hover:text-white text-[11px] font-semibold transition-all active:scale-95"
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Live Recognition or AI Reply display */}
          {recognizedText && (
            <div className="mt-3 p-3 rounded-2xl bg-stone-950 border border-stone-800 text-stone-200 space-y-1 animate-fade-in">
              <span className="font-semibold text-[10px] text-orange-400 uppercase tracking-wider block font-sans">Recognized Speech:</span>
              <p className="text-xs text-white font-medium">"{recognizedText}"</p>
            </div>
          )}

          {assistantReply && (
            <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-br from-orange-950/80 to-stone-900 border border-orange-600/40 text-orange-200 space-y-1 animate-fade-in shadow-md">
              <span className="font-bold text-[10px] text-orange-400 uppercase tracking-wider block flex items-center gap-1 font-sans">
                <Sparkles className="w-3 h-3 text-orange-400" /> AI Advisor Reply:
              </span>
              <p className="text-xs text-white leading-relaxed font-sans">{assistantReply}</p>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Voice Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white px-3.5 py-2 rounded-full border border-stone-700/80 shadow-lg text-xs font-semibold flex items-center space-x-1.5 backdrop-blur-md transition-all active:scale-95"
        >
          <span>Voice Guide</span>
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={startVoiceNavigation}
          className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isListening
              ? 'bg-red-600 text-white ring-4 ring-red-400/50 animate-pulse scale-105'
              : 'bg-gradient-to-tr from-orange-600 via-amber-600 to-yellow-500 text-white hover:scale-110 shadow-orange-900/50 glow-saffron'
          }`}
          title="Click to speak a voice command"
        >
          {isListening ? (
            <>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
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
