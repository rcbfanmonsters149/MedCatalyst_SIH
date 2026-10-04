import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  User, 
  AlertTriangle, 
  Droplet, 
  Pill, 
  Activity, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Stethoscope, 
  Phone, 
  FlaskConical,
  Sparkles
} from '../icons';
import { EmergencyDispatch, UserBioData, Hospital, PatientRecord } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HospitalEmergencyPatientRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserBioData;
  dispatch: EmergencyDispatch | null;
  hospital: Hospital;
}

export const HospitalEmergencyPatientRecordsModal: React.FC<HospitalEmergencyPatientRecordsModalProps> = ({
  isOpen,
  onClose,
  user,
  dispatch,
  hospital
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PAST_RECORDS' | 'PARAMEDIC_VITALS' | 'BLOCKCHAIN'>('OVERVIEW');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const recordsList: PatientRecord[] = user.pastRecords || [];
  const vitals = dispatch?.vitals;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative z-10 space-y-5 max-h-[92vh] overflow-y-auto"
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
                  ? 'रुग्ण आपत्कालीन आरोग्य नोंदी व इतिहास' 
                  : language === 'hi' 
                    ? 'मरीज आपातकालीन स्वास्थ्य रिकॉर्ड एवं इतिहास' 
                    : 'Emergency Patient Health Records & Clinical Dossier'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ABDM FHIR SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'mr'
                ? `रुग्णालय ${hospital.name} च्या आपत्कालीन विभागासाठी अधिकृत वैद्यकीय इतिहास.`
                : language === 'hi'
                  ? `अस्पताल ${hospital.name} के आपातकालीन ट्राइएज डेस्क के लिए आधिकारिक मेडिकल इतिहास।`
                  : `Authenticated EHR records and pre-arrival telemetry accessed by ${hospital.name} Emergency Triage Desk.`}
            </p>
          </div>
        </div>

        {/* Patient Identity Strip */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 border border-teal-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm shadow-2xs">
              {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-slate-900 text-sm sm:text-base font-extrabold">{user.fullName}</strong>
                <span className="text-xs text-slate-500 font-medium">({user.age} Yrs • {user.gender})</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                <span>Phone: <strong className="font-mono text-slate-800">+91 {user.phone}</strong></span>
                <span>•</span>
                <span>ABHA ID: <strong className="font-mono text-teal-800">{user.healthId || '91-8273-1928-3920'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-red-100 text-red-800 border border-red-200 text-xs font-black flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 fill-red-600 text-red-600" />
              <span>Blood: {user.bloodGroup || 'B+'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold">
              {recordsList.length} Historic Records
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 gap-2 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'मूलभूत माहिती व ॲलर्जी' : language === 'hi' ? 'बुनियादी विवरण व एलर्जी' : 'Overview & Clinical Alerts'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PAST_RECORDS')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PAST_RECORDS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'मागील वैद्यकीय नोंदी व प्रिस्क्रिप्शन' : language === 'hi' ? 'पिछला मेडिकल रिकॉर्ड व दवाइयां' : 'Past Medical Records & Rx'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
              {recordsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PARAMEDIC_VITALS')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PARAMEDIC_VITALS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'पॅरामेडिक थेट व्हायटल्स' : language === 'hi' ? 'पैरामेडिक लाइव वाइटल्स' : 'Live Paramedic Vitals'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BLOCKCHAIN')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BLOCKCHAIN'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'सहमती व ऑडिट ट्रेल' : language === 'hi' ? 'सहमति व ऑडिट ट्रेल' : 'ABDM Consent & Audit'}</span>
          </button>
        </div>

        {/* Tab 1: Overview & Emergency Alerts */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Critical Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Severe Drug Allergies */}
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Severe Drug Allergies</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-900 bg-rose-200/90 px-2 py-0.5 rounded-full">
                    ANAPHYLAXIS RISK
                  </span>
                </div>
                <strong className="text-rose-950 text-sm sm:text-base block">
                  Penicillin, Ampicillin, Amoxicillin & Sulfa Drugs
                </strong>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Contraindicated: Administration will trigger immediate respiratory distress & anaphylaxis. Use Macrolides, Cephalosporins, or Fluoroquinolones per hospital protocol.
                </p>
              </div>

              {/* Blood Group & Transfusion Safety */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-red-800 tracking-wider flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 fill-red-600 text-red-600" />
                    <span>Blood Group & Transfusion</span>
                  </span>
                  <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                    ABO / Rh Verified
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-950 font-mono">{user.bloodGroup || 'B+'}</span>
                  <span className="text-xs text-red-700 font-semibold">(B RhD Positive)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Can receive RBCs from B+, B-, O+, O-. Pre-crossmatch protocol on standby in blood bank.
                </p>
              </div>
            </div>

            {/* Chronic Conditions & Ongoing Medications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
                  Documented Chronic Conditions
                </span>
                <div className="flex flex-wrap gap-2">
                  {(user.chronicConditions && user.chronicConditions.length > 0 
                    ? user.chronicConditions 
                    : ['Type 2 Diabetes Mellitus', 'Essential Hypertension', 'Mild Osteoarthritis']
                  ).map((cond, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
                  Active Regular Medications
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-150">
                    <div className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-blue-600" />
                      <strong className="text-slate-800">Metformin 500mg</strong>
                    </div>
                    <span className="text-slate-500 text-[11px]">Twice Daily (Post Meal)</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-150">
                    <div className="flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-blue-600" />
                      <strong className="text-slate-800">Amlodipine 5mg</strong>
                    </div>
                    <span className="text-slate-500 text-[11px]">Once Daily (Morning)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Address */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">
                Emergency Next of Kin & Address
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-150">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Kin</span>
                  <strong className="text-slate-900 text-sm font-semibold">Sunita Patil (Wife)</strong>
                  <span className="text-slate-600 block text-xs mt-0.5 font-mono">+91 98765 43211</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-150">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Residential Address</span>
                  <p className="text-slate-700 text-xs mt-0.5">{user.address || 'House #42, Shivaji Chowk, Rampur'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Past Medical Records & Prescriptions */}
        {activeTab === 'PAST_RECORDS' && (
          <div className="space-y-4 animate-in fade-in">
            {recordsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past records found in registry.
              </div>
            ) : (
              recordsList.map((rec, i) => (
                <div key={rec.id || i} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-heading">
                          {rec.diagnosis}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span><Building2 className="w-3 h-3 inline text-slate-400 mr-1" />{rec.hospitalName}</span>
                        <span>•</span>
                        <span><Stethoscope className="w-3 h-3 inline text-slate-400 mr-1" />{rec.doctorName} ({rec.doctorSpecialty || 'Physician'})</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                      {rec.date}
                    </span>
                  </div>

                  {/* Clinical Summary */}
                  {rec.prescriptionSummary && (
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-150">
                      <span className="font-bold text-slate-900 block mb-0.5">Clinical Discharge Summary:</span>
                      <p className="text-[11px] leading-relaxed">{rec.prescriptionSummary}</p>
                    </div>
                  )}

                  {/* Prescribed Medications */}
                  {rec.medications && rec.medications.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Prescribed Medications ({rec.medications.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rec.medications.map((m, mIdx) => (
                          <div key={mIdx} className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
                            <div className="flex items-center justify-between font-bold text-blue-950">
                              <span>{m.name}</span>
                              <span className="font-mono text-blue-700">{m.dosage}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                              <span>Dosage: {m.frequency}</span>
                              <span>Duration: {m.duration}</span>
                            </div>
                            {m.instructions && (
                              <span className="text-[10px] text-slate-500 block mt-0.5 italic">{m.instructions}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Lab Reports */}
                  {rec.labRecords && rec.labRecords.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Diagnostic Lab Tests ({rec.labRecords.length})
                      </span>
                      <div className="space-y-1.5">
                        {rec.labRecords.map((lab, lIdx) => (
                          <div key={lab.id || lIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                                <strong className="text-slate-900 text-xs">{lab.testName}</strong>
                                <span className="text-[10px] text-slate-400">({lab.category})</span>
                              </div>
                              {lab.notes && (
                                <p className="text-[10px] text-slate-500 mt-0.5">{lab.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-xs font-black font-mono text-slate-900">
                                  {lab.resultValue} {lab.unit}
                                </span>
                                <span className="text-[10px] text-slate-400 block">Ref: {lab.referenceRange}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                lab.status === 'CRITICAL' 
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                  : lab.status === 'ABNORMAL' 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                {lab.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: En-Route Paramedic Vitals & Triage */}
        {activeTab === 'PARAMEDIC_VITALS' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Heart Rate</span>
                <strong className="text-emerald-700 text-base sm:text-lg font-extrabold font-mono">
                  {vitals?.heart_rate ? `${vitals.heart_rate} bpm` : '84 bpm'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Normal Sinus</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Oxygen</span>
                <strong className="text-emerald-700 text-base sm:text-lg font-extrabold font-mono">
                  {vitals?.spo2 ? `${vitals.spo2}%` : '98% SpO2'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Room Air</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Pressure</span>
                <strong className="text-slate-800 text-base sm:text-lg font-extrabold font-mono">
                  {vitals?.systolic_bp && vitals?.diastolic_bp 
                    ? `${vitals.systolic_bp}/${vitals.diastolic_bp}` 
                    : '128 / 82 mmHg'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Normotensive</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consciousness (GCS)</span>
                <strong className="text-teal-700 text-base sm:text-lg font-extrabold font-mono">15 / 15</strong>
                <span className="text-[10px] text-slate-500 block">Fully Oriented</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
              <span className="text-[11px] uppercase font-extrabold text-emerald-800 tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Paramedic In-Transit Field Interventions:</span>
              </span>
              <p className="text-emerald-950 text-xs leading-relaxed">
                &quot;Patient alert and oriented x 3. Cervical spine immobilized with collar as precaution. Continuous multi-lead ECG rhythm monitoring active (lead II normal sinus). 18G IV cannula patent in left antecubital fossa with slow Normal Saline infusion. Hospital trauma team pre-alert transmitted.&quot;
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: ABDM Consent & Blockchain Audit */}
        {activeTab === 'BLOCKCHAIN' && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-extrabold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ABDM Cryptographic Consent Verification</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ON-CHAIN VALIDATED
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between bg-white p-2 rounded-xl border border-slate-150">
                  <span className="text-slate-500">Access Scope:</span>
                  <span className="font-bold text-slate-800">EMERGENCY_OVERRIDE_RECORD_ACCESS</span>
                </div>
                <div className="flex justify-between bg-white p-2 rounded-xl border border-slate-150">
                  <span className="text-slate-500">ABHA Health ID:</span>
                  <span className="font-bold text-teal-800">{user.healthId || '91-8273-1928-3920'}</span>
                </div>
                <div className="flex justify-between bg-white p-2 rounded-xl border border-slate-150">
                  <span className="text-slate-500">Receiving Triage Facility:</span>
                  <span className="font-bold text-slate-800">{hospital.name}</span>
                </div>
                <div className="flex justify-between bg-white p-2 rounded-xl border border-slate-150">
                  <span className="text-slate-500">Audit Tx Hash:</span>
                  <span className="font-bold text-blue-700 truncate max-w-[280px]">
                    0x8f2a1b9c4d3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
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
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-md shadow-teal-600/20 cursor-pointer"
          >
            {language === 'mr' ? 'बंद करा' : language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
