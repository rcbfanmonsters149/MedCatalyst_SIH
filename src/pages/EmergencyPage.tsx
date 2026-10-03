import React, { useState, useMemo } from 'react';
import { 
  Send, 
  PhoneCall, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Truck, 
  ArrowRight,
  MessageSquare
} from '../components/icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TollFreeBanner } from '../components/TollFreeBanner';
import { LeafletMap } from '../components/LeafletMap';
import { LiveAmbulanceTrackerCard } from '../components/LiveAmbulanceTrackerCard';
import { PostDispatchTransportCard } from '../components/PostDispatchTransportCard';
import { HandoverETAComparisonCard } from '../components/HandoverETAComparisonCard';
import { RaiseAmbulanceRequestModal } from '../components/RaiseAmbulanceRequestModal';
import { Link } from 'react-router-dom';

interface EmergencyPageProps {
  onNavigateToAmbulance?: () => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ onNavigateToAmbulance }) => {
  const { 
    hospitals, 
    activeDispatch, 
    ambulances,
    sendDispatchMessage,
    cancelDispatch,
    createEmergencyDispatch,
    userLocation,
    user
  } = useApp();
  const { tr, language } = useLanguage();

  const [chatMessage, setChatMessage] = useState('');
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | undefined>(undefined);

  const dispatch = activeDispatch;

  // Unconditionally call hooks at top level to satisfy React Rules of Hooks
  const memoizedPickup = useMemo(() => {
    if (!dispatch) return undefined;
    return {
      lat: dispatch.pickupLat,
      lng: dispatch.pickupLng,
      label: dispatch.pickupAddress
    };
  }, [dispatch?.pickupLat, dispatch?.pickupLng, dispatch?.pickupAddress]);

  const memoizedUserPickup = useMemo(() => {
    return userLocation ? {
      lat: userLocation.lat,
      lng: userLocation.lng,
      label: `Your Location (${userLocation.areaName || 'Live GPS'})`
    } : undefined;
  }, [userLocation?.lat, userLocation?.lng, userLocation?.areaName]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    sendDispatchMessage('CITIZEN', chatMessage);
    setChatMessage('');
  };

  const handleAmbulanceDispatch = (problemText: string, voiceTranscript?: string) => {
    createEmergencyDispatch(problemText, voiceTranscript, 'CRITICAL');
    setIsAmbulanceModalOpen(false);
  };

  // Qualified hospitals with 24/7 ambulance service
  const eligibleEmergencyHospitals = hospitals.filter(h => h.hasAmbulanceService);

  // Standby View: Show Hero Banner + Map of Hospitals that can support emergencies (NO ambulance tracking yet)
  if (!dispatch) {
    return (
      <div className="space-y-6">
        {/* Pinned Top Toll Free Banner */}
        <TollFreeBanner />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
          
          {/* 1. Hero Emergency Card with Single "Raise Ambulance request" Action */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-100 via-stone-100 to-zinc-100 p-6 sm:p-8 border border-slate-300 shadow-sm">
            <div className="relative z-10 max-w-3xl space-y-4">
              {/* Live Telemetry Status Ribbon */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/90 border border-slate-300 text-slate-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>24x7 National Emergency Grid (108 / 112)</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span>🚑</span>
                  <span>Nearest 108 Ambulance: <strong className="text-slate-900">2.1 km (~6 mins ETA)</strong></span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-heading text-slate-900">
                  {tr.citizen.heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                  Autonomous real-time routing to nearest oxygen/ICU beds, green-light corridor signal pre-emption, and certified 108 paramedic triage.
                </p>
              </div>

              {/* STRICTLY ONLY ONE BUTTON: Raise Ambulance request */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAmbulanceModalOpen(true)}
                  className="h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-md flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <span>{tr.citizen.raiseAmbulanceRequest}</span>
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Map showing hospitals that can support emergencies */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-heading">
                  {language === 'mr' 
                    ? 'आपत्कालीन सज्ज रुग्णालये (२४/७ अतिदक्षता, ऑक्सिजन व रुग्णवाहिका)' 
                    : language === 'hi' 
                    ? 'आपातकालीन सहायता योग्य अस्पताल (24/7 आईसीयू, ऑक्सीजन एवं एम्बुलेंस)' 
                    : 'Emergency Care Facilities (24/7 ICU & Resuscitation Network)'}
                </h3>
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  {eligibleEmergencyHospitals.length} Ready Facilities
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'mr' 
                  ? 'रुग्णवाहिका थेट ट्रॅकिंगसाठी वरील बटण दाबून विनंती नोंदवा' 
                  : language === 'hi' 
                  ? 'लाइव एम्बुलेंस ट्रैकिंग के लिए ऊपर दिए गए बटन से अनुरोध दर्ज करें' 
                  : 'Submit ambulance request above to begin live moving ambulance tracking'}
              </span>
            </div>

            <LeafletMap
              hospitals={eligibleEmergencyHospitals}
              ambulances={[]}
              pickupLocation={memoizedUserPickup}
              selectedHospitalId={selectedHospitalId}
              onSelectHospital={(id) => setSelectedHospitalId(id)}
              height="480px"
              showRouteLine={false}
              showLiveAmbulance={false}
              showRideHUD={false}
            />

            {/* Quick Helper Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>
                  {language === 'mr' 
                    ? 'हिरवे मार्कर: २४/७ आपत्कालीन व रुग्णवाहिका सेवा उपलब्ध' 
                    : language === 'hi' 
                    ? 'हरे मार्कर: 24/7 आपातकालीन एवं एम्बुलेंस सेवा उपलब्ध' 
                    : 'Green Markers: Qualified 24/7 emergency & ambulance facilities with ready bays'}
                </span>
              </div>
              <span className="text-slate-600 font-semibold">
                {language === 'mr' 
                  ? 'थेट GPS ट्रॅकिंग विनंती सबमिट केल्यानंतर त्वरित सुरू होईल' 
                  : language === 'hi' 
                  ? 'लाइव जीपीएस ट्रैकिंग अनुरोध सबमिट करने के बाद तुरंत शुरू होगी' 
                  : 'Live moving ambulance tracking starts immediately upon submitting SOS'}
              </span>
            </div>
          </div>

          {/* Quick Helplines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a 
              href="tel:108"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/40 transition flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                  108
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">National Ambulance Hotline</h4>
                  <span className="text-[11px] text-slate-500">24/7 Immediate Dispatch</span>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600 group-hover:scale-110 transition" />
            </a>

            <a 
              href="tel:112"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  112
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">All-India Emergency Help</h4>
                  <span className="text-[11px] text-slate-500">Police, Fire & Medical</span>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
            </a>

            <a 
              href="tel:102"
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-pink-300 hover:bg-pink-50/40 transition flex items-center justify-between group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
                  102
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Maternal & Infant Health</h4>
                  <span className="text-[11px] text-slate-500">Free Janani Shishu Express</span>
                </div>
              </div>
              <PhoneCall className="w-4 h-4 text-pink-600 group-hover:scale-110 transition" />
            </a>
          </div>

          {/* Unified Raise Ambulance Request Modal */}
          <RaiseAmbulanceRequestModal
            isOpen={isAmbulanceModalOpen}
            onClose={() => setIsAmbulanceModalOpen(false)}
            onSubmitDispatch={handleAmbulanceDispatch}
          />

        </div>
      </div>
    );
  }

  // Active Dispatch View: Map shows live tracking of ambulance towards the user
  return (
    <div className="space-y-6">
      
      {/* Pinned Top Toll Free Banner */}
      <TollFreeBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">

        {/* Emergency Dashboard Eligibility Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Emergency Verification Notice:</strong> Only verified hospitals with an active 24/7 ambulance fleet and resuscitation OT are registered under this rapid emergency network.
            </span>
          </div>
          <span className="font-bold text-amber-800 shrink-0 hidden sm:inline">
            {eligibleEmergencyHospitals.length} Qualified Facilities Active
          </span>
        </div>

        {/* 3-WAY REAL-TIME ETA COMPARISON (When Meet Halfway Mode is Active) */}
        {dispatch.transportMode === 'MEET_HALFWAY' && (
          <HandoverETAComparisonCard />
        )}

        {/* LIVE INTERACTIVE GPS RADAR & TRACKING MAP (Ambulance Moving Towards User) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <h3 className="font-bold text-slate-900 text-base font-heading">
                {language === 'mr' ? 'थेट रवानगी रडार व रुग्णवाहिका ट्रॅकिंग' : language === 'hi' ? 'लाइव प्रेषण रडार एवं एम्बुलेंस ट्रैकिंग' : 'Live Dispatch Radar & Moving Ambulance Tracking'}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono">
                {tr.common.live}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {language === 'mr' ? 'रुग्णवाहिका प्रवासानुसार थेट अंतर सतत अद्यतनित होते' : language === 'hi' ? 'एम्बुलेंस यात्रा के दौरान वास्तविक दूरी निरंतर अद्यतन होती है' : 'Live distances update continuously as ambulance travels'}
              </span>
              <button
                type="button"
                onClick={cancelDispatch}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer shrink-0"
                title="Cancel emergency dispatch"
              >
                <span>{language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel SOS'}</span>
              </button>
            </div>
          </div>

          <LeafletMap
            hospitals={hospitals}
            ambulances={ambulances}
            selectedHospitalId={dispatch.currentHospitalId}
            pickupLocation={memoizedPickup}
            height="500px"
            showRouteLine={true}
            showLiveAmbulance={true}
            showRideHUD={true}
          />

          {/* DEDICATED SEPARATE LIVE AMBULANCE TELEMETRY & ROUTE TRACKER CARD */}
          <LiveAmbulanceTrackerCard />
        </div>

        {/* POST-DISPATCH TRANSPORT / DESIRED LOCATION COORDINATION OPTION */}
        <PostDispatchTransportCard />

        {/* TWO-COLUMN LIVE COMMUNICATION & PATIENT HUD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Real-time Incident Communication Radio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-heading">
                  {tr.emergency.liveChat}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {language === 'mr' ? 'सुरक्षित संप्रेषण' : language === 'hi' ? 'सुरक्षित संचार' : 'Encrypted Tri-Party Link'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
              {dispatch.messages.map((m, i) => {
                const isCitizen = m.sender === 'CITIZEN';
                const isHospital = m.sender === 'HOSPITAL';

                return (
                  <div 
                    key={i}
                    className={`p-3 rounded-xl ${
                      isCitizen 
                        ? 'bg-slate-100 text-slate-800 ml-4' 
                        : isHospital 
                        ? 'bg-blue-50 border border-blue-200 text-blue-900 mr-4' 
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-75">
                      <span>
                        {isCitizen 
                          ? (language === 'mr' ? 'तुम्ही (कॉलर)' : language === 'hi' ? 'आप (कॉलर)' : 'YOU (Caller)') 
                          : isHospital 
                          ? (language === 'mr' ? '🏥 प्राप्त रुग्णालय ER' : language === 'hi' ? '🏥 प्राप्तकर्ता अस्पताल ER' : '🏥 Receiving Hospital ER') 
                          : (language === 'mr' ? '🚑 पॅरामेडिक चमू' : language === 'hi' ? '🚑 पैरामेडिक टीम' : '🚑 Paramedic Crew')}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Send Update Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={tr.emergency.typeMessage}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{tr.emergency.send}</span>
              </button>
            </form>
          </div>

          {/* Patient Pre-Arrival Health Record Warnings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800">
                {language === 'mr' ? 'जोडलेली नागरिक आरोग्य माहिती:' : language === 'hi' ? 'संबद्ध नागरिक बायो-डेटा:' : 'Linked Citizen Bio-Data:'}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">ABHA ID: 91-8273-1928-3920</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-medium">{tr.biodata.bloodGroup}:</span>
                <strong className="text-slate-800 text-sm">O-Positive (O+)</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-900">
                <span className="text-rose-400 block font-medium">{tr.biodata.allergies}:</span>
                <strong>Penicillin & Sulfa Drugs</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 block font-medium">{tr.biodata.chronicConditions}:</span>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700">Type 2 Diabetes</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700">Mild Hypertension</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'mr' ? 'पॅरामेडिक तपासणी फॉर्म जोडला गेला आहे' : language === 'hi' ? 'पैरामेडिक मूल्यांकन फॉर्म जुड़ा हुआ है' : 'In-Ambulance Paramedic Assessment Form Linked'}</span>
              </div>

              <Link
                to="/hospital?tab=ambulance"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200"
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>{tr.nav.paramedicCrew}</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
