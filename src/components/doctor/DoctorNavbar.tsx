import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, 
  Building2, 
  User, 
  Clock, 
  Video, 
  FileText, 
  LogOut, 
  ChevronDown, 
  Star, 
  Scan, 
  ArrowRight,
  ShieldCheck,
  Check,
  KeyRound,
  Truck,
  Heart,
  Upload
} from '../icons';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';
import { DoctorDutyMode } from '../../types';
import { Link, useNavigate } from 'react-router-dom';

export type DoctorTabType = 'appointments' | 'schedule' | 'ehr' | 'profile';

interface DoctorNavbarProps {
  activeTab: DoctorTabType;
  setActiveTab: (tab: DoctorTabType) => void;
  onOpenPrescriptionModal: (section: 'all' | 'labs') => void;
  appointmentsCount: number;
  scheduledCount: number;
}

export const DoctorNavbar: React.FC<DoctorNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPrescriptionModal,
  appointmentsCount,
  scheduledCount
}) => {
  const { doctorUser, logoutDoctor, updateDoctorScheduleSettings } = useApp();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const portalsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(e.target as Node)) {
        setIsPortalsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logoutDoctor();
    navigate('/doctor/login');
  };

  if (!doctorUser) return null;

  const schedule = doctorUser.scheduleSettings;
  const dutyMode = schedule?.dutyMode || 'AVAILABLE';
  const readyForCalls = schedule?.readyForInstantConsult ?? true;
  const rating = doctorUser.profile?.averageRating || 4.9;
  const primaryDegree = doctorUser.profile?.primaryDegree || doctorUser.designation;

  const handleSetDutyMode = (mode: DoctorDutyMode) => {
    updateDoctorScheduleSettings({
      dutyMode: mode,
      readyForInstantConsult: mode === 'AVAILABLE'
    });
    setIsStatusDropdownOpen(false);
  };

  const handleToggleCallAvailability = () => {
    const nextCalls = !readyForCalls;
    updateDoctorScheduleSettings({
      readyForInstantConsult: nextCalls,
      dutyMode: nextCalls ? 'AVAILABLE' : dutyMode
    });
  };

  const portalsList = [
    {
      to: '/',
      title: 'Citizen Portal',
      desc: 'Emergency SOS & Tele-Consults',
      icon: Heart,
      color: 'text-rose-600 bg-rose-50 border-rose-200'
    },
    {
      to: '/hospital',
      title: 'Hospital Admin Portal',
      desc: 'Bed & ICU Availability, ER Triage Desk',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      to: '/ambulance',
      title: 'Ambulance & Paramedics',
      desc: 'Cockpit HUD, GPS Routing & Live Vitals',
      icon: Truck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      to: '/police',
      title: 'Traffic Police Portal',
      desc: 'Green Corridor Signal Post Control',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      to: '/workers',
      title: 'ASHA Healthcare Workers',
      desc: 'Village Field Reports & Maternal Care',
      icon: Heart,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 space-y-2.5">
        
        {/* ROW 1: Doctor Identity, Hospital, Status Dropdown, Portals Dropdown, Languages & Doctor Login */}
        <div className="flex items-center justify-between gap-3 flex-wrap lg:flex-nowrap">
          
          {/* LEFT GROUP: Doctor Name Block + Hospital Name Block */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            
            {/* 1. Doctor Name & Primary Degree Card */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="cursor-pointer group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 hover:border-teal-300 transition shadow-2xs shrink-0"
              title="Click to view full Doctor Profile & Credentials"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight font-heading truncate group-hover:text-teal-700 transition-colors">
                    {doctorUser.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 border border-teal-300 uppercase shrink-0">
                    MD Desk
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
                  <span className="text-teal-700 font-semibold truncate">{primaryDegree}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-mono text-[10px] shrink-0">
                    {doctorUser.profile?.abhaHprId || 'HPR-2026-99210@abdm'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Hospital Name & OPD Room Card */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-2xs text-xs shrink-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 text-xs truncate max-w-[180px] lg:max-w-[240px]">
                  {doctorUser.hospitalName}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <span>{doctorUser.department}</span>
                  {doctorUser.roomNumber && (
                    <>
                      <span>•</span>
                      <span className="text-teal-700 font-bold bg-teal-50 px-1 rounded border border-teal-200">
                        {doctorUser.roomNumber}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT GROUP: Duty Status, Portals Dropdown, Languages, Doctor Login, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            
            {/* 3. Duty Status Interactive Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 sm:gap-2 text-xs font-bold cursor-pointer shadow-2xs ${
                  dutyMode === 'AVAILABLE' 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70' 
                    : dutyMode === 'HOSPITAL_EMERGENCY'
                      ? 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100/70 animate-pulse'
                      : dutyMode === 'ON_LEAVE'
                        ? 'border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100/70'
                        : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Click to change clinical duty mode"
              >
                <span className={`w-2 h-2 rounded-full ${
                  dutyMode === 'AVAILABLE'
                    ? 'bg-emerald-500 animate-pulse'
                    : dutyMode === 'HOSPITAL_EMERGENCY'
                      ? 'bg-rose-600'
                      : dutyMode === 'ON_LEAVE'
                        ? 'bg-purple-500'
                        : 'bg-slate-400'
                }`} />

                <span>
                  {dutyMode === 'AVAILABLE' && 'Available'}
                  {dutyMode === 'HOSPITAL_EMERGENCY' && 'In Emergency OT'}
                  {dutyMode === 'ON_LEAVE' && 'On Leave'}
                  {dutyMode === 'OFF_DUTY' && 'Off Duty'}
                </span>

                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Status Dropdown Menu */}
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Duty Status
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      Update your clinical availability
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetDutyMode('AVAILABLE')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>🟢 Available</span>
                    </div>
                    {dutyMode === 'AVAILABLE' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetDutyMode('HOSPITAL_EMERGENCY')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>🚨 In Emergency OT</span>
                    </div>
                    {dutyMode === 'HOSPITAL_EMERGENCY' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetDutyMode('ON_LEAVE')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>🏖️ On Leave</span>
                    </div>
                    {dutyMode === 'ON_LEAVE' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetDutyMode('OFF_DUTY')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>⚪ Off Duty</span>
                    </div>
                    {dutyMode === 'OFF_DUTY' && <Check className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* 5. Operational Portals Dropdown Button */}
            <div className="relative" ref={portalsRef}>
              <button
                type="button"
                onClick={() => setIsPortalsOpen(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                  isPortalsOpen
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300'
                }`}
                title="Switch to another portal"
                aria-expanded={isPortalsOpen}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Portals</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isPortalsOpen ? 'rotate-180 text-teal-600' : ''}`} />
              </button>

              {/* Portals Floating Card Menu */}
              {isPortalsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Operational Portals
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Switch system view
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                      Active: Doctor Desk
                    </span>
                  </div>

                  <div className="p-1 space-y-1">
                    {portalsList.map((portal) => {
                      const Icon = portal.icon;
                      return (
                        <Link
                          key={portal.to}
                          to={portal.to}
                          onClick={() => setIsPortalsOpen(false)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200/60"
                        >
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${portal.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                              {portal.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {portal.desc}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Language Selector Dropdown */}
            <div className="p-0.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-2xs">
              <LanguageSelector variant="light" />
            </div>

            {/* 7. Doctor Profile Login Small Button */}
            <Link
              to="/doctor/login"
              className="px-2.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/90 text-teal-800 hover:border-teal-300 transition flex items-center gap-1.5 text-xs font-bold shadow-2xs active:scale-95"
              title="Doctor Profile Login / Switch Account"
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Doctor Login</span>
            </Link>

            {/* 8. Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs active:scale-95"
              title="Logout from clinical OPD desk"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>

        </div>

        {/* ROW 2: Primary Navigation Tabs (Centered & Sized to Fit Single Line) */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-center w-full">
          
          <nav className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs flex-wrap md:flex-nowrap">
            
            {/* Tab 1: Patient Appointments */}
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`px-3 sm:px-3.5 md:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-white text-teal-700 border-2 border-teal-500 shadow-sm font-extrabold ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent'
              }`}
            >
              <Video className={`w-4 h-4 shrink-0 ${activeTab === 'appointments' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Patient Appointments</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-black min-w-[20px] text-center ${
                activeTab === 'appointments'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {appointmentsCount}
              </span>
            </button>

            {/* Tab 2: Duty Schedule & Availability */}
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-3 sm:px-3.5 md:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-white text-teal-700 border-2 border-teal-500 shadow-sm font-extrabold ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent'
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 ${activeTab === 'schedule' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Duty Schedule & Availability</span>
              {!readyForCalls && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>

            {/* Option 3: Upload Prescriptions */}
            <button
              type="button"
              onClick={() => onOpenPrescriptionModal('all')}
              className="px-3 sm:px-3.5 md:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer bg-white hover:bg-indigo-50/80 text-indigo-700 border border-indigo-200/90 hover:border-indigo-300 shadow-2xs active:scale-95 group whitespace-nowrap"
              title="Upload & Scan Prescriptions & Diagnostic Lab Orders"
            >
              <Upload className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
              <span>Upload Prescriptions</span>
            </button>

            {/* Tab 4: Patient EHR & History */}
            <button
              type="button"
              onClick={() => setActiveTab('ehr')}
              className={`px-3 sm:px-3.5 md:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs whitespace-nowrap ${
                activeTab === 'ehr'
                  ? 'bg-white text-teal-700 border-2 border-teal-500 shadow-sm font-extrabold ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'ehr' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Patient EHR & History</span>
            </button>

            {/* Tab 5: Profile & Ratings */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 sm:px-3.5 md:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-teal-600 text-white border-2 border-teal-600 shadow-sm font-extrabold ring-1 ring-teal-500'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent'
              }`}
            >
              <User className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
              <span>Profile & Ratings</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 ${
                activeTab === 'profile'
                  ? 'bg-teal-700 text-white'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                <Star className="w-3 h-3 fill-current" />
                <span>{rating}</span>
              </span>
            </button>

          </nav>

        </div>

      </div>
    </header>
  );
};
