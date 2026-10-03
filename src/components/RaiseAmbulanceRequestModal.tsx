import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Languages, 
  X, 
  CheckCircle2, 
  MapPin,
  AlertTriangle,
  Truck,
  ArrowRight
} from './icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../locales';

export type VoiceLanguage = 'hi-IN' | 'mr-IN' | 'en-IN';

export interface EmergencyPreset {
  id: string;
  icon: string;
  label: {
    en: string;
    hi: string;
    mr: string;
  };
  symptom: {
    en: string;
    hi: string;
    mr: string;
  };
}

const EMERGENCY_PRESETS: EmergencyPreset[] = [
  {
    id: 'road-accident',
    icon: '🚗',
    label: {
      en: 'Road Accident',
      hi: 'सड़क दुर्घटना',
      mr: 'रस्ता अपघात'
    },
    symptom: {
      en: 'Severe road collision, patient bleeding heavily with head injury',
      hi: 'सड़क पर भीषण दुर्घटना, सिर पर गहरी चोट और भारी रक्तस्राव',
      mr: 'रस्त्यावर भीषण अपघात, डोक्याला गंभीर दुखापत आणि रक्तस्त्राव'
    }
  },
  {
    id: 'cardiac',
    icon: '🫀',
    label: {
      en: 'Cardiac / Heart',
      hi: 'हार्ट अटैक / हृदय',
      mr: 'हृदयविकार / हार्ट अटॅक'
    },
    symptom: {
      en: 'Crushing chest pain, left arm numbness and breathlessness',
      hi: 'सीने में असहनीय दर्द, बाएं हाथ में सुन्नता और सांस फूलना',
      mr: 'छातीत असह्य वेदना, डाव्या हाताला मुंग्या आणि धाप लागणे'
    }
  },
  {
    id: 'maternity',
    icon: '👶',
    label: {
      en: 'Maternity Labor',
      hi: 'प्रसव पीड़ा (लेबर)',
      mr: 'प्रसूती वेदना'
    },
    symptom: {
      en: 'Active labor pains with severe water break, urgent delivery transit needed',
      hi: 'प्रसव पीड़ा अत्यधिक बढ़ गई है, तुरंत प्रसूति एम्बुलेंस की आवश्यकता',
      mr: 'प्रसूती वेदना तीव्र झाल्या आहेत, तत्काळ रुग्णवाहिकेची गरज'
    }
  },
  {
    id: 'stroke',
    icon: '🧠',
    label: {
      en: 'Unconscious / Stroke',
      hi: 'बेहोशी / पक्षाघात',
      mr: 'बेशुद्ध / पक्षाघात'
    },
    symptom: {
      en: 'Patient suddenly collapsed, unresponsive with slurred speech',
      hi: 'मरीज अचानक बेहोश हो गए हैं, कोई प्रतिक्रिया नहीं दे रहे',
      mr: 'रुग्ण अचानक बेशुद्ध पडले आहेत, हालचाल थांबली आहे'
    }
  },
  {
    id: 'breathing',
    icon: '🫁',
    label: {
      en: 'Severe Breathing',
      hi: 'सांस में तकलीफ',
      mr: 'तीव्र श्वसन त्रास'
    },
    symptom: {
      en: 'Acute breathing difficulty, gasping for air, severe asthma or choking',
      hi: 'सांस लेने में भारी तकलीफ, दम फूल रहा है और ऑक्सीजन स्तर गिर रहा है',
      mr: 'श्वास घेण्यास तीव्र अडथळा, धाप लागणे आणि ऑक्सिजन कमी होणे'
    }
  },
  {
    id: 'snake-bite',
    icon: '🐍',
    label: {
      en: 'Snake Bite / Toxin',
      hi: 'सांप का काटना / जहर',
      mr: 'सर्पदंश / विषबाधा'
    },
    symptom: {
      en: 'Venomous snake bite with swelling and dizziness, urgent antivenom required',
      hi: 'जहरीले सांप ने काटा है, अत्यधिक सूजन और चक्कर, तुरंत एंटीवेनम की जरूरत',
      mr: 'विषारी सापाने दंश केला आहे, तीव्र सूज व चक्कर, तत्काळ अँटीव्हेनम आवश्यक'
    }
  },
  {
    id: 'burns',
    icon: '🔥',
    label: {
      en: 'Severe Burns / Fire',
      hi: 'गंभीर जलन / आग',
      mr: 'आगीत भाजणे'
    },
    symptom: {
      en: 'Critical burn injuries from fire or boiling fluid, deep tissue trauma',
      hi: 'आग या गर्म तरल से गंभीर रूप से झुलस गए हैं, त्वचा को भारी क्षति',
      mr: 'आग किंवा उकळत्या पाण्याने गंभीर भाजले आहे, त्वचेची तीव्र हानी'
    }
  },
  {
    id: 'electric-shock',
    icon: '⚡',
    label: {
      en: 'Electric Shock',
      hi: 'बिजली का करंट',
      mr: 'विजेचा धक्का'
    },
    symptom: {
      en: 'High-voltage electric shock, patient collapsed with irregular pulse',
      hi: 'तेज बिजली का करंट लगा है, मरीज गिर पड़ा और नाड़ी अनियमित है',
      mr: 'जोरदार विजेचा झटका लागला आहे, रुग्ण खाली पडला व नाडी मंदावली'
    }
  },
  {
    id: 'fracture',
    icon: '🦴',
    label: {
      en: 'Fall / Fracture',
      hi: 'गिरना / फ्रैक्चर',
      mr: 'उंचावरून पडणे / फ्रॅक्चर'
    },
    symptom: {
      en: 'Fall from height with suspected spine or bone fracture, unable to move',
      hi: 'ऊंचाई से गिरे हैं, रीढ़ या हड्डी में फ्रैक्चर की आशंका, हिल नहीं पा रहे',
      mr: 'उंचावरून पडल्याने हाड किंवा मणक्याला गंभीर मार, हालचाल अशक्य'
    }
  },
  {
    id: 'seizures',
    icon: '🌡️',
    label: {
      en: 'High Fever / Fits',
      hi: 'तेज बुखार / दौरे',
      mr: 'तीव्र ताप / झटके'
    },
    symptom: {
      en: 'Patient having severe convulsions, violent shaking, and high grade fever',
      hi: 'तेज बुखार के साथ दौरे और शरीर में तेज कंपकंपी हो रही है',
      mr: 'तीव्र तापाने अंगात झटके व कंप सुटला आहे, तत्काळ वैद्यकीय मदत हवी'
    }
  }
];

