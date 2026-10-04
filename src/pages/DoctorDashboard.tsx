import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Building2, 
  LogOut, 
  Search, 
  Filter, 
  ArrowRight, 
  Activity, 
  Droplets, 
  ChevronRight,
  Plus,
  Trash2,
  Check,
  TestTube
} from '../components/icons';
import { useApp, createDefaultScheduleSettings, DEFAULT_DOCTOR_SLOTS } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { 
  TeleAppointment, 
  Hospital, 
  DoctorDutyMode, 
  InHospitalEmergencyType, 
  DoctorScheduleSettings 
} from '../types';
import { VideoConsultModal } from '../components/teleconsult/VideoConsultModal';
import { HospitalPrescriptionModal } from '../components/hospital/HospitalPrescriptionModal';
import { DoctorNavbar, DoctorTabType } from '../components/doctor/DoctorNavbar';
import { DoctorProfileTab } from '../components/doctor/DoctorProfileTab';
import { PatientEhrLookup } from '../components/doctor/PatientEhrLookup';
import { Link, useNavigate } from 'react-router-dom';

type DoctorTab = DoctorTabType;

export const DoctorDashboard: React.FC = () => {
  const { 
    doctorUser, 
    logoutDoctor, 
    toggleDoctorTeleConsultStatus, 
    appointments, 
    updateAppointmentStatus,
    startPatientConsultation,
    endPatientConsultation,
    markPatientNoShow,
    hospitals,
    user,
    updateDoctorScheduleSettings
  } = useApp();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DoctorTab>('appointments');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedAppointmentForCall, setSelectedAppointmentForCall] = useState<TeleAppointment | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionModalSection, setPrescriptionModalSection] = useState<'all' | 'prescription' | 'labs'>('all');
  const [prescriptionAppt, setPrescriptionAppt] = useState<TeleAppointment | null>(null);
  const [inspectPatientModal, setInspectPatientModal] = useState<TeleAppointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Slot Input State
  const [customSlotInput, setCustomSlotInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    logoutDoctor();
    navigate('/doctor/login');
  };

  // Current Schedule Settings
  const currentSchedule: DoctorScheduleSettings = useMemo(() => {
    return doctorUser?.scheduleSettings || createDefaultScheduleSettings();
  }, [doctorUser?.scheduleSettings]);

  // Doctor's hospital details
  const doctorHospital: Hospital | undefined = useMemo(() => {
    if (!doctorUser) return hospitals[0];
    return hospitals.find(h => h.id === doctorUser.hospitalId) || hospitals[0];
  }, [doctorUser, hospitals]);

  // Doctor's appointments list
  const doctorAppointments = useMemo(() => {
    if (!doctorUser) return [];
    return appointments.filter(a => 
      a.doctorId === doctorUser.id || 
      a.doctorName.toLowerCase().includes(doctorUser.name.toLowerCase()) ||
      doctorUser.name.toLowerCase().includes(a.doctorName.toLowerCase())
    );
  }, [appointments, doctorUser]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return doctorAppointments.filter(appt => {
      const matchFilter = 
        filterStatus === 'ALL' 
          ? true 
          : filterStatus === 'SCHEDULED' 
            ? (appt.status === 'SCHEDULED' || appt.status === 'IN_CALL')
            : appt.status === filterStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q || 
        appt.patientName.toLowerCase().includes(q) || 
        appt.patientAbhaId.toLowerCase().includes(q) ||
        appt.symptoms.toLowerCase().includes(q) ||
        appt.timeSlot.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [doctorAppointments, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = doctorAppointments.length;
    const scheduled = doctorAppointments.filter(a => a.status === 'SCHEDULED' || a.status === 'IN_CALL').length;
    const completed = doctorAppointments.filter(a => a.status === 'COMPLETED').length;
    return { total, scheduled, completed };
  }, [doctorAppointments]);

  // Handlers for Duty & Schedule Controller
  const handleSetDutyMode = (mode: DoctorDutyMode) => {
    const isOnline = mode === 'AVAILABLE';
    updateDoctorScheduleSettings({
      dutyMode: mode,
      isOnLeave: mode === 'ON_LEAVE',
      readyForInstantConsult: mode === 'AVAILABLE'
    });

    if (mode === 'AVAILABLE') {
      showToast('Status updated: You are now Available for Consultations.');
    } else if (mode === 'HOSPITAL_EMERGENCY') {
      showToast('Emergency Duty Activated: Tele-OPD calls paused.');
    } else if (mode === 'ON_LEAVE') {
      showToast('Duty set to On Leave: Patient appointments paused.');
    } else {
      showToast('Shift Concluded: Set to Off Duty.');
    }
  };

  const handleToggleSlot = (slot: string) => {
    const active = currentSchedule.availableTimeSlots;
    let nextSlots: string[];
    if (active.includes(slot)) {
      nextSlots = active.filter(s => s !== slot);
    } else {
      nextSlots = [...active, slot];
    }
    updateDoctorScheduleSettings({ availableTimeSlots: nextSlots });
    showToast(`Time slot ${active.includes(slot) ? 'disabled' : 'enabled'}: ${slot}`);
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSlotInput.trim();
    if (!trimmed) return;
    if (currentSchedule.availableTimeSlots.includes(trimmed)) {
      showToast('This time slot is already added.');
      return;
    }
    updateDoctorScheduleSettings({
      availableTimeSlots: [...currentSchedule.availableTimeSlots, trimmed]
    });
    setCustomSlotInput('');
    showToast(`Added custom time slot: ${trimmed}`);
  };

  const handleQuickPresetSlots = (action: 'ALL_MORNING' | 'ALL_AFTERNOON' | 'ALL_EVENING' | 'STANDARD' | 'CLEAR') => {
    const morning = [
      '09:00 AM - 09:30 AM',
      '09:30 AM - 10:00 AM',
      '10:00 AM - 10:30 AM',
      '11:00 AM - 11:30 AM',
      '11:30 AM - 12:00 PM'
    ];
    const afternoon = [
      '01:30 PM - 02:00 PM',
      '02:00 PM - 02:30 PM',
      '02:30 PM - 03:00 PM',
      '03:30 PM - 04:00 PM'
    ];
    const evening = [
      '04:00 PM - 04:30 PM',
      '04:30 PM - 05:00 PM',
      '05:00 PM - 05:30 PM',
      '05:30 PM - 06:00 PM'
    ];

    let nextSlots: string[] = [];
    if (action === 'STANDARD') {
      nextSlots = [...DEFAULT_DOCTOR_SLOTS];
    } else if (action === 'ALL_MORNING') {
      nextSlots = Array.from(new Set([...currentSchedule.availableTimeSlots, ...morning]));
    } else if (action === 'ALL_AFTERNOON') {
      nextSlots = Array.from(new Set([...currentSchedule.availableTimeSlots, ...afternoon]));
    } else if (action === 'ALL_EVENING') {
      nextSlots = Array.from(new Set([...currentSchedule.availableTimeSlots, ...evening]));
    } else if (action === 'CLEAR') {
      nextSlots = [];
    }

    updateDoctorScheduleSettings({ availableTimeSlots: nextSlots });
    showToast(`Time slots updated: ${nextSlots.length} active slots.`);
  };

  if (!doctorUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Doctor Session Required</h2>
          <p className="text-xs text-slate-500">
            Please log in with your certified Doctor ID to access the Clinical OPD Consultation Desk.
          </p>
          <Link
            to="/doctor/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
          >
            Go to Doctor Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Pre-grouped time slots for display
  const standardMorning = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM'
  ];
  const standardAfternoon = [
    '01:30 PM - 02:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:30 PM - 04:00 PM'
  ];
  const standardEvening = [
    '04:00 PM - 04:30 PM',
    '04:30 PM - 05:00 PM',
    '05:00 PM - 05:30 PM',
    '05:30 PM - 06:00 PM'
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Clinical Header with Distinct Segmented Boundaries */}
      <DoctorNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrescriptionModal={(sec) => {
          setPrescriptionAppt(null);
          setPrescriptionModalSection(sec);
          setShowPrescriptionModal(true);
        }}
        appointmentsCount={doctorAppointments.length}
        scheduledCount={stats.scheduled}
      />


      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">

        {/* TAB 1: Appointments Queue */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 pl-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Status:</span>
                </span>
                <div className="flex items-center gap-1">
                  {(['ALL', 'SCHEDULED', 'COMPLETED'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        filterStatus === st
                          ? 'bg-teal-100 text-teal-800 border border-teal-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'ALL' ? 'All Bookings' : st === 'SCHEDULED' ? 'Pending / Active' : 'Completed'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, symptoms, ABHA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No Appointments Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {filterStatus === 'ALL' 
                    ? 'No tele-consult appointments scheduled with you yet.' 
                    : `No appointments matching "${filterStatus}" filter.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.map(appt => {
                  const isScheduled = appt.status === 'SCHEDULED' || appt.status === 'IN_CALL';
                  const isCompleted = appt.status === 'COMPLETED';
                  const isPriority = appt.urgency === 'PRIORITY';
                  const isInstant = appt.isInstantConsult;

                  return (
                    <div 
                      key={appt.id}
                      className={`bg-white rounded-2xl border transition-all p-5 shadow-2xs space-y-4 ${
                        isInstant && isScheduled
                          ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/10'
                          : isScheduled 
                            ? 'border-teal-200 hover:border-teal-300 ring-1 ring-teal-500/10' 
                            : 'border-slate-200 opacity-90'
                      }`}
                    >
                      {/* Top Row: Patient Info & Status Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isInstant
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isScheduled 
                                ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isInstant ? '⚡' : <User className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Sequential Token Badge */}
                              <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-teal-700 text-white shadow-xs">
                                #{appt.tokenNumber || `A-${appt.tokenSequence || 1}`}
                              </span>

                              <h3 className="font-bold text-base text-slate-900">{appt.patientName}</h3>
                              <span className="text-xs text-slate-500">
                                ({appt.patientAge}y, {appt.patientGender})
                              </span>
                              {appt.patientBloodGroup && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  🩸 {appt.patientBloodGroup}
                                </span>
                              )}
                              {isInstant && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                  ⚡ Instant Call
                                </span>
                              )}
                              {isPriority && !isInstant && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  ⚡ Priority Case
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-teal-600" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Window:</span>
                                <strong className="text-slate-800 font-mono">{appt.timeWindow || appt.timeSlot}</strong>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Dynamic ETA:</span>
                                <strong className="text-teal-700 font-mono">{appt.estimatedConsultationTime || 'Calculating...'}</strong>
                              </span>
                              <span>•</span>
                              <span className="font-mono text-slate-600">
                                ABHA: <strong>{appt.patientAbhaId}</strong>
                              </span>
                              <span>•</span>
                              <span>📞 {appt.patientPhone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <div className="shrink-0 flex items-center gap-2">
                          {appt.queueStatus === 'IN_CONSULTATION' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span>In Consultation Now</span>
                            </span>
                          )}
                          {appt.queueStatus === 'CALLED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <span>Summoned to Desk</span>
                            </span>
                          )}
                          {appt.queueStatus === 'WAITING' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                              <span>Waiting ({appt.patientsAhead ?? 0} ahead)</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completed ({appt.actualDurationMinutes || 14}m)</span>
                            </span>
                          )}
                          {appt.queueStatus === 'NO_SHOW' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <span>No-Show</span>
                            </span>
                          )}
                          {appt.queueStatus === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                              <span>Cancelled</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Patient Reported Symptoms */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          Chief Complaints / Reported Symptoms:
                        </span>
                        <p className="text-slate-800 font-medium leading-relaxed">
                          "{appt.symptoms}"
                        </p>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* If Waiting or Called */}
                          {(appt.queueStatus === 'WAITING' || appt.queueStatus === 'CALLED') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  startPatientConsultation(appt.id);
                                  setSelectedAppointmentForCall(appt);
                                }}
                                className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer bg-teal-600 hover:bg-teal-700"
                              >
                                <Video className="w-4 h-4" />
                                <span>Start Consultation</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  markPatientNoShow(appt.id);
                                  showToast(`Marked ${appt.patientName} as No-Show. Queue advanced.`);
                                }}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition cursor-pointer"
                              >
                                <span>Mark No-Show</span>
                              </button>
                            </>
                          )}

                          {/* If Active Consultation */}
                          {appt.queueStatus === 'IN_CONSULTATION' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAppointmentForCall(appt);
                                }}
                                className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Video className="w-4 h-4" />
                                <span>Join Active Call</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  endPatientConsultation(appt.id);
                                  setPrescriptionAppt(appt);
                                  setPrescriptionModalSection('all');
                                  setShowPrescriptionModal(true);
                                  showToast(`Consultation with ${appt.patientName} ended. Duration recorded & queue recalculated.`);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>End & Issue Prescription</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setInspectPatientModal(appt)}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>View EHR & Allergies</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {isScheduled && !appt.queueStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                updateAppointmentStatus(appt.id, 'COMPLETED');
                                showToast(`Appointment with ${appt.patientName} marked as completed.`);
                              }}
                              className="text-xs text-slate-500 hover:text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition font-medium cursor-pointer"
                            >
                              ✓ Mark Complete
                            </button>
                          )}
                          <span className="text-[11px] text-slate-400">
                            Booked: {appt.bookedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Duty Schedule & Availability Controller */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span>Clinical Duty Schedule & Availability Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure your live duty presence, time slots, leave records, and hospital emergency overrides.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Duty Mode:</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    currentSchedule.dutyMode === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentSchedule.dutyMode === 'HOSPITAL_EMERGENCY'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : currentSchedule.dutyMode === 'ON_LEAVE'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}>
                    {currentSchedule.dutyMode.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Live Duty & Presence Status Switcher */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    1. Select Live Duty Status
                  </h4>
                  <p className="text-xs text-slate-500">
                    How you are currently engaged in the hospital network.
                  </p>
                </div>
              </div>

              {/* 4 Interactive Duty Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Available */}
                <button
                  type="button"
                  onClick={() => handleSetDutyMode('AVAILABLE')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    currentSchedule.dutyMode === 'AVAILABLE'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      🟢
                    </span>
                    {currentSchedule.dutyMode === 'AVAILABLE' && (
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Available & On Duty</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ready for instant video calls and scheduled OPD consultations.
                    </p>
                  </div>
                </button>

                {/* 2. Hospital Emergency Work */}
                <button
                  type="button"
                  onClick={() => handleSetDutyMode('HOSPITAL_EMERGENCY')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    currentSchedule.dutyMode === 'HOSPITAL_EMERGENCY'
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                      🚨
                    </span>
                    {currentSchedule.dutyMode === 'HOSPITAL_EMERGENCY' && (
                      <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full">
                        EMERGENCY
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-rose-900">Hospital Emergency Work</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Occupied in Emergency OT, Trauma, ICU Code Red, or surgery.
                    </p>
                  </div>
                </button>

                {/* 3. On Leave */}
                <button
                  type="button"
                  onClick={() => handleSetDutyMode('ON_LEAVE')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    currentSchedule.dutyMode === 'ON_LEAVE'
                      ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      🏖️
                    </span>
                    {currentSchedule.dutyMode === 'ON_LEAVE' && (
                      <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-200/80 px-2 py-0.5 rounded-full">
                        ON LEAVE
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-purple-900">On Leave Today</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Approved casual, medical, or official out-of-station leave.
                    </p>
                  </div>
                </button>

                {/* 4. Off Duty */}
                <button
                  type="button"
                  onClick={() => handleSetDutyMode('OFF_DUTY')}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    currentSchedule.dutyMode === 'OFF_DUTY'
                      ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                      ⚪
                    </span>
                    {currentSchedule.dutyMode === 'OFF_DUTY' && (
                      <span className="text-[10px] font-black uppercase text-slate-800 bg-slate-300 px-2 py-0.5 rounded-full">
                        OFF DUTY
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Shift Concluded</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Shift over; not available for online OPD until next shift.
                    </p>
                  </div>
                </button>
              </div>

              {/* Emergency Configuration Drawer (if HOSPITAL_EMERGENCY selected) */}
              {currentSchedule.dutyMode === 'HOSPITAL_EMERGENCY' && (
                <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-300 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Configure Emergency Clinical Assignment & Return Time</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Emergency Assignment
                      </label>
                      <select
                        value={currentSchedule.emergencyType || 'EMERGENCY_OT'}
                        onChange={(e) => updateDoctorScheduleSettings({
                          emergencyType: e.target.value as InHospitalEmergencyType
                        })}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                      >
                        <option value="EMERGENCY_OT">Emergency Operation Theater (OT)</option>
                        <option value="TRAUMA_RESUSCITATION">Trauma / Shock Resuscitation</option>
                        <option value="ICU_CODE_RED">ICU Code Red & Crash Cart</option>
                        <option value="WARD_ROUNDS">High-Dependency Ward Rounds</option>
                        <option value="OTHER_EMERGENCY">Other Urgent Clinical Crisis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Estimated Resumption
                      </label>
                      <select
                        value={currentSchedule.emergencyEstimatedResume || '~45 mins'}
                        onChange={(e) => updateDoctorScheduleSettings({
                          emergencyEstimatedResume: e.target.value
                        })}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                      >
                        <option value="~30 mins">~30 minutes</option>
                        <option value="~45 mins">~45 minutes</option>
                        <option value="~1.5 hours">~1.5 hours</option>
                        <option value="~3 hours">~3 hours</option>
                        <option value="Post-Op (TBD)">Post-Op (TBD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Patient Advisory Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Operating in OT-2. Tele-OPD delayed."
                        value={currentSchedule.emergencyNote || ''}
                        onChange={(e) => updateDoctorScheduleSettings({
                          emergencyNote: e.target.value
                        })}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Configuration Drawer (if ON_LEAVE selected) */}
              {currentSchedule.dutyMode === 'ON_LEAVE' && (
                <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-300 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                    <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Leave Declaration Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Leave Type
                      </label>
                      <select
                        value={currentSchedule.leaveType || 'CASUAL_LEAVE'}
                        onChange={(e) => updateDoctorScheduleSettings({
                          leaveType: e.target.value as any
                        })}
                        className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                      >
                        <option value="CASUAL_LEAVE">Casual Leave (Personal)</option>
                        <option value="MEDICAL_LEAVE">Medical / Sick Leave</option>
                        <option value="DUTY_TRAVEL">Official Duty / Symposium Travel</option>
                        <option value="EMERGENCY_LEAVE">Family Emergency Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Duration / Return Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Today (Returning Tomorrow, 09:00 AM)"
                        value={currentSchedule.leaveDate || 'Today (Full Day)'}
                        onChange={(e) => updateDoctorScheduleSettings({
                          leaveDate: e.target.value
                        })}
                        className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Reason / Note for Department
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Attending AIIMS Trauma Symposium"
                        value={currentSchedule.leaveReason || ''}
                        onChange={(e) => updateDoctorScheduleSettings({
                          leaveReason: e.target.value
                        })}
                        className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Channel Availability & Invitation Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Consultation Channel & Invitation Acceptance
                </h4>
                <p className="text-xs text-slate-500">
                  Control whether patients can initiate instant calls or book advance appointments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instant "Meet Now" Video Calls Switch */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>⚡ Instant "Meet Now" Video Calls</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Patients can call you directly if you are online and on-duty.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !currentSchedule.readyForInstantConsult;
                      updateDoctorScheduleSettings({ readyForInstantConsult: next });
                      showToast(`Instant video calls ${next ? 'enabled' : 'disabled'}.`);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentSchedule.readyForInstantConsult ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        currentSchedule.readyForInstantConsult ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Advance Scheduled Bookings Switch */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>📅 Advance Scheduled Bookings</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Accept new slot bookings from the citizen Tele-OPD queue.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !currentSchedule.acceptingAppointments;
                      updateDoctorScheduleSettings({ acceptingAppointments: next });
                      showToast(`Advance appointments ${next ? 'opened' : 'paused'}.`);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentSchedule.acceptingAppointments ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        currentSchedule.acceptingAppointments ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Time Slots & Timings Configurator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    3. Available Consultation Timings & Slot Manager
                  </h4>
                  <p className="text-xs text-slate-500">
                    Click any slot chip to toggle it on or off for today's OPD schedule.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSlots('ALL_MORNING')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-[11px]"
                  >
                    + All Morning
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSlots('ALL_AFTERNOON')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-[11px]"
                  >
                    + All Afternoon
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSlots('ALL_EVENING')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-[11px]"
                  >
                    + All Evening
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSlots('STANDARD')}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-semibold cursor-pointer text-[11px]"
                  >
                    Reset Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetSlots('CLEAR')}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold cursor-pointer text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Morning Slots */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <span>🌅 Morning OPD Slots:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {standardMorning.map((slot) => {
                    const isEnabled = currentSchedule.availableTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleToggleSlot(slot)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          isEnabled
                            ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 line-through'
                        }`}
                      >
                        {isEnabled && <Check className="w-3 h-3 text-white" />}
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <span>☀️ Afternoon OPD Slots:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {standardAfternoon.map((slot) => {
                    const isEnabled = currentSchedule.availableTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleToggleSlot(slot)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          isEnabled
                            ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 line-through'
                        }`}
                      >
                        {isEnabled && <Check className="w-3 h-3 text-white" />}
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evening Slots */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <span>🌙 Evening Clinic Slots:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {standardEvening.map((slot) => {
                    const isEnabled = currentSchedule.availableTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleToggleSlot(slot)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          isEnabled
                            ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 line-through'
                        }`}
                      >
                        {isEnabled && <Check className="w-3 h-3 text-white" />}
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Slot Input */}
              <div className="pt-3 border-t border-slate-100">
                <form onSubmit={handleAddCustomSlot} className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Add custom slot (e.g. 06:30 PM - 07:00 PM)"
                      value={customSlotInput}
                      onChange={(e) => setCustomSlotInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Slot</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Patient EHR & Records Lookup (Protected by QR Scan / ABHA ID Gatekeeper) */}
        {activeTab === 'ehr' && (
          <PatientEhrLookup
            user={user}
            doctorUser={doctorUser}
            appointments={appointments}
            onOpenPrescriptionModal={(sec) => {
              setPrescriptionAppt(null);
              setPrescriptionModalSection(sec);
              setShowPrescriptionModal(true);
            }}
            showToast={showToast}
          />
        )}

        {/* TAB: Doctor Profile, Credentials & Patient Ratings */}
        {activeTab === 'profile' && (
          <DoctorProfileTab />
        )}

      </main>

      {/* Video Consultation Modal (DOCTOR MODE) */}
      {selectedAppointmentForCall && (
        <VideoConsultModal
          isOpen={!!selectedAppointmentForCall}
          onClose={() => setSelectedAppointmentForCall(null)}
          appointment={selectedAppointmentForCall}
          userRole="DOCTOR"
          onConsultationCompleted={(apptId) => {
            updateAppointmentStatus(apptId, 'COMPLETED');
            setSelectedAppointmentForCall(null);
            showToast('Video consultation successfully finished.');
          }}
        />
      )}

      {/* Hospital Prescription Modal */}
      {showPrescriptionModal && doctorHospital && (
        <HospitalPrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => {
            setShowPrescriptionModal(false);
            setPrescriptionAppt(null);
            setPrescriptionModalSection('all');
          }}
          hospital={doctorHospital}
          initialDoctorId={doctorUser?.id}
          initialAbhaId={prescriptionAppt?.patientAbhaId || ''}
          initialPatientName={prescriptionAppt?.patientName || ''}
          defaultActiveSection={prescriptionModalSection}
          onNotify={(msg) => {
            if (prescriptionAppt) {
              updateAppointmentStatus(prescriptionAppt.id, 'COMPLETED');
            }
            showToast(msg);
          }}
        />
      )}

      {/* Patient EHR Modal View */}
      {inspectPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Patient EHR Profile</h3>
              </div>
              <button
                onClick={() => setInspectPatientModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900 text-sm">{inspectPatientModal.patientName}</span>
                  <span className="font-mono text-slate-600">{inspectPatientModal.patientAbhaId}</span>
                </div>
                <div className="text-slate-500">
                  {inspectPatientModal.patientAge} Years, {inspectPatientModal.patientGender} • Blood Group: {inspectPatientModal.patientBloodGroup || user.bloodGroup}
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <span className="font-bold uppercase text-[10px] text-rose-700 block">Allergies & Alerts</span>
                {user.allergies.map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span>⚠️ {a.allergen} ({a.reaction})</span>
                    <span className="font-bold text-[10px] uppercase text-rose-800">{a.severity}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold uppercase text-[10px] text-slate-500 block">Reported Problem</span>
                <p className="text-slate-800 leading-relaxed font-medium">"{inspectPatientModal.symptoms}"</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold uppercase text-[10px] text-slate-500 block">Existing Conditions</span>
                <p className="text-slate-700">{user.chronicConditions.join(', ')}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectPatientModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAppointmentForCall(inspectPatientModal);
                  setInspectPatientModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Launch Video Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        MedCatalyst 2026 Clinical Tele-OPD Desk • Ayushman Bharat Digital Mission (ABDM) Integration
      </footer>

    </div>
  );
};
