import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Zap, ChevronUp, ChevronDown, Activity, Navigation, Clock, MapPin, Truck } from './icons';

interface LiveAmbulanceTrackerCardProps {
  className?: string;
}

export const LiveAmbulanceTrackerCard: React.FC<LiveAmbulanceTrackerCardProps> = ({ className = '' }) => {
  const { liveAmbulance, cancelDispatch, activeDispatch, hospitals } = useApp();
  const { tr, language } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!liveAmbulance) return null;

  const trackerTitle = language === 'mr' ? 'थेट रुग्णवाहिका ट्रॅकर' : language === 'hi' ? 'लाइव एम्बुलेंस ट्रैकर' : 'Live Ambulance Tracker';
  const pickupLabel = language === 'mr' ? 'पिकअप अंतर' : language === 'hi' ? 'पिकअप दूरी' : 'Distance to Pickup';
  const hospDistLabel = language === 'mr' ? 'रुग्णालय अंतर' : language === 'hi' ? 'अस्पताल दूरी' : 'Distance to Hospital';
  const remainingLabel = language === 'mr' ? 'किमी शिल्लक' : language === 'hi' ? 'किमी शेष' : 'km remaining';
  const callDriverLabel = language === 'mr' ? 'चालकाला कॉल करा' : language === 'hi' ? 'चालक को कॉल करें' : 'Call Driver';

  // Target hospital and expected arrival time
  const targetHospital = hospitals.find(h => h.id === activeDispatch?.currentHospitalId);
  const targetHospitalName = targetHospital?.name || 'Apex Trauma Center & Emergency Department';
  const etaMinutesToHosp = liveAmbulance.etaToHospitalMinutes || 12;
  const formattedArrivalTime = new Date(Date.now() + etaMinutesToHosp * 60000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const patientPickupAddress = activeDispatch?.pickupAddress || (language === 'mr' ? 'नागरिक थेट स्थान' : language === 'hi' ? 'नागरिक लाइव स्थान' : 'User Live Location');
  const patientPickupLat = liveAmbulance.pickupLat || activeDispatch?.pickupLat || 28.7080;
  const patientPickupLng = liveAmbulance.pickupLng || activeDispatch?.pickupLng || 77.0980;

  const ambLocationLabel = liveAmbulance.phase === 'EN_ROUTE_TO_PATIENT' 
    ? (language === 'mr' ? 'पिकअप स्थानाकडे मार्गक्रमण' : language === 'hi' ? 'पिकअप स्थान की ओर अग्रसर' : 'Approaching User Pickup Point')
    : (language === 'mr' ? 'रुग्णालयाकडे ग्रीन कॉरिडोअर' : language === 'hi' ? 'अस्पताल की ओर ग्रीन कॉरिडोर' : 'Transit Corridor to Hospital');

  return (
    <div className={`bg-white text-slate-800 rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 transition-all ${className}`}>
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Navigation className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight font-heading">
                {trackerTitle}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                108 Emergency
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">
              {liveAmbulance.phase === 'EN_ROUTE_TO_PATIENT' 
                ? (language === 'mr' ? 'टप्पा १: रुग्णाच्या पिकअप स्थानाकडे प्रवास' : language === 'hi' ? 'चरण 1: मरीज के पिकअप स्थान की ओर' : 'Phase 1: Approaching Patient Pickup Location')
                : (language === 'mr' ? 'टप्पा २: निश्चित रुग्णालयाकडे प्रवास' : language === 'hi' ? 'चरण 2: अस्पताल की ओर पारगमन' : 'Phase 2: Transit to Destination Hospital')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer flex items-center gap-1 text-xs"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <span className="hidden sm:inline text-[11px] font-medium text-slate-500">
            {isCollapsed ? tr.common.viewDetails : tr.common.close}
          </span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed ? (
        <div className="space-y-4 pt-3">
          {/* PRIMARY TRI-CARD TELEMETRY: Ambulance Location, User Location, Expected Hospital Arrival */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Ambulance Live Location */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/90 text-blue-950 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5 text-blue-900">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Ambulance Location</span>
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  {tr.common.live}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 font-mono">
                  {liveAmbulance.lat.toFixed(4)}° N, {liveAmbulance.lng.toFixed(4)}° E
                </p>
                <p className="text-[11px] text-blue-700 font-medium truncate mt-0.5">
                  {ambLocationLabel}
                </p>
              </div>
            </div>

            {/* 2. User / Patient Location */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/90 text-rose-950 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5 text-rose-900">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>User Location</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Pickup Point
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {patientPickupAddress}
                </p>
                <p className="text-[11px] text-rose-700 font-mono font-medium mt-0.5">
                  {patientPickupLat.toFixed(4)}° N, {patientPickupLng.toFixed(4)}° E
                </p>
              </div>
            </div>

            {/* 3. Expected Time by Which They Will Reach the Hospital */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 flex flex-col justify-between space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-900">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Expected Hospital Arrival</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ETA Inbound
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm sm:text-base font-black text-emerald-900 font-mono">
                    {formattedArrivalTime}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    (~{etaMinutesToHosp} {tr.common.unitMin})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                  Destination: <span className="font-semibold text-slate-900">{targetHospitalName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2 Distance & ETA Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Distance to Patient Pickup */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{pickupLabel}</span>
                </span>
                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  ~{liveAmbulance.etaToPatientMinutes}m {tr.common.eta}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  {liveAmbulance.distanceToPatientKm}
                </span>
                <span className="text-xs font-medium text-slate-500">{remainingLabel}</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                {liveAmbulance.phase === 'EN_ROUTE_TO_PATIENT' 
                  ? (language === 'mr' ? 'वाहन पिकअप स्थानाकडे जात आहे' : language === 'hi' ? 'वाहन पिकअप स्थान की ओर बढ़ रहा है' : 'Vehicle moving toward pickup coordinates') 
                  : (language === 'mr' ? 'रुग्ण पिकअप पूर्ण ✓' : language === 'hi' ? 'मरीज पिकअप पूर्ण ✓' : 'Patient Picked Up ✓')}
              </span>
            </div>

            {/* Distance from Patient to Destination Hospital */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{hospDistLabel}</span>
                </span>
                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  ~{liveAmbulance.etaToHospitalMinutes}m {tr.common.eta}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
                  {liveAmbulance.distancePatientToHospitalKm}
                </span>
                <span className="text-xs font-medium text-slate-500">{remainingLabel}</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                {targetHospitalName}
              </span>
            </div>
          </div>

          {/* Linear Route Progress Indicator */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>{language === 'mr' ? 'सुरुवात' : language === 'hi' ? 'प्रारंभ' : 'Depot'}</span>
              <span className="text-slate-700 font-bold">
                {liveAmbulance.progress < 0.45 
                  ? (language === 'mr' ? 'पिकअप स्थानाकडे जात आहे' : language === 'hi' ? 'मरीज पिकअप की ओर' : 'Approaching Patient Pickup') 
                  : (language === 'mr' ? 'रुग्णालयाच्या दिशेने' : language === 'hi' ? 'अस्पताल के रास्ते में' : 'In Transit to Hospital')}
              </span>
              <span>{language === 'mr' ? 'रुग्णालय' : language === 'hi' ? 'अस्पताल' : 'Hospital'}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-600 transition-all duration-700 ease-linear rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, Math.round(liveAmbulance.progress * 100)))}%` }}
              />
            </div>
          </div>

          {/* Driver Information & Actions Strip */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                {liveAmbulance.driverName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AM'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{liveAmbulance.driverName}</span>
                  <span className="text-xs text-slate-500 font-medium">★ 4.9</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <b className="text-emerald-700 font-semibold">{language === 'mr' ? 'थेट जीपीएस रडार सुरू' : language === 'hi' ? 'लाइव जीपीएस रडार सक्रिय' : 'Live GPS Radar Active'}</b>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${liveAmbulance.driverPhone}`}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>{callDriverLabel} ({liveAmbulance.driverPhone})</span>
              </a>
              <button
                type="button"
                onClick={cancelDispatch}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Cancel emergency dispatch"
              >
                <span>{language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel SOS'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed Compact View */
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              🚑 {liveAmbulance.lat.toFixed(4)}°N, {liveAmbulance.lng.toFixed(4)}°E
            </span>
            <span className="text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 truncate max-w-[200px]" title={patientPickupAddress}>
              📍 {patientPickupAddress}
            </span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
              ⏱ Reach: {formattedArrivalTime} (~{etaMinutesToHosp}m)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${liveAmbulance.driverPhone}`}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-slate-500" />
              <span>{callDriverLabel}</span>
            </a>
            <button
              type="button"
              onClick={cancelDispatch}
              className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer ml-1"
            >
              {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
