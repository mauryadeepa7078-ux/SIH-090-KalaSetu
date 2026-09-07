import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { getTranslation } from '../services/translations';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Globe, 
  Palette, 
  ShoppingBag, 
  Building2,
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Layers,
  FileCheck,
  Mic,
  MicOff,
  Edit3,
  RotateCcw,
  Check,
  Phone,
  MapPin,
  User,
  Mail,
  ChevronRight
} from 'lucide-react';

export const OnboardingModal = ({ isFullScreen = false }) => {
  const { 
    showOnboardingModal, 
    completeOnboarding, 
    lang, 
    setLang, 
    t 
  } = useApp();

  const [step, setStep] = useState(1); // 1 = Language, 2 = Role (3 options), 3 = Registration / Auth
  const [selectedLang, setSelectedLang] = useState(lang || 'hi');
  const [selectedRole, setSelectedRole] = useState('artisan'); // 'artisan' | 'buyer' | 'businessman'
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // All 15 Major Indian Languages with native script, phonetic English label, and regional tag
  const languages = [
    { code: 'hi', name: 'हिंदी', native: 'Hindi', badge: 'लोकप्रिय' },
    { code: 'en', name: 'English', native: 'English', badge: 'Global' },
    { code: 'bn', name: 'বাংলা', native: 'Bengali', badge: 'পূর্ব ভারত' },
    { code: 'mr', name: 'मराठी', native: 'Marathi', badge: 'पश्चिम' },
    { code: 'te', name: 'తెలుగు', native: 'Telugu', badge: 'దక్షిణ' },
    { code: 'ta', name: 'தமிழ்', native: 'Tamil', badge: 'தெற்கு' },
    { code: 'gu', name: 'ગુજરાતી', native: 'Gujarati', badge: 'પશ્ચિમ' },
    { code: 'ur', name: 'اردو', native: 'Urdu', badge: 'شمالی' },
    { code: 'kn', name: 'ಕನ್ನಡ', native: 'Kannada', badge: 'ದಕ್ಷಿಣ' },
    { code: 'or', name: 'ଓଡ଼ିଆ', native: 'Odia', badge: 'ପୂର୍ବ' },
    { code: 'ml', name: 'മലയാളം', native: 'Malayalam', badge: 'തെക്ക്' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', native: 'Punjabi', badge: 'ਉੱਤਰ' },
    { code: 'as', name: 'অসমীয়া', native: 'Assamese', badge: 'উত্তৰ-পূব' },
    { code: 'mai', name: 'मैथिली', native: 'Maithili', badge: 'मिथिला' },
    { code: 'bho', name: 'भोजपुरी', native: 'Bhojpuri', badge: 'पूर्वांचल' }
  ];

  // Step 1: Speak Hindi greeting automatically on mount
  useEffect(() => {
    if (showOnboardingModal && step === 1) {
      const greeting = "नमस्ते! शिल्पसेतु में आपका स्वागत है। आप किस भाषा में बात करना पसंद करेंगे?";
      const timer = setTimeout(() => {
        try {
          speechService.speak(greeting, 'hi');
          setIsAudioPlaying(true);
        } catch (e) {
          console.warn('[OnboardingModal] Speech synthesis auto-greeting skipped:', e);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showOnboardingModal, step]);

  // Handle Language Selection (FIX 1: Immediate state update, speech prompt in selected language & transition to Step 2)
  const handleLanguageSelect = (langCode) => {
    console.log('[OnboardingModal] Language selected:', langCode);
    setSelectedLang(langCode);
    setLang(langCode);
    setStep(2);

    // Prompt user in selected language for 3 roles
    const rolePrompt = getTranslation(langCode, 'onboarding3RolePrompt') || 
      "नमस्ते! क्या आप कारीगर/विक्रेता हैं, व्यक्तिगत खरीदार हैं, या थोक व्यापारी हैं?";

    setTimeout(() => {
      speechService.speak(rolePrompt, langCode);
      setIsAudioPlaying(true);
    }, 200);
  };

  // Step 2: Role selection -> Transition to Step 3 Registration
  const handleRoleSelect = (role) => {
    console.log('[OnboardingModal] Role selected:', role);
    setSelectedRole(role);
    setStep(3);

    let promptText = "";
    if (role === 'artisan') {
      promptText = getTranslation(selectedLang, 'voiceRegStepName') || 
        "नमस्ते कारीगर साथी! आपका पूरा नाम क्या है? बोलकर बताइए।";
    } else if (role === 'businessman') {
      promptText = selectedLang === 'hi' || selectedLang === 'bho' || selectedLang === 'mai'
        ? "संस्थागत व्यापारी व GeM खरीद पंजीकरण। कृपया अपनी कंपनी या संस्था का विवरण दर्ज करें।"
        : "Institutional Businessman & GeM Procurement registration. Please enter your enterprise details.";
    } else {
      promptText = selectedLang === 'hi' || selectedLang === 'bho' || selectedLang === 'mai'
        ? "खरीदार पंजीकरण। कृपया अपनी डिलीवरी प्रोफ़ाइल दर्ज करें।"
        : "Retail Buyer registration. Please complete your delivery profile.";
    }

    setTimeout(() => {
      speechService.speak(promptText, selectedLang);
      setIsAudioPlaying(true);
    }, 250);
  };

  // Form State for Login / Register
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'

  // Artisan Form Data
  const [artisanForm, setArtisanForm] = useState({
    name: 'Master Ram Das Bunkar',
    craft_type: 'Handloom Pure Silk Weaving',
    village: 'Kotwa, Varanasi',
    state: 'Uttar Pradesh',
    phone: '+91 98765 43210',
    scheme_id: 'MoSJE-VISH-2026-UP-091'
  });

  // Buyer Form Data
  const [buyerForm, setBuyerForm] = useState({
    name: 'Priya Sharma',
    phone: '+91 98112 34567',
    email: 'priya.sharma@heritagecraft.in',
    location: '124 Connaught Place, Central Delhi, New Delhi',
    pincode: '110001',
    buyer_type: 'Individual Heritage Collector'
  });

  // Businessman Form Data
  const [businessmanForm, setBusinessmanForm] = useState({
    name: 'Rajesh Singhal',
    company: 'Singhal Crafts Export & Retailers Pvt Ltd',
    phone: '+91 98200 11223',
    email: 'procurement@singhalcrafts.com',
    gstin: '07AAAAA0000A1Z5',
    gem_org_id: 'GEM-DL-2026-9912',
    procurement_type: 'B2B Wholesale & Government GeM Tenders',
    city: 'New Delhi / Global Exporter'
  });

  // =========================================================================
  // FIX 2: INTERACTIVE VOICE-ASSISTED REGISTRATION FOR ARTISANS
  // =========================================================================
  const [artisanVoiceIndex, setArtisanVoiceIndex] = useState(0); // 0: Name, 1: Craft, 2: Location, 3: Phone, 4: Confirm
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [liveVoiceTranscript, setLiveVoiceTranscript] = useState('');
  const activeRecognizerRef = useRef(null);

  const artisanQuestions = [
    {
      key: 'name',
      label: selectedLang === 'hi' ? 'कारीगर का पूरा नाम' : 'Full Name',
      speechPrompt: getTranslation(selectedLang, 'voiceRegStepName') || "आपका पूरा नाम क्या है? बोलकर बताइए।",
      hint: "उदा. 'मास्टर रामदास बुनकर' / 'Master Ram Das'",
      icon: User
    },
    {
      key: 'craft_type',
      label: selectedLang === 'hi' ? 'मुख्य शिल्प / हस्तकला' : 'Primary Craft Type',
      speechPrompt: getTranslation(selectedLang, 'voiceRegStepCraft') || "आप कौन सा शिल्प या हस्तकला बनाते हैं?",
      hint: "उदा. 'बनारसी रेशम बुनाई', 'खुर्जा पॉटरी', 'मधुबनी पेंटिंग'",
      icon: Palette
    },
    {
      key: 'village',
      label: selectedLang === 'hi' ? 'गाँव / क्लस्टर और राज्य' : 'Village / Cluster & State',
      speechPrompt: getTranslation(selectedLang, 'voiceRegStepLocation') || "आपका गाँव, शहर और राज्य कौन सा है?",
      hint: "उदा. 'कोटवा, वाराणसी, उत्तर प्रदेश'",
      icon: MapPin
    },
    {
      key: 'phone',
      label: selectedLang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number',
      speechPrompt: getTranslation(selectedLang, 'voiceRegStepPhone') || "आपका मोबाइल नंबर क्या है?",
      hint: "उदा. '9876543210'",
      icon: Phone
    }
  ];

  // Stop current active speech recognition
  const stopVoiceListening = () => {
    if (activeRecognizerRef.current) {
      try {
        activeRecognizerRef.current.stop();
      } catch (e) {}
      activeRecognizerRef.current = null;
    }
    setIsVoiceListening(false);
  };

  // Start voice listening for active question
  const startVoiceQuestion = (index) => {
    stopVoiceListening();
    setArtisanVoiceIndex(index);
    setLiveVoiceTranscript('');

    const currentQ = artisanQuestions[index];
    if (!currentQ) return;

    // 1. Speak the question prompt
    speechService.speak(currentQ.speechPrompt, selectedLang);
    setIsAudioPlaying(true);

    // 2. Initialize speech recognition after brief speech prompt window
    setTimeout(async () => {
      try {
        await speechService.requestMicrophonePermission();
        const speechCode = speechService.resolveLanguageCode(selectedLang);
        
        const recognizer = speechService.createRecognizer(
          speechCode,
          (res) => {
            const captured = res.current || '';
            setLiveVoiceTranscript(captured);
            // Auto-fill active artisan form field in real time
            setArtisanForm(prev => ({
              ...prev,
              [currentQ.key]: captured
            }));
          },
          (err) => {
            console.warn('[OnboardingModal VoiceReg] STT error:', err);
            setIsVoiceListening(false);
          },
          (finalText) => {
            if (finalText && finalText.trim()) {
              setArtisanForm(prev => ({
                ...prev,
                [currentQ.key]: finalText.trim()
              }));
            }
            setIsVoiceListening(false);
          },
          () => {
            setIsVoiceListening(true);
          }
        );

        if (recognizer) {
          recognizer.start();
          activeRecognizerRef.current = recognizer;
        }
      } catch (e) {
        console.warn('[OnboardingModal VoiceReg] Microphone start error:', e);
      }
    }, 1200);
  };

  // Move to next voice question or final confirmation
  const handleNextVoiceQuestion = () => {
    stopVoiceListening();
    if (artisanVoiceIndex < artisanQuestions.length - 1) {
      const nextIdx = artisanVoiceIndex + 1;
      startVoiceQuestion(nextIdx);
    } else {
      // Reached all questions -> Final confirmation step
      setArtisanVoiceIndex(4);
      const confirmSpeech = getTranslation(selectedLang, 'voiceRegConfirm') || 
        "बहुत बढ़िया! मैं आपकी कारीगर प्रोफ़ाइल सहेज रही हूँ, क्या यह सही है?";
      speechService.speak(confirmSpeech, selectedLang);
    }
  };

  // Optional Voice Input helper for Buyer & Businessman fields
  const [activeRecordingField, setActiveRecordingField] = useState(null);
  const handleGenericFieldVoice = async (fieldKey, setFormFn) => {
    if (activeRecordingField === fieldKey) {
      stopVoiceListening();
      setActiveRecordingField(null);
      return;
    }
    stopVoiceListening();
    setActiveRecordingField(fieldKey);

    try {
      await speechService.requestMicrophonePermission();
      const speechCode = speechService.resolveLanguageCode(selectedLang);
      const recognizer = speechService.createRecognizer(
        speechCode,
        (res) => {
          setFormFn(prev => ({ ...prev, [fieldKey]: res.current }));
        },
        () => setActiveRecordingField(null),
        () => setActiveRecordingField(null),
        () => setIsVoiceListening(true)
      );
      if (recognizer) {
        recognizer.start();
        activeRecognizerRef.current = recognizer;
      }
    } catch (e) {
      setActiveRecordingField(null);
    }
  };

  // Complete Onboarding & Save
  const handleFinish = (roleOverride) => {
    stopVoiceListening();
    const finalRole = roleOverride || selectedRole;
    let userDetails = null;

    if (finalRole === 'artisan') {
      userDetails = {
        name: artisanForm.name || 'Master Ram Das Bunkar',
        phone: artisanForm.phone || '+91 98765 43210',
        role: 'artisan',
        craft_type: artisanForm.craft_type || 'Handloom Pure Silk Weaving',
        location: `${artisanForm.village || 'Kotwa, Varanasi'}, ${artisanForm.state || 'Uttar Pradesh'}`,
        scheme_id: artisanForm.scheme_id || 'MoSJE-VISH-2026-UP-091'
      };
    } else if (finalRole === 'businessman') {
      userDetails = {
        name: businessmanForm.name || 'Rajesh Singhal',
        company: businessmanForm.company || 'Singhal Crafts Export & Retailers Pvt Ltd',
        phone: businessmanForm.phone || '+91 98200 11223',
        email: businessmanForm.email || 'procurement@singhalcrafts.com',
        gstin: businessmanForm.gstin || '07AAAAA0000A1Z5',
        gem_org_id: businessmanForm.gem_org_id || 'GEM-DL-2026-9912',
        role: 'businessman',
        location: businessmanForm.city || 'New Delhi / Global Exporter',
        procurement_type: businessmanForm.procurement_type || 'B2B Wholesale & Government GeM Tenders'
      };
    } else {
      userDetails = {
        name: buyerForm.name || 'Priya Sharma',
        phone: buyerForm.phone || '+91 98112 34567',
        email: buyerForm.email || 'priya.sharma@heritagecraft.in',
        role: 'buyer',
        location: `${buyerForm.location || '124 Connaught Place, Central Delhi'} - ${buyerForm.pincode || '110001'}`,
        buyer_type: buyerForm.buyer_type || 'Individual Heritage Collector'
      };
    }

    completeOnboarding(finalRole, selectedLang, userDetails);
  };

  const handleDemoInstantLogin = (role) => {
    stopVoiceListening();
    handleFinish(role);
  };

  const replayAudio = () => {
    if (step === 1) {
      speechService.speak("नमस्ते! शिल्पसेतु में आपका स्वागत है। आप किस भाषा में बात करना पसंद करेंगे?", 'hi');
    } else if (step === 2) {
      const promptText = getTranslation(selectedLang, 'onboarding3RolePrompt') || 
        "नमस्ते! क्या आप कारीगर/विक्रेता हैं, व्यक्तिगत खरीदार हैं, या थोक व्यापारी हैं?";
      speechService.speak(promptText, selectedLang);
    } else {
      if (selectedRole === 'artisan') {
        if (artisanVoiceIndex < 4) {
          speechService.speak(artisanQuestions[artisanVoiceIndex].speechPrompt, selectedLang);
        } else {
          speechService.speak(getTranslation(selectedLang, 'voiceRegConfirm') || "बहुत बढ़िया! मैं आपकी कारीगर प्रोफ़ाइल सहेज रही हूँ, क्या यह सही है?", selectedLang);
        }
      } else if (selectedRole === 'businessman') {
        speechService.speak(selectedLang === 'hi' ? "संस्थागत व्यापारी व GeM खरीद खाता प्रमाणीकरण।" : "Institutional Businessman and GeM procurement authentication.", selectedLang);
      } else {
        speechService.speak(selectedLang === 'hi' ? "खरीदार खाता सत्यापन। कृपया अपना विवरण दर्ज करें।" : "Buyer authentication. Please enter your profile details.", selectedLang);
      }
    }
  };

  // Cleanup recognizers on unmount
  useEffect(() => {
    return () => {
      stopVoiceListening();
    };
  }, []);

  if (!isFullScreen && !showOnboardingModal) return null;

  return (
    <div className={
      isFullScreen 
        ? "min-h-screen bg-stone-950 flex items-center justify-center p-3 sm:p-6 text-stone-100 animate-fade-in relative"
        : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    }>
      <div className="bg-stone-900 border border-stone-700 w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl relative text-stone-100 flex flex-col max-h-[92vh]">
        {/* Top Header Glow */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 p-4 sm:p-6 text-stone-950 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-2xl bg-stone-950 text-orange-400 shadow-md">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-black/20 text-stone-950">
                  SIH 2026 • MoSJE SIH26090
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-stone-950 mt-0.5 font-hindi">
                  KalaSetu (कलासेतु)
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Audio Replay Button */}
              <button
                onClick={replayAudio}
                className="p-2.5 rounded-full bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 transition-colors flex items-center space-x-1 text-xs font-bold"
                title="Replay Voice Prompt"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </button>

              {/* Close Button (Only in modal overlay mode) */}
              {!isFullScreen && (
                <button
                  onClick={() => handleDemoInstantLogin('artisan')}
                  className="p-2.5 rounded-full bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 transition-colors flex items-center justify-center text-xs font-bold"
                  title="Close Modal"
                >
                  <span className="text-sm font-bold leading-none">✕</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-stone-900 leading-relaxed truncate">
              {step === 1 && "Select Preferred Language / अपनी भाषा चुनें (15 Indian Languages)"}
              {step === 2 && (selectedLang === 'hi' ? 'अपनी भूमिका चुनें (कारीगर, खरीदार, या व्यापारी)' : 'Select Your Role (Artisan, Buyer, or Businessman)')}
              {step === 3 && (selectedRole === 'artisan' 
                ? 'Artisan Voice-Assisted Registration (आवाज से पंजीकरण)'
                : selectedRole === 'businessman'
                ? 'Institutional Businessman & GeM Procurement'
                : 'Buyer Profile Registration')}
            </p>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-950/30 text-stone-950 shrink-0">
              Step {step} of 3
            </span>
          </div>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* STEP 1: ALL 15 INDIAN LANGUAGES SELECTION */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Voice Speech Bubble */}
              <div className="p-3.5 rounded-2xl bg-orange-950/60 border border-orange-600/40 flex items-start space-x-3 text-orange-200">
                <div className="p-2 rounded-xl bg-orange-600 text-white shrink-0">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 block">AI Voice Assistant:</span>
                  <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                    "नमस्ते! आप किस भाषा में बात करना पसंद करेंगे?"
                  </p>
                  <p className="text-[11px] text-orange-300">
                    "Tap your native language to proceed with interactive voice assistance"
                  </p>
                </div>
              </div>

              {/* 15 Language Selection Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-400" />
                    <span>अपनी भाषा चुनें / Select Language</span>
                  </label>
                  <span className="text-[10px] font-bold text-orange-400 px-2 py-0.5 bg-orange-950/60 border border-orange-800 rounded-full">
                    15 Indian Languages
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => handleLanguageSelect(item.code)}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex items-center justify-between group min-h-[52px] ${
                        selectedLang === item.code
                          ? 'bg-orange-600 border-orange-500 text-white font-extrabold shadow-lg shadow-orange-900/40 scale-[1.02]'
                          : 'bg-stone-800/90 border-stone-700 text-stone-200 hover:bg-stone-750 hover:border-orange-500/60'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <div className="text-sm font-bold group-hover:scale-105 transition-transform truncate">
                          {item.name}
                        </div>
                        <div className={`text-[10px] truncate ${selectedLang === item.code ? 'text-orange-100 font-medium' : 'text-stone-400'}`}>
                          {item.native}
                        </div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                        selectedLang === item.code ? 'bg-white/25 text-white' : 'bg-stone-700/80 text-stone-300'
                      }`}>
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 3-ROLE SELECTION (ARTISAN, BUYER, BUSINESSMAN) */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* Voice Speech Bubble */}
              <div className="p-3.5 rounded-2xl bg-orange-950/60 border border-orange-600/40 flex items-start space-x-3 text-orange-200">
                <div className="p-2 rounded-xl bg-orange-600 text-white shrink-0">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 block">AI Voice Assistant:</span>
                  <p className="text-xs sm:text-sm font-semibold text-white mt-0.5 font-sans">
                    "{getTranslation(selectedLang, 'onboarding3RolePrompt') || 
                      "नमस्ते! क्या आप कारीगर/विक्रेता हैं, व्यक्तिगत खरीदार हैं, या थोक व्यापारी हैं?"}"
                  </p>
                </div>
              </div>

              {/* 3 Role Selection Cards */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                  {selectedLang === 'hi' ? 'अपनी उपयुक्त भूमिका चुनें' : 'Select Your Role & Portal'}
                </label>

                {/* Role 1: Artisan / Seller */}
                <button
                  onClick={() => handleRoleSelect('artisan')}
                  className="w-full p-3.5 sm:p-4 rounded-2xl border-2 border-orange-500/80 bg-gradient-to-r from-orange-950/60 via-stone-850 to-stone-800 text-left transition-all hover:scale-[1.01] hover:border-orange-400 shadow-xl group min-h-[72px]"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-2xl bg-orange-600 text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
                      <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-black text-white font-hindi">
                          {getTranslation(selectedLang, 'roleArtisan') || 'कारीगर / विक्रेता (Artisan & Seller)'}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold shrink-0">
                          AI Studio
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-300 mt-0.5 leading-relaxed">
                        {getTranslation(selectedLang, 'roleArtisanDesc') || 'मुझे अपने हस्तशिल्प की फोटो लेकर, बोलकर AI कैटलॉग और उचित मूल्य तय करना है।'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Role 2: Individual Buyer */}
                <button
                  onClick={() => handleRoleSelect('buyer')}
                  className="w-full p-3.5 sm:p-4 rounded-2xl border border-stone-700 bg-stone-800/80 hover:bg-stone-800 hover:border-amber-500/80 text-left transition-all hover:scale-[1.01] shadow-lg group min-h-[72px]"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-2xl bg-amber-600/90 text-stone-950 group-hover:bg-amber-500 transition-colors shrink-0">
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {getTranslation(selectedLang, 'roleBuyer') || 'व्यक्तिगत खरीदार (Retail Buyer)'}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold shrink-0">
                          Marketplace
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 leading-relaxed">
                        {getTranslation(selectedLang, 'roleBuyerDesc') || 'मुझे कारीगरों से सीधे प्रामाणिक, GI-प्रमाणित हस्तशिल्प और कलाकृतियाँ खरीदनी हैं।'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Role 3: Businessman / B2B Procurement */}
                <button
                  onClick={() => handleRoleSelect('businessman')}
                  className="w-full p-3.5 sm:p-4 rounded-2xl border border-blue-600/60 bg-gradient-to-r from-blue-950/40 via-stone-850 to-stone-800 hover:bg-stone-800 hover:border-blue-500 text-left transition-all hover:scale-[1.01] shadow-lg group min-h-[72px]"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-2xl bg-blue-600 text-white group-hover:bg-blue-500 transition-colors shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          {getTranslation(selectedLang, 'roleBusinessman') || 'थोक व्यापारी / GeM B2B (Businessman)'}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold shrink-0">
                          GeM & ONDC
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 leading-relaxed">
                        {getTranslation(selectedLang, 'roleBusinessmanDesc') || 'मुझे GeM व ONDC के माध्यम से थोक खरीद, संस्थागत टेंडर और सीधे कारीगर क्लस्टर से सोर्सिंग करनी है।'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Back to Step 1 */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-400 hover:text-white font-semibold underline"
                >
                  ← {selectedLang === 'hi' ? 'भाषा बदलें (Change Language)' : 'Change Language'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REGISTRATION & LOGIN SCREEN (COMBINED AUTH) */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Segmented Auth Mode Switcher (Register vs Login) */}
              <div className="flex rounded-2xl bg-stone-800 p-1 border border-stone-700">
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceListening();
                    setAuthMode('register');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                    authMode === 'register'
                      ? selectedRole === 'artisan'
                        ? 'bg-orange-600 text-white shadow-md'
                        : selectedRole === 'businessman'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-amber-600 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span>📝 {selectedLang === 'hi' ? 'नया खाता बनाएँ (Register)' : 'New User? Register'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceListening();
                    setAuthMode('login');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                    authMode === 'login'
                      ? selectedRole === 'artisan'
                        ? 'bg-orange-600 text-white shadow-md'
                        : selectedRole === 'businessman'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-amber-600 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span>🔑 {selectedLang === 'hi' ? 'पहले से खाता है? लॉगिन करें (Log In)' : 'Already Registered? Log In'}</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* RETURNING USER LOGIN TAB */}
              {/* ========================================================================= */}
              {authMode === 'login' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-stone-850 border border-stone-700/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                      {selectedLang === 'hi' ? 'त्वरित 1-टैप प्रोफाइल चयन (Quick Returning Account)' : 'Select Your Registered Profile (1-Tap Fast Login)'}
                    </span>

                    {/* Returning Profiles List for Selected Role */}
                    {selectedRole === 'artisan' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            completeOnboarding('artisan', selectedLang, {
                              name: 'Master Ram Das Bunkar',
                              phone: '+91 98765 43210',
                              role: 'artisan',
                              craft_type: 'Handloom Pure Silk Weaving',
                              location: 'Kotwa, Varanasi, Uttar Pradesh',
                              scheme_id: 'MoSJE-VISH-2026-UP-091'
                            });
                          }}
                          className="w-full p-3 rounded-2xl bg-stone-800 hover:bg-orange-950/60 border border-stone-700 hover:border-orange-500/80 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center">
                              RB
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white font-hindi">Master Ram Das Bunkar</h4>
                              <p className="text-[11px] text-stone-400">Handloom Silk • Kotwa, Varanasi • MoSJE-UP-091</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                            Login ➔
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            completeOnboarding('artisan', selectedLang, {
                              name: 'Sita Devi',
                              phone: '+91 98765 43211',
                              role: 'artisan',
                              craft_type: 'Madhubani Painting',
                              location: 'Ranti, Madhubani, Bihar',
                              scheme_id: 'MoSJE-VISH-2026-BR-118'
                            });
                          }}
                          className="w-full p-3 rounded-2xl bg-stone-800 hover:bg-orange-950/60 border border-stone-700 hover:border-orange-500/80 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 font-bold flex items-center justify-center">
                              SD
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white font-hindi">Sita Devi</h4>
                              <p className="text-[11px] text-stone-400">Mithila Folk Painting • Ranti, Bihar • MoSJE-BR-118</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
                            Login ➔
                          </span>
                        </button>
                      </div>
                    )}

                    {selectedRole === 'buyer' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            completeOnboarding('buyer', selectedLang, {
                              name: 'Priya Sharma',
                              phone: '+91 98112 34567',
                              email: 'priya.sharma@heritagecraft.in',
                              role: 'buyer',
                              location: '124 Connaught Place, Central Delhi, New Delhi - 110001',
                              buyer_type: 'Individual Heritage Collector'
                            });
                          }}
                          className="w-full p-3 rounded-2xl bg-stone-800 hover:bg-amber-950/60 border border-stone-700 hover:border-amber-500/80 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 font-bold flex items-center justify-center">
                              PS
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white">Priya Sharma</h4>
                              <p className="text-[11px] text-stone-400">Retail Buyer • Central Delhi - 110001</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                            Login ➔
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            completeOnboarding('buyer', selectedLang, {
                              name: 'Ananya Roy',
                              phone: '+91 98300 45678',
                              email: 'ananya.roy@craftart.in',
                              role: 'buyer',
                              location: 'Heritage Enclave, Salt Lake City, Kolkata - 700091',
                              buyer_type: 'Heritage Connoisseur'
                            });
                          }}
                          className="w-full p-3 rounded-2xl bg-stone-800 hover:bg-amber-950/60 border border-stone-700 hover:border-amber-500/80 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center">
                              AR
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white">Ananya Roy</h4>
                              <p className="text-[11px] text-stone-400">Retail Buyer • Salt Lake, Kolkata - 700091</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                            Login ➔
                          </span>
                        </button>
                      </div>
                    )}

                    {selectedRole === 'businessman' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            completeOnboarding('businessman', selectedLang, {
                              name: 'Rajesh Singhal',
                              company: 'Singhal Crafts Export & Retailers Pvt Ltd',
                              phone: '+91 98200 11223',
                              email: 'procurement@singhalcrafts.com',
                              gstin: '07AAAAA0000A1Z5',
                              gem_org_id: 'GEM-DL-2026-9912',
                              role: 'businessman',
                              location: 'New Delhi / Global Exporter',
                              procurement_type: 'B2B Wholesale & Government GeM Tenders'
                            });
                          }}
                          className="w-full p-3 rounded-2xl bg-stone-800 hover:bg-blue-950/60 border border-stone-700 hover:border-blue-500/80 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center">
                              RS
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white">Rajesh Singhal (Singhal Exports)</h4>
                              <p className="text-[11px] text-stone-400">GSTIN: 07AAAAA0000A1Z5 • GeM ID: GEM-DL-2026</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                            Login ➔
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Direct Phone / ID Sign-In */}
                  <div className="space-y-2.5 p-4 rounded-2xl bg-stone-850 border border-stone-700">
                    <label className="text-xs font-bold text-stone-300 block">
                      {selectedLang === 'hi' 
                        ? (selectedRole === 'artisan' ? 'पंजीकृत मोबाइल नंबर या विश्वकर्मा ID से लॉगिन करें:' : 'पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें:') 
                        : 'Or Log In with Registered Phone / ID:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={selectedRole === 'artisan' ? '+91 98765 43210' : (selectedRole === 'businessman' ? '07AAAAA0000A1Z5' : '+91 98112 34567')}
                        defaultValue={selectedRole === 'artisan' ? artisanForm.phone : (selectedRole === 'businessman' ? businessmanForm.phone : buyerForm.phone)}
                        className="flex-1 p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                      <button
                        onClick={() => handleDemoInstantLogin(selectedRole)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md ${
                          selectedRole === 'artisan' ? 'bg-orange-600 hover:bg-orange-500 text-white' :
                          selectedRole === 'businessman' ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                          'bg-amber-600 hover:bg-amber-500 text-stone-950'
                        }`}
                      >
                        {selectedLang === 'hi' ? 'लॉगिन ➔' : 'Sign In ➔'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* NEW USER REGISTRATION TAB */}
              {/* ========================================================================= */}
              {authMode === 'register' && (
                <div className="space-y-4">
                  {/* 1-Click Instant Demo Credentials Button */}
                  <button
                    onClick={() => handleDemoInstantLogin(selectedRole)}
                    className={`w-full p-3 rounded-2xl border text-xs font-black flex items-center justify-center space-x-2 shadow-sm transition-all ${
                      selectedRole === 'artisan'
                        ? 'bg-orange-500/15 border-orange-500/40 hover:bg-orange-500/25 text-orange-300'
                        : selectedRole === 'businessman'
                        ? 'bg-blue-500/15 border-blue-500/40 hover:bg-blue-500/25 text-blue-300'
                        : 'bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25 text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>
                      {selectedRole === 'artisan'
                        ? '⚡ 1-Click Instant Demo Artisan Login (Master Bunkar)'
                        : selectedRole === 'businessman'
                        ? '⚡ 1-Click Instant Demo Businessman Login (Singhal Exports)'
                        : '⚡ 1-Click Instant Demo Buyer Login (Priya Sharma)'}
                    </span>
                  </button>

                  {/* ========================================================================= */}
                  {/* ARTISAN VOICE-FIRST AUTO-FILL REGISTRATION */}
                  {/* ========================================================================= */}
                  {selectedRole === 'artisan' && (
                    <div className="space-y-4">
                  
                  {/* Interactive Voice Assistant Question Box */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-orange-950/80 via-stone-850 to-stone-900 border-2 border-orange-500/60 shadow-xl relative overflow-hidden">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-2xl bg-orange-600 text-white shrink-0 shadow-md animate-pulse">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                            {artisanVoiceIndex < 4 
                              ? `AI Voice Question (${artisanVoiceIndex + 1} of 4)` 
                              : 'AI Profile Confirmation'}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                            Voice Auto-Fill
                          </span>
                        </div>

                        {/* Current Voice Question Prompt */}
                        <p className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                          {artisanVoiceIndex < 4 
                            ? artisanQuestions[artisanVoiceIndex].speechPrompt 
                            : (getTranslation(selectedLang, 'voiceRegConfirm') || "बहुत बढ़िया! मैं आपकी कारीगर प्रोफ़ाइल सहेज रही हूँ, क्या यह सही है?")}
                        </p>

                        {/* Speech hint */}
                        <p className="text-[11px] text-stone-300 mt-1">
                          {artisanVoiceIndex < 4 
                            ? artisanQuestions[artisanVoiceIndex].hint 
                            : "नीचे सभी विवरण देख कर पुष्टि करें और AI स्टूडियो में प्रवेश करें।"}
                        </p>
                      </div>
                    </div>

                    {/* Live Voice Wave & Mic Action Bar */}
                    <div className="mt-3.5 pt-3 border-t border-orange-500/30 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (isVoiceListening) {
                            stopVoiceListening();
                          } else {
                            if (artisanVoiceIndex < 4) startVoiceQuestion(artisanVoiceIndex);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md ${
                          isVoiceListening 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-orange-600 hover:bg-orange-500 text-white'
                        }`}
                      >
                        {isVoiceListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                        <span>{isVoiceListening ? 'सुन रहे हैं... (Listening)' : '🎙️ बोलकर बताएं (Speak Answer)'}</span>
                      </button>

                      {artisanVoiceIndex < 4 ? (
                        <button
                          onClick={handleNextVoiceQuestion}
                          className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-orange-300 border border-stone-600 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                        >
                          <span>{selectedLang === 'hi' ? 'अगला सवाल' : 'Next'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setArtisanVoiceIndex(0)}
                          className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>पुनः बोलें</span>
                        </button>
                      )}
                    </div>

                    {/* Live speech transcription ticker */}
                    {liveVoiceTranscript && (
                      <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-orange-500/40 text-[11px] text-orange-200 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <span className="truncate">"{liveVoiceTranscript}"</span>
                      </div>
                    )}
                  </div>

                  {/* Real-time Captured Profile Fields (Visual Auto-Filled Cards) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                        {selectedLang === 'hi' ? 'आपकी कारीगर प्रोफ़ाइल (स्वतः भरी जा रही है)' : 'Your Artisan Profile (Auto-Filling by Voice)'}
                      </label>
                      <span className="text-[10px] text-stone-400">टैप करके संपादित भी कर सकते हैं</span>
                    </div>

                    {/* 1. Full Name Field Card */}
                    <div 
                      onClick={() => setArtisanVoiceIndex(0)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        artisanVoiceIndex === 0 
                          ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500/50' 
                          : 'bg-stone-800/80 border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">पूरा नाम (Full Name)</span>
                          <input
                            type="text"
                            value={artisanForm.name}
                            onChange={(e) => setArtisanForm({ ...artisanForm, name: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startVoiceQuestion(0); }}
                        className="p-2 rounded-xl bg-stone-700 hover:bg-orange-600 text-stone-200 hover:text-white transition-colors"
                        title="Speak Name"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 2. Craft Type Field Card */}
                    <div 
                      onClick={() => setArtisanVoiceIndex(1)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        artisanVoiceIndex === 1 
                          ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500/50' 
                          : 'bg-stone-800/80 border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 shrink-0">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">शिल्प श्रेणी (Craft Type)</span>
                          <input
                            type="text"
                            value={artisanForm.craft_type}
                            onChange={(e) => setArtisanForm({ ...artisanForm, craft_type: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startVoiceQuestion(1); }}
                        className="p-2 rounded-xl bg-stone-700 hover:bg-orange-600 text-stone-200 hover:text-white transition-colors"
                        title="Speak Craft"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 3. Location Field Card */}
                    <div 
                      onClick={() => setArtisanVoiceIndex(2)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        artisanVoiceIndex === 2 
                          ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500/50' 
                          : 'bg-stone-800/80 border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">स्थान / गाँव (Location / Village)</span>
                          <input
                            type="text"
                            value={artisanForm.village}
                            onChange={(e) => setArtisanForm({ ...artisanForm, village: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startVoiceQuestion(2); }}
                        className="p-2 rounded-xl bg-stone-700 hover:bg-orange-600 text-stone-200 hover:text-white transition-colors"
                        title="Speak Location"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 4. Phone Field Card */}
                    <div 
                      onClick={() => setArtisanVoiceIndex(3)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        artisanVoiceIndex === 3 
                          ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500/50' 
                          : 'bg-stone-800/80 border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                        <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">मोबाइल नंबर (Phone)</span>
                          <input
                            type="text"
                            value={artisanForm.phone}
                            onChange={(e) => setArtisanForm({ ...artisanForm, phone: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none border-b border-transparent focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startVoiceQuestion(3); }}
                        className="p-2 rounded-xl bg-stone-700 hover:bg-orange-600 text-stone-200 hover:text-white transition-colors"
                        title="Speak Phone"
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* MoSJE Verified ID Badge Card */}
                    <div className="p-3 rounded-2xl bg-orange-950/30 border border-orange-600/40 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-orange-300">
                        <ShieldCheck className="w-4 h-4 text-orange-400" />
                        <span className="font-bold">MoSJE Pehchan Card / Vishwakarma ID:</span>
                      </div>
                      <span className="font-mono text-orange-400 font-bold bg-orange-900/60 px-2 py-0.5 rounded border border-orange-700">
                        {artisanForm.scheme_id}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* BUYER STANDARD REGISTRATION FORM */}
              {/* ========================================================================= */}
              {selectedRole === 'buyer' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300 block">
                      {selectedLang === 'hi' ? 'खरीदार का नाम' : 'Buyer Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={buyerForm.name}
                        onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        className="w-full p-2.5 pr-10 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                      />
                      <button 
                        onClick={() => handleGenericFieldVoice('name', setBuyerForm)}
                        className={`absolute right-2 top-2 p-1.5 rounded-lg ${activeRecordingField === 'name' ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-700 text-stone-300 hover:text-white'}`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300 block">
                        {selectedLang === 'hi' ? 'ईमेल' : 'Email Address'}
                      </label>
                      <input
                        type="text"
                        value={buyerForm.email}
                        onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300 block">
                        {selectedLang === 'hi' ? 'पिनकोड' : 'Pincode'}
                      </label>
                      <input
                        type="text"
                        value={buyerForm.pincode}
                        onChange={(e) => setBuyerForm({ ...buyerForm, pincode: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300 block">
                      {selectedLang === 'hi' ? 'डिलीवरी का पता (Shipping Address)' : 'Delivery Address'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={buyerForm.location}
                        onChange={(e) => setBuyerForm({ ...buyerForm, location: e.target.value })}
                        placeholder="Street, City, Landmark"
                        className="w-full p-2.5 pr-10 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                      />
                      <button 
                        onClick={() => handleGenericFieldVoice('location', setBuyerForm)}
                        className={`absolute right-2 top-2 p-1.5 rounded-lg ${activeRecordingField === 'location' ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-700 text-stone-300 hover:text-white'}`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* BUSINESSMAN STANDARD REGISTRATION FORM */}
              {/* ========================================================================= */}
              {selectedRole === 'businessman' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300 block">
                        {selectedLang === 'hi' ? 'अधिकारी / व्यापारी नाम' : 'Representative Name'}
                      </label>
                      <input
                        type="text"
                        value={businessmanForm.name}
                        onChange={(e) => setBusinessmanForm({ ...businessmanForm, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300 block">
                        {selectedLang === 'hi' ? 'कंपनी / संस्था का नाम' : 'Company / Enterprise'}
                      </label>
                      <input
                        type="text"
                        value={businessmanForm.company}
                        onChange={(e) => setBusinessmanForm({ ...businessmanForm, company: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300 block">
                        {selectedLang === 'hi' ? 'GSTIN नंबर' : 'GSTIN Registration'}
                      </label>
                      <input
                        type="text"
                        value={businessmanForm.gstin}
                        onChange={(e) => setBusinessmanForm({ ...businessmanForm, gstin: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-blue-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-300 block">
                        {selectedLang === 'hi' ? 'GeM / ONDC खरीदार ID' : 'GeM / ONDC Buyer ID'}
                      </label>
                      <input
                        type="text"
                        value={businessmanForm.gem_org_id}
                        onChange={(e) => setBusinessmanForm({ ...businessmanForm, gem_org_id: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-blue-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300 block">
                      {selectedLang === 'hi' ? 'थोक सोर्सिंग दायरा (Procurement Scope)' : 'Procurement Scope & Category'}
                    </label>
                    <input
                      type="text"
                      value={businessmanForm.procurement_type}
                      onChange={(e) => setBusinessmanForm({ ...businessmanForm, procurement_type: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Submit Registration Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleFinish()}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center space-x-2 ${
                    selectedRole === 'artisan'
                      ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-stone-950'
                      : selectedRole === 'businessman'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedRole === 'artisan'
                      ? (selectedLang === 'hi' ? 'कारीगर पंजीकरण पूरा करें व AI स्टूडियो खोलें ➔' : 'Complete Registration & Open AI Studio ➔')
                      : selectedRole === 'businessman'
                      ? (selectedLang === 'hi' ? 'संस्थागत GeM व B2B पोर्टल में प्रवेश करें ➔' : 'Complete B2B Registration & Enter Portal ➔')
                      : (selectedLang === 'hi' ? 'पंजीकरण पूरा करें व बाज़ार देखें ➔' : 'Complete Registration & Explore ➔')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Change Role / Language footer links */}
          <div className="flex justify-between items-center pt-3 border-t border-stone-800/60">
            <button
              onClick={() => { stopVoiceListening(); setStep(2); }}
              className="text-xs text-stone-400 hover:text-white font-semibold underline"
            >
              ← {selectedLang === 'hi' ? 'भूमिका बदलें' : 'Change Role'}
            </button>
            <button
              onClick={() => { stopVoiceListening(); setStep(1); }}
              className="text-xs text-stone-400 hover:text-white font-semibold underline"
            >
              {selectedLang === 'hi' ? 'भाषा बदलें' : 'Change Language'}
            </button>
          </div>

        </div>
      )}

    </div>
  </div>
</div>
  );
};

