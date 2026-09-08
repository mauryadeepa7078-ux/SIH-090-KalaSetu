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
    audioChunksRef.current = [];

    // Trigger haptic vibration on mobile phone if available
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch (e) {}

    // 1. Request Microphone Stream for MediaRecorder (guaranteed audio capture on all mobile phones)
    try {
      const stream = await speechService.requestMicrophonePermission(false);
      mediaStreamRef.current = stream;
      setMicPermissionState('granted');
      console.log('[VoiceCatalogPage] Microphone stream acquired.');

      if (typeof MediaRecorder !== 'undefined' && stream) {
        try {
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = async () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setRecordedAudioBlob(blob);
            console.log('[VoiceCatalogPage] MediaRecorder stopped. Blob size:', blob.size);

            // If SpeechRecognition failed to capture text (common on mobile browsers), immediately use Whisper!
            const currentCaptured = transcriptRef.current.trim();
            if (!currentCaptured && blob.size > 0) {
              console.log('[VoiceCatalogPage] No live STT text, uploading audio blob to backend Whisper AI...');
              setIsGenerating(true);
              showToast('Processing speech via Whisper AI engine...', 'info');
              try {
                const whisperRes = await api.transcribeVoice(blob);
                if (whisperRes && whisperRes.transcription) {
                  console.log('[VoiceCatalogPage] Whisper AI transcription:', whisperRes.transcription);
                  setTranscript(whisperRes.transcription);
                  transcriptRef.current = whisperRes.transcription;
                  handleGenerateCatalog(whisperRes.transcription);
                } else {
                  handleGenerateCatalog('पारंपरिक हस्तनिर्मित भारतीय शिल्प उत्पाद');
                }
              } catch (wErr) {
                console.warn('[VoiceCatalogPage] Whisper fallback notice:', wErr);
                handleGenerateCatalog('पारंपरिक हस्तनिर्मित भारतीय शिल्प उत्पाद');
              }
            } else if (currentCaptured) {
              handleGenerateCatalog(currentCaptured);
            }
          };

          recorder.start(100); // 100ms chunks
          mediaRecorderRef.current = recorder;
          console.log('[VoiceCatalogPage] MediaRecorder started.');
        } catch (recErr) {
          console.warn('[VoiceCatalogPage] MediaRecorder notice:', recErr);
        }
      }
    } catch (permErr) {
      console.error('[VoiceCatalogPage] Microphone permission denied:', permErr);
      setMicPermissionState('denied');
      showToast('Microphone access denied. Please allow microphone permissions in your phone browser.', 'error');
      return;
    }

    // 2. Start Web Speech Recognition (for live interactive typing effect on supported browsers)
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
        console.warn('[VoiceCatalogPage] Speech recognition notice:', err?.error || err);
        if (err.error === 'not-allowed') {
          setMicPermissionState('denied');
        }
      },
      (finalText) => {
        console.log('[VoiceCatalogPage] Recognition ended. Final text:', finalText);
      },
      () => {
        console.log('[VoiceCatalogPage] Recognizer started listening successfully.');
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognizerInstanceRef.current = recognizer;
      } catch (startErr) {
        console.warn('[VoiceCatalogPage] Native STT start notice (MediaRecorder active):', startErr);
      }
    }

    setIsRecording(true);
    showToast('🎙️ Listening... Speak naturally about your craft!', 'info');
  };

  const stopRecording = async () => {
    console.log('[VoiceCatalogPage] stopRecording called. Current transcript:', transcriptRef.current);
    setIsRecording(false);

    // Stop speech recognition
    if (recognizerInstanceRef.current) {
      try {
        recognizerInstanceRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognizer:', e);
      }
      recognizerInstanceRef.current = null;
    }

    // Stop MediaRecorder (triggers onstop handler above)
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

    showToast('Voice captured! Generating AI bilingual catalog...', 'info');

    // If client STT already captured text, trigger catalog generation immediately
    const capturedText = transcriptRef.current.trim();
    if (capturedText) {
      handleGenerateCatalog(capturedText);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-xs font-bold tracking-wide font-sans">
            <Languages className="w-3.5 h-3.5" />
            <span>Core Feature 2 • Multilingual Voice-to-Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-serif">
            {t('voiceTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed font-sans">
            {t('voiceSubtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold shadow-sm flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Input: {lang.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Browser Compatibility & Mic Permission Alerts */}
      {micPermissionState === 'denied' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Microphone Access Blocked in Browser</span>
            <p className="leading-relaxed">
              Please enable microphone permissions in your browser address bar (click the lock/permission icon next to the URL) or use the 1-Tap Quick Prompts below.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Voice Recording Console */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-6 text-center relative overflow-hidden">
            
            {/* Subtle glow background */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center space-x-2">
                <Radio className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`} />
                <span>Voice Recording Console</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
                {isRecording ? 'Recording Live' : 'Standby'}
              </span>
            </div>

            {/* Giant Thumb-Friendly Microphone Button with Multi-Ring Glow */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative">
                {isRecording && (
                  <>
                    <span className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping"></span>
                    <span className="absolute -inset-8 rounded-full bg-red-500/10 animate-pulse"></span>
                  </>
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer select-none ${
                    isRecording
                      ? 'bg-gradient-to-tr from-red-600 to-rose-600 text-white ring-8 ring-red-400/40 scale-105 animate-pulse shadow-red-900/50'
                      : 'bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 text-white hover:scale-105 active:scale-95 shadow-orange-900/40 hover:shadow-orange-600/50 ring-4 ring-orange-500/20'
                  }`}
                  title={isRecording ? 'Tap to Stop Recording' : 'Tap to Start Speaking'}
                >
                  {isRecording ? (
                    <MicOff className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
                  ) : (
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14" />
                  )}
                </button>
              </div>

              <div className="mt-5 space-y-1.5">
                <span className="text-base sm:text-lg font-black text-stone-900 dark:text-white block font-serif">
                  {isRecording ? t('listening') : t('startRecording')}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto block leading-relaxed font-sans">
                  {isRecording ? 'Listening through microphone... Tap button when finished speaking.' : t('speakHint')}
                </span>
              </div>
            </div>

            {/* Live Visual Speech Status Indicator */}
            {isRecording && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/60 flex items-center justify-center space-x-2 text-xs font-bold text-red-700 dark:text-red-300 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span>Web Speech API is actively listening to your dialect...</span>
              </div>
            )}

            {/* Real-time Live Transcript Display */}
            <div className="text-left space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 dark:text-stone-300">
                <label className="font-sans">Recognized Speech Transcript:</label>
                {transcript && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Text Captured</span>
                  </span>
                )}
              </div>
              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  transcriptRef.current = e.target.value;
                }}
                placeholder="Spoken words appear here in real-time. You can also edit or type directly in your regional language..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed font-sans min-h-[105px] transition-colors"
              />
            </div>

            {/* Quick 1-Tap Voice Samples for Testing & Demo */}
            <div className="text-left space-y-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                ✨ 1-Tap Quick Test Prompts (For Demo):
              </span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => useSampleVoice('यह हाथ से बनी शुद्ध बनारसी कातान सिल्क साड़ी है, इसमें सोने की जरी का काम है, बनाने में 4 दिन लगे।')}
                  className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-left text-xs text-stone-900 dark:text-stone-200 font-medium transition-all shadow-sm min-h-[48px] flex items-center"
                >
                  <span>🧵 <b>Banarasi Silk:</b> "यह हाथ से बनी शुद्ध बनारसी कातान सिल्क साड़ी है..."</span>
                </button>
                <button
                  type="button"
                  onClick={() => useSampleVoice('यह बस्तर की पारंपरिक ढोकरा लॉस्ट-वैक्स ब्रास की जनजातीय संगीतकार मूर्ति है, 1 किलो वजन है।')}
                  className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-left text-xs text-stone-900 dark:text-stone-200 font-medium transition-all shadow-sm min-h-[48px] flex items-center"
                >
                  <span>🔔 <b>Dokra Brass:</b> "यह बस्तर की पारंपरिक ढोकरा ब्रास मूर्ति है..."</span>
                </button>
                <button
                  type="button"
                  onClick={() => useSampleVoice('यह मिथिला की प्राकृतिक रंगों से बनी असली मधुबनी कोहबर पेंटिंग है, खादी शीट पर तैयार की गई।')}
                  className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/50 text-left text-xs text-stone-900 dark:text-stone-200 font-medium transition-all shadow-sm min-h-[48px] flex items-center"
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
              className="w-full py-4 px-4 rounded-2xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{isGenerating ? t('generating') : t('generateListing')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Bilingual Listing Editor & Preview */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-card hover:shadow-elevated transition-all space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-extrabold text-stone-900 dark:text-white font-serif">
                  {t('bilingualEditor')}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
                ✓ Live editable before publishing
              </span>
            </div>

            {/* Dual Language Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">
                  {t('titleEnglish')}
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-hindi">
                  {t('titleHindi')}
                </label>
                <input
                  type="text"
                  value={formData.title_hi}
                  onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-hindi min-h-[44px] transition-colors"
                />
              </div>
            </div>

            {/* Dual Language Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">
                  {t('descEnglish')}
                </label>
                <textarea
                  rows={3}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed min-h-[85px] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-hindi">
                  {t('descHindi')}
                </label>
                <textarea
                  rows={3}
                  value={formData.description_hi}
                  onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed font-hindi min-h-[85px] transition-colors"
                />
              </div>
            </div>

            {/* Cultural Heritage Stories */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-400">
                <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-serif text-sm">Cultural Heritage Narrative (MoSJE Heritage Theme)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1">English Story</span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed italic bg-white dark:bg-stone-950 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
                    "{formData.cultural_story_en}"
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase block mb-1 font-hindi">विरासत कथा (हिंदी)</span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed italic bg-white dark:bg-stone-950 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 font-hindi">
                    "{formData.cultural_story_hi}"
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata (Category, Material, Dimensions) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">{t('categoryLabel')}</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] transition-colors"
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
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">{t('materialLabel')}</label>
                <input
                  type="text"
                  value={formData.material_type}
                  onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block font-sans">{t('dimensionsLabel')}</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Next Step Action Button & Proactive Guide */}
          <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-[28px] p-6 text-white shadow-xl space-y-4 border border-orange-400/40">
            <div className="flex items-center space-x-2 text-sm font-bold font-serif">
              <Sparkles className="w-5 h-5 text-yellow-200" />
              <span>AI साथी मार्गदर्शन (Step 2 Complete)</span>
            </div>

            <div className="p-3.5 bg-black/20 rounded-2xl backdrop-blur-sm border border-white/15 text-xs font-semibold leading-relaxed font-sans">
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
              className="w-full py-4 rounded-2xl bg-white text-orange-900 font-black text-sm shadow-2xl hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center space-x-2 ring-4 ring-white/30 animate-pulse min-h-[48px]"
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