interface RaiseAmbulanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispatch: (problemText: string, voiceTranscript?: string) => void;
}

export const RaiseAmbulanceRequestModal: React.FC<RaiseAmbulanceRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmitDispatch
}) => {
  const { userLocation } = useApp();
  const { language, setLanguage, tr } = useLanguage();

  // Convert system language code to speech recognition locale
  const initialSpeechLang: VoiceLanguage = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
  const [selectedLang, setSelectedLang] = useState<VoiceLanguage>(initialSpeechLang);

  const [problemText, setProblemText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Sync selected language when modal opens or system language changes
  useEffect(() => {
    if (isOpen) {
      setSelectedLang(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
      setSpeechError(null);
    }
  }, [isOpen, language]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    const speechCode: VoiceLanguage = newLang === 'mr' ? 'mr-IN' : newLang === 'hi' ? 'hi-IN' : 'en-IN';
    setSelectedLang(speechCode);

    if (isListening) {
      stopListening();
    }

    // If the current problemText corresponds to one of the presets in any language, update it to the new language
    const current = problemText.trim();
    if (current) {
      const matched = EMERGENCY_PRESETS.find(p => 
        p.symptom.en.trim() === current || 
        p.symptom.hi.trim() === current || 
        p.symptom.mr.trim() === current
      );
      if (matched) {
        setProblemText(matched.symptom[newLang]);
      }
    }
  };

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'mr'
          ? 'तुमच्या ब्राउझरमध्ये व्हॉइस रेकग्निशन उपलब्ध नाही. कृपया थेट टाईप करा किंवा खालील पर्याय निवडा.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सुविधा समर्थित नहीं है। कृपया सीधे टाइप करें या नीचे दिए गए विकल्पों को चुनें।'
          : 'Speech recognition is not supported in this browser. Please type directly or pick a quick preset below.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        audioIntervalRef.current = setInterval(() => {
          setAudioLevel(Math.floor(Math.random() * 60) + 40);
        }, 120);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' ';
          }
        }
        if (finalStr.trim()) {
          setProblemText((prev) => (prev ? `${prev} ${finalStr}`.trim() : finalStr.trim()));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            language === 'mr'
              ? 'मायक्रोफोन परवानगी नाकारली गेली आहे. कृपया ब्राउझरमध्ये मायक्रोफोन चालू करा.'
              : language === 'hi'
              ? 'माइक्रोफोन की अनुमति अवरुद्ध है। कृपया सेटिंग्स में माइक्रोफोन की अनुमति दें।'
              : 'Microphone permission blocked. Please allow mic access in your browser.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError(
            language === 'mr'
              ? 'आवाज ऐकू आला नाही. कृपया माईकजवळ स्पष्ट बोला.'
              : language === 'hi'
              ? 'कोई आवाज नहीं सुनी गई। कृपया माइक के पास स्पष्ट बोलें।'
              : 'No speech detected. Please speak closer to the microphone.'
          );
        } else {
          setSpeechError(`Voice: ${event.error}`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (audioIntervalRef.current) {
          clearInterval(audioIntervalRef.current);
        }
        setAudioLevel(0);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setSpeechError('Microphone unavailable. Please type your emergency directly.');
      stopListening();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }
    setAudioLevel(0);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if ('speechSynthesis' in window) {
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        window.speechSynthesis.speak(unlock);
      }
      startListening();
    }
  };

  const handleSelectPreset = (preset: EmergencyPreset) => {
    const text = preset.symptom[language] || preset.symptom.en;
    setProblemText(text);
    setSpeechError(null);
  };

  const speakConfirmationVoice = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    let reply = '';
    if (language === 'hi' || selectedLang === 'hi-IN') {
      reply = 'एम्बुलेंस अनुरोध दर्ज कर लिया गया है। नजदीकी 108 एम्बुलेंस तुरंत रवाना हो रही है।';
    } else if (language === 'mr' || selectedLang === 'mr-IN') {
      reply = 'रुग्णवाहिका विनंती नोंदवली गेली आहे. जवळची 108 रुग्णवाहिका तात्काळ निघत आहे.';
    } else {
      reply = 'Ambulance request confirmed. Nearest 108 ambulance is dispatched immediately.';
    }

    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.lang = selectedLang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProblem = problemText.trim();
    if (!finalProblem) {
      setSpeechError(
        language === 'mr'
          ? 'कृपया समस्येचे वर्णन टाईप करा किंवा माईकमध्ये बोला.'
          : language === 'hi'
          ? 'कृपया आपातकालीन समस्या टाइप करें या माइक में बोलें।'
          : 'Please describe the emergency by typing or speaking.'
      );
      return;
    }

    stopListening();
    speakConfirmationVoice();
    onSubmitDispatch(finalProblem, finalProblem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-150 relative z-10 space-y-5 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopListening();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                {tr.citizen.raiseAmbulanceModalTitle}
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                108 SOS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {tr.citizen.raiseAmbulanceModalDesc}
            </p>
          </div>
        </div>

        {/* Language Selection Bar (Inside Modal) */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 px-1">
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{tr.citizen.speechInputLanguage || 'Speech / Input Language:'}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              🌐 English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                language === 'hi'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              🇮🇳 हिन्दी
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('mr')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                language === 'mr'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              🚩 मराठी
            </button>
          </div>
        </div>

        {/* Step 1: Input (Type OR Speak) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                {tr.citizen.typeOrSpeakLabel}
              </label>
              {problemText && (
                <button
                  type="button"
                  onClick={() => setProblemText('')}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition cursor-pointer"
                >
                  {tr.citizen.clearText || 'Clear Text'}
                </button>
              )}
            </div>

            {/* Input Surface with Integrated Mic Button */}
            <div className="relative">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder={tr.citizen.typeProblemPlaceholder}
                rows={3}
                className="w-full p-4 pr-14 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-slate-900 text-sm placeholder:text-slate-400 outline-hidden transition shadow-inner resize-none font-sans"
              />

              {/* In-box Speak Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                className={`absolute bottom-3.5 right-3.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/30'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
                title={isListening ? tr.citizen.stopListeningLabel : tr.citizen.tapToSpeak}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Listening Indicator Bar */}
            {isListening && (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span>{tr.citizen.listeningNow} ({selectedLang.split('-')[0].toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1 bg-red-500 rounded-full transition-all duration-100"
                      style={{ height: `${Math.max(6, Math.min(22, (audioLevel * (i + 1)) % 24))}px` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Speech Error Banner */}
            {speechError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                ⚠️ {speechError}
              </p>
            )}
          </div>

          {/* Quick 1-Click Symptom Presets (Expanded Shortcuts) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {tr.citizen.quickShortcutsLabel || 'QUICK 1-CLICK PRESET SHORTCUTS:'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'mr' ? '१० जलद पर्याय' : language === 'hi' ? '10 त्वरित विकल्प' : '10 Quick Presets'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {EMERGENCY_PRESETS.map((preset) => {
                const isSelected = 
                  problemText.trim() === preset.symptom.en.trim() ||
                  problemText.trim() === preset.symptom.hi.trim() ||
                  problemText.trim() === preset.symptom.mr.trim();
                const currentLabel = preset.label[language] || preset.label.en;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs group cursor-pointer flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base leading-none">{preset.icon}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className={`font-bold mt-1 leading-tight text-[11px] sm:text-xs ${
                      isSelected ? 'text-emerald-800' : 'text-slate-800 group-hover:text-emerald-700'
                    }`}>
                      {currentLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Confirmation Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{tr.citizen.reviewHeading}</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {tr.citizen.reviewAndConfirmBadge || 'Review & Confirm'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium min-h-[38px] flex items-center">
              {problemText ? (
                <span className="text-slate-900 font-semibold leading-relaxed">"{problemText}"</span>
              ) : (
                <span className="text-slate-400 italic">
                  {tr.citizen.noSymptomsEntered || 'No symptoms entered yet. Type above, select a shortcut, or tap the mic button.'}
                </span>
              )}
            </div>

            {/* Live Telemetry Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[280px]">
                  {tr.citizen.pickupLocationLabel || 'Pickup'}: <strong>{userLocation?.areaName || tr.citizen.liveGpsCoordinates || 'Live GPS Coordinates'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 font-bold text-red-600">
                <span>🚑 {tr.citizen.nearestAmbulanceEta || 'Nearest 108: ~6 mins ETA'}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Final Submit Button */}
          <button
            type="submit"
            disabled={!problemText.trim()}
            className={`w-full h-14 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              problemText.trim()
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 transform hover:scale-101 active:scale-99'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{tr.citizen.confirmAndDispatch}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

        </form>

      </div>
    </div>
  );
};
