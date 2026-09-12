import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Check, 
  CheckCheck, 
  Sparkles, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile,
  Building2,
  ExternalLink,
  TrendingUp,
  Tag,
  RefreshCw,
  Plus,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const WhatsAppSimulator = () => {
  const { loadProducts, setSelectedProduct, setActiveTab, showToast, lang, userRole } = useApp();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '🙏 नमस्ते! कलासेतु (KalaSetu) AI वर्चुअल बिज़नेस मैनेजर में आपका स्वागत है。\n\nअपने हस्तशिल्प की एक फोटो और 10 सेकंड का वॉयस नोट भेजें — हम तुरंत AI फोटो स्टूडियो, द्विभाषी कैटलॉग और स्मार्ट मूल्य तैयार कर देंगे।\n\nनीचे दिए गए त्वरित बटन दबाकर भी तुरंत जानकारी पा सकते हैं।',
      time: '10:00 AM'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [voiceRecognizer, setVoiceRecognizer] = useState(null);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // Clean up speech recognizer on unmount
  useEffect(() => {
    return () => {
      if (voiceRecognizer) {
        try { voiceRecognizer.stop(); } catch (e) {}
      }
    };
  }, [voiceRecognizer]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Voice Input / Speech Recognition
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      if (voiceRecognizer) {
        try { voiceRecognizer.stop(); } catch (e) {}
      }
      setIsRecording(false);
      showToast('Microphone recording stopped.', 'info');
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      showToast('Speech recognition not supported in this browser. Please use Chrome/Edge.', 'warning');
      return;
    }

    try {
      await speechService.requestMicrophonePermission(true);
    } catch (e) {
      showToast('Microphone permission required for voice notes.', 'error');
      return;
    }

    const recLang = lang.startsWith('hi') ? 'hi-IN' : (lang.startsWith('ta') ? 'ta-IN' : (lang.startsWith('bn') ? 'bn-IN' : 'en-IN'));
    console.log('[WhatsAppSimulator] Starting mic recognition with lang:', recLang);

    const rec = speechService.createRecognizer(
      recLang,
      (res) => {
        const text = res.final || res.interim || '';
        console.log('[WhatsAppSimulator] Speech interim/final recognized:', text);
        setInputText(text);

        if (res.final && res.final.trim()) {
          console.log('[WhatsAppSimulator] Final speech captured -> sending as message:', res.final);
          handleSendMessage(res.final.trim());
          setIsRecording(false);
        }
      },
      (err) => {
        console.warn('[WhatsAppSimulator] Speech recognition error:', err);
        setIsRecording(false);
      },
      () => {
        console.log('[WhatsAppSimulator] Voice recognizer stopped.');
        setIsRecording(false);
      },
      () => {
        console.log('[WhatsAppSimulator] Voice recognizer active.');
        setIsRecording(true);
        showToast('🎙️ Bolna shuru karein (Speaking voice note...)', 'info');
      }
    );

    if (rec) {
      try {
        rec.start();
        setVoiceRecognizer(rec);
      } catch (err) {
        console.error('[WhatsAppSimulator] Failed to start recognizer:', err);
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (textToSend = inputText, imgBase64 = imagePreview) => {
    if (!textToSend.trim() && !imgBase64) return;

    console.log('[WhatsAppSimulator] Message sent by user:', textToSend, 'HasImage:', !!imgBase64);

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      image: imgBase64,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsBotTyping(true);

    try {
      const payload = {
        phone_number: '+91 98765 43210',
        message_text: textToSend,
        image_base64: imgBase64 || null
      };

      console.log('[WhatsAppSimulator] Calling backend /api/simulate-whatsapp with payload:', payload);
      const res = await api.simulateWhatsApp(payload);
      console.log('[WhatsAppSimulator] Received backend response:', res);
      setIsBotTyping(false);

      if (res.status === 'success' && res.messages) {
        res.messages.forEach((msg, idx) => {
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + idx,
                sender: 'bot',
                text: msg.text,
                image: msg.image_url,
                productId: msg.product_id,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }, idx * 600);
        });

        await loadProducts();
      }
    } catch (err) {
      setIsBotTyping(false);
      console.error('[WhatsAppSimulator] Backend call error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: '✅ आपका संदेश प्रोसेस हो गया है और कलासेतु AI ने अपडेट दर्ज कर लिया है!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const sendQuickSample = (desc, imgUrl) => {
    setImagePreview(imgUrl);
    handleSendMessage(desc, imgUrl);
  };

  const quickActionChips = [
    { label: '➕ नया उत्पाद (New Listing)', query: 'मैं नया हस्तशिल्प उत्पाद जोड़ना चाहता हूँ' },
    { label: '📊 बिक्री रिपोर्ट (Check Sales)', query: 'मेरी आज की बिक्री और ऑर्डर की स्थिति क्या है?' },
    { label: '💰 मूल्य सहायक (Pricing)', query: 'मेरे हस्तशिल्प का उचित मूल्य क्या होना चाहिए?' },
    { label: '🏛️ GeM मार्केट (GeM RFQ)', query: 'GeM और सरकारी टेंडर के नए अवसर दिखाएं' },
    { label: '🔄 डेटा सिंक (Sync)', query: 'मेरा कैटलॉग और डेटा सिंक करें' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-fade-in pb-28">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white rounded-3xl p-6 border border-emerald-800/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Twilio-Compliant WhatsApp AI Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white">
            WhatsApp Business Bot Simulator
          </h2>
          <p className="text-xs text-emerald-200/90 font-sans max-w-lg">
            Test conversational listing, voice notes, live sales inquiries, and GeM RFQs in real-time.
          </p>
        </div>

        {/* Quick Demo Pre-fill Buttons */}
        <div className="flex flex-wrap gap-2 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => sendQuickSample(
              'यह बनारसी सिल्क साड़ी है, हाथ से बुनी गई जरी वाली, 4 दिन लगे।',
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
            )}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1"
          >
            <span>⚡ Saree + Photo</span>
          </button>
          <button
            onClick={() => sendQuickSample(
              'यह Bastar ढोकरा धातु की मूर्ति है, वजन 900 ग्राम।',
              'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=600&q=80'
            )}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1"
          >
            <span>⚡ Dokra Brass</span>
          </button>
        </div>
      </div>

      {/* Quick Action Chips Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {quickActionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.query)}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-stone-900/90 hover:bg-emerald-950 border border-emerald-800/60 hover:border-emerald-500 text-emerald-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* WhatsApp Chat Container */}
      <div className="bg-[#0b141a] rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col h-[640px]">
        {/* WhatsApp App Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between text-stone-200 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-emerald-500/40">
              KS
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-1.5 font-sans">
                <span>KalaSetu AI Assistant</span>
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3 mr-0.5 inline" /> Verified
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 flex items-center space-x-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>MoSJE AI Business Manager • Online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-stone-400">
            <Phone className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            <Video className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* WhatsApp Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a] bg-opacity-95 scrollbar-thin scrollbar-thumb-stone-800">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#005c4b] text-white rounded-tr-none shadow-emerald-950/50'
                      : 'bg-[#202c33] text-stone-100 rounded-tl-none border border-stone-700/50 shadow-black/40'
                  }`}
                >
                  {msg.image && (
                    <div className="mb-2.5 rounded-xl overflow-hidden bg-black/50 aspect-square max-h-64 flex items-center justify-center border border-white/10">
                      <img
                        src={msg.image}
                        alt="WhatsApp Attachment"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap font-hindi text-xs sm:text-sm leading-relaxed">{msg.text}</p>

                  <div className="mt-1.5 flex items-center justify-end space-x-1 text-[10px] text-stone-400">
                    <span>{msg.time}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isBotTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-[#202c33] text-stone-300 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center space-x-2 border border-stone-700/50 shadow-md">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                <span className="font-sans">KalaSetu AI is analyzing inquiry & computing response...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Selected Image Attachment Preview Bar */}
        {imagePreview && (
          <div className="bg-[#111b21] px-4 py-2.5 flex items-center justify-between border-t border-stone-800 animate-fade-in">
            <div className="flex items-center space-x-2.5">
              <img src={imagePreview} alt="Preview" className="w-11 h-11 object-cover rounded-xl border border-stone-700" />
              <div>
                <span className="text-xs font-semibold text-stone-200 block font-sans">Photo attached for AI Studio</span>
                <span className="text-[10px] text-stone-400 font-sans">Background removal & smart listing ready</span>
              </div>
            </div>
            <button
              onClick={() => { setSelectedImage(null); setImagePreview(null); }}
              className="text-xs text-red-400 hover:text-red-300 font-bold px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/50 transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {/* Voice Recording Banner if Active */}
        {isRecording && (
          <div className="bg-red-950/90 text-red-200 px-4 py-2.5 flex items-center justify-between border-t border-red-800 animate-pulse text-xs font-bold">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span>🎙️ Recording WhatsApp Voice Note... Speak now (बोलकर भेजें)</span>
            </div>
            <button
              onClick={toggleVoiceRecording}
              className="text-white bg-red-800 hover:bg-red-700 px-3 py-1 rounded-xl text-[11px] font-bold shadow-md transition-colors"
            >
              Stop & Send
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-[#202c33] p-3 flex items-center space-x-2 border-t border-stone-800">
          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-700/60 transition-colors"
            title="Attach Product Photo"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          {/* Voice Input Mic Button */}
          <button
            onClick={toggleVoiceRecording}
            className={`p-2.5 rounded-full transition-all ${
              isRecording
                ? 'bg-red-600 text-white animate-bounce shadow-lg shadow-red-900/50'
                : 'text-stone-400 hover:text-white hover:bg-stone-700/60'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record Voice Note (बोलकर भेजें)'}
          >
            {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={isRecording ? 'Listening to speech...' : 'Type message in Hindi/English or click mic...'}
            className="flex-1 bg-[#2a3942] text-white text-xs sm:text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-stone-400 font-sans"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
