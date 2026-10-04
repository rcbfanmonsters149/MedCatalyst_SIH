import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Baby, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Clock, 
  HeartPulse, 
  ArrowLeft,
  Building2,
  Heart,
  AlertTriangle,
  User,
  Activity
} from '../components/icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { Link } from 'react-router-dom';
import { PortalsDropdown } from '../components/PortalsDropdown';

export const PublicWorkersPage: React.FC = () => {
  const { tr } = useLanguage();
  const { 
    workerReports, 
    addWorkerReport 
  } = useApp();

  // ASHA Survey Form State
  const [ashaMotherName, setAshaMotherName] = useState('');
  const [ashaVillage, setAshaVillage] = useState('');
  const [ashaGestationalWeeks, setAshaGestationalWeeks] = useState<number | ''>('');
  const [ashaHb, setAshaHb] = useState<number | ''>('');
  const [ashaBp, setAshaBp] = useState('');
  const [ashaSaved, setAshaSaved] = useState(false);

  const handleAshaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ashaMotherName || !ashaVillage || ashaGestationalWeeks === '' || ashaHb === '' || !ashaBp) {
      alert('Please fill out all required fields');
      return;
    }
    const isHighRisk = (typeof ashaHb === 'number' && ashaHb < 8.0) || parseInt(ashaBp.split('/')[0]) >= 140;

    addWorkerReport({
      workerType: 'ASHA',
      workerName: 'Sunita Devi (ASHA Worker)',
      badgeId: 'ASHA-VIL-08',
      title: `Maternal Health Visit: ${ashaMotherName} (${isHighRisk ? 'HIGH RISK' : 'NORMAL'})`,
      description: `Gestational age: ${ashaGestationalWeeks}w, Hemoglobin: ${ashaHb} g/dL, BP: ${ashaBp}. ${isHighRisk ? 'Flagged for urgent IV Iron Sucrose & PHC tele-consultation.' : 'Routine progress good.'}`,
      location: `Village ${ashaVillage}`,
      lat: 28.6980,
      lng: 77.1140,
      severity: isHighRisk ? 'URGENT' : 'NORMAL',
      metadata: { hemoglobin: `${ashaHb} g/dL`, bloodPressure: ashaBp }
    });

    setAshaSaved(true);
    setAshaMotherName('');
    setAshaVillage('');
    setAshaGestationalWeeks('');
    setAshaHb('');
    setAshaBp('');
    setTimeout(() => setAshaSaved(false), 3500);
  };

  const ashaReports = workerReports.filter(r => r.workerType === 'ASHA');
  const highRiskCount = ashaReports.filter(r => r.severity === 'URGENT').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight font-heading text-slate-900 leading-tight">
                  Frontline and ASHA
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Community Health Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageSelector variant="light" />

            <PortalsDropdown currentPortal="workers" />

            <Link 
              to="/" 
              className="h-10 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
              title="Return to Public Citizen Portal"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>{tr.common.back} • {tr.nav.citizenPortal}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        
        {/* Portal Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ASHA Community Health
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
              {tr.asha.frontlineHeader || 'Rural Community Health Surveillance'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {tr.asha.subtitle || 'Door-to-door village health monitoring, high-risk maternal tracking, severe anemia alerts, and Primary Health Center escalations.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ASHA Station: Village Kalyanpur Sub-Center</span>
          </div>
        </div>

        {/* 4 Summary KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Mothers Monitored</span>
              <Baby className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">38</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Gram Panchayat Registry</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">High-Risk Flags</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 font-mono">{highRiskCount || 2}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Escalated to PHC Doctor</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Severe Anemia Alerts</span>
              <HeartPulse className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-600 font-mono">2</p>
            <p className="text-[11px] text-rose-700 font-semibold mt-0.5">Hb &lt; 8.0 g/dL (IV Iron Plan)</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Referral Hub Beds</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-700 font-mono">3 Free</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Bilaspur CHC Maternity Unit</p>
          </div>
        </div>

        {/* Main 2-Column Split: Field Logger Form & Village Registry Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: ASHA Rural Survey & Vitals Logger (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Baby className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  {tr.asha.villageMaternalLoggerTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Record home visit health indicators in underserved villages; automatically flag severe anemia or high-risk pregnancies to the Primary Health Center.
                </p>
              </div>
            </div>

            <form onSubmit={handleAshaSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tr.asha.motherName}:
                  </label>
                  <input
                    type="text"
                    required
                    value={ashaMotherName}
                    onChange={(e) => setAshaMotherName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tr.asha.villageName}:
                  </label>
                  <input
                    type="text"
                    required
                    value={ashaVillage}
                    onChange={(e) => setAshaVillage(e.target.value)}
                    placeholder="e.g. Kalyanpur"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tr.asha.gestationalWeeks}:
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={42}
                    value={ashaGestationalWeeks}
                    onChange={(e) => setAshaGestationalWeeks(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    placeholder="e.g. 26"
                  />
                  <span className="text-[10px] text-slate-400">Weeks</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tr.asha.hemoglobin}:
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={ashaHb}
                    onChange={(e) => setAshaHb(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="e.g. 9.5"
                    className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold ${
                      typeof ashaHb === 'number' && ashaHb < 8.0 ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400">
                    {typeof ashaHb === 'number' && ashaHb < 8.0 ? '⚠️ Severe Anemia Alert (< 8.0)' : 'g/dL'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {tr.asha.bloodPressure}:
                  </label>
                  <input
                    type="text"
                    required
                    value={ashaBp}
                    onChange={(e) => setAshaBp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    placeholder="120/80"
                  />
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span>Nearest Referral Hub: <strong>Bilaspur CHC (Maternity Unit)</strong></span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-md">3 Beds Free</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{ashaSaved ? 'Logged & Escalated to PHC Doctor!' : tr.asha.logVisitBtn}</span>
              </button>
            </form>
          </div>

          {/* Right: ASHA Field Visit Log (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 font-heading">
              <Baby className="w-4 h-4 text-emerald-600" />
              <span>{tr.asha.villageRegistry}</span>
            </h3>

            <div className="space-y-3">
              {ashaReports.length > 0 ? (
                ashaReports.map(report => (
                  <div key={report.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{report.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          report.severity === 'URGENT' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{report.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-600">{report.description}</p>
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>ASHA: <strong>{report.workerName}</strong> ({report.badgeId})</span>
                      <span>📍 {report.location}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No village visit records logged today yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
