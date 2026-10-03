import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Check, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Truck 
} from './icons';
import { HandoverLandmark } from '../types';
import { VERIFIED_SAFE_LANDMARKS } from '../utils/handoverEngine';

interface RendezvousTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VEHICLE_OPTIONS: {
  id: 'BIKE' | 'AUTO_RICKSHAW' | 'CAR' | 'TRACTOR';
  name: string;
  icon: string;
  speed: string;
  description: string;
}[] = [
  {
    id: 'BIKE',
    name: 'Bike / Two-Wheeler',
    icon: '🏍️',
    speed: '~35 km/h',
    description: 'Fastest navigation through narrow village lanes and rural alleys'
  },
  {
    id: 'AUTO_RICKSHAW',
    name: 'Auto-Rickshaw / Tempo',
    icon: '🛺',
    speed: '~30 km/h',
    description: 'Enclosed three-wheeler, widely available rural transport'
  },
  {
    id: 'CAR',
    name: 'Private Car / Taxi',
    icon: '🚗',
    speed: '~50 km/h',
    description: 'High-speed highway vehicle, maximum patient comfort and safety'
  },
  {
    id: 'TRACTOR',
    name: 'Rural Utility / Tractor',
    icon: '🚜',
    speed: '~20 km/h',
    description: 'Heavy terrain mobility for unpaved farm roads and fields'
  }
];

export const RendezvousTravelModal: React.FC<RendezvousTravelModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    activeDispatch, 
    activeHandover, 
    activateRendezvousTravel, 
    hospitals, 
    ambulances 
  } = useApp();
  const { language } = useLanguage();

  const [selectedVehicle, setSelectedVehicle] = useState<'BIKE' | 'AUTO_RICKSHAW' | 'CAR' | 'TRACTOR'>('BIKE');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>(() => {
    return activeHandover?.landmark?.id || VERIFIED_SAFE_LANDMARKS[0].id;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activeDispatch) return null;

  const assignedAmb = ambulances.find(a => a.id === activeDispatch.assignedAmbulanceId) || ambulances[0];
  const targetHosp = hospitals.find(h => h.id === activeDispatch.currentHospitalId) || hospitals[0];

  const isDirectRecommended = activeHandover?.directPickupRecommended || 
    (activeDispatch.ambulanceAssessment && (activeDispatch.ambulanceAssessment.gcs <= 8 || activeDispatch.ambulanceAssessment.spo2 < 85));

  const recommendationReason = activeHandover?.safetyRecommendationReason || 
    'Patient has acute clinical severity. Immediate on-site paramedic stabilization is recommended.';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const chosenLandmark = VERIFIED_SAFE_LANDMARKS.find(l => l.id === selectedLandmarkId) || VERIFIED_SAFE_LANDMARKS[0];
    await activateRendezvousTravel(selectedVehicle, chosenLandmark);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg">
              🚗
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading">
                {language === 'mr' ? 'इच्छित स्थळाकडे प्रवास करा (रुग्णवाहिकेला भेटा)' : language === 'hi' ? 'वांछित स्थल की ओर यात्रा करें (एम्बुलेंस से मिलें)' : 'Travel to Desired Meeting Point (Meet Ambulance)'}
              </h3>
              <p className="text-xs text-blue-100">
                {language === 'mr' 
                  ? 'स्थानिक वाहनाने इच्छित भेट ठिकाणाकडे प्रवास करा आणि वैद्यकीय मदत ५०% वेगाने मिळवा.' 
                  : language === 'hi' 
                  ? 'स्थानीय वाहन से वांछित बैठक स्थल की ओर यात्रा करें और 50% तेजी से उपचार प्राप्त करें।' 
                  : 'Use your own vehicle to travel towards a designated roadside point for faster paramedic rendezvous.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          
          {/* Clinical Safety Warning if Critical */}
          {isDirectRecommended && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <span>⚠️ Clinical Safety Advisory</span>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono font-bold">HIGH SEVERITY</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {recommendationReason}
                </p>
                <p className="text-[10px] text-rose-700 italic">
                  * Only travel if the patient is conscious, sitting safely, and accompanied by an adult.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Choose Available Means of Transport */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              1. Select Your Available Means of Transport *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VEHICLE_OPTIONS.map((veh) => {
                const isSelected = selectedVehicle === veh.id;
                return (
                  <button
                    key={veh.id}
                    type="button"
                    onClick={() => setSelectedVehicle(veh.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{veh.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{veh.name}</span>
                        <span className="font-mono text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                          {veh.speed}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {veh.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Desired Meeting Landmark */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                2. Choose Desired Meeting Location / Roadside Landmark *
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Safe Pull-Overs
              </span>
            </div>

            <div className="space-y-2">
              {VERIFIED_SAFE_LANDMARKS.slice(0, 4).map((lm, idx) => {
                const isSelected = selectedLandmarkId === lm.id;
                const isRecommended = idx === 0;

                return (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => setSelectedLandmarkId(lm.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{lm.name}</span>
                        </span>
                        {isRecommended && (
                          <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ⭐ Recommended (Optimal Midpoint)
                          </span>
                        )}
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {lm.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {lm.address}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {lm.features.slice(0, 3).map((f, fIdx) => (
                          <span key={fIdx} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center self-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Saved & Benefit Highlight Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Estimated Time Saved: ~14 to 18 Minutes</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Both vehicles move simultaneously towards each other, cutting emergency response time significantly.
                </p>
              </div>
            </div>
            <span className="font-mono font-black text-emerald-700 text-xs hidden sm:inline bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              ⚡ 50% Faster
            </span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
          >
            Cancel (Wait at My Location)
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 text-xs"
          >
            <Navigation className="w-4 h-4" />
            <span>{isSubmitting ? 'Configuring Rendezvous...' : 'Confirm & Start Traveling to Meeting Spot'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
