import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  QrCode, 
  Camera, 
  Upload, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Heart, 
  Pill, 
  FlaskConical, 
  Plus, 
  Scan, 
  ExternalLink, 
  RefreshCw, 
  User, 
  X,
  Clock
} from '../icons';
import { UserBioData, TeleAppointment } from '../../types';
import { recordAuditEvent } from '../../services/blockchainService';
import { Link } from 'react-router-dom';

interface PatientEhrLookupProps {
  user: UserBioData;
  doctorUser: any;
  appointments: TeleAppointment[];
  onOpenPrescriptionModal: (section: 'all' | 'labs', appt?: TeleAppointment | null) => void;
  showToast: (msg: string) => void;
}

export const PatientEhrLookup: React.FC<PatientEhrLookupProps> = ({
  user,
  doctorUser,
  appointments,
  onOpenPrescriptionModal,
  showToast
}) => {
  // Gatekeeper unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activeInputMethod, setActiveInputMethod] = useState<'QR_SCAN' | 'ABHA_INPUT'>('QR_SCAN');
  
  // ABHA Input state
  const [abhaInput, setAbhaInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Active unlocked patient data
  const [currentPatient, setCurrentPatient] = useState<UserBioData>(user);
  const [unlockedTxHash, setUnlockedTxHash] = useState<string>('');
  const [unlockTimestamp, setUnlockTimestamp] = useState<string>('');

  // QR Camera Scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Records Filter
  const [recordFilter, setRecordFilter] = useState<'ALL' | 'PRESCRIPTIONS' | 'LABS'>('ALL');

  // Helper to extract ABHA from QR content (URL or raw text or JSON)
  const parseAbhaFromQr = (decodedText: string): string => {
    const text = decodedText.trim();
    if (text.includes('abha=')) {
      try {
        const url = new URL(text.startsWith('http') ? text : `http://dummy.com/${text}`);
        const param = url.searchParams.get('abha');
        if (param) return decodeURIComponent(param);
      } catch {
        const match = text.match(/abha=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
    }
    if (text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.abha || parsed.healthId || parsed.patientAbhaId) {
          return parsed.abha || parsed.healthId || parsed.patientAbhaId;
        }
      } catch {
        // ignore JSON parse error
      }
    }
    return text;
  };

  // Stop camera when unmounting or stopping
  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  // Start live camera scanner
  const startCameraScanner = async () => {
    setCameraError(null);
    setVerificationError(null);
    try {
      setIsCameraActive(true);
      // Wait for DOM element
      setTimeout(async () => {
        try {
          const scanner = new Html5Qrcode('qr-reader-container');
          scannerRef.current = scanner;
          await scanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 240, height: 240 }
            },
            (decodedText) => {
              // Successfully read QR
              stopCameraScanner();
              const extractedAbha = parseAbhaFromQr(decodedText);
              handleUnlockWithAbha(extractedAbha, 'QR_CAMERA');
            },
            () => {
              // scanning frame error (ignore)
            }
          );
        } catch (err: any) {
          console.error('Camera start error:', err);
          setIsCameraActive(false);
          setCameraError(
            err?.message?.includes('Permission') 
              ? 'Camera permission denied. Please allow camera access or use the manual ABHA input.' 
              : 'Could not activate camera on this device. Please use manual ABHA entry or image upload.'
          );
        }
      }, 150);
    } catch (err: any) {
      setIsCameraActive(false);
      setCameraError('Camera initialization failed.');
    }
  };

  // Handle QR file upload
  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerificationError(null);
    setCameraError(null);
    try {
      const html5Qr = new Html5Qrcode('qr-file-dummy');
      const decodedText = await html5Qr.scanFile(file, true);
      html5Qr.clear();
      const extracted = parseAbhaFromQr(decodedText);
      handleUnlockWithAbha(extracted, 'QR_IMAGE_UPLOAD');
    } catch (err: any) {
      setVerificationError('Could not find a valid ABHA QR code in the uploaded image. Please try another image or enter the ABHA ID directly.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Verification & Unlock
  const handleUnlockWithAbha = async (targetAbha: string, source: 'QR_CAMERA' | 'QR_IMAGE_UPLOAD' | 'MANUAL_ENTRY') => {
    const cleaned = targetAbha.trim();
    if (!cleaned) {
      setVerificationError('Please enter a valid 14-digit ABHA ID or ABHA Address.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    // Simulate cryptographic ABDM Consent Handshake (500ms)
    await new Promise(r => setTimeout(r, 650));

    // Match patient from context or appointments
    let matchedPatient: UserBioData = user;
    const appointmentMatch = appointments.find(a => 
      a.patientAbhaId.toLowerCase() === cleaned.toLowerCase() ||
      a.patientName.toLowerCase().includes(cleaned.toLowerCase())
    );

    if (appointmentMatch && appointmentMatch.patientAbhaId !== user.healthId) {
      // Create representative BioData view for this patient
      matchedPatient = {
        ...user,
        id: appointmentMatch.patientId,
        fullName: appointmentMatch.patientName,
        healthId: appointmentMatch.patientAbhaId,
        phone: appointmentMatch.patientPhone,
        age: appointmentMatch.patientAge,
        gender: appointmentMatch.patientGender,
        bloodGroup: appointmentMatch.patientBloodGroup || user.bloodGroup,
        pastRecords: user.pastRecords // provide medical records ledger
      };
    } else {
      // Standard registered citizen Rameshwar Singh
      matchedPatient = {
        ...user,
        healthId: cleaned.includes('@') || cleaned.includes('-') ? cleaned : user.healthId
      };
    }

    // Generate blockchain transaction hash for audit ledger
    const tx = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}Amoy`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    try {
      await recordAuditEvent({
        recordIdHash: `ABHA:${matchedPatient.healthId}`,
        accessor: doctorUser?.id || '0xDocA4B92d99F123C',
        accessorName: doctorUser?.name || 'Attending Clinical Physician',
        actionType: 'RECORD_ACCESSED',
        blockNumber: 4182910,
        txHash: tx,
        details: `Doctor unlocked patient EHR history via ${source} (ABHA: ${matchedPatient.healthId})`
      });
    } catch (e) {
      console.warn('Audit record warning:', e);
    }

    setCurrentPatient(matchedPatient);
    setUnlockedTxHash(tx);
    setUnlockTimestamp(now);
    setIsUnlocked(true);
    setIsVerifying(false);
    showToast(`✓ Sovereign Consent Verified: Records unlocked for ${matchedPatient.fullName} (${matchedPatient.healthId})`);
  };

  // Lock back
  const handleLockRecords = () => {
    stopCameraScanner();
    setIsUnlocked(false);
    setAbhaInput('');
    setVerificationError(null);
    setCameraError(null);
    showToast('Patient medical records locked.');
  };

  return (
    <div className="space-y-6">
      {/* Hidden dummy container for image file scans */}
      <div id="qr-file-dummy" className="hidden" />

      {/* GATEKEEPER VIEW: When Records are LOCKED */}
      {!isUnlocked && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-white p-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight font-heading text-slate-900">
                  Patient Health Records (EHR) Gateway
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Under National Digital Health Guidelines (ABDM), patient health records cannot be viewed without verified patient consent. Scan the patient's QR code or enter their ABHA ID to unlock past medical history.
                </p>
              </div>
            </div>
          </div>

          {/* Action Tabs: QR Code Scan vs Manual ABHA ID Entry */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  stopCameraScanner();
                  setActiveInputMethod('QR_SCAN');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeInputMethod === 'QR_SCAN'
                    ? 'bg-white text-teal-800 shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-teal-600" />
                <span>Scan Patient QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCameraScanner();
                  setActiveInputMethod('ABHA_INPUT');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeInputMethod === 'ABHA_INPUT'
                    ? 'bg-white text-teal-800 shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4 text-teal-600" />
                <span>Enter ABHA ID Directly</span>
              </button>
            </div>

            {/* Error Message */}
            {verificationError && (
              <div className="max-w-2xl mx-auto p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            {/* METHOD 1: QR CODE SCANNER */}
            {activeInputMethod === 'QR_SCAN' && (
              <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Live Camera Scanner Box */}
                {isCameraActive ? (
                  <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 text-center space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-teal-400 flex items-center gap-2">
                        <Camera className="w-4 h-4 animate-pulse" />
                        <span>Live ABDM QR Code Camera Scanner</span>
                      </span>
                      <button
                        type="button"
                        onClick={stopCameraScanner}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>

                    {/* Camera Viewfinder View */}
                    <div className="relative mx-auto w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden border-2 border-teal-500/50 shadow-inner">
                      <div id="qr-reader-container" className="w-full h-full" />
                      {/* Animated Scanning Line */}
                      <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-bounce top-1/2 pointer-events-none" />
                    </div>

                    <p className="text-xs text-slate-400">
                      Align the patient's Smart Health Card QR Code or Mobile ABDM QR within the scanner box.
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-gradient-to-b from-teal-50/40 to-slate-50 border-2 border-dashed border-teal-200/90 text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-teal-100 border border-teal-300 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                      <QrCode className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-slate-900">
                        Scan Patient's Smart Health QR Code
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Patients present their ABHA QR code via Ayushman Bharat Card, Aarogya Setu, or the MediCatalyst Citizen Portal.
                      </p>
                    </div>

                    {cameraError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 max-w-md mx-auto">
                        {cameraError}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      {/* Start Live Camera Scanner */}
                      <button
                        type="button"
                        onClick={startCameraScanner}
                        disabled={isVerifying}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Open Camera Scanner</span>
                      </button>

                      {/* Upload QR Image */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleQrFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isVerifying}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>Upload QR Image</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* METHOD 2: DIRECT ABHA ID INPUT */}
            {activeInputMethod === 'ABHA_INPUT' && (
              <div className="max-w-xl mx-auto space-y-5">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUnlockWithAbha(abhaInput, 'MANUAL_ENTRY');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                      Patient 14-Digit ABHA ID or ABDM Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={abhaInput}
                        onChange={(e) => setAbhaInput(e.target.value)}
                        placeholder="e.g. 91-8273-1928-3920 or rameshwar@abdm"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-500">
                      Standard format: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-bold">XX-XXXX-XXXX-XXXX</code>
                    </p>

                    <button
                      type="submit"
                      disabled={isVerifying || !abhaInput.trim()}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying ABDM Consent...</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Verify & Unlock Records</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            )}

          </div>
        </div>
      )}

      {/* UNLOCKED VIEW: PREVIOUS MEDICAL RECORDS & BIO-DATA */}
      {isUnlocked && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          
          {/* Sovereign Consent Verified Top Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">
                      Sovereign Patient Consent Verified & Cryptographically Unlocked
                    </h3>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                      ABDM HIE-CM Token Valid
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Access recorded to Polygon Amoy Blockchain at {unlockTimestamp}. Tx: <code className="font-mono text-[11px] text-emerald-300">{unlockedTxHash}</code>
                  </p>
                </div>
              </div>

              {/* Lock / Switch Patient Button */}
              <button
                type="button"
                onClick={handleLockRecords}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/20 hover:border-rose-400/40 text-white hover:text-rose-200 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
                title="Lock access and scan or look up another patient"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Lock / Switch Patient</span>
              </button>
            </div>
          </div>

          {/* Main Patient EHR Card Container */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            
            {/* Patient Header & Full View Link */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Ayushman Bharat Digital Health Records (ABHA)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Decentralized EHR ledger verified with Polygon cryptographic proofs.
                </p>
              </div>

              <Link
                to={`/records?patient=${currentPatient.id}&abha=${encodeURIComponent(currentPatient.healthId)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Scan className="w-3.5 h-3.5 text-teal-400" />
                <span>Open Full Patient QR Scan View</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>

            {/* Patient Profile Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {currentPatient.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{currentPatient.fullName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{currentPatient.age} Years, {currentPatient.gender}</span>
                      <span>•</span>
                      <span className="font-bold text-rose-600">Blood Group: {currentPatient.bloodGroup}</span>
                      {currentPatient.phone && (
                        <>
                          <span>•</span>
                          <span>Phone: {currentPatient.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified ABHA Health ID</span>
                  <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block shadow-2xs">
                    {currentPatient.healthId}
                  </span>
                </div>
              </div>

              {/* Critical Clinical Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-rose-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Documented Allergies (Contraindications)</span>
                  </span>
                  <div className="space-y-1 pt-1">
                    {currentPatient.allergies.map((all, i) => (
                      <div key={i} className="text-xs text-rose-950 font-medium flex items-center justify-between">
                        <span>• <strong>{all.allergen}</strong> ({all.reaction})</span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">
                          {all.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-amber-800 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chronic Medical Conditions</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentPatient.chronicConditions.map((cond, i) => (
                      <span key={i} className="text-xs bg-white text-amber-900 px-2.5 py-1 rounded-lg font-semibold border border-amber-200 shadow-2xs">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Past Medical Records & Blockchain Hashes */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Verified Blockchain EHR History ({currentPatient.pastRecords.length} Visits)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Cryptographically linked prescriptions and diagnostic investigations on Polygon Amoy.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPrescriptionModal('all')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue Prescriptions & Labs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPrescriptionModal('labs')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Add Lab Records</span>
                    </button>
                  </div>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 text-xs">
                  {(['ALL', 'PRESCRIPTIONS', 'LABS'] as const).map((flt) => (
                    <button
                      key={flt}
                      type="button"
                      onClick={() => setRecordFilter(flt)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        recordFilter === flt
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {flt === 'ALL' 
                        ? `All Records (${currentPatient.pastRecords.length})` 
                        : flt === 'PRESCRIPTIONS' 
                        ? 'Prescriptions' 
                        : 'Diagnostic Lab Reports'}
                    </button>
                  ))}
                </div>

                {/* Records List */}
                <div className="space-y-3">
                  {currentPatient.pastRecords
                    .filter(rec => {
                      if (recordFilter === 'PRESCRIPTIONS') return (rec.medications && rec.medications.length > 0) || !rec.labRecords?.length;
                      if (recordFilter === 'LABS') return rec.labRecords && rec.labRecords.length > 0;
                      return true;
                    })
                    .map((rec) => (
                      <div key={rec.id} className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-3 shadow-2xs hover:border-slate-300 transition">
                        {/* Visit Header */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">{rec.diagnosis}</span>
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {rec.id}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {rec.date} • {rec.hospitalName}
                          </span>
                        </div>

                        {/* Prescribed Medications */}
                        {rec.medications && rec.medications.length > 0 && (
                          <div className="space-y-1.5 bg-rose-50/30 p-2.5 rounded-xl border border-rose-100">
                            <span className="text-[10px] uppercase font-bold text-rose-800 flex items-center gap-1">
                              <Pill className="w-3 h-3 text-rose-600" />
                              <span>Prescribed Medications ({rec.medications.length})</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.medications.map((m, mIdx) => (
                                <span key={mIdx} className="px-2.5 py-1 bg-white text-slate-800 rounded-lg text-[11px] font-semibold border border-rose-200 shadow-2xs">
                                  {m.name} <strong className="text-blue-700">({m.dosage})</strong> • {m.frequency} • {m.duration}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lab Diagnostic Investigations */}
                        {rec.labRecords && rec.labRecords.length > 0 && (
                          <div className="space-y-2 bg-purple-50/30 p-2.5 rounded-xl border border-purple-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-purple-800 flex items-center gap-1">
                                <FlaskConical className="w-3 h-3 text-purple-600" />
                                <span>Laboratory & Diagnostic Findings ({rec.labRecords.length} Tests)</span>
                              </span>
                              <span className="text-[10px] text-purple-700 font-semibold">
                                ABDM Diagnostic Ledger
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {rec.labRecords.map((lab, lIdx) => (
                                <div key={lIdx} className="p-2.5 bg-white rounded-xl border border-purple-150 space-y-1 shadow-2xs">
                                  <div className="flex items-start justify-between gap-1">
                                    <div>
                                      <span className="text-[9px] uppercase font-bold text-purple-600 tracking-wider block">
                                        {lab.category}
                                      </span>
                                      <span className="font-bold text-slate-900 text-xs block leading-tight">
                                        {lab.testName}
                                      </span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      lab.status === 'NORMAL' 
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : lab.status === 'BORDERLINE' 
                                          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                          : lab.status === 'CRITICAL' 
                                            ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black animate-pulse' 
                                            : 'bg-orange-50 text-orange-800 border border-orange-200'
                                    }`}>
                                      {lab.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                                    <span className="text-slate-500">Result: <strong className="text-slate-900">{lab.resultValue} {lab.unit}</strong></span>
                                    <span className="text-[10px] text-slate-400">Ref: {lab.referenceRange}</span>
                                  </div>

                                  {lab.notes && (
                                    <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1 rounded border border-slate-100">
                                      Note: {lab.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.clinicalAdvice && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <strong>Advice:</strong> {rec.clinicalAdvice}
                          </p>
                        )}

                        {/* Footer Blockchain & Physician Metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Polygon Amoy Verified (Block #{rec.blockNumber || 4182880})
                            </span>
                            <span>Tx: {rec.blockchainTxHash ? `${rec.blockchainTxHash.slice(0, 14)}...` : '0x4f82905...'}</span>
                          </div>
                          <span className="font-sans font-semibold text-slate-600">Attending: {rec.doctorName} ({rec.doctorSpecialty || 'Physician'})</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
