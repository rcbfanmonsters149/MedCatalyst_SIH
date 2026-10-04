import React from 'react';
import { 
  X, 
  Droplet, 
  AlertTriangle, 
  Pill, 
  Building2, 
  Truck, 
  Printer, 
  CheckCircle2, 
  FileText,
  User
} from './icons';
import { EmergencyDispatch, UserBioData, Hospital } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HospitalTransferredDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: EmergencyDispatch;
  user: UserBioData;
  receivingHospital?: Hospital;
}

export const HospitalTransferredDataModal: React.FC<HospitalTransferredDataModalProps> = ({
  isOpen,
  onClose,
  dispatch,
  user,
  receivingHospital
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const hospName = receivingHospital?.name || 'Rampur Primary Health Center (PHC)';
  const hospAddress = receivingHospital?.address || 'Civil Hospital Road, Rampur';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative z-10 space-y-5 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                {language === 'mr' 
                  ? 'रुग्णालयाकडे पाठवलेला संपूर्ण रुग्ण डेटा' 
                  : language === 'hi' 
                    ? 'अस्पताल को हस्तांतरित संपूर्ण मरीज स्वास्थ्य डेटा' 
                    : 'Patient Emergency Data Transferred to Hospital'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ABDM FHIR SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'mr'
                ? `रुग्णालयात पोहोचण्यापूर्वी ER टीमकडे सुपूर्द केलेला डिजिटल आरोग्य इतिहास व पॅरामेडिक माहिती.`
                : language === 'hi'
                  ? `अस्पताल पहुंचने से पहले ER टीम को हस्तांतरित डिजिटल स्वास्थ्य रिकॉर्ड और लाइव पैरामेडिक डेटा।`
                  : `Real-time encrypted pre-arrival dossier delivered directly to the emergency triage desk of ${hospName}.`}
            </p>
          </div>
        </div>

        {/* Destination Hospital Status */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 border border-teal-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                {language === 'mr' ? 'प्राप्तकर्ता रुग्णालय:' : language === 'hi' ? 'प्राप्तकर्ता अस्पताल:' : 'Receiving Healthcare Facility:'}
              </span>
              <strong className="text-slate-900 text-sm font-semibold">{hospName}</strong>
              <span className="text-slate-500 text-[11px] block">{hospAddress}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Patient Identity & ABHA Verification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>{language === 'mr' ? '१. रुग्ण ओळख व आभा (ABHA) माहिती' : language === 'hi' ? '१. मरीज पहचान और आभा (ABHA) विवरण' : '1. Patient Identity & Verified ABHA'}</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ABHA ID: {user.healthId || '91-8273-1928-3920'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
              <strong className="text-slate-800 text-xs sm:text-sm font-semibold">{user.fullName}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Age & Gender</span>
              <strong className="text-slate-800 text-xs sm:text-sm font-semibold">{user.age} Yrs • {user.gender}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
              <strong className="text-slate-800 text-xs sm:text-sm font-mono font-semibold">+91 {user.phone}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Kin</span>
              <strong className="text-slate-800 text-[11px] font-semibold">Sunita Patil (Wife)</strong>
              <span className="text-[10px] text-slate-500 block font-mono">+91 98765 43211</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Residential Address</span>
            <span className="text-slate-700 font-medium">{user.address || 'House #42, Shivaji Chowk, Rampur'}</span>
          </div>
        </div>

        {/* Section 2: Critical Pre-Arrival Medical Warnings & Allergies */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{language === 'mr' ? '२. तात्काळ वैद्यकीय धोके व ॲलर्जी' : language === 'hi' ? '२. आपातकालीन मेडिकल अलर्ट व एलर्जी' : '2. Critical Pre-Arrival Clinical Alerts & Allergies'}</span>
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase">
              ER Doctor Pre-Warning
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Blood Group */}
            <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5 fill-red-600 text-red-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider block">Blood Group</span>
                <strong className="text-red-950 text-base font-extrabold">{user.bloodGroup || 'O-Positive (O+)'}</strong>
                <span className="text-[11px] text-red-700 block">Universal Compatible Red Cells</span>
              </div>
            </div>

            {/* Severe Allergies */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                  ⚠️ Severe Drug Allergies
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-200/80 px-1.5 py-0.2 rounded">
                  ANAPHYLAXIS RISK
                </span>
              </div>
              <strong className="text-rose-950 text-xs sm:text-sm block">Penicillin & Sulfa Drugs</strong>
              <p className="text-[11px] text-rose-800 leading-tight">
                DO NOT ADMINISTER Amoxicillin, Ampicillin, or Septran. Use Macrolides/Cephalosporins per protocol.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Chronic Conditions */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Chronic Medical Conditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                  Type 2 Diabetes Mellitus
                </span>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                  Mild Essential Hypertension
                </span>
              </div>
            </div>

            {/* Daily Medications */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Current Regular Medications
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <strong className="text-slate-800">Metformin 500mg</strong>
                  <span className="text-slate-500">Twice daily (Post-meal)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <strong className="text-slate-800">Amlodipine 5mg</strong>
                  <span className="text-slate-500">Once daily (Morning)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Live En-Route Paramedic Vitals & Triage Telemetry */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'mr' ? '३. रुग्णवाहिकेतील पॅरामेडिक तपासणी व लाइव्ह व्हायटल्स' : language === 'hi' ? '३. एम्बुलेंस पैरामेडिक असेसमेंट व लाइव वाइटल्स' : '3. En-Route Paramedic Assessment & Live Vitals'}</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Ambulance: {dispatch.assignedAmbulanceId || 'MH-12-AMB-1081'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
              <strong className="text-emerald-700 text-sm font-extrabold">84 bpm</strong>
              <span className="text-[10px] text-slate-500 block">Normal Sinus</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Oxygen</span>
              <strong className="text-emerald-700 text-sm font-extrabold">98% SpO2</strong>
              <span className="text-[10px] text-slate-500 block">Room Air</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
              <strong className="text-slate-800 text-sm font-extrabold">128 / 82</strong>
              <span className="text-[10px] text-slate-500 block">mmHg</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Consciousness (GCS)</span>
              <strong className="text-teal-700 text-sm font-extrabold">15 / 15</strong>
              <span className="text-[10px] text-slate-500 block">Fully Oriented</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Paramedic Field Report & On-Board Interventions:
            </span>
            <p className="text-emerald-950 text-[11px] leading-relaxed">
              &quot;Patient conscious and alert. Cervical spine stabilized with collar. Peripheral IV line secured in left forearm (Normal Saline 100ml/hr). Pre-arrival hospital intake alert acknowledged by ER staff.&quot;
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Dossier</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 cursor-pointer"
          >
            {language === 'mr' ? 'बंद करा' : language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
