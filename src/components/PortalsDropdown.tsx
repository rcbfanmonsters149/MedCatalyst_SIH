import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  ChevronDown, 
  Stethoscope, 
  Truck, 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  ExternalLink
} from './icons';
import { useLanguage } from '../context/LanguageContext';

export type PortalKey = 'citizen' | 'doctor' | 'hospital' | 'ambulance' | 'police' | 'workers';

interface PortalsDropdownProps {
  currentPortal?: PortalKey;
  variant?: 'light' | 'dark';
  align?: 'left' | 'right';
  className?: string;
}

export const PortalsDropdown: React.FC<PortalsDropdownProps> = ({
  currentPortal,
  variant = 'light',
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tr, language } = useLanguage();
  const location = useLocation();

  // Close on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const portalsList = [
    {
      id: 'citizen' as PortalKey,
      to: '/',
      title: tr.nav.citizenPortal || 'Public Citizen Portal',
      desc: language === 'hi' 
        ? 'आपातकालीन SOS, टेली-ओपीडी एवं डिजिटल स्वास्थ्य लॉकर' 
        : (language === 'mr' 
          ? 'आपत्कालीन SOS, टेलि-ओपीडी व डिजिटल आरोग्य लॉकर' 
          : 'Emergency SOS, Tele-OPD & Digital Health Locker'),
      icon: ExternalLink,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'doctor' as PortalKey,
      to: '/doctor',
      title: language === 'hi' 
        ? 'डॉक्टर क्लिनिकल पोर्टल' 
        : (language === 'mr' ? 'डॉक्टर क्लिनिकल पोर्टल' : 'Doctor Clinical Portal'),
      desc: language === 'hi'
        ? 'टेली-परामर्श, अपॉइंटमेंट एवं डिजिटल प्रिस्क्रिप्शन'
        : (language === 'mr'
          ? 'टेलि-सल्ला, अपॉइंटमेंट्स व डिजिटल प्रिस्क्रिप्शन'
          : 'Tele-Consults, Bookings & Prescription Desk'),
      icon: Stethoscope,
      color: 'text-teal-600 bg-teal-50 border-teal-200'
    },
    {
      id: 'hospital' as PortalKey,
      to: '/hospital',
      title: tr.nav.hospitalPortal || 'Hospital Operations',
      desc: language === 'hi'
        ? 'बेड एवं आईसीयू उपलब्धता, ईआर ट्रायज डेस्क'
        : (language === 'mr'
          ? 'बेड व आयसीयू उपलब्धता, ईआर ट्रायज डेस्क'
          : 'Bed & ICU Availability, ER Triage Desk'),
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'ambulance' as PortalKey,
      to: '/ambulance',
      title: tr.nav.ambulance || '108 Ambulance Cockpit',
      desc: language === 'hi'
        ? 'कॉकपिट HUD, जीपीएस रूटिंग एवं लाइव वाइटल्स'
        : (language === 'mr'
          ? 'कॉकपिट HUD, जीपीएस रूटिंग व लाईव्ह व्हायटल्स'
          : 'Cockpit HUD, GPS Routing & Live Vitals'),
      icon: Truck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'police' as PortalKey,
      to: '/police',
      title: tr.nav.trafficPolice || 'Traffic Police ITMS',
      desc: language === 'hi'
        ? 'ग्रीन कॉरिडोर सिग्नल पोस्ट नियंत्रण'
        : (language === 'mr'
          ? 'ग्रीन कॉरिडॉर सिग्नल पोस्ट नियंत्रण'
          : 'Green Corridor Signal Post Control'),
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      id: 'workers' as PortalKey,
      to: '/workers',
      title: tr.nav.ashaShort || 'ASHA & Frontline Workers',
      desc: language === 'hi'
        ? 'ग्राम फील्ड रिपोर्ट एवं मातृ स्वास्थ्य सेवा'
        : (language === 'mr'
          ? 'गाव फील्ड रिपोर्ट व माता आरोग्य सेवा'
          : 'Village Field Reports & Maternal Care'),
      icon: Heart,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  // Determine active portal either by currentPortal prop or matching pathname
  const isPortalCurrent = (portal: typeof portalsList[0]) => {
    if (currentPortal) {
      return currentPortal === portal.id;
    }
    if (portal.to === '/') {
      return location.pathname === '/' || location.pathname === '/emergency' || location.pathname === '/teleconsult';
    }
    return location.pathname.startsWith(portal.to);
  };

  const isDark = variant === 'dark';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer select-none ${
          isOpen
            ? isDark 
              ? 'bg-slate-800 border-slate-600 text-white ring-2 ring-blue-500/30'
              : 'bg-slate-100 border-slate-300 text-slate-900 ring-2 ring-blue-500/20'
            : isDark
              ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200 hover:border-slate-600'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
        } ${className}`}
        title={tr.nav.portalsDesc}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Building2 className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
        <span className="hidden sm:inline font-semibold">{tr.nav.portals}</span>
        <ChevronDown 
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen 
              ? 'rotate-180 text-blue-600' 
              : isDark ? 'text-slate-400' : 'text-slate-400'
          }`} 
        />
      </button>

      {/* Floating Card Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-2 z-50 animate-in fade-in slide-in-from-top-2`}
          role="menu"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                {tr.nav.portals}
              </p>
              <p className="text-[10px] text-slate-500">
                {tr.nav.portalsDesc}
              </p>
            </div>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
              6 Desks
            </span>
          </div>

          {/* List of Portals */}
          <div className="p-1 space-y-1 max-h-[75vh] overflow-y-auto">
            {portalsList.map((portal) => {
              const Icon = portal.icon;
              const isCurrent = isPortalCurrent(portal);

              return (
                <Link
                  key={portal.to}
                  to={portal.to}
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all group border ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-200/80 shadow-2xs'
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-200/60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${portal.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-bold transition-colors ${
                        isCurrent ? 'text-blue-900' : 'text-slate-800 group-hover:text-blue-700'
                      }`}>
                        {portal.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                          {language === 'mr' ? 'चालू' : language === 'hi' ? 'सक्रिय' : 'Current'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {portal.desc}
                    </p>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 transition-all shrink-0 ${
                    isCurrent 
                      ? 'text-blue-600' 
                      : 'text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5'
                  }`} />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
