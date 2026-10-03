import React, { useState, useEffect } from 'react';
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
  Truck,
  Sparkles,
  CheckCircle2
} from './icons';
import { HandoverLandmark, MeetingPointCoordination } from '../types';
import { VERIFIED_SAFE_LANDMARKS, calculateDynamicMeetingPoint } from '../utils/handoverEngine';

interface RendezvousTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type MeetingLocationMode = 'AUTO_OPTIMAL' | 'MANUAL_LANDMARK';

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
    ambulances,
    userLocation
  } = useApp();
  const { language } = useLanguage();

  const [locationMode, setLocationMode] = useState<MeetingLocationMode>('AUTO_OPTIMAL');
  const [selectedVehicle, setSelectedVehicle] = useState<'BIKE' | 'AUTO_RICKSHAW' | 'CAR' | 'TRACTOR'>('BIKE');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>(() => {
    return activeHandover?.landmark?.id || VERIFIED_SAFE_LANDMARKS[0].id;
  });

  const [autoPreview, setAutoPreview] = useState<MeetingPointCoordination | null>(null);
  const [isCalculatingPreview, setIsCalculatingPreview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute live auto-calculated optimal meeting point preview whenever modal is open or vehicle changes
  useEffect(() => {
    if (!isOpen || !activeDispatch) return;

    let isMounted = true;
    const computePreview = async () => {
      setIsCalculatingPreview(true);
      try {
        const assignedAmb = ambulances.find(a => a.id === activeDispatch.assignedAmbulanceId) || ambulances[0];
        const targetHosp = hospitals.find(h => h.id === activeDispatch.currentHospitalId) || hospitals[0];
        const patientLat = activeDispatch.pickupLat || userLocation?.lat || 28.7080;
        const patientLng = activeDispatch.pickupLng || userLocation?.lng || 77.0980;
        const ambLat = assignedAmb.currentLat;
        const ambLng = assignedAmb.currentLng;

        const speedMap = { BIKE: 35, AUTO_RICKSHAW: 30, CAR: 50, TRACTOR: 20 };
        const speed = speedMap[selectedVehicle] || 35;

        const result = await calculateDynamicMeetingPoint({
          caretakerLat: patientLat,
          caretakerLng: patientLng,
          ambulanceLat: ambLat,
          ambulanceLng: ambLng,
          hospitalLat: targetHosp.lat,
          hospitalLng: targetHosp.lng,
          caretakerSpeedKmH: speed,
          ambulanceSpeedKmH: 55,
          triageAssessment: activeDispatch.ambulanceAssessment,
          customLandmark: undefined
        });

        if (isMounted) {
          setAutoPreview(result);
        }
      } catch (err) {
        console.warn('Auto rendezvous preview calculation error:', err);
      } finally {
        if (isMounted) {
          setIsCalculatingPreview(false);
        }
      }
    };

    computePreview();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    activeDispatch?.id,
    selectedVehicle,
    ambulances,
    hospitals,
    activeDispatch?.pickupLat,
    activeDispatch?.pickupLng,
    activeDispatch?.currentHospitalId,
    activeDispatch?.assignedAmbulanceId,
    activeDispatch?.ambulanceAssessment,
    userLocation?.lat,
    userLocation?.lng
  ]);

  if (!isOpen || !activeDispatch) return null;

  const isDirectRecommended = activeHandover?.directPickupRecommended || 
    (activeDispatch.ambulanceAssessment && (activeDispatch.ambulanceAssessment.gcs <= 8 || activeDispatch.ambulanceAssessment.spo2 < 85));

  const recommendationReason = activeHandover?.safetyRecommendationReason || 
    'Patient has acute clinical severity. Immediate on-site paramedic stabilization is recommended.';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (locationMode === 'AUTO_OPTIMAL') {
        // Let the software algorithm dynamically compute the optimal meeting point along the road
        await activateRendezvousTravel(selectedVehicle, undefined);
      } else {
        // Manually chosen landmark
        const chosenLandmark = VERIFIED_SAFE_LANDMARKS.find(l => l.id === selectedLandmarkId) || VERIFIED_SAFE_LANDMARKS[0];
        await activateRendezvousTravel(selectedVehicle, chosenLandmark);
      }
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg">
              🤝
            </div>
            <div>
              <h3 className="font-extrabold text-base font-heading">
                {language === 'mr' ? 'भेट ठिकाण निश्चित करा (रुग्णवाहिका व तुमचे वाहन)' : language === 'hi' ? 'मिलन स्थल निर्धारित करें (एम्बुलेंस एवं आपका वाहन)' : 'Set Rendezvous Meeting Point (Meet Ambulance)'}
              </h3>
              <p className="text-xs text-blue-100">
                {language === 'mr' 
                  ? 'सॉफ्टवेअर आपोआप सर्वोत्तम भेट ठिकाण शोधू शकते किंवा तुम्ही स्वतः निवडू शकता.' 
                  : language === 'hi' 
                  ? 'सॉफ्टवेयर स्वतः सर्वोत्तम मिलन स्थल चुन सकता है अथवा आप स्वयं चुन सकते हैं।' 
                  : 'Let the software auto-calculate the optimal meeting spot or choose manually.'}
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

          {/* Section 2: Choose Strategy - Auto Find Best Location vs Manual Pick */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                2. How Would You Like to Set the Meeting Location? *
              </label>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                AI / Routing Algorithm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Software Auto-Finds Best Location (RECOMMENDED) */}
              <button
                type="button"
                onClick={() => setLocationMode('AUTO_OPTIMAL')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  locationMode === 'AUTO_OPTIMAL'
                    ? 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      <span className="font-extrabold text-xs text-slate-900">
                        {language === 'mr' ? 'सॉफ्टवेअरद्वारे सर्वोत्तम ठिकाण शोधा' : language === 'hi' ? 'सॉफ्टवेयर द्वारा सर्वोत्तम स्थान खोजें' : 'Software Auto-Finds Best Location'}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      ⭐ Recommended
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === 'mr'
                      ? 'अल्गोरिदम रुग्णवाहिकेचा थेट वेग, रस्ता आणि तुमच्या वाहनाचा वेग मोजून सर्वात जलद भेटीचे सुरक्षित ठिकाण स्वतः ठरवतो.'
                      : language === 'hi'
                      ? 'एल्गोरिदम एम्बुलेंस की गति, सड़क मार्ग और आपके वाहन की गति के आधार पर सबसे तेज सुरक्षित मिलन स्थल स्वतः तय करता है।'
                      : 'Algorithm calculates the exact road convergence midpoint based on live ambulance velocity, GPS route, and your vehicle speed.'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dynamic Road Convergence</span>
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    locationMode === 'AUTO_OPTIMAL' 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {locationMode === 'AUTO_OPTIMAL' && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
              </button>

              {/* Option B: Choose Location Manually */}
              <button
                type="button"
                onClick={() => setLocationMode('MANUAL_LANDMARK')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  locationMode === 'MANUAL_LANDMARK'
                    ? 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      <span className="font-extrabold text-xs text-slate-900">
                        {language === 'mr' ? 'स्वतः ठिकाण निवडा' : language === 'hi' ? 'स्थान स्वयं चुनें' : 'Choose Location Manually'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                      Manual Pick
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === 'mr'
                      ? 'महामार्गावरील खात्रीशीर पेट्रोल पंप, टोल नाका किंवा आरोग्य उपकेंद्र स्वतः निवडा.'
                      : language === 'hi'
                      ? 'राजमार्ग पर सत्यापित पेट्रोल पंप, टोल प्लाजा अथवा स्वास्थ्य उपकेंद्र की सूची में से स्वयं चुनें।'
                      : 'Manually select a verified roadside landmark (Fuel station, Toll plaza, or Health Sub-Center) from the certified list.'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Select from Verified Spots</span>
                  </span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    locationMode === 'MANUAL_LANDMARK' 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {locationMode === 'MANUAL_LANDMARK' && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* Conditional Detail: Auto-Calculated Spot Preview OR Manual Landmark Selection */}
          {locationMode === 'AUTO_OPTIMAL' ? (
            <div className="p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white rounded-2xl border border-blue-200 shadow-2xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                  <h4 className="font-extrabold text-xs text-blue-950 font-heading flex items-center gap-1.5">
                    <span>{language === 'mr' ? 'सॉफ्टवेअरने निर्धारित केलेले सर्वोत्तम भेट ठिकाण' : language === 'hi' ? 'सॉफ्टवेयर द्वारा निर्धारित सर्वोत्तम मिलन स्थल' : 'Software Auto-Calculated Meeting Point'}</span>
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">
                  ⚡ 50% Faster Care
                </span>
              </div>

              {/* Resolved Safe Landmark Card */}
              <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-xs text-slate-900">
                        {autoPreview?.landmark?.name || 'Calculating Optimal Highway Safe Pullover...'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 pl-6">
                      {autoPreview?.landmark?.address || 'SH-14 Highway Pullover with Wide Paved Shoulder'}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Safe Pullover Bay
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pl-6 pt-0.5">
                  {(autoPreview?.landmark?.features || [
                    'Wide Highway Shoulder',
                    '24x7 High-Mast Lighting',
                    'Paved Waiting Forecourt'
                  ]).slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Synchronized Telemetry Convergence Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Your Travel</span>
                  <strong className="text-xs text-amber-700 font-extrabold block mt-0.5">
                    {autoPreview ? `~${autoPreview.caretakerDistanceKm} km` : 'Calculating...'}
                  </strong>
                  <span className="text-[9px] text-slate-400">
                    {autoPreview ? `~${autoPreview.caretakerEtaMinutes} mins ETA` : ''}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">108 Ambulance</span>
                  <strong className="text-xs text-emerald-700 font-extrabold block mt-0.5">
                    {autoPreview ? `~${autoPreview.ambulanceDistanceKm} km` : 'Calculating...'}
                  </strong>
                  <span className="text-[9px] text-slate-400">
                    {autoPreview ? `~${autoPreview.ambulanceEtaMinutes} mins ETA` : ''}
                  </span>
                </div>

                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Time Saved</span>
                  <strong className="text-xs text-emerald-700 font-black block mt-0.5">
                    {autoPreview ? `~${autoPreview.timeSavedMinutes} Mins` : '~16 Mins'}
                  </strong>
                  <span className="text-[9px] text-emerald-600 font-bold">
                    Fastest Care
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic leading-snug">
                ℹ️ The software balances both vehicles' speeds so patient and paramedic arrive within 1-2 minutes of each other without waiting.
              </p>
            </div>
          ) : (
            /* Manual Selection Landmark List */
            <div className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-[11px]">
                  Select from Verified Highway Landmarks:
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Safe Pull-Overs
                </span>
              </div>

              <div className="space-y-2">
                {VERIFIED_SAFE_LANDMARKS.slice(0, 4).map((lm, idx) => {
                  const isSelected = selectedLandmarkId === lm.id;
                  const isTopPick = idx === 0;

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
                          {isTopPick && (
                            <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Top Pullover Bay
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
          )}

          {/* Time Saved & Benefit Highlight Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">
                  {locationMode === 'AUTO_OPTIMAL' ? 'Algorithm-Optimized Rendezvous' : 'Pre-Determined Roadside Meeting'}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Both vehicles move simultaneously towards each other, cutting emergency response time by up to 50%.
                </p>
              </div>
            </div>
            <span className="font-mono font-black text-emerald-700 text-xs hidden sm:inline bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              ⚡ ~16 Mins Saved
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
            <span>
              {isSubmitting 
                ? 'Configuring Rendezvous...' 
                : locationMode === 'AUTO_OPTIMAL'
                ? 'Confirm & Auto-Rendezvous with Ambulance'
                : 'Confirm & Meet at Selected Landmark'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
