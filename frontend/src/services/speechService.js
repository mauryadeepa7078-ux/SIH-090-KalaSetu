// Comprehensive Speech Recognition & Synthesis Service with Safe Guards

export const speechService = {
  // Check browser speech recognition support
  isSpeechRecognitionSupported() {
    try {
      if (typeof window === 'undefined') return false;
      const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      console.log('[SpeechService] Speech recognition supported in browser:', supported);
      return !!supported;
    } catch (e) {
      return false;
    }
  },

  // Check and request microphone permission
  async requestMicrophonePermission() {
    console.log('[SpeechService] Requesting microphone permission...');
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone mediaDevices API not supported');
      }

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'microphone' });
          console.log('[SpeechService] Microphone permission status:', perm.state);
        } catch (e) {
          console.log('[SpeechService] Permissions query not fully supported for microphone, proceeding with getUserMedia');
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[SpeechService] Microphone access granted successfully! Audio tracks:', stream.getAudioTracks().length);
      return stream;
    } catch (err) {
      console.warn('[SpeechService] Microphone permission error:', err);
      throw err;
    }
  },

  createRecognizer(lang = 'hi-IN', onResult, onError, onEnd, onStart) {
    try {
      if (typeof window === 'undefined') return null;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('[SpeechService] SpeechRecognition API is NOT supported on this browser.');
        return null;
      }

      console.log(`[SpeechService] Initializing SpeechRecognition instance (Language: ${lang})...`);
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening continuously while speaking
      recognition.interimResults = true; // Emit real-time interim speech chunks
      recognition.maxAlternatives = 1;
      recognition.lang = lang;

      let accumulatedFinal = '';

      recognition.onstart = () => {
        console.log('[SpeechService Event] onstart: Speech recognition service has started listening.');
        if (onStart) onStart();
      };

      recognition.onaudiostart = () => {
        console.log('[SpeechService Event] onaudiostart: Audio capturing started from microphone.');
      };

      recognition.onsoundstart = () => {
        console.log('[SpeechService Event] onsoundstart: Sound detected by audio engine.');
      };

      recognition.onspeechstart = () => {
        console.log('[SpeechService Event] onspeechstart: Speech activity recognized!');
      };

      recognition.onspeechend = () => {
        console.log('[SpeechService Event] onspeechend: Speech activity paused.');
      };

      recognition.onresult = (event) => {
        console.log('[SpeechService Event] onresult: Speech result received!', event);
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          console.log(`[SpeechService Result Chunk ${i}] isFinal=${event.results[i].isFinal}, confidence=${confidence}, text="${transcriptPart}"`);

          if (event.results[i].isFinal) {
            accumulatedFinal = accumulatedFinal ? `${accumulatedFinal} ${transcriptPart.trim()}` : transcriptPart.trim();
          } else {
            interimTranscript += transcriptPart;
          }
        }

        console.log(`[SpeechService Full State] Final="${accumulatedFinal}", Interim="${interimTranscript}"`);

        if (onResult) {
          onResult({
            final: accumulatedFinal,
            interim: interimTranscript,
            current: accumulatedFinal + (interimTranscript ? ` ${interimTranscript}` : '')
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn('[SpeechService Event] onerror:', event?.error, event);
        if (onError) onError(event);
      };

      recognition.onnomatch = (event) => {
        console.warn('[SpeechService Event] onnomatch: No speech could be recognized.', event);
      };

      recognition.onend = () => {
        console.log('[SpeechService Event] onend: Speech recognition session ended.');
        if (onEnd) onEnd(accumulatedFinal);
      };

      return recognition;
    } catch (err) {
      console.warn('[SpeechService] Recognizer initialization error:', err);
      return null;
    }
  },

  // Map internal language code to proper BCP-47 speech code
  resolveLanguageCode(code = 'hi') {
    const map = {
      hi: 'hi-IN',   // Hindi
      en: 'en-IN',   // English (India)
      bn: 'bn-IN',   // Bengali
      mr: 'mr-IN',   // Marathi
      te: 'te-IN',   // Telugu
      ta: 'ta-IN',   // Tamil
      gu: 'gu-IN',   // Gujarati
      ur: 'ur-IN',   // Urdu
      kn: 'kn-IN',   // Kannada
      or: 'or-IN',   // Odia
      ml: 'ml-IN',   // Malayalam
      pa: 'pa-IN',   // Punjabi
      as: 'as-IN',   // Assamese
      mai: 'hi-IN',  // Maithili (Hindi phonetic fallback)
      bho: 'hi-IN'   // Bhojpuri (Hindi phonetic fallback)
    };
    return map[code] || (code.includes('-') ? code : 'hi-IN');
  },

  // Text-To-Speech audio prompt synthesizer
  speak(text, lang = 'hi') {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
        console.warn('[SpeechService TTS] SpeechSynthesis API not supported.');
        return;
      }
      
      const speechCode = this.resolveLanguageCode(lang);
      console.log(`[SpeechService TTS] Speaking: "${text}" (Lang Code: ${speechCode})`);
      
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      if (typeof SpeechSynthesisUtterance === 'undefined') {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Pick best matching voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && Array.isArray(voices)) {
          const langPrefix = speechCode.slice(0, 2);
          const matchingVoice = voices.find(v => v && v.lang && (v.lang === speechCode || v.lang.startsWith(langPrefix)));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
        }
      } catch (e) {}

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[SpeechService TTS] speak error safely caught:', err);
    }
  }
};


