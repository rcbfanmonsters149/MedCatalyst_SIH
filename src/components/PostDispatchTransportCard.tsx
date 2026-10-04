import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Navigation, Zap, AlertTriangle, RotateCcw } from './icons';
import { RendezvousTravelModal } from './RendezvousTravelModal';

interface PostDispatchTransportCardProps {
  className?: string;
}

export const PostDispatchTransportCard: React.FC<PostDispatchTransportCardProps> = ({
  className = ''
}) => {
  const { activeDispatch, setTransportMode } = useApp();
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!activeDispatch) return null;

  const isRendezvousActive = activeDispatch.transportMode === 'MEET_HALFWAY';

  return (
    <>
      <div className={`rounded-2xl border transition-all shadow-xs ${
        isRendezvousActive
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-300'
          : 'bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border-blue-200'
      } p-4 sm:p-5 ${className}`}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs text-xl ${
              isRendezvousActive ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {isRendezvousActive ? '🤝' : '🚗'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold ${isRendezvousActive ? 'text-emerald-900' : 'text-blue-900'}`}>
                  {isRendezvousActive 
                    ? (language === 'mr' ? 'अर्ध्या रस्त्यात भेटण्याची प्रक्रिया सुरू आहे' : language === 'hi' ? 'आधे रास्ते में मिलन प्रक्रिया सक्रिय है' : 'Active Travel to Meet Up Point in Progress')
                    : (language === 'mr' ? 'स्वतःचे वाहन उपलब्ध आहे का? (बाईक, कार, ऑटो)' : language === 'hi' ? 'क्या आपके पास अपना वाहन उपलब्ध है? (बाइक, कार, ऑटो)' : 'Have your own vehicle/transport available? (Bike, Car, Auto)')}
                </span>

                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full font-mono border ${
                  isRendezvousActive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {isRendezvousActive ? 'LIVE CONVERGENCE' : '⚡ Save up to 16 Mins'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {isRendezvousActive
                  ? (language === 'mr'
                    ? 'दोन्ही वाहने निवडलेल्या भेट ठिकाणाकडे प्रवास करत आहेत. अडचण असल्यास आपण मूळ स्थानावर थांबण्याचा पर्याय निवडू शकता.'
                    : language === 'hi'
                    ? 'दोनों वाहन चुने गए मिलन स्थल की ओर अग्रसर हैं। किसी भी स्थिति में आप पुनः अपने मूल स्थान पर एम्बुलेंस बुला सकते हैं।'
                    : 'Both vehicles are approaching the designated meeting spot. You can safely revert to direct pickup anytime.')
                    : (language === 'mr'
                    ? 'रुग्णवाहिका थेट तुमच्या स्थानाकडे येत आहे. जर तुमच्याकडे स्वतःचे वाहन असेल, तर आमची प्रणाली आपोआप सर्वोत्तम भेट ठिकाण ठरवू शकते (किंवा तुम्ही स्वतः निवडू शकता) जेणेकरून उपचार लवकर मिळतील.'
                    : language === 'hi'
                    ? 'एम्बुलेंस सीधे आपके स्थान की ओर आ रही है। यदि आपके पास अपना वाहन है, तो हमारा सॉफ्टवेयर स्वतः सबसे अच्छा मिलन स्थल तय कर सकता है (या आप स्वयं चुन सकते हैं) ताकि तेजी से उपचार मिल सके।'
                    : 'Ambulance is en route directly to your location. If you have local transport, our software can automatically find the best midway meeting spot (or you can pick manually) to meet the ambulance and receive paramedic care faster.')}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isRendezvousActive ? (
              <button
                type="button"
                onClick={() => setTransportMode('DIRECT_AMBULANCE')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-300 hover:border-rose-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'प्रवास रद्द करा (माझ्या स्थानावर या)' : language === 'hi' ? 'यात्रा रद्द करें (मेरे स्थान पर आएं)' : 'Cancel Travel (Come to My Location)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>{language === 'mr' ? 'भेट ठिकाणाकडे प्रवास करा (ऑटो / मॅन्युअल)' : language === 'hi' ? 'मिलन स्थल की ओर यात्रा करें (ऑटो / मैनुअल)' : 'Travel to Meeting Spot (Auto / Manual)'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Rendezvous Modal */}
      <RendezvousTravelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
