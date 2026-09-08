import React, { createContext, useContext, useState, useEffect } from 'react';
import { speechService } from '../services/speechService';
import { api } from '../services/api';
import { useApp } from './AppContext';

const VoiceNavContext = createContext();

export const VoiceNavProvider = ({ children }) => {
  const { setActiveTab, triggerSync, lang, userRole, showToast } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [recognizer, setRecognizer] = useState(null);

  const startVoiceNavigation = async () => {
    console.log('[VoiceNavContext] startVoiceNavigation invoked.');
    if (!speechService.isSpeechRecognitionSupported()) {
      showToast('Voice navigation: Web Speech API is not supported in this browser (Use Chrome/Edge).', 'warning');
      return;
    }

    if (isListening) {
      if (recognizer) {
        try { recognizer.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    // Trigger haptic vibration
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch (e) {}

    // Request microphone permission first (release immediately so Web Speech API is not locked on mobile)
    try {
      await speechService.requestMicrophonePermission(true);
    } catch (e) {
      showToast('Microphone permission needed for Voice Navigation.', 'error');
      return;
    }

    const recLang = lang.startsWith('hi') ? 'hi-IN' : (lang.startsWith('ta') ? 'ta-IN' : (lang.startsWith('bn') ? 'bn-IN' : 'en-IN'));
    console.log('[VoiceNavContext] Initializing recognizer with language:', recLang);
    
    const rec = speechService.createRecognizer(
      recLang,
      (res) => {
        const text = (res.final || res.interim || '').toLowerCase();
        console.log('[VoiceNavContext] Recognized live speech:', text);
        setRecognizedText(text);

        if (res.final) {
          handleVoiceCommand(res.final.toLowerCase());
        }
      },
      (err) => {
        console.warn('[VoiceNavContext] Speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        console.log('[VoiceNavContext] Recognizer stopped.');
        setIsListening(false);
      },
      () => {
        console.log('[VoiceNavContext] Recognizer started.');
        setIsListening(true);
        showToast('🎙️ Voice Assistant Listening... Ask a question or say a command', 'info');
      }
    );

    if (rec) {
      try {
        rec.start();
        setRecognizer(rec);
      } catch (err) {
        console.error('[VoiceNavContext] Failed to start recognizer:', err);
        setIsListening(false);
      }
    }
  };

  const handleVoiceCommand = async (cmd) => {
    console.log('[VoiceNavContext] Processing Voice Command:', cmd);

    // 1. Direct Command Matchers based on 3 Roles
    if (userRole === 'businessman') {
      if (cmd.includes('rfq') || cmd.includes('कोटेशन') || cmd.includes('bulk') || cmd.includes('थोक') || cmd.includes('hub') || cmd.includes('b2b')) {
        setActiveTab('businessman-home');
        const response = lang === 'hi' ? 'संस्थागत B2B हब व थोक RFQ पेज खुल गया है।' : 'Opening B2B Institutional Hub & Bulk RFQ Portal.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('gem') || cmd.includes('जेम') || cmd.includes('टेंडर') || cmd.includes('tender') || cmd.includes('ondc')) {
        setActiveTab('gem');
        const response = lang === 'hi' ? 'GeM एवं ONDC टेंडर बोर्ड खुल गया है।' : 'Opening GeM Government Tenders & RFQ Board.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('क्लस्टर') || cmd.includes('cluster') || cmd.includes('कारीगर') || cmd.includes('guild')) {
        setActiveTab('businessman-home');
        const response = lang === 'hi' ? 'कारीगर क्लस्टर डायरेक्टरी खुल गई है।' : 'Opening Artisan Cluster Directory.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('व्हाट्सएप') || cmd.includes('whatsapp') || cmd.includes('inquiry') || cmd.includes('पूछताछ')) {
        setActiveTab('whatsapp');
        const response = lang === 'hi' ? 'क्लस्टर पूछताछ व संदेश केंद्र खुल गया है।' : 'Opening Cluster Inquiries & Communication Hub.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('होम') || cmd.includes('home')) {
        setActiveTab('businessman-home');
        const response = lang === 'hi' ? 'B2B मुख्य पेज पर आ गए।' : 'Returning to B2B Hub.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else {
        // Conversational AI for Businessman
        try {
          showToast('🤔 AI सोचने में लगा है...', 'info');
          const aiData = await api.chatWithAssistant(cmd, lang, userRole);
          const replyText = aiData?.reply || (lang === 'hi' ? 'मैं आपकी बात समझ रहा हूँ।' : 'I understand your procurement query.');
          setAssistantReply(replyText);
          speechService.speak(replyText, lang);
          showToast(`💬 ${replyText}`, 'info');
          if (aiData?.target_tab) {
            setActiveTab(aiData.target_tab);
          }
        } catch (err) {
          const fallback = lang === 'hi' ? `आदेश: "${cmd}"` : `Command: "${cmd}"`;
          speechService.speak(fallback, lang);
          setAssistantReply(fallback);
        }
      }
    } else if (userRole === 'buyer') {
      if (cmd.includes('ऑर्डर') || cmd.includes('order') || cmd.includes('track') || cmd.includes('ट्रैकिंग') || cmd.includes('delivery')) {
        setActiveTab('orders');
        const response = lang === 'hi' ? 'आपके ऑर्डर और लाइव ट्रैकिंग पेज खुल गया है।' : 'Opening your Live Order Tracking.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('कार्ट') || cmd.includes('cart') || cmd.includes('टोकरी') || cmd.includes('checkout') || cmd.includes('बैग')) {
        setActiveTab('cart');
        const response = lang === 'hi' ? 'आपकी खरीदारी की टोकरी (Cart) खुल गई है।' : 'Opening your Shopping Cart.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('मार्केट') || cmd.includes('बाज़ार') || cmd.includes('market') || cmd.includes('खरीद') || cmd.includes('buy') || cmd.includes('शिल्प') || cmd.includes('craft')) {
        setActiveTab('buyer-market');
        const response = lang === 'hi' ? 'हस्तशिल्प बाज़ार खुल गया है।' : 'Opening Heritage Craft Marketplace.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('फोटो') || cmd.includes('camera') || cmd.includes('studio') || cmd.includes('लिस्टिंग') || cmd.includes('pricing')) {
        const response = lang === 'hi'
          ? 'आप अभी खरीदार मोड में हैं। हस्तशिल्प देखने के लिए "बाज़ार" या ऑर्डर ट्रैक करने के लिए "ऑर्डर" कहें।'
          : 'You are in Buyer Mode. Say "Marketplace" to browse crafts or "Orders" to track deliveries.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'info');
        setAssistantReply(response);
      }
      else if (cmd.includes('होम') || cmd.includes('home')) {
        setActiveTab('buyer-market');
        const response = lang === 'hi' ? 'शिल्प बाज़ार होम पेज पर आ गए।' : 'Returning to Marketplace Home.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else {
        // Fallback to Assistant
        try {
          showToast('🤔 AI सोचने में लगा है...', 'info');
          const aiData = await api.chatWithAssistant(cmd, lang, userRole);
          const replyText = aiData?.reply || (lang === 'hi' ? 'मैं आपकी बात समझ रहा हूँ।' : 'I understand your question.');
          setAssistantReply(replyText);
          speechService.speak(replyText, lang);
          showToast(`💬 ${replyText}`, 'info');
          if (aiData?.target_tab && ['buyer-market', 'orders', 'cart', 'community', 'certificate'].includes(aiData.target_tab)) {
            setActiveTab(aiData.target_tab);
          }
        } catch (err) {
          const fallback = lang === 'hi' ? `आदेश: "${cmd}"` : `Command: "${cmd}"`;
          speechService.speak(fallback, lang);
          setAssistantReply(fallback);
        }
      }
    } else {
      // Artisan Voice Navigation
      if (cmd.includes('नया') || cmd.includes('उत्पाद') || cmd.includes('फोटो') || cmd.includes('add') || cmd.includes('new') || cmd.includes('photo') || cmd.includes('camera')) {
        setActiveTab('camera');
        const response = lang === 'hi' ? 'फोटो स्टूडियो खोल दिया गया है।' : 'Opening AI Photo Studio.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      } 
      else if (cmd.includes('आवाज') || cmd.includes('बोलकर') || cmd.includes('voice') || cmd.includes('catalog') || cmd.includes('लिस्टिंग')) {
        setActiveTab('voice');
        const response = lang === 'hi' ? 'आवाज से लिस्टिंग पेज खुल गया है।' : 'Opening Voice to Catalog.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('मूल्य') || cmd.includes('दाम') || cmd.includes('pricing') || cmd.includes('price')) {
        setActiveTab('pricing');
        const response = lang === 'hi' ? 'स्मार्ट मूल्य सहायक खुला है।' : 'Opening Dynamic Pricing Assistant.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('बिक्री') || cmd.includes('एनालिटिक्स') || cmd.includes('sales') || cmd.includes('analytics') || cmd.includes('report')) {
        setActiveTab('analytics');
        const response = lang === 'hi' ? 'आपकी बिक्री व एनालिटिक्स रिपोर्ट।' : 'Opening Sales & Analytics Dashboard.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('व्हाट्सएप') || cmd.includes('whatsapp') || cmd.includes('बॉट') || cmd.includes('bot')) {
        setActiveTab('whatsapp');
        const response = lang === 'hi' ? 'व्हाट्सएप बॉट सिमुलेटर खुल गया है।' : 'Opening WhatsApp Bot Simulator.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('सिंक') || cmd.includes('sync')) {
        triggerSync();
        const response = lang === 'hi' ? 'डेटा सिंक शुरू किया जा रहा है।' : 'Starting data synchronization.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else if (cmd.includes('होम') || cmd.includes('home') || cmd.includes('कैटलॉग') || cmd.includes('सूची') || cmd.includes('list')) {
        setActiveTab('artisan-home');
        const response = lang === 'hi' ? 'होम पेज पर वापस आ गए।' : 'Returning to Studio Home.';
        speechService.speak(response, lang);
        showToast(`🎙️ ${response}`, 'success');
        setAssistantReply(response);
      }
      else {
        // Conversational AI Assistant for Artisan
        try {
          showToast('🤔 AI सोचने में लगा है...', 'info');
          const aiData = await api.chatWithAssistant(cmd, lang, userRole);
          const replyText = aiData?.reply || (lang === 'hi' ? 'मैं आपकी बात समझ रहा हूँ।' : 'I understand your question.');
          setAssistantReply(replyText);
          speechService.speak(replyText, lang);
          showToast(`💬 ${replyText}`, 'info');
          if (aiData?.target_tab) {
            setActiveTab(aiData.target_tab);
          }
        } catch (err) {
          console.warn('[VoiceNavContext] Assistant chat fallback error:', err);
          const fallback = lang === 'hi' ? `आदेश प्राप्त हुआ: "${cmd}"` : `Command received: "${cmd}"`;
          speechService.speak(fallback, lang);
          setAssistantReply(fallback);
          showToast(`🎙️ ${fallback}`, 'info');
        }
      }
    }
  };


  const speakGuide = (text) => {
    speechService.speak(text, lang);
  };

  return (
    <VoiceNavContext.Provider
      value={{
        isListening,
        startVoiceNavigation,
        recognizedText,
        assistantReply,
        speakGuide
      }}
    >
      {children}
    </VoiceNavContext.Provider>
  );
};

export const useVoiceNav = () => useContext(VoiceNavContext);
