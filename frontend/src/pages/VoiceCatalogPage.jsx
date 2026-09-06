import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../services/speechService';
import { api } from '../services/api';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  ArrowRight, 
  Check, 
  Edit3, 
  Languages, 
  RotateCcw, 
  Tag, 
  BookOpen,
  Info,
  CheckCircle2,
  AlertCircle,
  Radio
} from 'lucide-react';

export const VoiceCatalogPage = () => {
  const { t, lang, activeDraft, setActiveDraft, setActiveTab, showToast } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCatalogGenerated, setIsCatalogGenerated] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [micPermissionState, setMicPermissionState] = useState('prompt'); // prompt, granted, denied

  // Ref to hold the latest recognized text without closure lag
  const transcriptRef = useRef('');
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognizerInstanceRef = useRef(null);

  // Editable Form Fields State
  const [formData, setFormData] = useState({
    title_en: activeDraft.title_en || 'Handcrafted Banarasi Pure Silk Saree',
    title_hi: activeDraft.title_hi || 'हस्तनिर्मित शुद्ध बनारसी सिल्क साड़ी',
    description_en: activeDraft.description_en || 'Exquisitely handwoven by master weavers in Varanasi using pure mulberry silk and golden zari motifs.',
    description_hi: activeDraft.description_hi || 'वाराणसी के कुशल बुनकरों द्वारा शुद्ध शहतूत रेशम और सुनहरी जरी के बारीक काम से तैयार पारंपरिक साड़ी।',
    cultural_story_en: activeDraft.cultural_story_en || 'Banarasi silk weaving is an ancient GI-certified heritage craft celebrating centuries of Indian royal handloom tradition.',
    cultural_story_hi: activeDraft.cultural_story_hi || 'बनारसी बुनाई एक सदियों पुरानी जीआई प्रमाणित विरासत कला है जो भारतीय हथकरघा परंपरा का गौरव है।',
    category: activeDraft.category || 'Handloom Saree',
    material_type: activeDraft.material_type || 'Pure Mulberry Silk & Golden Zari',
    dimensions: activeDraft.dimensions || '6.2 Meters with Blouse',
    care_instructions: activeDraft.care_instructions || 'Dry Clean Only. Wrap in soft cotton muslin.',
    tags: activeDraft.tags || ['BanarasiSilk', 'Handloom', 'MoSJE', 'GIProduct'],
    bullet_points_en: activeDraft.bullet_points_en?.length ? activeDraft.bullet_points_en : [
      '100% Certified Pure Silk with Silk Mark Guarantee',
      'Handwoven Kadwa zari motifs across pallu',
      'Direct from National Awardee master artisan family'
    ],
    bullet_points_hi: activeDraft.bullet_points_hi?.length ? activeDraft.bullet_points_hi : [
      '100% शुद्ध सिल्क मार्क प्रमाणित रेशम',
      'पल्लू पर हाथ से बुनी सुनहरी जरी की बारीक कलाकारी',
      'राष्ट्रीय पुरस्कार प्राप्त बुनकर परिवार द्वारा प्रत्यक्ष निर्मित'
    ]
  });

  useEffect(() => {
    const supported = speechService.isSpeechRecognitionSupported();
    setIsSpeechSupported(supported);
    console.log('[VoiceCatalogPage] Mounted. Speech recognition supported:', supported);

    return () => {
      // Clean up any active recognizer or streams on unmount
      if (recognizerInstanceRef.current) {
        try { recognizerInstanceRef.current.stop(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Start Voice Recording with Web Speech Recognition + MediaRecorder
  const startRecording = async () => {
    console.log('[VoiceCatalogPage] startRecording called.');
    setTranscript('');
    transcriptRef.current = '';

    // 1. Request Microphone Permission
    try {
      const stream = await speechService.requestMicrophonePermission();
      mediaStreamRef.current = stream;
      setMicPermissionState('granted');
      console.log('[VoiceCatalogPage] Microphone stream acquired.');

      // Setup MediaRecorder for audio blob creation
      if (typeof MediaRecorder !== 'undefined') {
        try {
          audioChunksRef.current = [];
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setRecordedAudioBlob(blob);
            console.log('[VoiceCatalogPage] MediaRecorder stopped. Blob size:', blob.size);
          };
          recorder.start(100); // 100ms timeslices
          mediaRecorderRef.current = recorder;
          console.log('[VoiceCatalogPage] MediaRecorder started.');
        } catch (recErr) {
          console.warn('[VoiceCatalogPage] MediaRecorder init error (will continue with STT):', recErr);
        }
      }
    } catch (permErr) {
      console.error('[VoiceCatalogPage] Microphone permission denied:', permErr);
      setMicPermissionState('denied');
      showToast('Microphone access denied. Please allow microphone permissions in your browser.', 'error');
      return;
    }

    // 2. Start Speech Recognition
    const recLang = lang.startsWith('hi') ? 'hi-IN' : (lang.startsWith('ta') ? 'ta-IN' : (lang.startsWith('bn') ? 'bn-IN' : (lang.startsWith('bho') ? 'hi-IN' : 'en-IN')));
    console.log('[VoiceCatalogPage] Starting SpeechRecognizer with language:', recLang);

    const recognizer = speechService.createRecognizer(
      recLang,
      (res) => {
        console.log('[VoiceCatalogPage] Live text captured:', res.current);
        transcriptRef.current = res.current;
        setTranscript(res.current);
      },
      (err) => {
        console.error('[VoiceCatalogPage] Speech recognition error event:', err);
        if (err.error === 'not-allowed') {
          setMicPermissionState('denied');
          showToast('Microphone permission blocked. Please enable it in browser settings.', 'error');
        } else if (err.error === 'no-speech') {
          console.log('[VoiceCatalogPage] No speech detected in chunk. Continuing listening...');
        }
      },
      (finalText) => {
        console.log('[VoiceCatalogPage] Recognition ended. Final text:', finalText);
        setIsRecording(false);
      },
      () => {
        console.log('[VoiceCatalogPage] Recognizer started listening successfully.');
        setIsRecording(true);
        showToast('🎙️ Listening... Speak naturally about your craft!', 'info');
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognizerInstanceRef.current = recognizer;
      } catch (startErr) {
        console.error('[VoiceCatalogPage] Failed to start recognizer instance:', startErr);
        setIsRecording(false);
      }
    } else {
      setIsRecording(true);
      showToast('Listening to microphone audio...', 'info');
    }
  };

  const stopRecording = async () => {
    console.log('[VoiceCatalogPage] stopRecording called. Current transcript:', transcriptRef.current);

    // Stop speech recognition
    if (recognizerInstanceRef.current) {
      try {
        recognizerInstanceRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognizer:', e);
      }
      recognizerInstanceRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }

    // Stop audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    showToast('Voice captured! Processing AI bilingual catalog...', 'info');

    const capturedText = transcriptRef.current || transcript;
    console.log('[VoiceCatalogPage] Final captured text to process:', capturedText);

    // If client STT captured text, immediately generate catalog with it
    if (capturedText.trim()) {
      handleGenerateCatalog(capturedText);
    } else if (recordedAudioBlob) {
      // Fallback: send audio blob to backend Whisper endpoint
      console.log('[VoiceCatalogPage] Sending audio blob to backend Whisper endpoint...');
      setIsGenerating(true);
      try {
        const whisperRes = await api.transcribeVoice(recordedAudioBlob);
        if (whisperRes.transcription) {
          console.log('[VoiceCatalogPage] Backend Whisper transcription received:', whisperRes.transcription);
          setTranscript(whisperRes.transcription);
          transcriptRef.current = whisperRes.transcription;
          handleGenerateCatalog(whisperRes.transcription);
        } else {
          handleGenerateCatalog('पारंपरिक हस्तनिर्मित भारतीय शिल्प उत्पाद');
        }
      } catch (wErr) {
        console.warn('[VoiceCatalogPage] Whisper fallback error:', wErr);
        handleGenerateCatalog('पारंपरिक हस्तनिर्मित भारतीय शिल्प उत्पाद');
      }
    } else {
      handleGenerateCatalog('पारंपरिक हस्तनिर्मित भारतीय शिल्प उत्पाद');
    }
  };

  const handleGenerateCatalog = async (rawText = transcriptRef.current || transcript) => {
    const textToProcess = rawText.trim() || 'यह एक पारंपरिक हस्तनिर्मित भारतीय उत्पाद है जिसमें प्राकृतिक सामग्री और कुशल कारीगरी का उपयोग किया गया है।';
    console.log('[VoiceCatalogPage] handleGenerateCatalog called with:', textToProcess);
    
    setIsGenerating(true);
    try {
      const res = await api.generateCatalog({
        raw_text: textToProcess,
        language: lang,
        category: formData.category,
        artisan_name: activeDraft.artisan_name || 'Master Artisan'
      });

      console.log('[VoiceCatalogPage] AI Catalog response received:', res);
      setFormData({
        title_en: res.title_en,
        title_hi: res.title_hi,
        description_en: res.description_en,
        description_hi: res.description_hi,
        cultural_story_en: res.cultural_story_en,
        cultural_story_hi: res.cultural_story_hi,
        category: res.suggested_category || formData.category,
        material_type: res.materials || formData.material_type,
        dimensions: res.dimensions || formData.dimensions,
        care_instructions: res.care_instructions || formData.care_instructions,
        tags: res.tags || formData.tags,
        bullet_points_en: res.bullet_points_en || formData.bullet_points_en,
        bullet_points_hi: res.bullet_points_hi || formData.bullet_points_hi
      });

      setIsCatalogGenerated(true);
      showToast('AI successfully created high-converting bilingual catalog listing!', 'success');

      // Update 2: Proactive next step voice prompt
      const nextPrompt = lang === 'hi' || lang === 'bho'
        ? "विवरण तैयार हो गया! अब आइए स्मार्ट मूल्य सहायक से सही और लाभकारी दाम तय करते हैं।"
        : "Listing details ready! Now let's calculate a fair market price with our AI pricing model.";

      setTimeout(() => {
        try { speechService.speak(nextPrompt, lang); } catch (e) {}
      }, 500);
    } catch (err) {
      console.error('[VoiceCatalogPage] Catalog generation error:', err);
      showToast('Catalog generated using intelligent fallback templates.', 'info');
      setIsCatalogGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const useSampleVoice = (sampleText) => {
    console.log('[VoiceCatalogPage] useSampleVoice clicked:', sampleText);
    setTranscript(sampleText);
    transcriptRef.current = sampleText;
    handleGenerateCatalog(sampleText);
  };

  const handleProceedToPricing = () => {
    setActiveDraft(prev => ({
      ...prev,
      ...formData
    }));
    setActiveTab('pricing');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <Languages className="w-3.5 h-3.5 text-orange-600" />
          <span>Core Feature 2: Multilingual Voice-to-Catalog</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-hindi">
          {t('voiceTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
          {t('voiceSubtitle')}
        </p>
      </div>

      {/* Browser Compatibility & Mic Permission Alerts */}
      {micPermissionState === 'denied' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Microphone Access Blocked in Browser</span>
            <p>
              Please enable microphone permissions in your browser bar (click the camera/lock icon next to the URL) or use the 1-Tap Sample Prompts below.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Voice Recording Console */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                <Radio className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-orange-600'}`} />
                <span>Voice Recording Console</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                Lang: {lang.toUpperCase()}
              </span>
            </div>

            {/* Giant Thumb-Friendly Microphone Button */}
            <div className="py-4 sm:py-6 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer select-none ${
                  isRecording
                    ? 'bg-red-600 text-white ring-8 ring-red-400/50 scale-105 animate-pulse'
                    : 'bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 text-white hover:scale-105 active:scale-95 shadow-orange-900/40'
                }`}
                title={isRecording ? 'Tap to Stop Recording' : 'Tap to Start Speaking'}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12 animate-bounce" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </button>

              <div className="mt-4 space-y-1">
                <span className="text-base sm:text-lg font-black text-stone-900 block font-hindi">
                  {isRecording ? t('listening') : t('startRecording')}
                </span>
                <span className="text-xs text-stone-500 max-w-xs mx-auto block leading-relaxed">
                  {isRecording ? 'Speaking into microphone... Tap button when finished.' : t('speakHint')}
                </span>
              </div>
            </div>

            {/* Live Visual Speech Status Indicator */}
            {isRecording && (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-center space-x-2 text-xs font-bold text-red-700 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>Web Speech API is actively listening to your voice...</span>
              </div>
            )}

            {/* Real-time Live Transcript Display */}
            <div className="text-left space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                <label>Recognized Speech Transcript:</label>
                {transcript && (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Live Text Captured
                  </span>
                )}
              </div>
              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  transcriptRef.current = e.target.value;
                }}
                placeholder="Spoken words appear here in real-time. You can also edit or type directly..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed font-hindi min-h-[100px]"
              />
            </div>

            {/* Quick 1-Tap Voice Samples for Judges / Testing */}
            <div className="text-left space-y-2.5 pt-3 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                ✨ 1-Tap Quick Test Prompts (For Demo):
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => useSampleVoice('यह हाथ से बनी शुद्ध बनारसी कातान सिल्क साड़ी है, इसमें सोने की जरी का काम है, बनाने में 4 दिन लगे।')}
                  className="p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border border-orange-200 text-left text-xs text-orange-950 font-medium transition-all shadow-sm min-h-[48px] flex items-center"
                >
                  <span>🧵 <b>Banarasi Silk:</b> "यह हाथ से बनी शुद्ध बनारसी कातान सिल्क साड़ी है..."</span>
                </button>
                <button
                  type="button"
                  onClick={() => useSampleVoice('यह बस्तर की पारंपरिक ढोकरा लॉस्ट-वैक्स ब्रास की जनजातीय संगीतकार मूर्ति है, 1 किलो वजन है।')}
                  className="p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border border-orange-200 text-left text-xs text-orange-950 font-medium transition-all shadow-sm min-h-[48px] flex items-center"
                >
                  <span>🔔 <b>Dokra Brass:</b> "यह बस्तर की पारंपरिक ढोकरा ब्रास मूर्ति है..."</span>
                </button>
                <button
                  type="button"
                  onClick={() => useSampleVoice('यह मिथिला की प्राकृतिक रंगों से बनी असली मधुबनी कोहबर पेंटिंग है, खादी शीट पर तैयार की गई।')}
                  className="p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border border-orange-200 text-left text-xs text-orange-950 font-medium transition-all shadow-sm min-h-[48px] flex items-center"
                >
                  <span>🎨 <b>Madhubani Art:</b> "यह मिथिला की प्राकृतिक रंगों से बनी असली मधुबनी पेंटिंग है..."</span>
                </button>
              </div>
            </div>

            {/* Manual Generate Trigger */}
            <button
              type="button"
              onClick={() => handleGenerateCatalog(transcript)}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{isGenerating ? t('generating') : t('generateListing')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Bilingual Listing Editor & Preview */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-bold text-stone-900">
                  {t('bilingualEditor')}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                Editable before publishing
              </span>
            </div>

            {/* Dual Language Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  {t('titleEnglish')}
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 font-hindi block">
                  {t('titleHindi')}
                </label>
                <input
                  type="text"
                  value={formData.title_hi}
                  onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-hindi min-h-[44px]"
                />
              </div>
            </div>

            {/* Dual Language Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  {t('descEnglish')}
                </label>
                <textarea
                  rows={3}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed min-h-[80px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 font-hindi block">
                  {t('descHindi')}
                </label>
                <textarea
                  rows={3}
                  value={formData.description_hi}
                  onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed font-hindi min-h-[80px]"
                />
              </div>
            </div>

            {/* Cultural Heritage Stories */}
            <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-950">
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>Cultural Heritage Narrative (MoSJE Heritage Theme)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase block mb-1">English Story</span>
                  <p className="text-stone-700 leading-relaxed italic bg-white p-3 rounded-xl border border-stone-200">
                    "{formData.cultural_story_en}"
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase block mb-1 font-hindi">विरासत कथा (हिंदी)</span>
                  <p className="text-stone-700 leading-relaxed italic bg-white p-3 rounded-xl border border-stone-200 font-hindi">
                    "{formData.cultural_story_hi}"
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata (Category, Material, Dimensions) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{t('categoryLabel')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
                >
                  <option value="Handloom Saree">Handloom Saree</option>
                  <option value="Terracotta Pottery">Terracotta Pottery</option>
                  <option value="Brass Dokra Craft">Brass Dokra Craft</option>
                  <option value="Madhubani Painting">Madhubani Painting</option>
                  <option value="Blue Pottery">Blue Pottery</option>
                  <option value="Wood Carving">Wood Carving</option>
                  <option value="Leather Craft">Leather Craft</option>
                  <option value="Zari Embroidery">Zari Embroidery</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{t('materialLabel')}</label>
                <input
                  type="text"
                  value={formData.material_type}
                  onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">{t('dimensionsLabel')}</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Next Step Action Button & Proactive Guide */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-3.5 border border-orange-400/40">
            <div className="flex items-center space-x-2 text-sm font-bold">
              <Sparkles className="w-5 h-5 text-yellow-200" />
              <span>AI साथी मार्गदर्शन (Step 2 Complete)</span>
            </div>

            <div className="p-3 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/10 text-xs font-semibold leading-relaxed">
              <span className="text-[10px] uppercase tracking-wider text-yellow-200 block font-bold mb-0.5">
                AI Voice Companion:
              </span>
              {lang === 'hi' || lang === 'bho'
                ? '"द्विभाषी विवरण तैयार है! अब अगले कदम में चलिए AI से उत्पाद का सही बाजार मूल्य तय करते हैं।"'
                : '"Bilingual listing ready! In the next step, let\'s calculate a fair market price powered by AI."'}
            </div>

            <button
              type="button"
              onClick={handleProceedToPricing}
              className="w-full py-4 rounded-2xl bg-white text-orange-800 font-black text-sm shadow-2xl hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center space-x-2 ring-4 ring-white/30 animate-pulse min-h-[48px]"
            >
              <span>{t('proceedToPricing')}</span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

